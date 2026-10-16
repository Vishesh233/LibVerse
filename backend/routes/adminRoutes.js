const express = require('express');
const {
  getDashboard,
  getNotifications,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getPendingRequests,
  createAdminUser,
  sendOverdueReminders,
  adminIssueBook,
  adminReturnBook,
  getReports,
  globalSearch,
} = require('../controllers/adminController');
const { protect, isStaff, isAdminRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Search route - accessible to all authenticated users (before admin middleware)
router.get('/search', protect, globalSearch);

// All other admin routes - require admin role
router.use(protect, isStaff);

router.get('/dashboard', getDashboard);
router.get('/reports', getReports);
router.get('/notifications', getNotifications);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/pending-requests', getPendingRequests);
router.post('/create-admin', isAdminRole, createAdminUser);
router.post('/send-reminders', sendOverdueReminders);
router.post('/issue-book', adminIssueBook);
router.post('/return-book', adminReturnBook);

module.exports = router;
