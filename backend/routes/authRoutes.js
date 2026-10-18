const express = require('express');
const { signup, login, getCurrentUser, updateProfile, completeOnboarding, updateFavoriteGenres, changePassword } = require('../controllers/authController');
const { getMyStats, getMyActivity, getMyReadingStats } = require('../controllers/accountController');
const { protect, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/me/stats', protect, getMyStats);
router.get('/me/activity', protect, getMyActivity);
router.get('/me/reading-stats', protect, isStudent, getMyReadingStats);
router.put('/update-profile', protect, updateProfile);
router.put('/complete-onboarding', protect, completeOnboarding);
router.put('/update-favorite-genres', protect, updateFavoriteGenres);
router.put('/change-password', protect, changePassword);

module.exports = router;
