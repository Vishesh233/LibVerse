const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const {
  MAX_ACTIVE_RESERVATIONS,
  OPEN_LOAN_STATUSES,
  QUEUE_ORDER,
  queuePositions,
  afterCopyFreed,
  expireReservations,
  cancelReservation,
} = require('../services/reservationService');
const { toQueryString, toPagination } = require('../utils/escapeRegex');
const User = require('../models/User');
const { audit, personLabel } = require('../utils/audit');

const ACTIVE = Reservation.ACTIVE_STATUSES;
const STATUSES = Reservation.schema.path('status').enumValues;
const STAFF_ROLES = ['admin', 'librarian'];
const BOOK_FIELDS = 'title author genre coverImage imageUrl isActive totalCopies availableCopies issuedCopies heldCopies';

const withPosition = (reservation, positions) => {
  const plain = typeof reservation.toObject === 'function' ? reservation.toObject() : reservation;
  return { ...plain, position: positions.get(String(plain._id)) ?? null };
};

// Ready holds whose time is up are expired before anyone looks at a list (the hourly job does the rest)
const expireOverdueHolds = () =>
  expireReservations().catch((error) => console.error('Reservation expiry failed (non-fatal):', error.message));

/**
 * @route POST /api/reservations
 * @desc Join the waiting list for a book that has no free copy
 * @access Private/Student
 */
