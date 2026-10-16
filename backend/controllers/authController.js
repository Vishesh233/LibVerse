const User = require('../models/User');
const Book = require('../models/Book');

// Favourite genres must be real catalogue genres (the Book.genre enum)
const VALID_GENRES = Book.schema.path('genre').enumValues;
const invalidGenres = (genres) => genres.filter((g) => !VALID_GENRES.includes(g));
const { createNotification } = require('./notificationController');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

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

    // Create user
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: 'student',
      phone,
      address,
      libraryId: `LIB-${Date.now()}`,
    });

    // Create token
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        libraryId: user.libraryId,
        profileImage: user.profileImage,
        isOnboardingCompleted: user.isOnboardingCompleted,
        favoriteGenres: user.favoriteGenres,
      },
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

    // Same message for unknown email and wrong password, so accounts can't be enumerated
    if (!user || !(await user.matchPassword(password))) {
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

    // Create token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        libraryId: user.libraryId,
        fineAmount: user.fineAmount,
        profileImage: user.profileImage,
        isOnboardingCompleted: user.isOnboardingCompleted,
        favoriteGenres: user.favoriteGenres,
      },
    });
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
      user,
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
    const { favoriteGenres } = req.body;

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

    user.favoriteGenres = favoriteGenres;
    user.isOnboardingCompleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        libraryId: user.libraryId,
        profileImage: user.profileImage,
        isOnboardingCompleted: user.isOnboardingCompleted,
        favoriteGenres: user.favoriteGenres,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/auth/update-profile
 * @desc Update user profile (name, profileImage)
 * @access Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;

    if (!name && !profileImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
      });
    }

    // Avatars are uploaded via /profile/upload-avatar; only an http(s) URL may be stored here
    if (profileImage && (typeof profileImage !== 'string' || !/^https?:\/\//i.test(profileImage) || profileImage.length > 2048)) {
      return res.status(400).json({
        success: false,
        message: 'Profile image must be an http(s) URL of at most 2048 characters',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const oldName = user.name;
    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;
    await user.save();

    if (user.role === 'student' && name && oldName !== name) {
      // Non-fatal - never fails the main operation
      try {
        await createNotification(
          user._id,
          'admin',
          'NAME_CHANGE',
          'Student Name Change',
          `Student ${user.libraryId} changed name from "${oldName}" to "${name}"`
        );
      } catch (notifError) {
        console.error('Notification creation failed (non-fatal):', notifError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        libraryId: user.libraryId,
        profileImage: user.profileImage,
        isOnboardingCompleted: user.isOnboardingCompleted,
        favoriteGenres: user.favoriteGenres,
      },
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

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password — pre('save') hook will bcrypt hash it
    user.password = newPassword;
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
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
