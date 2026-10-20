const mongoose = require('mongoose');

/**
 * A one-time emailed code for sign-up verification ("verify") or passwordless sign-in ("login"):
 * one per user and purpose at a time, the same pattern as PasswordResetCode. Only an HMAC of the
 * code is stored; MongoDB deletes the document once expiresAt has passed (TTL index).
 */
const emailCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  purpose: {
    type: String,
    enum: ['verify', 'login'],
    required: true,
  },
  codeHash: {
    type: String,
    required: true,
  },
  // Login codes: the account's tokenVersion when the code was sent (a password change voids it)
  tokenVersion: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  // Guesses so far; the code is deleted at the limit
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

emailCodeSchema.index({ userId: 1, purpose: 1 }, { unique: true });
emailCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailCode', emailCodeSchema);
