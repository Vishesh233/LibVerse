const mongoose = require('mongoose');

/**
 * A student's place in the waiting list for a book with no free copies.
 * waiting -> ready (a returned copy is held for them until expiresAt) -> fulfilled (borrowed)
 * waiting|ready -> cancelled (student or staff) | expired (not borrowed in time).
 * Queue order is createdAt (then _id).
 */
const ACTIVE_STATUSES = ['waiting', 'ready'];

const reservationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['waiting', 'ready', 'fulfilled', 'cancelled', 'expired'],
      default: 'waiting',
    },
    // Set when a copy is held for this reservation
    readyAt: Date,
    expiresAt: Date,
    // The loan that used the reservation
    fulfilledTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// At most one active (waiting or ready) reservation per student and book
reservationSchema.index(
  { userId: 1, bookId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ACTIVE_STATUSES } } }
);
// Queue per book, and the expiry job
reservationSchema.index({ bookId: 1, status: 1, createdAt: 1 });
reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ userId: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
Reservation.ACTIVE_STATUSES = ACTIVE_STATUSES;

module.exports = Reservation;
