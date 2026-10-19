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
  getPaymentScreenshot,
  waiveFine,
} = require('../controllers/transactionController');
const { protect, isStaff, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Student routes
router.post('/issue', protect, isStudent, requestIssueBook);
router.put('/:id/return', protect, returnBook);
router.put('/:id/renew', protect, renewBook);
router.get('/user/me', protect, getUserTransactions);
router.put('/:id/submit-payment', protect, submitPayment);

// Admin routes
router.get('/', protect, isStaff, getAllTransactions);
router.get('/:id/payment-screenshot', protect, isStaff, getPaymentScreenshot);
router.put('/:id/approve', protect, isStaff, approveIssueRequest);
router.put('/:id/reject', protect, isStaff, rejectIssueRequest);
router.put('/:id/approve-return', protect, isStaff, approveReturn);
router.put('/:id/approve-payment', protect, isStaff, approvePayment);
router.post('/:id/waive', protect, isStaff, waiveFine);

module.exports = router;
