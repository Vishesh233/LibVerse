const mongoose = require('mongoose');

/**
 * UI categories (icon, colour and filter) for each notification type.
 * Types not listed here fall into 'system'.
 */
const CATEGORY_TYPES = {
  request: ['ISSUE_REQUEST', 'PENDING_APPROVAL'],
  approval: ['BOOK_ISSUED', 'ISSUE_REJECTED', 'BOOK_RENEWED'],
  return: ['RETURN_REQUEST', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'BOOK_RETURNED'],
  fine: ['PAYMENT_PENDING', 'PAYMENT_APPROVED', 'FINE_GENERATED', 'FINE_PAID'],
  reminder: ['DUE_DATE_REMINDER', 'BOOK_OVERDUE'],
  reservation: ['RESERVATION_READY', 'RESERVATION_EXPIRED', 'RESERVATION_CANCELLED', 'BACK_IN_STOCK'],
};
const CATEGORIES = [...Object.keys(CATEGORY_TYPES), 'system'];
const categoryOf = (type) => CATEGORIES.find((c) => CATEGORY_TYPES[c]?.includes(type)) || 'system';

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
        'BOOK_RENEWED',
        'DUE_DATE_REMINDER',
        'BOOK_OVERDUE',
        'WISHLIST_AVAILABLE',
        'FINE_GENERATED',
        'PROFILE_UPDATED',
        'PASSWORD_CHANGED',
        'NEW_RECOMMENDATIONS',
        'ISSUE_REQUEST',
        'ISSUE_REJECTED',
        'RETURN_REQUEST',
        'RETURN_REQUESTED',
        'RETURN_APPROVED',
        'PAYMENT_PENDING',
        'PAYMENT_APPROVED',
        'PENDING_APPROVAL',
        'NEW_MEMBER',
        'LOW_STOCK',
        'FINE_PAID',
        'FINE_WAIVED',
        'INVENTORY_UPDATE',
        'NEW_LIBRARIAN',
        'SYSTEM_ACTIVITY',
        'USER_MANAGEMENT',
        'REPORT_GENERATED',
        'CRITICAL_ALERT',
        'DATABASE_NOTIFICATION',
        'NAME_CHANGE',
        'RESERVATION_READY',
        'RESERVATION_EXPIRED',
        'RESERVATION_CANCELLED',
        'BACK_IN_STOCK',
      ],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Frontend path opened when the notification is clicked (e.g. /student/my-books?tab=issued)
    link: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    // Small reference data only - never large payloads
    meta: {
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    },
  },
  { timestamps: true }
);

// Per-user listing, newest first, and unread counts
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Virtual for notificationId used by frontend/tests
notificationSchema.virtual('notificationId').get(function () {
  return `NOTIF-${this._id}`;
});

notificationSchema.virtual('category').get(function () {
  return categoryOf(this.type);
});

// Ensure virtuals are included in JSON output
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema);
Notification.CATEGORY_TYPES = CATEGORY_TYPES;
Notification.CATEGORIES = CATEGORIES;
Notification.categoryOf = categoryOf;

module.exports = Notification;
