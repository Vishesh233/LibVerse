const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    // Accounts created with Google have no password until the member sets one (hasPassword)
    password: {
      type: String,
      required: [function () { return this.hasPassword !== false; }, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'librarian', 'admin'],
      default: 'student',
    },
    phone: String,
    address: String,
    libraryId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: String,
    // Digital library card (utils/libraryCard.js): the QR carries this version; reissuing the card
    // increments it so an older printed or saved QR stops working
    cardVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    // Part of every login token: bumping it (password change or reset) signs out older sessions
    tokenVersion: {
      type: Number,
      default: 0,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    favoriteGenres: [
      {
        type: String,
        trim: true,
      },
    ],
    isOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    hasPassword: {
      type: Boolean,
      default: true,
    },
    // Email/password sign-ups confirm their address with an emailed code first (only while email is
    // configured). Google, admin-created and older accounts are verified.
    emailVerified: {
      type: Boolean,
      default: true,
    },
    // Google sign-in: the Google account's stable id (`sub`), never the email. Not sent to clients.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    googleLinkedAt: Date,
    // How the account was created: Google accounts give their phone number during onboarding
    createdWith: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    // Live demo account (scripts/resetDemo.js): one-click sign-in, destructive actions blocked.
    // Set only by the demo scripts, never through the API.
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // A Google account without a password never matches
  if (!this.password || typeof enteredPassword !== 'string') return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);