/**
 * Desk issue and return, shared by the scan desk (POST /api/admin/desk/issue|return) and the
 * older desk endpoints (POST /api/admin/issue-book|return-book), so both follow the same rules.
 */
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const { notifyStudent } = require('../controllers/notificationController');
const { calculateFine, payableFineOf, startOfDay } = require('../utils/fineCalculator');
const { takeCopyFor, undoTakeCopy, returnCopy } = require('./reservationService');
const { audit, personLabel } = require('../utils/audit');
const { LOAN_DAYS } = require('../utils/loanRules');

const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_LOAN = ['issued', 'return_requested', 'payment_pending'];

class DeskError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const rupees = (n) => `₹${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-IN')}`;

// Atomic guard: nothing left to pay (no fine, paid, or fully waived)
const NOTHING_PAYABLE = {
  $or: [
    { fineAmount: { $lte: 0 } },
    { finePaid: true },
    { $expr: { $lte: ['$fineAmount', { $ifNull: ['$fineWaived', 0] }] } },
  ],
};

/** Why no copy could be taken: every free copy is held for someone else, or none is left */
const noCopyMessage = async (bookId, title) => {
  const fresh = await Book.findById(bookId).select('availableCopies heldCopies').lean();
  if (fresh && fresh.availableCopies <= 0 && (fresh.heldCopies || 0) > 0) {
    return `Every copy of "${title}" that is not on loan is held for another student's reservation`;
  }
  return `No copies of "${title}" are available`;
};

/**
 * Lend a book to a student at the desk.
 * Rules: student account, active; active book; no open loan of this book already (a pending
 * request for it is turned into the loan); a copy is taken atomically - the copy held for this
 * student's ready reservation if any (fulfilling it), otherwise a free copy, never one held for
 * someone else.
 * @param {Object} req - Express request (staff in req.user)
 * @param {Object} user - User document
 * @param {Object} book - Book document
 * @param {{ dueDate?: Date }} [options]
 * @returns {Promise<{ transaction, dueDate, fromHold, reservationFulfilled, fromRequest }>}
 * @throws {DeskError}
 */
const issueAtDesk = async (req, user, book, { dueDate: customDue } = {}) => {
  if (!user) throw new DeskError(404, 'Student not found');
  if (user.role !== 'student') throw new DeskError(400, 'Only student accounts can borrow books');
  if (user.isActive === false) throw new DeskError(400, `${user.name}'s account is deactivated`);
  if (!book || book.isActive === false) throw new DeskError(404, 'Book not found');
  if (customDue && Number.isNaN(customDue.getTime())) throw new DeskError(400, 'Invalid due date');
  // A custom due date is a calendar day after today and at most a year away (a loan can't start overdue)
  if (customDue) {
    const today = startOfDay(new Date());
    if (startOfDay(customDue) <= today) throw new DeskError(400, 'The due date must be after today');
    if (startOfDay(customDue) > new Date(today.getTime() + 366 * DAY_MS)) throw new DeskError(400, 'The due date must be within a year');
  }

  const existing = await Transaction.findOne({ userId: user._id, bookId: book._id, status: { $in: ['pending', ...OPEN_LOAN] } })
    .select('status')
    .lean();
  if (existing && OPEN_LOAN.includes(existing.status)) {
    throw new DeskError(400, `${user.name} already has "${book.title}" on loan`);
  }

  const now = new Date();
  const dueDate = customDue || new Date(now.getTime() + LOAN_DAYS * DAY_MS);
  let transaction;
  let taken;
  const fromRequest = !!existing; // a pending online request for this book

  if (existing) {
    // Turn the student's pending request into the loan (same claim as approving it)
    transaction = await Transaction.findOneAndUpdate(
      { _id: existing._id, status: 'pending' },
      { $set: { status: 'issued', isApproved: true, approvedBy: req.user._id, approvalDate: now, issueDate: now, dueDate } },
      { new: true }
    );
    if (!transaction) throw new DeskError(409, 'This request just changed. Scan the book again.');
    taken = await takeCopyFor(user._id, book._id, transaction._id);
    if (!taken) {
      await Transaction.updateOne(
        { _id: transaction._id, status: 'issued' },
        { $set: { status: 'pending', isApproved: false }, $unset: { approvedBy: '', approvalDate: '' } }
      );
      throw new DeskError(400, await noCopyMessage(book._id, book.title));
    }
  } else {
    const transactionId = new mongoose.Types.ObjectId();
    taken = await takeCopyFor(user._id, book._id, transactionId);
    if (!taken) throw new DeskError(400, await noCopyMessage(book._id, book.title));
    try {
      transaction = await Transaction.create({
        _id: transactionId,
        userId: user._id,
        bookId: book._id,
        issueDate: now,
        dueDate,
        status: 'issued',
        isApproved: true,
        approvedBy: req.user._id,
        approvalDate: now,
      });
    } catch (createError) {
      await undoTakeCopy(taken, book._id); // put the copy (and the reservation) back
      throw createError;
    }
  }

  try {
    await notifyStudent(user._id, {
      type: 'BOOK_ISSUED',
      title: 'Book issued',
      message: `"${book.title}" has been issued to you at the library. Due date: ${dueDate.toLocaleDateString()}.`,
      link: '/student/my-books?tab=issued',
      meta: { transactionId: transaction._id, bookId: book._id },
    });
  } catch (notifError) {
    console.error('Notification creation failed (non-fatal):', notifError.message);
  }

  await audit(req, 'loan.admin_issue', { type: 'Transaction', id: transaction._id },
    `Issued "${book.title}" at the desk to ${personLabel(user)}${taken.fromHold ? ' (their reserved copy)' : ''}`,
    { dueDate: dueDate.toISOString().slice(0, 10), fromHold: taken.fromHold, fromRequest });

  return { transaction, dueDate, fromHold: taken.fromHold, reservationFulfilled: !!taken.reservation, fromRequest };
};

