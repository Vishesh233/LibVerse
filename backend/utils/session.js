const jwt = require('jsonwebtoken');

/**
 * The user fields sent to the client after signup, login and profile changes.
 * The frontend stores this object as the session user, so it must carry everything the UI reads
 * (createdAt for "Member since", phone/address for the profile form) - not a partial copy.
 */
const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  libraryId: user.libraryId,
  phone: user.phone,
  address: user.address,
  fineAmount: user.fineAmount,
  profileImage: user.profileImage,
  isOnboardingCompleted: user.isOnboardingCompleted,
  favoriteGenres: user.favoriteGenres,
  createdAt: user.createdAt,
  isDemo: user.isDemo === true,
  // Google sign-in: whether the account has a password yet, is connected to Google, and how it was created
  hasPassword: user.hasPassword !== false,
  googleLinked: Boolean(user.googleLinkedAt),
  createdWith: user.createdWith || 'email',
  emailVerified: user.emailVerified !== false,
});

/**
 * Generate JWT Token
 */
// tv = the user's tokenVersion: a token from before a password change/reset no longer works.
// Demo sessions are short (DEMO_JWT_EXPIRE, default 2h): the accounts are shared and reset every 6 hours.
const signToken = (user) => {
  return jwt.sign({ id: user._id, tv: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: user.isDemo ? process.env.DEMO_JWT_EXPIRE || '2h' : process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = { toPublicUser, signToken };
