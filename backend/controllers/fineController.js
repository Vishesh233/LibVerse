const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { getDaysLateOf, payableFineOf } = require('../utils/fineCalculator');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { fineId } = req.body;
    const transaction = await Transaction.findById(fineId).populate('bookId', 'title');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Fine transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay this fine' });
    }

    // What is still owed: the fine (growing while issued) minus any waiver; 0 once paid
    const fineAmount = payableFineOf(transaction);

    if (!fineAmount || fineAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No outstanding fine to pay' });
    }

    const paymentReference = `PAY-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    // Measured to the day the fine was frozen (return request), not to today
    const daysLate = getDaysLateOf(transaction);

    return res.status(200).json({
      success: true,
      paymentReference,
      transaction: {
        _id: transaction._id,
        bookTitle: transaction.bookId?.title || 'Unknown Book',
        dueDate: transaction.dueDate,
        fineAmount,
        fineWaived: transaction.fineWaived || 0,
        daysLate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};