exports.createReservation = async (req, res) => {
  try {
    const bookId = toQueryString(req.body?.bookId);
    if (!bookId || !mongoose.isValidObjectId(bookId)) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const book = await Book.findById(bookId).select('title isActive availableCopies');
    if (!book || book.isActive === false) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    if (book.availableCopies > 0) {
      return res.status(400).json({ success: false, message: 'This book has a copy available. Request it instead of reserving.' });
    }

    const userId = req.user._id;
    if (await Transaction.exists({ userId, bookId, status: { $in: OPEN_LOAN_STATUSES } })) {
      return res.status(400).json({ success: false, message: 'You already have a request or loan for this book' });
    }
    if (await Reservation.exists({ userId, bookId, status: { $in: ACTIVE } })) {
      return res.status(400).json({ success: false, message: 'You already have a reservation for this book' });
    }
    const activeCount = await Reservation.countDocuments({ userId, status: { $in: ACTIVE } });
    if (activeCount >= MAX_ACTIVE_RESERVATIONS) {
      return res.status(400).json({
        success: false,
        message: `You can have at most ${MAX_ACTIVE_RESERVATIONS} active reservations. Cancel one to reserve another book.`,
      });
    }

    let reservation;
    try {
      reservation = await Reservation.create({ userId, bookId });
    } catch (error) {
      // Unique partial index: a second request for the same book raced this one
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'You already have a reservation for this book' });
      }
      throw error;
    }

    // A copy may have come back between the availability check and now: hand it out right away
    await afterCopyFreed(bookId);
    reservation = await Reservation.findById(reservation._id);
    const positions = await queuePositions([reservation]);
    const result = withPosition(reservation, positions);

    res.status(201).json({
      success: true,
      message: result.status === 'ready'
        ? `A copy of "${book.title}" is being held for you. Borrow it within 48 hours.`
        : `You're #${result.position} in line for "${book.title}". We'll notify you when a copy is ready.`,
      reservation: result,
      position: result.position,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/reservations/me
 * @desc The signed-in student's reservations (active first), with queue position or hold expiry
 * @access Private/Student
 */
exports.getMyReservations = async (req, res) => {
  try {
    await expireOverdueHolds();
    const docs = await Reservation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('bookId', BOOK_FIELDS)
      .lean();
    const positions = await queuePositions(docs);
    const rank = (r) => (r.status === 'ready' ? 0 : r.status === 'waiting' ? 1 : 2);
    const reservations = docs
      .map((r) => withPosition(r, positions))
      .sort((a, b) => rank(a) - rank(b));

    res.status(200).json({
      success: true,
      count: reservations.length,
      active: reservations.filter((r) => ACTIVE.includes(r.status)).length,
      reservations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/reservations
 * @desc Reservations, filtered by ?bookId= and/or ?status= (waiting|ready|fulfilled|cancelled|expired|
 *       active (default)|all), paginated. Active lists are in queue order with positions.
 * @access Private/Staff
 */
exports.getReservations = async (req, res) => {
  try {
    const status = toQueryString(req.query.status) || 'active';
    const bookId = toQueryString(req.query.bookId);
    const { page, limit, skip } = toPagination(req.query.page, req.query.limit, 20, 100);

    const filter = {};
    if (status === 'active') filter.status = { $in: ACTIVE };
    else if (status !== 'all') {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Unknown reservation status' });
      }
      filter.status = status;
    }
    if (bookId) {
      if (!mongoose.isValidObjectId(bookId)) {
        return res.status(400).json({ success: false, message: 'Invalid book id' });
      }
      filter.bookId = bookId;
    }

    await expireOverdueHolds();
    const queueView = ['active', 'waiting', 'ready'].includes(status);
    const [docs, total] = await Promise.all([
      Reservation.find(filter)
        .sort(queueView ? { bookId: 1, ...QUEUE_ORDER } : { updatedAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name libraryId')
        .populate('bookId', BOOK_FIELDS)
        .lean(),
      Reservation.countDocuments(filter),
    ]);
    const positions = await queuePositions(docs);

    res.status(200).json({
      success: true,
      count: docs.length,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      reservations: docs.map((r) => withPosition(r, positions)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/reservations/queues
 * @desc Books with an active waiting list (oldest queue first), paginated by book,
 *       each with its ready and waiting reservations in order
 * @access Private/Staff
 */
exports.getReservationQueues = async (req, res) => {
  try {
    const { page, limit, skip } = toPagination(req.query.page, req.query.limit, 10, 50);
    await expireOverdueHolds();

    const [summary] = await Reservation.aggregate([
      { $match: { status: { $in: ACTIVE } } },
      {
        $group: {
          _id: '$bookId',
          since: { $min: '$createdAt' },
          waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          ready: { $sum: { $cond: [{ $eq: ['$status', 'ready'] }, 1, 0] } },
        },
      },
      { $sort: { since: 1, _id: 1 } },
      { $facet: { total: [{ $count: 'n' }], books: [{ $skip: skip }, { $limit: limit }] } },
    ]);
    const total = summary?.total[0]?.n || 0;
    const pageBooks = summary?.books || [];
    const bookIds = pageBooks.map((b) => b._id);

    const [books, entries] = await Promise.all([
      Book.find({ _id: { $in: bookIds } }).select(BOOK_FIELDS).lean(),
      Reservation.find({ bookId: { $in: bookIds }, status: { $in: ACTIVE } })
        .sort(QUEUE_ORDER)
        .populate('userId', 'name libraryId')
        .lean(),
    ]);
    const positions = await queuePositions(entries);
    const bookById = new Map(books.map((b) => [String(b._id), b]));

    const queues = pageBooks.map((b) => {
      const list = entries.filter((r) => String(r.bookId) === String(b._id)).map((r) => withPosition(r, positions));
      return {
        book: bookById.get(String(b._id)) || { _id: b._id, title: 'Unknown book' },
        waiting: b.waiting,
        ready: b.ready,
        // Ready (held) first, then the waiting line
        reservations: [...list.filter((r) => r.status === 'ready'), ...list.filter((r) => r.status === 'waiting')],
      };
    });

    res.status(200).json({
      success: true,
      count: queues.length,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      queues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route DELETE /api/reservations/:id
 * @desc Cancel a waiting or ready reservation (its owner, or staff). A held copy goes to the next in line.
 * @access Private
 */
exports.cancelReservation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const isOwner = String(reservation.userId) === String(req.user._id);
    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!ACTIVE.includes(reservation.status)) {
      return res.status(400).json({ success: false, message: 'Only waiting or ready reservations can be cancelled' });
    }

    const cancelled = await cancelReservation(reservation, req.user);
    if (!cancelled) {
      return res.status(409).json({ success: false, message: 'This reservation just changed. Refresh and try again.' });
    }

    // Staff cancelling a student's reservation is audited (a student cancelling their own is not)
    if (!isOwner && isStaff) {
      const [student, book] = await Promise.all([
        User.findById(reservation.userId).select('name libraryId').lean().catch(() => null),
        Book.findById(reservation.bookId).select('title').lean().catch(() => null),
      ]);
      await audit(req, 'reservation.staff_cancel', { type: 'Reservation', id: reservation._id },
        `Cancelled the ${reservation.status} reservation of "${book?.title || 'a book'}" for ${personLabel(student)}`,
        { previousStatus: reservation.status });
    }

    res.status(200).json({ success: true, message: 'Reservation cancelled', reservation: cancelled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
