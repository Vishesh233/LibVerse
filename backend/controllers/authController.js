const User = require('../models/User');
const Book = require('../models/Book');

// Favourite genres must be real catalogue genres (the Book.genre enum)
const VALID_GENRES = Book.schema.path('genre').enumValues;
const invalidGenres = (genres) => genres.filter((g) => !VALID_GENRES.includes(g));
const { createNotification, notifyStaff } = require('./notificationController');
const { nextLibraryId } = require('../utils/libraryId');
const { toPublicUser, signToken } = require('../utils/session');
const { isDemoMode, demoDisabledBody } = require('../config/demo');
const { isEmailEnabled } = require('../services/mailer');
const { sendVerificationCode } = require('./emailCodeController');

const DEMO_ROLES = ['student', 'librarian', 'admin'];

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
exports.signup = async (req, res, next) => {
  try {
    // Only whitelisted fields are read; role and other privileged fields are never taken from the request
    const { name, email, password, phone, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists (normalize email to lowercase for consistent lookup)
    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // With email configured, the address is confirmed with an emailed code before the first sign-in
    const needsVerification = isEmailEnabled();

    // Create user
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: 'student',
      phone,
      address,
      emailVerified: !needsVerification,
      libraryId: await nextLibraryId(), // short and sequential: LIB-1003, LIB-1004 ...
    });

    if (needsVerification) {
      await sendVerificationCode(user);
      return res.status(201).json({
        success: true,
        verificationRequired: true,
        email: user.email,
        message: 'Account created. Enter the 6-digit code we emailed you to finish.',
      });
    }

    // Create token
    const token = signToken(user);

    res.status(201).json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check user exists (normalize email to lowercase to match stored format)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Same message for unknown email and wrong password, so accounts can't be enumerated.
    // Demo accounts never sign in with a password (only POST /auth/demo-login on the demo instance).
    if (!user || user.isDemo || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Not verified yet (and email can be sent): a fresh code (at most one a minute) and the code screen
    if (user.emailVerified === false && isEmailEnabled()) {
      await sendVerificationCode(user);
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email',
        email: user.email,
      });
    }

    // Create token
    const token = signToken(user);

    res.status(200).json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/auth/demo
 * @desc Whether this is the demo instance (the login page then shows only the demo buttons)
 * @access Public
 */
exports.getDemoStatus = (req, res) => {
  res.status(200).json({ success: true, enabled: isDemoMode() });
};

/**
 * @route POST /api/auth/demo-login
 * @desc One-click sign-in as the demo account for a role: { role: 'student' | 'librarian' | 'admin' }.
 * The account is picked on the server by its isDemo flag (the oldest active one per role), so no
 * password is ever sent or stored in the browser. Only on the demo instance (DEMO_MODE=true).
 * @access Public (rate limited)
 */