/**
 * Take a book back at the desk.
 * - issued: the fine (calendar days late x ₹5) is fixed and recorded as unpaid, the loan is returned
 * - return_requested with nothing payable (no fine, paid or waived): the return is completed
 * - anything still payable: refused (pay or waive first)
 * The copy then goes to the next reservation in the queue (held 48 h) or back on the shelf.
 * @param {Object} req
 * @param {Object} transaction - Transaction document
 * @returns {Promise<{ transaction, fine, kind: 'desk'|'request', heldForNext, book }>}
 * @throws {DeskError}
 */
const returnAtDesk = async (req, transaction) => {
  if (!transaction) throw new DeskError(404, 'Loan not found');
  const startedAt = new Date();
  let returned;
  let fine = 0;
  let kind;

  if (transaction.status === 'issued') {
    kind = 'desk';
    fine = calculateFine(transaction.dueDate, startedAt);
    returned = await Transaction.findOneAndUpdate(
      { _id: transaction._id, status: 'issued' },
      { $set: { fineAmount: fine, returnDate: startedAt, status: 'returned', returnApprovedBy: req.user._id } },
      { new: true }
    );
    if (!returned) throw new DeskError(409, 'This loan was just returned. Scan the book again.');
    if (fine > 0) {
      await User.updateOne({ _id: returned.userId }, { $inc: { fineAmount: fine } })
        .catch((err) => console.error('User fine total update failed (non-fatal):', err.message));
    }
  } else if (transaction.status === 'return_requested' || transaction.status === 'payment_pending') {
    kind = 'request';
    const payable = payableFineOf(transaction);
    if (payable > 0) {
      throw new DeskError(400, transaction.status === 'payment_pending'
        ? `A payment of ${rupees(payable)} is waiting to be verified. Verify it on the Requests page first.`
        : `A fine of ${rupees(payable)} must be paid or waived before this return can be completed`);
    }
    fine = Number(transaction.fineAmount) || 0;
    returned = await Transaction.findOneAndUpdate(
      { _id: transaction._id, status: { $in: ['return_requested', 'payment_pending'] }, ...NOTHING_PAYABLE },
      { $set: { status: 'returned', returnDate: startedAt, returnApprovedBy: req.user._id } },
      { new: true }
    );
    if (!returned) throw new DeskError(409, 'This loan just changed. Scan the book again.');
  } else {
    throw new DeskError(400, 'This loan is not open, so there is nothing to return');
  }

  const book = await returnCopy(returned.bookId);
  // Did the copy go to the next student in the queue?
  const hold = await Reservation.findOne({ bookId: returned.bookId, status: 'ready', readyAt: { $gte: startedAt } })
    .sort({ readyAt: -1 })
    .populate('userId', 'name libraryId')
    .lean();
  const heldForNext = hold ? { name: hold.userId?.name || 'Deleted user', libraryId: hold.userId?.libraryId || '', expiresAt: hold.expiresAt } : null;

  const title = book?.title || 'Your book';
  const borrower = await User.findById(returned.userId).select('name libraryId').lean().catch(() => null);
  if (kind === 'desk') {
    await notifyStudent(returned.userId, {
      type: 'BOOK_RETURNED',
      title: 'Book returned',
      message: `"${title}" was returned at the library.${fine > 0 ? ` A fine of ₹${fine} was recorded.` : ''}`,
      link: fine > 0 ? '/student/fines' : '/student/my-books?tab=returned',
      meta: { transactionId: returned._id, bookId: returned.bookId },
    });
    await audit(req, 'loan.admin_return', { type: 'Transaction', id: returned._id },
      `Returned "${title}" at the desk for ${personLabel(borrower)}${fine > 0 ? `, fine ₹${fine} recorded` : ''}${heldForNext ? ', copy held for the next reservation' : ''}`,
      { fine, heldForNext: !!heldForNext });
  } else {
    await notifyStudent(returned.userId, {
      type: 'RETURN_APPROVED',
      title: 'Return approved',
      message: `Your return of "${title}" has been approved. Thank you!`,
      link: '/student/my-books?tab=returned',
      meta: { transactionId: returned._id, bookId: returned.bookId },
    });
    await audit(req, 'return.approve', { type: 'Transaction', id: returned._id },
      `Approved return of "${title}" from ${personLabel(borrower)} at the desk`,
      { fineAmount: returned.fineAmount || 0, fineWaived: returned.fineWaived || 0, heldForNext: !!heldForNext });
  }

  return { transaction: returned, fine, kind, heldForNext, book };
};

module.exports = { issueAtDesk, returnAtDesk, DeskError, OPEN_LOAN };
