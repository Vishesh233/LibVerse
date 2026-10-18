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
  globalSearch,
} = require('../controllers/adminController');
const { getAnalytics, getReports, getAuditLog } = require('../controllers/analyticsController');
const { resolveCode, deskIssue, deskReturn, reissueCard } = require('../controllers/deskController');
const { protect, isStaff, isAdminRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Search route - accessible to all authenticated users (before admin middleware)
router.get('/search', protect, globalSearch);

// All other admin routes - require staff (librarian or admin)
router.use(protect, isStaff);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/reports', getReports);
router.get('/audit', isAdminRole, getAuditLog);
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

// Scan desk
router.get('/desk/resolve', resolveCode);
router.post('/desk/issue', deskIssue);
router.post('/desk/return', deskReturn);
router.post('/users/:id/reissue-card', isAdminRole, reissueCard);

module.exports = router;
