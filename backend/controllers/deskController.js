const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Reservation = require('../models/Reservation');
const { createNotification } = require('./notificationController');
const { parseDeskCode, cardCodeFor } = require('../utils/libraryCard');
const { calculateFine, getDaysOverdue, payableFineOf, startOfDay } = require('../utils/fineCalculator');
const { issueAtDesk, returnAtDesk, DeskError, OPEN_LOAN } = require('../services/deskService');
const { audit, personLabel } = require('../utils/audit');
const { escapeRegex, toQueryString } = require('../utils/escapeRegex');
const { LOAN_DAYS, RENEWAL_DAYS, MAX_RENEWALS, FINE_PER_DAY } = require('../utils/loanRules');

const ROLE_BASE = { student: '/student', librarian: '/librarian', admin: '/admin' };
const sendDeskError = (res, error) => {
  if (error instanceof DeskError) {
    res.status(error.status).json({ success: false, message: error.message });
    return true;
  }
  return false;
};

/** What the desk needs about a person: never the email */
const userPayload = async (user) => {
  const [loans, ready] = await Promise.all([
    Transaction.find({ userId: user._id, status: { $in: OPEN_LOAN } })
      .select('bookId status dueDate fineAmount fineWaived finePaid')
      .populate('bookId', 'title')
      .lean(),
    Reservation.find({ userId: user._id, status: 'ready' }).populate('bookId', 'title').select('bookId expiresAt').lean(),
  ]);
  const today = startOfDay(new Date());
  // Fixed fines still payable after waivers, plus fines still growing on overdue loans
  const payableFines = loans.filter((t) => t.status !== 'issued').reduce((s, t) => s + payableFineOf(t), 0);
  const accruingFines = loans.filter((t) => t.status === 'issued' && new Date(t.dueDate) < today).reduce((s, t) => s + calculateFine(t.dueDate), 0);
  return {
    type: 'user',
    user: {
      _id: user._id,
      name: user.name,
      libraryId: user.libraryId,
      role: user.role,
      isActive: user.isActive !== false,
      profileImage: user.profileImage || null,
      activeLoans: loans.length,
      overdueLoans: loans.filter((t) => t.status === 'issued' && new Date(t.dueDate) < today).length,
      payableFines,
      accruingFines,
      unpaidFinesTotal: payableFines + accruingFines,
      loans: loans.map((t) => ({ transactionId: t._id, bookId: t.bookId?._id, title: t.bookId?.title || 'Book', status: t.status, dueDate: t.dueDate })),
      readyReservations: ready.map((r) => ({ reservationId: r._id, bookId: r.bookId?._id, title: r.bookId?.title || 'Book', expiresAt: r.expiresAt })),
    },
  };
};

/** What the desk needs about a book: stock, its open loans and its queue */
const bookPayload = async (book) => {
  const [loans, waiting, held] = await Promise.all([
    Transaction.find({ bookId: book._id, status: { $in: OPEN_LOAN } })
      .select('userId status dueDate fineAmount fineWaived finePaid issueDate')
      .populate('userId', 'name libraryId')
      .sort('dueDate')
      .lean(),
    Reservation.countDocuments({ bookId: book._id, status: 'waiting' }),
    Reservation.find({ bookId: book._id, status: 'ready' }).populate('userId', 'name libraryId').select('userId expiresAt').lean(),
  ]);
  const now = new Date();
  return {
    type: 'book',
    book: {
      _id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn || '',
      location: book.location || '',
      cover: book.imageUrl || book.coverImage || null,
      isActive: book.isActive !== false,
      totalCopies: book.totalCopies || 0,
      availableCopies: book.availableCopies || 0,
      issuedCopies: book.issuedCopies || 0,
      heldCopies: book.heldCopies || 0,
      queueLength: waiting,
      heldFor: held.map((r) => ({ userId: r.userId?._id, name: r.userId?.name || 'A student', libraryId: r.userId?.libraryId || '', expiresAt: r.expiresAt })),
      openLoans: loans.map((t) => ({
        transactionId: t._id,
        status: t.status,
        userId: t.userId?._id,
        student: t.userId?.name || 'Unknown student',
        libraryId: t.userId?.libraryId || '',
        issueDate: t.issueDate,
        dueDate: t.dueDate,
        daysOverdue: t.status === 'issued' ? getDaysOverdue(t.dueDate, now) : 0,
        // What returning it now would mean: issued -> fine fixed at today; else the fixed fine still payable
        fineIfReturnedNow: t.status === 'issued' ? calculateFine(t.dueDate, now) : Number(t.fineAmount) || 0,
        payableFine: payableFineOf(t),
      })),
    },
  };
};

