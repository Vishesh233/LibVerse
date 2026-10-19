const mongoose = require('mongoose');

/**
 * A one-time code for "Forgot password" (one per user at a time). Only an HMAC of the code is
 * stored; MongoDB deletes the document once expiresAt has passed (TTL index).
 */
const passwordResetCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  codeHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  // Wrong guesses so far; the code is deleted at the limit
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

passwordResetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetCode', passwordResetCodeSchema);
