/**
 * "Forgot password" by email code. Available only when outgoing email is configured
 * (services/mailer.js). The request answer is the same whether or not the email has an account,
 * the code is stored only as an HMAC, lasts 10 minutes and allows 5 guesses, and setting the new
 * password signs out every existing session (tokenVersion).
 */
const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetCode = require('../models/PasswordResetCode');
const { isEmailEnabled, sendMail } = require('../services/mailer');
const { createNotification } = require('./notificationController');
const { isDemoMode } = require('../config/demo');

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60 * 1000; // a new code at most once a minute per account
const SENT_MESSAGE = 'If an account uses that email, a 6-digit code is on its way. It expires in 10 minutes.';
const BAD_CODE = 'That code is wrong or has expired. Check the email or request a new code.';
const DISABLED = 'Password reset by email is not set up. Ask your librarian or admin to reset your password.';

const hashCode = (userId, code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${userId}:${code}`).digest('hex');
const sameHash = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const cleanEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const looksLikeEmail = (email) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const codeEmail = (name, code) => ({
  subject: `${code} is your LibVerse password reset code`,
  text: [
    `Hi ${name},`,
    '',
    `Your LibVerse password reset code is ${code}.`,
    'It expires in 10 minutes. Enter it on the "Forgot password" page to choose a new password.',
    '',
    'If you did not ask for this, ignore this email: your password stays the same.',
  ].join('\n'),
  html: `<p>Hi ${String(name).replace(/[<>&"]/g, '')},</p>
<p>Your LibVerse password reset code is</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px;font-family:monospace">${code}</p>
<p>It expires in 10 minutes. Enter it on the "Forgot password" page to choose a new password.</p>
<p style="color:#666">If you did not ask for this, ignore this email: your password stays the same.</p>`,
});

/**
 * @route GET /api/auth/password-reset
 * @desc Whether "Forgot password" by email is available
 * @access Public
 */
exports.getResetStatus = (req, res) => {
  res.status(200).json({ success: true, enabled: isEmailEnabled() && !isDemoMode() });
};

/**
 * @route POST /api/auth/forgot-password
 * @desc Email a 6-digit code to the account's address. Same answer for unknown emails.
 * @access Public (rate limited)
 */
exports.requestReset = async (req, res) => {
  if (!isEmailEnabled()) return res.status(503).json({ success: false, enabled: false, message: DISABLED });
  const email = cleanEmail(req.body?.email);
  if (!looksLikeEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });

  try {
    const user = await User.findOne({ email }).select('name isActive isDemo');
    // Demo accounts have no password of their own: never send them a code (same answer as usual)
    if (user && user.isActive !== false && !user.isDemo) {
      const recent = await PasswordResetCode.findOne({ userId: user._id, createdAt: { $gt: new Date(Date.now() - RESEND_AFTER_MS) } }).lean();
      if (!recent) {
        const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        await PasswordResetCode.findOneAndUpdate(
          { userId: user._id },
          { codeHash: hashCode(user._id, code), expiresAt: new Date(Date.now() + CODE_TTL_MS), attempts: 0, createdAt: new Date() },
          { upsert: true, setDefaultsOnInsert: true }
        );
        // Not awaited: the answer must not take longer when the account exists
        sendMail({ to: email, ...codeEmail(user.name, code) });
      }
    }
    res.status(200).json({ success: true, message: SENT_MESSAGE });
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Try again in a moment.' });
  }
};

/**
 * @route POST /api/auth/reset-password
 * @desc Set a new password with the emailed code: { email, code, newPassword }
 * @access Public (rate limited)
 */
exports.resetPassword = async (req, res) => {
  if (!isEmailEnabled()) return res.status(503).json({ success: false, enabled: false, message: DISABLED });
  const email = cleanEmail(req.body?.email);
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (!looksLikeEmail(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: BAD_CODE });
  if (newPassword.length < 6 || newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'The new password must be 6 to 128 characters' });
  }

  try {
    const user = await User.findOne({ email }).select('_id isDemo');
    if (!user || user.isDemo) return res.status(400).json({ success: false, message: BAD_CODE });

    // Count the guess first (atomically), so parallel guesses can't exceed the limit
    const record = await PasswordResetCode.findOneAndUpdate(
      { userId: user._id, attempts: { $lt: MAX_ATTEMPTS }, expiresAt: { $gt: new Date() } },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!record) {
      await PasswordResetCode.deleteOne({ userId: user._id });
      return res.status(400).json({ success: false, message: BAD_CODE });
    }
    if (!sameHash(record.codeHash, hashCode(user._id, code))) {
      if (record.attempts >= MAX_ATTEMPTS) await PasswordResetCode.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: BAD_CODE });
    }
    // One use: whoever deletes the record first sets the password
    const used = await PasswordResetCode.deleteOne({ _id: record._id });
    if (!used.deletedCount) return res.status(400).json({ success: false, message: BAD_CODE });

    const account = await User.findById(user._id).select('+password');
    account.password = newPassword;
    account.tokenVersion = (account.tokenVersion || 0) + 1; // signs out every existing session
    await account.save();

    try {
      await createNotification(account._id, account.role, 'PASSWORD_CHANGED', 'Password reset',
        'Your password was reset with an emailed code. If you did not do this, contact the library straight away.');
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({ success: true, message: 'Password updated. Sign in with your new password.' });
  } catch (error) {
    console.error('Password reset failed:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Try again in a moment.' });
  }
};