const findBookByText = async (text) => {
  if (/^[a-f0-9]{24}$/i.test(text)) {
    const byId = await Book.findById(text);
    if (byId) return byId;
  }
  // ISBN typed by hand or from a barcode scanner: digits (and X), hyphens/spaces optional
  const digits = text.replace(/[\s-]/g, '').toUpperCase();
  if (/^(\d{9}[\dX]|\d{13})$/.test(digits)) {
    const pattern = `^${digits.split('').map((c) => escapeRegex(c)).join('[\\s-]?')}$`;
    return Book.findOne({ isbn: { $regex: pattern, $options: 'i' } });
  }
  return null;
};

/**
 * @route GET /api/admin/desk/resolve?code=
 * @desc What a scanned or typed code is: a library card (signed), a book code, an old stored book QR,
 *       or a library ID / ISBN / book id typed by hand.
 * @access Private/Staff
 */
exports.resolveCode = async (req, res) => {
  try {
    const parsed = parseDeskCode(toQueryString(req.query.code) || '');
    if (parsed.kind === 'invalid') return res.status(400).json({ success: false, message: parsed.reason });

    if (parsed.kind === 'card') {
      if (!parsed.validSignature) return res.status(400).json({ success: false, code: 'BAD_SIGNATURE', message: 'This library card could not be verified. It may be damaged or forged.' });
      const user = await User.findOne({ libraryId: parsed.libraryId });
      if (!user) return res.status(404).json({ success: false, message: 'No member has this library card' });
      if ((Number(user.cardVersion) || 1) !== parsed.cardVersion) {
        return res.status(400).json({ success: false, code: 'OLD_CARD', message: `This card was replaced. Ask ${user.name} to show their current card.` });
      }
      if (user.isActive === false) return res.status(400).json({ success: false, code: 'INACTIVE', message: `${user.name}'s account is deactivated` });
      return res.status(200).json({ success: true, ...(await userPayload(user)) });
    }

    if (parsed.kind === 'book' || parsed.kind === 'legacy-book') {
      const book = await Book.findById(parsed.bookId);
      if (!book) return res.status(404).json({ success: false, message: 'No book has this code' });
      if (book.isActive === false) return res.status(400).json({ success: false, code: 'INACTIVE_BOOK', message: `"${book.title}" was removed from the catalogue` });
      return res.status(200).json({ success: true, ...(await bookPayload(book)) });
    }

    // Typed by hand: a library ID first, then an ISBN or a book id
    const text = parsed.text;
    if (/^[A-Za-z0-9][A-Za-z0-9_-]{1,39}$/.test(text)) {
      const user = await User.findOne({ libraryId: { $regex: `^${escapeRegex(text)}$`, $options: 'i' } });
      if (user) {
        if (user.isActive === false) return res.status(400).json({ success: false, code: 'INACTIVE', message: `${user.name}'s account is deactivated` });
        return res.status(200).json({ success: true, typed: true, ...(await userPayload(user)) });
      }
    }
    const book = await findBookByText(text);
    if (book) {
      if (book.isActive === false) return res.status(400).json({ success: false, code: 'INACTIVE_BOOK', message: `"${book.title}" was removed from the catalogue` });
      return res.status(200).json({ success: true, typed: true, ...(await bookPayload(book)) });
    }
    return res.status(404).json({ success: false, message: `Nothing matches "${text.slice(0, 40)}". Scan a library card or book, or type a Library ID or ISBN.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const validId = (v) => typeof v === 'string' && mongoose.isValidObjectId(v);

/**
 * @route POST /api/admin/desk/issue  { userId, bookId }
 * @access Private/Staff
 */
exports.deskIssue = async (req, res) => {
  try {
    const { userId, bookId } = req.body || {};
    if (!validId(userId)) return res.status(400).json({ success: false, message: 'Scan the student’s library card first' });
    if (!validId(bookId)) return res.status(400).json({ success: false, message: 'Scan the book first' });
    const [user, book] = await Promise.all([User.findById(userId), Book.findById(bookId)]);
    const result = await issueAtDesk(req, user, book);
    res.status(201).json({
      success: true,
      message: `"${book.title}" issued to ${user.name}. Due ${result.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
      transaction: result.transaction,
      dueDate: result.dueDate,
      fromHold: result.fromHold,
      reservationFulfilled: result.reservationFulfilled,
      fromRequest: result.fromRequest,
    });
  } catch (error) {
    if (sendDeskError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/desk/return  { transactionId }
 * @access Private/Staff
 */
exports.deskReturn = async (req, res) => {
  try {
    const { transactionId } = req.body || {};
    if (!validId(transactionId)) return res.status(400).json({ success: false, message: 'Choose the loan to return' });
    const transaction = await Transaction.findById(transactionId);
    const result = await returnAtDesk(req, transaction);
    const title = result.book?.title || 'The book';
    res.status(200).json({
      success: true,
      message: `${title} returned.${result.kind === 'desk' && result.fine > 0 ? ` Fine of ₹${result.fine} recorded.` : ''}${result.heldForNext ? ' Held for the next reservation.' : ''}`,
      transaction: result.transaction,
      fine: result.kind === 'desk' ? result.fine : 0,
      kind: result.kind,
      heldForNext: result.heldForNext,
    });
  } catch (error) {
    if (sendDeskError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/users/:id/reissue-card
 * @desc New card version: every older card QR stops working. The member is notified.
 * @access Private/Admin
 */
exports.reissueCard = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'User not found' });
    const existing = await User.findById(req.params.id).select('libraryId').lean();
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });
    if (!existing.libraryId) return res.status(400).json({ success: false, message: 'This user has no Library ID, so there is no card to reissue' });
    // Atomic increment: two reissues at once give two new versions, never the same one
    const user = await User.findByIdAndUpdate(req.params.id, { $inc: { cardVersion: 1 } }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await createNotification(user._id, user.role, 'CARD_REISSUED', 'Library card reissued',
      'Your library card was reissued. Use the new card from your profile; the old one no longer works at the desk.',
      { link: `${ROLE_BASE[user.role] || '/student'}/profile?tab=card` });
    await audit(req, 'user.card_reissue', { type: 'User', id: user._id },
      `Reissued the library card of ${personLabel(user)} (version ${user.cardVersion})`, { cardVersion: user.cardVersion });

    res.status(200).json({ success: true, message: `New card issued to ${user.name}. The old card no longer works.`, cardVersion: user.cardVersion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/auth/me/card
 * @desc The signed-in member's own library card (signed QR code). Nobody else's card is ever returned.
 * @access Private
 */
exports.getMyCard = async (req, res) => {
  try {
    const user = req.user;
    if (!user.libraryId) return res.status(404).json({ success: false, message: 'Your account has no Library ID yet. Ask the library to add one.' });
    res.status(200).json({
      success: true,
      card: {
        name: user.name,
        role: user.role,
        libraryId: user.libraryId,
        profileImage: user.profileImage || null,
        memberSince: user.createdAt || null,
        cardVersion: Number(user.cardVersion) || 1,
        code: cardCodeFor(user),
        // Printed on the back of the card: the same constants the loans use
        rules: { loanDays: LOAN_DAYS, renewalDays: RENEWAL_DAYS, maxRenewals: MAX_RENEWALS, finePerDay: FINE_PER_DAY },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
