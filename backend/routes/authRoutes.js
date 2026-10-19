const express = require('express');
const {
  signup, login, getCurrentUser, updateProfile, completeOnboarding, updateFavoriteGenres, changePassword, getDemoStatus, demoLogin,
} = require('../controllers/authController');
const { getMyStats, getMyActivity, getMyReadingStats } = require('../controllers/accountController');
const { getMyCard } = require('../controllers/deskController');
const { getResetStatus, requestReset, resetPassword } = require('../controllers/passwordResetController');
const { protect, isStudent, blockDemo, notInDemoMode } = require('../middleware/authMiddleware');
const { rateLimiters } = require('../config/security');

const router = express.Router();
const limit = rateLimiters();

// Public routes (the demo instance has no signup, password login or password reset)
router.post('/signup', notInDemoMode, limit.signup, signup);
router.post('/login', notInDemoMode, limit.login, login);
// Forgot password by emailed code (only when SMTP is configured)
router.get('/password-reset', getResetStatus);
router.post('/forgot-password', notInDemoMode, limit.forgotPassword, requestReset);
router.post('/reset-password', notInDemoMode, limit.resetPassword, resetPassword);
// Live demo: one-click sign-in (404 unless DEMO_MODE=true)
router.get('/demo', getDemoStatus);
router.post('/demo-login', limit.demoLogin, demoLogin);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/me/stats', protect, getMyStats);
router.get('/me/activity', protect, getMyActivity);
router.get('/me/reading-stats', protect, isStudent, getMyReadingStats);
router.get('/me/card', protect, getMyCard);
router.put('/update-profile', protect, updateProfile);
router.put('/complete-onboarding', protect, completeOnboarding);
router.put('/update-favorite-genres', protect, updateFavoriteGenres);
router.put('/change-password', limit.passwordChange, protect, blockDemo, changePassword);

module.exports = router;
