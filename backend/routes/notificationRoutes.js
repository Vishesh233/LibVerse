const express = require('express');
const { protect, isStaff } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createAdminNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.put('/read/:id', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.post('/admin', protect, isStaff, createAdminNotification);

module.exports = router;
