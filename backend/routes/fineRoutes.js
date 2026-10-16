const express = require('express');
const { protect, isStudent } = require('../middleware/authMiddleware');
const { initiatePayment } = require('../controllers/fineController');

const router = express.Router();

// Fines are settled through the return flow: submit-payment (student) -> approve-payment (librarian/admin)
router.post('/initiate-payment', protect, isStudent, initiatePayment);

module.exports = router;
