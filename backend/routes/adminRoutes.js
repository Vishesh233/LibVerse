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
const { resolveCode, deskIssue, deskReturn, reissueCard, getUserCard } = require('../controllers/deskController');
const { getUserOverview, lookupUsers } = require('../controllers/userOverviewController');
const { protect, isStaff, isAdminRole, blockDemo } = require('../middleware/authMiddleware');

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
// Student 360 (librarians: students only) and "Find a student"
router.get('/users/lookup', lookupUsers);
router.get('/users/:id/overview', getUserOverview);
router.get('/users/:id/card', getUserCard);
// Accounts and system-wide actions are off for demo accounts
router.post('/users', blockDemo, createUser);
router.put('/users/:id', blockDemo, updateUser);
router.delete('/users/:id', blockDemo, deleteUser);
router.get('/pending-requests', getPendingRequests);
router.post('/create-admin', isAdminRole, blockDemo, createAdminUser);
router.post('/send-reminders', blockDemo, sendOverdueReminders);
router.post('/issue-book', adminIssueBook);
router.post('/return-book', adminReturnBook);

// Scan desk
router.get('/desk/resolve', resolveCode);
router.post('/desk/issue', deskIssue);
router.post('/desk/return', deskReturn);
router.post('/users/:id/reissue-card', isAdminRole, blockDemo, reissueCard);

module.exports = router;
