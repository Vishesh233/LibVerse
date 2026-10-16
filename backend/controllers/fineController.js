const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { calculateFine, getDaysOverdue } = require('../utils/fineCalculator');

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

    const fineAmount = transaction.status === 'issued'
      ? calculateFine(transaction.dueDate)
      : transaction.fineAmount;

    if (!fineAmount || fineAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No outstanding fine to pay' });
    }

    const paymentReference = `PAY-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const daysLate = transaction.status === 'issued' ? getDaysOverdue(transaction.dueDate) : 0;

    return res.status(200).json({
      success: true,
      paymentReference,
      transaction: {
        _id: transaction._id,
        bookTitle: transaction.bookId?.title || 'Unknown Book',
        dueDate: transaction.dueDate,
        fineAmount,
        daysLate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};