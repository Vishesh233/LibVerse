const express = require('express');
const {
  requestIssueBook,
  returnBook,
  getUserTransactions,
  getAllTransactions,
  approveIssueRequest,
  rejectIssueRequest,
  renewBook,
  approveReturn,
  submitPayment,
  approvePayment,
} = require('../controllers/transactionController');
const { protect, isAdmin, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Student routes
router.post('/issue', protect, isStudent, requestIssueBook);
router.put('/:id/return', protect, returnBook);
router.put('/:id/renew', protect, renewBook);
router.get('/user/me', protect, getUserTransactions);
router.put('/:id/submit-payment', protect, submitPayment);

// Admin routes
router.get('/', protect, isAdmin, getAllTransactions);
router.put('/:id/approve', protect, isAdmin, approveIssueRequest);
router.put('/:id/reject', protect, isAdmin, rejectIssueRequest);
router.put('/:id/approve-return', protect, isAdmin, approveReturn);
router.put('/:id/approve-payment', protect, isAdmin, approvePayment);

module.exports = router;
