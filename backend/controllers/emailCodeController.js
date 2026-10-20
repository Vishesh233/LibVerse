/**
 * Emailed 6-digit codes (services/emailCodes.js), available only when outgoing email is configured
 * and this is not the demo instance:
 *  - sign-up email verification: new email/password accounts confirm their address before signing in
 *  - passwordless sign-in: "Email me a code" on the login page
 *
 * Requests always get the same answer whether or not the email has an account, and the email is
 * sent without delaying the answer.
 */
const User = require('../models/User');
const { isEmailEnabled, sendMail } = require('../services/mailer');
const { verificationEmail, loginCodeEmail } = require('../services/emailTemplates');
const { issueCode, useCode } = require('../services/emailCodes');
const { toPublicUser, signToken } = require('../utils/session');
const { isDemoMode } = require('../config/demo');

const BAD_CODE = 'That code is wrong or has expired. Check the email or request a new code.';
const DISABLED = 'Email codes are not available here.';
const VERIFY_SENT = 'If that account still needs verifying, a new 6-digit code is on its way. It expires in 10 minutes.';
const LOGIN_SENT = 'If an account uses that email, a 6-digit sign-in code is on its way. It expires in 10 minutes.';
const SOMETHING_WRONG = 'Something went wrong. Try again in a moment.';

const cleanEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const looksLikeEmail = (email) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const cleanCode = (value) => (typeof value === 'string' ? value.trim() : '');

const emailCodesOn = () => isEmailEnabled() && !isDemoMode();
const disabled = (res) => res.status(503).json({ success: false, enabled: false, message: DISABLED });

/**
 * Send a sign-up verification code to the user (unless one went out less than a minute ago).
 * Never throws; the email is not awaited.
 * @returns {Promise<boolean>} whether a new code was sent
 */
const sendVerificationCode = async (user) => {
  try {
    const code = await issueCode(user, 'verify');
    if (!code) return false;
    sendMail({ to: user.email, ...verificationEmail(user.name, code) });
    return true;
  } catch (error) {
    console.error('Verification code could not be created:', error.message);
    return false;
  }
};

/**
 * @route GET /api/auth/email
 * @desc Whether email features (verification, login codes, forgot password) are available
 * @access Public
 */
const getEmailStatus = (req, res) => {
  res.status(200).json({ success: true, enabled: emailCodesOn() });
};

/**
 * @route POST /api/auth/verify-email
 * @desc Confirm a new account's email with its code: { email, code }. Signs in on success.
 * @access Public (rate limited)
 */
const verifyEmail = async (req, res) => {
  if (!emailCodesOn()) return disabled(res);
  const email = cleanEmail(req.body?.email);
  const code = cleanCode(req.body?.code);
  if (!looksLikeEmail(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: BAD_CODE });

  try {
    const user = await User.findOne({ email });
    if (!user || user.isDemo || user.emailVerified !== false) return res.status(400).json({ success: false, message: BAD_CODE });
    if (!(await useCode(user, 'verify', code))) return res.status(400).json({ success: false, message: BAD_CODE });

    const verified = await User.findByIdAndUpdate(user._id, { $set: { emailVerified: true } }, { new: true });
    if (verified.isActive === false) return res.status(403).json({ success: false, message: 'Account is deactivated' });
    return res.status(200).json({ success: true, message: 'Email verified', token: signToken(verified), user: toPublicUser(verified) });
  } catch (error) {
    console.error('Email verification failed:', error.message);
    return res.status(500).json({ success: false, message: SOMETHING_WRONG });
  }
};

/**
 * @route POST /api/auth/resend-verification
 * @desc A new verification code for an unverified account: { email }. Same answer for every email.
 * @access Public (rate limited)
 */
const resendVerification = async (req, res) => {
  if (!emailCodesOn()) return disabled(res);
  const email = cleanEmail(req.body?.email);
  if (!looksLikeEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });

  try {
    const user = await User.findOne({ email }).select('name email emailVerified isActive isDemo tokenVersion');
    if (user && user.emailVerified === false && user.isActive !== false && !user.isDemo) {
      await sendVerificationCode(user);
    }
    return res.status(200).json({ success: true, message: VERIFY_SENT });
  } catch (error) {
    console.error('Verification resend failed:', error.message);
    return res.status(500).json({ success: false, message: SOMETHING_WRONG });
  }
};

/**
 * @route POST /api/auth/login-code
 * @desc Email a 6-digit sign-in code: { email }. Same answer for every email.
 * @access Public (rate limited)
 */
const requestLoginCode = async (req, res) => {
  if (!emailCodesOn()) return disabled(res);
  const email = cleanEmail(req.body?.email);
  if (!looksLikeEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });

  try {
    const user = await User.findOne({ email }).select('name email isActive isDemo tokenVersion');
    // Deactivated and demo accounts never get a code (the answer stays the same)
    if (user && user.isActive !== false && !user.isDemo) {
      const code = await issueCode(user, 'login');
      if (code) sendMail({ to: user.email, ...loginCodeEmail(user.name, code) });
    }
    return res.status(200).json({ success: true, message: LOGIN_SENT });
  } catch (error) {
    console.error('Login code request failed:', error.message);
    return res.status(500).json({ success: false, message: SOMETHING_WRONG });
  }
};

/**
 * @route POST /api/auth/login-code/verify
 * @desc Sign in with the emailed code: { email, code }
 * @access Public (rate limited)
 */
const loginWithCode = async (req, res) => {
  if (!emailCodesOn()) return disabled(res);
  const email = cleanEmail(req.body?.email);
  const code = cleanCode(req.body?.code);
  if (!looksLikeEmail(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: BAD_CODE });

  try {
    const user = await User.findOne({ email });
    if (!user || user.isDemo) return res.status(400).json({ success: false, message: BAD_CODE });
    const record = await useCode(user, 'login', code);
    // A password change or reset since the code was sent (tokenVersion) makes it useless
    if (!record || (record.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(400).json({ success: false, message: BAD_CODE });
    }
    if (user.isActive === false) return res.status(403).json({ success: false, message: 'Account is deactivated' });

    // The code proves the address belongs to the user
    const account = user.emailVerified === false
      ? await User.findByIdAndUpdate(user._id, { $set: { emailVerified: true } }, { new: true })
      : user;
    return res.status(200).json({ success: true, token: signToken(account), user: toPublicUser(account) });
  } catch (error) {
    console.error('Login with code failed:', error.message);
    return res.status(500).json({ success: false, message: SOMETHING_WRONG });
  }
};

module.exports = {
  getEmailStatus, verifyEmail, resendVerification, requestLoginCode, loginWithCode, sendVerificationCode, emailCodesOn,
};
