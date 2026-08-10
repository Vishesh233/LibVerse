const mongoose = require('mongoose');

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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate fine based on overdue days
transactionSchema.methods.calculateFine = function (fineRate = 5) {
  if (this.status === 'returned') return 0;
  const today = new Date();
  if (today > this.dueDate) {
    const daysOverdue = Math.floor((today - this.dueDate) / (1000 * 60 * 60 * 24));
    return daysOverdue * fineRate;
  }
  return 0;
};

module.exports = mongoose.model('Transaction', transactionSchema);

