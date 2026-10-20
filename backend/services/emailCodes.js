/**
 * Issue and check emailed 6-digit codes (models/EmailCode.js): stored as an HMAC, valid for
 * 10 minutes, 5 guesses, a new one at most once a minute per account and purpose, single use.
 */
const crypto = require('crypto');
const EmailCode = require('../models/EmailCode');

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60 * 1000;

const hashCode = (userId, purpose, code) => crypto.createHmac('sha256', process.env.JWT_SECRET)
  .update(`${purpose}:${userId}:${code}`).digest('hex');
const sameHash = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * A new code for the user, replacing any older one. Resolves to the code, or null when the last
 * one was sent less than a minute ago (nothing changes then).
 * @param {{ _id: any, tokenVersion?: number }} user
 * @param {'verify' | 'login'} purpose
 */
const issueCode = async (user, purpose) => {
  const recent = await EmailCode.exists({ userId: user._id, purpose, createdAt: { $gt: new Date(Date.now() - RESEND_AFTER_MS) } });
  if (recent) return null;
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await EmailCode.findOneAndUpdate(
    { userId: user._id, purpose },
    {
      codeHash: hashCode(user._id, purpose, code),
      tokenVersion: user.tokenVersion || 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
      attempts: 0,
      createdAt: new Date(),
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return code;
};

/**
 * Use a code. Resolves to the stored record when the code is right (it is deleted: single use),
 * or null when it is wrong, expired, out of guesses or already used.
 * @param {{ _id: any }} user
 * @param {'verify' | 'login'} purpose
 * @param {string} code
 */
const useCode = async (user, purpose, code) => {
  // Count the guess first (atomically), so parallel guesses can't exceed the limit
  const record = await EmailCode.findOneAndUpdate(
    { userId: user._id, purpose, attempts: { $lt: MAX_ATTEMPTS }, expiresAt: { $gt: new Date() } },
    { $inc: { attempts: 1 } },
    { new: true }
  );
  if (!record) {
    await EmailCode.deleteOne({ userId: user._id, purpose });
    return null;
  }
  if (!sameHash(record.codeHash, hashCode(user._id, purpose, code))) {
    if (record.attempts >= MAX_ATTEMPTS) await EmailCode.deleteOne({ _id: record._id });
    return null;
  }
  // One use: whoever deletes the record first wins
  const used = await EmailCode.deleteOne({ _id: record._id });
  return used.deletedCount ? record : null;
};

module.exports = { issueCode, useCode, CODE_TTL_MS, MAX_ATTEMPTS, RESEND_AFTER_MS };
