/**
 * Book reservations (waiting list).
 *
 * - A student reserves a book with no free copy and waits in line (oldest first).
 * - When a loaned copy comes back, returnCopy() moves it straight from issued to held for the oldest
 *   waiting reservation (status ready, 48 hours to borrow); other freed copies go through fillQueue(). Held copies are counted in Book.heldCopies and can only be lent to that student.
 * - Borrowing goes through the normal request flow; approval calls takeCopyFor(), which uses the held
 *   copy and marks the reservation fulfilled.
 * - expireReservations() (hourly job) releases copies that were not borrowed in time and moves on
 *   to the next student; cancelling a ready reservation does the same.
 * - checkBackInStock() tells wishlisting students, once per event, when a book has a free copy again.
 *
 * Every state change is a conditional update on one document, so concurrent returns, approvals,
 * cancels and job runs can never hold, lend or release the same copy twice.
 */
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { notifyStudent } = require('../controllers/notificationController');
const {
  takeBookCopy,
  returnBookCopy,
  holdBookCopy,
  releaseHeldCopy,
  consumeHeldCopy,
  returnCopyToHold,
  restoreHeldCopy,
} = require('../utils/bookStock');

const HOLD_HOURS = 48;
const HOUR_MS = 60 * 60 * 1000;
const MAX_ACTIVE_RESERVATIONS = 3;
const ACTIVE = Reservation.ACTIVE_STATUSES;
// A request or loan that is still open (same list the issue-request duplicate check uses)
const OPEN_LOAN_STATUSES = ['pending', 'issued', 'return_requested', 'payment_pending'];
const RESERVATIONS_LINK = '/student/my-books?tab=reservations';
const QUEUE_ORDER = { createdAt: 1, _id: 1 };

const idOf = (value) => value?._id || value;

/**
 * Queue position (1 = next) for each waiting reservation in the list; others get null.
 * @param {Array<Object>} reservations - plain objects or documents with _id, bookId, status
 * @returns {Promise<Map<String, Number>>} reservation id -> position
 */
const queuePositions = async (reservations) => {
  const bookIds = [...new Set(reservations.filter((r) => r.status === 'waiting').map((r) => String(idOf(r.bookId))))];
  const positions = new Map();
  if (!bookIds.length) return positions;
  const queue = await Reservation.find({ bookId: { $in: bookIds }, status: 'waiting' })
    .sort(QUEUE_ORDER)
    .select('_id bookId')
    .lean();
  const counters = {};
  queue.forEach((r) => {
    const key = String(r.bookId);
    counters[key] = (counters[key] || 0) + 1;
    positions.set(String(r._id), counters[key]);
  });
  return positions;
};

const formatHoldEnd = (date) =>
  new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Claim the oldest waiting reservation of a book (waiting -> ready, 48 hours from now), or null. */
const claimNextWaiting = (bookId, now) =>
  Reservation.findOneAndUpdate(
    { bookId, status: 'waiting' },
    { $set: { status: 'ready', readyAt: now, expiresAt: new Date(now.getTime() + HOLD_HOURS * HOUR_MS) } },
    { sort: QUEUE_ORDER, new: true }
  );

/** No copy could be held after all: back to waiting with its place in line unchanged. */
const unclaim = (reservation) =>
  Reservation.updateOne(
    { _id: reservation._id, status: 'ready', readyAt: reservation.readyAt },
    { $set: { status: 'waiting' }, $unset: { readyAt: '', expiresAt: '' } }
  );

const notifyReady = (reservation, title) =>
  notifyStudent(reservation.userId, {
    type: 'RESERVATION_READY',
    title: 'Your reserved book is ready — borrow within 48 hours',
    message: `"${title}" is being held for you until ${formatHoldEnd(reservation.expiresAt)}. Open My Books and choose Borrow now to request it.`,
    link: RESERVATIONS_LINK,
    meta: { bookId: reservation.bookId },
  });

/**
 * Hold free copies of a book for the oldest waiting reservations, one copy each, while both last.
 * Claims the reservation first (waiting -> ready), then the copy; if the copy is gone the
 * reservation goes back to waiting with its place in line unchanged.
 * @returns {Promise<Number>} reservations made ready
 */
