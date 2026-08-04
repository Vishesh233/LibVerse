const express = require('express');
const { protect, isStudent } = require('../middleware/authMiddleware');
const { initiatePayment, payFine } = require('../controllers/fineController');

const router = express.Router();

router.post('/initiate-payment', protect, isStudent, initiatePayment);
router.patch('/:id/pay', protect, isStudent, payFine);

module.exports = router;
