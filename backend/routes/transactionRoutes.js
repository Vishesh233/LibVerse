const express = require('express');
const {
  requestIssueBook,
  returnBook,
  getUserTransactions,
  getAllTransactions,
  approveIssueRequest,
  rejectIssueRequest,
  renewBook,
} = require('../controllers/transactionController');
const { protect, isAdmin, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Student routes
router.post('/issue', protect, isStudent, requestIssueBook);
router.put('/:id/return', protect, returnBook);
router.put('/:id/renew', protect, renewBook);
router.get('/user/me', protect, getUserTransactions);

// Admin routes
router.get('/', protect, isAdmin, getAllTransactions);
router.put('/:id/approve', protect, isAdmin, approveIssueRequest);
router.put('/:id/reject', protect, isAdmin, rejectIssueRequest);

module.exports = router;