const fillQueue = async (bookId, now = new Date()) => {
  let promoted = 0;
  for (;;) {
    const book = await Book.findById(bookId).select('title isActive availableCopies').lean();
    if (!book || book.isActive === false || !(book.availableCopies > 0)) break;

    const reservation = await claimNextWaiting(bookId, now);
    if (!reservation) break;

    if (!(await holdBookCopy(bookId))) {
      await unclaim(reservation);
      break;
    }

    promoted++;
    await notifyReady(reservation, book.title);
  }
  return promoted;
};

/**
 * One "back in stock" notification per availability event: only the call that clears
 * Book.restockAlertPending (armed when the last free copy went) sends it. Students who already
 * reserve or hold the book are skipped.
 * @returns {Promise<Number>} notifications sent
 */
const checkBackInStock = async (bookId) => {
  const book = await Book.findOneAndUpdate(
    { _id: bookId, isActive: true, restockAlertPending: true, availableCopies: { $gt: 0 } },
    { $set: { restockAlertPending: false } },
    { new: true }
  ).select('title');
  if (!book) return 0;

  const [students, reserved, borrowing] = await Promise.all([
    User.find({ role: 'student', isActive: { $ne: false }, wishlist: book._id }).select('_id').lean(),
    Reservation.distinct('userId', { bookId: book._id, status: { $in: ACTIVE } }),
    Transaction.distinct('userId', { bookId: book._id, status: { $in: OPEN_LOAN_STATUSES } }),
  ]);
  const skip = new Set([...reserved, ...borrowing].map(String));

  let sent = 0;
  for (const student of students) {
    if (skip.has(String(student._id))) continue;
    const created = await notifyStudent(student._id, {
      type: 'BACK_IN_STOCK',
      title: 'Back in stock',
      message: `"${book.title}" from your wishlist is available again. Request it before someone else does.`,
      link: `/student/books/${book._id}`,
      meta: { bookId: book._id },
    });
    if (created) sent++;
  }
  return sent;
};

/**
 * A copy of the book became free (return approved, hold released, copies added): give it to the
 * waiting list first, then tell wishlisters if a free copy is left. Never throws - the return
 * itself has already happened.
 * @returns {Promise<{ promoted: Number, notified: Number }>}
 */
const afterCopyFreed = async (bookId, now = new Date()) => {
  try {
    const promoted = await fillQueue(bookId, now);
    const notified = await checkBackInStock(bookId);
    return { promoted, notified };
  } catch (error) {
    console.error('Reservation queue update failed (non-fatal):', error.message);
    return { promoted: 0, notified: 0 };
  }
};

/**
 * A loaned copy came back (return approved, payment approved, desk return). If someone is waiting,
 * the copy goes straight from issued to held for the oldest reservation in one conditional update,
 * so no other request can take it in between. Otherwise it goes back on the shelf (and wishlisters
 * may hear it is back in stock).
 * @returns {Promise<Object|null>} the updated book
 */
const returnCopy = async (bookId, now = new Date()) => {
  try {
    const reservation = await claimNextWaiting(bookId, now);
    if (reservation) {
      const book = await returnCopyToHold(bookId);
      if (book) {
        await notifyReady(reservation, book.title);
        return book;
      }
      await unclaim(reservation);
    }
  } catch (error) {
    console.error('Holding the returned copy failed (non-fatal, returned to the shelf):', error.message);
  }
  const book = await returnBookCopy(bookId);
  await afterCopyFreed(bookId, now);
  return book;
};

/**
 * Take a copy for a loan to this student: their held copy if they have a ready reservation,
 * otherwise a free copy. Marks the reservation fulfilled (linked to the loan); a waiting
 * reservation is fulfilled too when a free copy is used, so the student leaves the queue.
 * @returns {Promise<{ book, fromHold: Boolean, reservation }|null>} null when no copy can be taken
 */
const takeCopyFor = async (userId, bookId, transactionId) => {
  let reservation = await Reservation.findOneAndUpdate(
    { userId, bookId, status: 'ready' },
    { $set: { status: 'fulfilled', fulfilledTransactionId: transactionId } },
    { new: true }
  );
  if (reservation) {
    const book = await consumeHeldCopy(bookId);
    if (book) return { book, fromHold: true, reservation };
    // Nothing held (should not happen): give the reservation back and try a free copy
    await Reservation.updateOne(
      { _id: reservation._id, status: 'fulfilled' },
      { $set: { status: 'ready' }, $unset: { fulfilledTransactionId: '' } }
    );
  }

  const book = await takeBookCopy(bookId);
  if (!book) return null;
  reservation = await Reservation.findOneAndUpdate(
    { userId, bookId, status: 'waiting' },
    { $set: { status: 'fulfilled', fulfilledTransactionId: transactionId } },
    { new: true }
  );
  return { book, fromHold: false, reservation };
};

