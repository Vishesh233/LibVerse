const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { calculateFine } = require('../utils/fineCalculator');

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
    const daysLate = transaction.status === 'issued'
      ? Math.max(1, Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24)))
      : 0;

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

exports.payFine = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId', 'title');
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
      return res.status(400).json({ success: false, message: 'No fine due for this transaction' });
    }

    if (transaction.finePaid) {
      return res.status(400).json({ success: false, message: 'Fine is already paid' });
    }

    transaction.finePaid = true;
    await transaction.save();

    const user = await User.findById(req.user.id);
    if (user) {
      user.fineAmount = Math.max(0, (user.fineAmount || 0) - fineAmount);
      await user.save();
    }

    // Non-fatal - never fails the main operation
    try {
      await createNotification(
        req.user.id,
        'admin',
        'FINE_PAID',
        'Fine Payment Received',
        `Student ${req.user.name || user?.name || req.user.email} paid fine of ₹${fineAmount} for "${transaction.bookId?.title || 'Unknown'}"`
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Fine marked as paid',
      transaction,
      fineAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};