const mongoose = require('mongoose');
const { calculateFine } = require('../utils/fineCalculator');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: Date,
    status: {
      type: String,
      enum: [
        'pending',
        'issued',
        'return_requested',
        'payment_pending',
        'returned',
        'rejected',
        'overdue',
      ],
      default: 'pending',
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: Date,
    renewalCount: {
      type: Number,
      default: 0,
    },
    // Return flow fields
    returnRequestedAt: Date,
    returnApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Payment flow fields
    paymentScreenshot: String,
    paymentSubmittedAt: Date,
    paymentApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentApprovedAt: Date,
    // Fine waiver (staff): the part of fineAmount the student no longer owes.
    // Payable fine = fineAmount - fineWaived, never below 0 (utils/fineCalculator payableFineOf)
    fineWaived: {
      type: Number,
      default: 0,
      min: 0,
    },
    waiverReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    waivedAt: Date,
    // Automatic reminders (jobs/reminders.js): when each kind was last sent for this loan
    remindersSent: {
      dueSoon: Date,
      overdue: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate fine based on overdue calendar days (same formula as utils/fineCalculator)
transactionSchema.methods.calculateFine = function (fineRate = 5) {
  if (this.status === 'returned') return 0;
  return calculateFine(this.dueDate, new Date(), fineRate);
};

module.exports = mongoose.model('Transaction', transactionSchema);