/** Undo takeCopyFor() when the loan could not be recorded. */
const undoTakeCopy = async (taken, bookId) => {
  if (!taken) return;
  if (taken.fromHold) {
    await restoreHeldCopy(bookId);
  } else {
    await returnBookCopy(bookId);
  }
  if (taken.reservation) {
    await Reservation.updateOne(
      { _id: taken.reservation._id, status: 'fulfilled' },
      { $set: { status: taken.fromHold ? 'ready' : 'waiting' }, $unset: { fulfilledTransactionId: '' } }
    );
  }
};

/**
 * Expire ready reservations whose 48 hours are up: release the held copy, tell the student,
 * and pass the copy to the next student in line (or back to the shelf).
 * @param {Object} [options]
 * @param {Date} [options.now] - reference time (tests simulate later hours)
 * @returns {Promise<{ expired: Number, promoted: Number }>}
 */
const expireReservations = async ({ now = new Date() } = {}) => {
  const due = await Reservation.find({ status: 'ready', expiresAt: { $lte: now } }).select('_id').lean();
  let expired = 0;
  let promoted = 0;
  for (const { _id } of due) {
    const reservation = await Reservation.findOneAndUpdate(
      { _id, status: 'ready', expiresAt: { $lte: now } },
      { $set: { status: 'expired' } },
      { new: true }
    ).populate('bookId', 'title');
    if (!reservation) continue;
    expired++;

    const bookId = idOf(reservation.bookId);
    await releaseHeldCopy(bookId);
    await notifyStudent(reservation.userId, {
      type: 'RESERVATION_EXPIRED',
      title: 'Reservation expired',
      message: `Your reservation for "${reservation.bookId?.title || 'a book'}" expired because it was not borrowed within ${HOLD_HOURS} hours. You can reserve it again from the catalogue.`,
      link: RESERVATIONS_LINK,
      meta: { bookId },
    });
    promoted += (await afterCopyFreed(bookId, now)).promoted;
  }
  return { expired, promoted };
};

/**
 * Cancel an active reservation. A ready one gives its held copy to the next student in line.
 * @param {Object} reservation - the current document (status waiting or ready)
 * @param {Object} actor - req.user
 * @returns {Promise<Object|null>} the cancelled reservation, or null if its status changed meanwhile
 */
const cancelReservation = async (reservation, actor, reason) => {
  const cancelled = await Reservation.findOneAndUpdate(
    { _id: reservation._id, status: reservation.status },
    { $set: { status: 'cancelled', cancelledBy: actor?._id || actor } },
    { new: true }
  );
  if (!cancelled) return null;

  const bookId = idOf(reservation.bookId);
  if (reservation.status === 'ready') {
    await releaseHeldCopy(bookId);
    await afterCopyFreed(bookId);
  }

  const byOwner = actor && String(actor._id || actor) === String(idOf(reservation.userId));
  if (!byOwner) {
    const book = await Book.findById(bookId).select('title').lean();
    await notifyStudent(idOf(reservation.userId), {
      type: 'RESERVATION_CANCELLED',
      title: 'Reservation cancelled',
      message: `Your reservation for "${book?.title || 'a book'}" was cancelled by the library.${reason ? ` ${reason}` : ''}`,
      link: RESERVATIONS_LINK,
      meta: { bookId },
    });
  }
  return cancelled;
};

/** Cancel every active reservation of a book (it was removed from the catalogue). */
const cancelBookReservations = async (bookId, actor) => {
  const active = await Reservation.find({ bookId, status: { $in: ACTIVE } });
  let cancelled = 0;
  for (const reservation of active) {
    if (await cancelReservation(reservation, actor, 'The book was removed from the catalogue.')) cancelled++;
  }
  return cancelled;
};

module.exports = {
  HOLD_HOURS,
  MAX_ACTIVE_RESERVATIONS,
  OPEN_LOAN_STATUSES,
  RESERVATIONS_LINK,
  QUEUE_ORDER,
  queuePositions,
  fillQueue,
  checkBackInStock,
  afterCopyFreed,
  returnCopy,
  takeCopyFor,
  undoTakeCopy,
  expireReservations,
  cancelReservation,
  cancelBookReservations,
};