exports.demoLogin = async (req, res) => {
  if (!isDemoMode()) return res.status(404).json({ success: false, message: 'Route not found' });
  const role = req.body?.role;
  if (typeof role !== 'string' || !DEMO_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role must be student, librarian or admin' });
  }

  try {
    const user = await User.findOne({ isDemo: true, role, isActive: { $ne: false }, isOnboardingCompleted: true })
      .sort({ createdAt: 1, _id: 1 });
    if (!user) {
      return res.status(503).json({ success: false, message: 'The demo accounts are being reset. Try again in a minute.' });
    }
    res.status(200).json({ success: true, token: signToken(user), user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      // The full document (googleId and password are never selected) plus the derived fields of toPublicUser
      user: { ...user.toObject(), ...toPublicUser(user) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/auth/complete-onboarding
 * @desc Complete onboarding with favorite genres
 * @access Private
 */
exports.completeOnboarding = async (req, res, next) => {
  try {
    const { favoriteGenres, phone, address } = req.body;

    if (!favoriteGenres || !Array.isArray(favoriteGenres) || favoriteGenres.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least 2 favorite genres',
      });
    }

    if (favoriteGenres.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'You can select maximum 5 genres',
      });
    }

    if (invalidGenres(favoriteGenres).length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid genre(s): ${invalidGenres(favoriteGenres).join(', ')}`,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isOnboardingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding already completed',
      });
    }

    // Google accounts give a phone number here (email signups may already have one: optional for them)
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : phone;
    if (user.createdWith === 'google' && !user.phone && !trimmedPhone) {
      return res.status(400).json({ success: false, message: 'Please enter your phone number' });
    }
    const detailsProblem = phoneProblem(trimmedPhone) || addressProblem(address);
    if (detailsProblem) return res.status(400).json({ success: false, message: detailsProblem });
    if (trimmedPhone) user.phone = trimmedPhone;
    if (typeof address === 'string' && address.trim()) user.address = address.trim();

    user.favoriteGenres = favoriteGenres;
    user.isOnboardingCompleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/auth/update-profile
 * @desc Update user profile (name, phone, address, profileImage)
 * @access Private
 */
const NAME_MAX = 60;
const ADDRESS_MAX = 200;
// Digits with optional leading +, spaces, hyphens or brackets; 7-15 digits in total
const PHONE_PATTERN = /^\+?[\d\s()-]+$/;

/** Problem with an optional phone value (undefined or '' = none), or null */
const phoneProblem = (phone) => {
  if (phone === undefined || phone === '') return null;
  const digits = typeof phone === 'string' ? phone.replace(/\D/g, '').length : 0;
  if (typeof phone !== 'string' || !PHONE_PATTERN.test(phone) || digits < 7 || digits > 15) {
    return 'Phone must be 7-15 digits (spaces, hyphens and a leading + are allowed)';
  }
  return null;
};

/** Problem with an optional address value, or null */
const addressProblem = (address) => {
  const trimmed = typeof address === 'string' ? address.trim() : address;
  if (trimmed === undefined || trimmed === '') return null;
  return typeof trimmed !== 'string' || trimmed.length > ADDRESS_MAX ? `Address must be at most ${ADDRESS_MAX} characters` : null;
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage, phone, address } = req.body;

    if (name === undefined && !profileImage && phone === undefined && address === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
      });
    }

    const trimmedName = typeof name === 'string' ? name.trim() : name;
    if (trimmedName !== undefined && (typeof trimmedName !== 'string' || trimmedName.length < 2 || trimmedName.length > NAME_MAX)) {
      return res.status(400).json({
        success: false,
        message: `Name must be between 2 and ${NAME_MAX} characters`,
      });
    }

    // Phone and address are optional; an empty string clears them
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : phone;
    if (trimmedPhone !== undefined && trimmedPhone !== '') {
      const digits = typeof trimmedPhone === 'string' ? trimmedPhone.replace(/\D/g, '').length : 0;
      if (typeof trimmedPhone !== 'string' || !PHONE_PATTERN.test(trimmedPhone) || digits < 7 || digits > 15) {
        return res.status(400).json({
          success: false,
          message: 'Phone must be 7-15 digits (spaces, hyphens and a leading + are allowed)',
        });
      }
    }

    const trimmedAddress = typeof address === 'string' ? address.trim() : address;
    if (trimmedAddress !== undefined && (typeof trimmedAddress !== 'string' || trimmedAddress.length > ADDRESS_MAX)) {
      return res.status(400).json({
        success: false,
        message: `Address must be at most ${ADDRESS_MAX} characters`,
      });
    }

    // Avatars are uploaded via /profile/upload-avatar; only an http(s) URL may be stored here
    if (profileImage && (typeof profileImage !== 'string' || !/^https?:\/\//i.test(profileImage) || profileImage.length > 2048)) {
      return res.status(400).json({
        success: false,
        message: 'Profile image must be an http(s) URL of at most 2048 characters',
      });
    }

    // Demo accounts are shared: no pictures of the visitor's choosing
    if (profileImage && req.user.isDemo) return res.status(403).json(demoDisabledBody);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const oldName = user.name;
    if (trimmedName !== undefined) user.name = trimmedName;
    if (trimmedPhone !== undefined) user.phone = trimmedPhone || undefined;
    if (trimmedAddress !== undefined) user.address = trimmedAddress || undefined;
    if (profileImage) user.profileImage = profileImage;
    await user.save();

    if (user.role === 'student' && trimmedName !== undefined && oldName !== trimmedName) {
      // Staff-facing, one per active librarian/admin (non-fatal: notifyStaff never throws)
      await notifyStaff({
        type: 'NAME_CHANGE',
        title: 'Student name change',
        message: `${user.libraryId ? `Student ${user.libraryId}` : 'A student'} changed their name from "${oldName}" to "${trimmedName}".`,
        path: '/users',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/auth/update-favorite-genres
 * @desc Update user's favorite genres
 * @access Private
 */
exports.updateFavoriteGenres = async (req, res, next) => {
  try {
    const { favoriteGenres } = req.body;

    if (!favoriteGenres || !Array.isArray(favoriteGenres)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide favorite genres as an array',
      });
    }

    if (favoriteGenres.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least 2 favorite genres',
      });
    }

    if (favoriteGenres.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'You can select maximum 5 genres',
      });
    }

    if (invalidGenres(favoriteGenres).length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid genre(s): ${invalidGenres(favoriteGenres).join(', ')}`,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.favoriteGenres = favoriteGenres;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Favorite genres updated successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password (verify current, hash new)
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Your account has no password yet. Set one first.' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password — pre('save') hook will bcrypt hash it. Bumping tokenVersion signs out every
    // other session (tokens signed before now); this one continues with the new token below.
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Send notification (non-fatal)
    try {
      await createNotification(
        user._id,
        user.role,
        'PASSWORD_CHANGED',
        'Password Changed',
        'Your password has been changed successfully. If you did not make this change, please contact support.'
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      token: signToken(user),
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/auth/set-password
 * @desc A first password for an account created with Google: { newPassword }. Only while the
 * account has none (afterwards it is "change password", which asks for the current one).
 * @access Private (rate limited)
 */
exports.setPassword = async (req, res) => {
  try {
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
    if (newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: 'The password must be 6 to 128 characters' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.password || user.hasPassword !== false) {
      return res.status(400).json({ success: false, message: 'Your account already has a password. Use "Change password".' });
    }

    user.password = newPassword; // hashed by pre('save')
    user.hasPassword = true;
    await user.save();

    try {
      await createNotification(user._id, user.role, 'PASSWORD_CHANGED', 'Password set',
        'You can now also sign in with your email and this password. If you did not do this, contact the library.');
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }
    res.status(200).json({ success: true, message: 'Password set', user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
