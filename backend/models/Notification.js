const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'librarian', 'admin'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'BOOK_ISSUED',
        'BOOK_RETURNED',
        'DUE_DATE_REMINDER',
        'BOOK_OVERDUE',
        'WISHLIST_AVAILABLE',
        'FINE_GENERATED',
        'PROFILE_UPDATED',
        'PASSWORD_CHANGED',
        'NEW_RECOMMENDATIONS',
        'ISSUE_REQUEST',
        'RETURN_REQUEST',
        'RETURN_REQUESTED',
        'RETURN_APPROVED',
        'PAYMENT_PENDING',
        'PAYMENT_APPROVED',
        'PENDING_APPROVAL',
        'NEW_MEMBER',
        'LOW_STOCK',
        'FINE_PAID',
        'INVENTORY_UPDATE',
        'NEW_LIBRARIAN',
        'SYSTEM_ACTIVITY',
        'USER_MANAGEMENT',
        'REPORT_GENERATED',
        'CRITICAL_ALERT',
        'DATABASE_NOTIFICATION',
        'NAME_CHANGE',
      ],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual for notificationId used by frontend/tests
notificationSchema.virtual('notificationId').get(function () {
  return `NOTIF-${this._id}`;
});

// Ensure virtuals are included in JSON output
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);