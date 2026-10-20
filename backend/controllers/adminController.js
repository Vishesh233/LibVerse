const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Reservation = require('../models/Reservation');
const { getUserNotifications } = require('./notificationController');
const { runReminders } = require('../jobs/reminders');
const { calculateFine, getDaysOverdue, startOfDay, payableFineOf } = require('../utils/fineCalculator');
const { issueAtDesk, returnAtDesk, DeskError } = require('../services/deskService');
const { escapeRegex, toQueryString, toPagination } = require('../utils/escapeRegex');
const { audit, personLabel } = require('../utils/audit');
const { nextLibraryId } = require('../utils/libraryId');
const mongoose = require('mongoose');

const USER_ROLES = ['student', 'librarian', 'admin'];

/**
 * Turn Mongoose validation / duplicate-key errors into a 400 response.
 * Returns true when the error was handled.
 */
const sendUserSaveError = (res, error) => {
  if (error.name === 'ValidationError') {
    // Never echo the submitted value back (Mongoose's default password message contains it)
    const message = Object.values(error.errors)
      .map((e) => (e.path === 'password' ? 'Password must be at least 6 characters' : e.message))
      .join(', ');
    res.status(400).json({ success: false, message });
    return true;
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    const message = field === 'email' ? 'Email already in use' : field === 'libraryId' ? 'Library ID already in use' : 'Duplicate field value';
    res.status(400).json({ success: false, message });
    return true;
  }
  return false;
};

/**
 * Check whether `actor` may change `target` (role and/or isActive).
 * Returns { status, message } when the change is not allowed, otherwise null.
 * - Librarians may only manage students and may never change a role.
 * - Nobody can demote or deactivate themselves.
 * - The last active admin can never be demoted or deactivated.
 */
const checkUserChange = async (actor, target, { role, isActive }) => {
  const roleChanged = role !== undefined && role !== target.role;
  const deactivating = isActive === false && target.isActive !== false;

  if (role !== undefined && !USER_ROLES.includes(role)) {
    return { status: 400, message: 'Invalid role' };
  }

  if (actor.role === 'librarian') {
    if (target.role !== 'student') {
      return { status: 403, message: 'Librarians can only manage student accounts' };
    }
    if (roleChanged) {
      return { status: 403, message: 'Librarians cannot change user roles' };
    }
  }

  if (actor._id.toString() === target._id.toString()) {
    if (roleChanged) {
      return { status: 400, message: 'You cannot change your own role' };
    }
    if (deactivating) {
      return { status: 400, message: 'You cannot deactivate your own account' };
    }
  }

  if (target.role === 'admin' && target.isActive !== false && (roleChanged || deactivating)) {
    const otherActiveAdmins = await User.countDocuments({
      role: 'admin',
      isActive: { $ne: false },
      _id: { $ne: target._id },
    });
    if (otherActiveAdmins === 0) {
      return { status: 400, message: 'The last active admin cannot be demoted or deactivated' };
    }
  }

  return null;
};

/**
 * Helper to calculate relative time string (e.g. "2 min ago", "1 hr ago", "Yesterday")
 */
function getRelativeTimeString(date) {
  if (!date) return 'Recently';
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

/**
 * @route GET /api/admin/dashboard
 * @desc Get comprehensive dashboard analytics populated with real DB entries
 * @access Private/Admin
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Core Summary Metrics
    const totalUsers = await User.countDocuments({ role: 'student', isActive: true });
    const totalBooks = await Book.countDocuments({ isActive: true });
    const issuedBooks = await Transaction.countDocuments({ status: 'issued' });
    const overdueBooksCount = await Transaction.countDocuments({
      status: 'issued',
      dueDate: { $lt: startOfDay(now) },
    });

    const activeUserIds = await Transaction.distinct('userId', { status: 'issued' });
    const activeUsers = activeUserIds.length;

    // Collected on completed returns: the paid part only (a waived part was never paid)
    const [paidAgg] = await Transaction.aggregate([
      { $match: { status: 'returned', finePaid: true } },
      { $group: { _id: null, total: { $sum: { $max: [0, { $subtract: ['$fineAmount', { $ifNull: ['$fineWaived', 0] }] }] } } } },
    ]);
    const totalFines = paidAgg?.total || 0;

    // Books issued today (real data from MongoDB)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const issuedToday = await Transaction.countDocuments({
      issueDate: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ['issued', 'returned'] },
    });

    // Books returned (total) - real data from MongoDB
    const returnedBooks = await Transaction.countDocuments({ status: 'returned' });

    // 2. Overdue Books Detailed List
    const overdueTransactions = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: startOfDay(now) },
    })
      .populate('userId', 'name email libraryId fineAmount')
      .populate('bookId', 'title author coverImage location')
      .sort('dueDate');

    const overdueList = overdueTransactions.map((tx) => {
      const overdueDays = getDaysOverdue(tx.dueDate, now);
      const fine = calculateFine(tx.dueDate, now);
      const userName = tx.userId?.name || 'Deleted user';
      const libraryId = tx.userId?.libraryId || '';
      const bookTitle = tx.bookId?.title || 'Book';

      return {
        _id: tx._id,
        name: userName,
        libraryId,
        userEmail: tx.userId?.email || '',
        book: bookTitle,
        overdueDays: `${overdueDays}d overdue`,
        fine: `₹${fine} fine`,
        rawOverdueDays: overdueDays,
        rawFineAmount: fine,
        dueDate: tx.dueDate,
        issueDate: tx.issueDate,
      };
    });

    // 3. Pending Issue Requests
    const pendingTransactions = await Transaction.find({ status: 'pending' })
      .populate('userId', 'name email libraryId')
      .populate('bookId', 'title author coverImage')
      .sort('-createdAt');

    const pendingRequests = pendingTransactions.map((tx) => {
      const studentName = tx.userId?.name || 'Deleted user';
      const initials = studentName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      return {
        _id: tx._id,
        studentName,
        libraryId: tx.userId?.libraryId || '',
        userEmail: tx.userId?.email || '',
        initials,
        bookTitle: tx.bookId?.title || 'Book',
        requestTime: getRelativeTimeString(tx.createdAt),
        createdAt: tx.createdAt,
        userId: tx.userId,
        bookId: tx.bookId,
      };
    });

    // 3b. Return Requests (awaiting librarian approval)
    const returnRequestedTx = await Transaction.find({ status: 'return_requested' })
      .populate('userId', 'name email libraryId')
      .populate('bookId', 'title author coverImage')
      .sort('-createdAt');

    const returnRequests = returnRequestedTx.map((tx) => {
      const studentName = tx.userId?.name || 'Deleted user';
      const initials = studentName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      return {
        _id: tx._id,
        studentName,
        libraryId: tx.userId?.libraryId || '',
        userEmail: tx.userId?.email || '',
        initials,
        bookTitle: tx.bookId?.title || 'Book',
        requestTime: getRelativeTimeString(tx.createdAt),
        createdAt: tx.createdAt,
        userId: tx.userId,
        bookId: tx.bookId,
        fineAmount: tx.fineAmount || 0,
        fineWaived: tx.fineWaived || 0,
        payableFine: payableFineOf(tx),
        finePaid: tx.finePaid || false,
        type: 'return',
      };
    });

    // 3c. Payment Pending (awaiting librarian payment approval)
    const paymentPendingTx = await Transaction.find({ status: 'payment_pending' })
      .populate('userId', 'name email libraryId')
      .populate('bookId', 'title author coverImage')
      .sort('-createdAt');

    const paymentPending = paymentPendingTx.map((tx) => {
      const studentName = tx.userId?.name || 'Deleted user';
      const initials = studentName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      return {
        _id: tx._id,
        studentName,
        libraryId: tx.userId?.libraryId || '',
        userEmail: tx.userId?.email || '',
        initials,
        bookTitle: tx.bookId?.title || 'Book',
        requestTime: getRelativeTimeString(tx.createdAt),
        createdAt: tx.createdAt,
        userId: tx.userId,
        bookId: tx.bookId,
        fineAmount: tx.fineAmount || 0,
        fineWaived: tx.fineWaived || 0,
        payableFine: payableFineOf(tx),
        hasScreenshot: !!tx.paymentScreenshot,
        type: 'payment',
      };
    });

    // 4. Recent Activity Stream (Last 10 transactions across issued, returned, requested)
    const recentTx = await Transaction.find()
      .populate('userId', 'name email libraryId profileImage')
      .populate('bookId', 'title author coverImage')
      .sort('-updatedAt')
      .limit(10);

    const recentActivities = recentTx.map((tx, idx) => {
      const name = tx.userId?.name || 'Deleted user';
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      const book = tx.bookId?.title || 'Book';
      // Every status is mapped explicitly; anything unexpected shows as "updated" with its raw status
      const ACTIVITY_BY_STATUS = {
        pending: { action: 'requested', status: 'Pending' },
        issued: { action: 'borrowed', status: 'Issued' },
        return_requested: { action: 'requested to return', status: 'Return Requested' },
        payment_pending: { action: 'submitted fine payment for', status: 'Payment Pending' },
        returned: { action: 'returned', status: 'Returned' },
        rejected: { action: 'request rejected for', status: 'Rejected' },
      };
      const rawStatus = tx.status || 'unknown';
      const { action, status: badgeStatus } = ACTIVITY_BY_STATUS[rawStatus] || {
        action: 'updated',
        status: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
      };

      const timestamp = tx.status === 'returned' ? tx.returnDate : tx.updatedAt || tx.createdAt;

      return {
        id: tx._id || idx + 1,
        _id: tx._id,
        name,
        libraryId: tx.userId?.libraryId || '',
        userEmail: tx.userId?.email || '',
        avatar: tx.userId?.profileImage || null,
        initials,
        action,
        book,
        bookCover: tx.bookId?.coverImage || null,
        time: getRelativeTimeString(timestamp),
        status: badgeStatus,
      };
    });

    // 5. Top Books (most borrowed): real loans only - requests and rejections are not borrows.
    //    Nothing borrowed yet -> empty list (no placeholder books).
    const LOAN_STATUSES = ['issued', 'return_requested', 'payment_pending', 'returned'];
    const topIssuedAgg = await Transaction.aggregate([
      { $match: { status: { $in: LOAN_STATUSES } } },
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }, // stable order for ties
      { $limit: 5 },
    ]);

    const topBookIds = topIssuedAgg.map((item) => item._id);
    const topBooksDocs = await Book.find({ _id: { $in: topBookIds } });

    const topBooks = topIssuedAgg
      .map((item) => {
        const bookDoc = topBooksDocs.find((b) => b._id.toString() === item._id.toString());
        if (!bookDoc) return null;
        return {
          _id: bookDoc._id,
          title: bookDoc.title,
          author: bookDoc.author,
          category: bookDoc.category || bookDoc.genre || 'General',
          count: item.count,
          rating: bookDoc.rating || 0,
          publisher: bookDoc.publisher || '',
          publicationYear: bookDoc.publicationYear || '',
          pages: bookDoc.pages || '',
          language: bookDoc.language || '',
          isbn: bookDoc.isbn || '',
          description: bookDoc.description || '',
          availableCopies: bookDoc.availableCopies || 0,
          issuedCopies: bookDoc.issuedCopies || 0,
          genre: bookDoc.genre || '',
          coverImage: bookDoc.coverImage || null,
        };
      })
      .filter(Boolean);


    // 6. Active books per genre: every genre of the catalogue (Book.genre enum), 0 when empty
    const genreAgg = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
    ]);
    const genreCounts = Object.fromEntries(genreAgg.map((g) => [g._id, g.count]));
    const booksByGenre = Book.schema.path('genre').enumValues
      .map((genre) => ({ genre, count: genreCounts[genre] || 0 }))
      .sort((x, y) => y.count - x.count || x.genre.localeCompare(y.genre));

    // 6b. Real loans per genre (same loan rule as top books), every genre of the enum, 0 when none.
    //     Loans of books that no longer exist are skipped.
    const borrowedAgg = await Transaction.aggregate([
      { $match: { status: { $in: LOAN_STATUSES } } },
      { $lookup: { from: Book.collection.name, localField: 'bookId', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $group: { _id: '$book.genre', count: { $sum: 1 } } },
    ]);
    const borrowedCounts = Object.fromEntries(borrowedAgg.map((g) => [g._id, g.count]));
    const borrowedByGenre = Book.schema.path('genre').enumValues
      .map((genre) => ({ genre, count: borrowedCounts[genre] || 0 }))
      .sort((x, y) => y.count - x.count || x.genre.localeCompare(y.genre));

    // 7. 7-Day Issue vs Return Weekly Stats
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayName = daysOfWeek[d.getDay()];
      const issuedCount = await Transaction.countDocuments({
        issueDate: { $gte: d, $lt: nextD },
      });
      const returnedCount = await Transaction.countDocuments({
        returnDate: { $gte: d, $lt: nextD },
      });

      weeklyData.push({
        day: dayName,
        issued: issuedCount,
        returned: returnedCount,
      });
    }

    // 7b. Staff hero: loans issued per day for the last 14 days (local days, oldest first),
    //     issued loans due today, and reservations holding a copy for pickup
    const DAILY_DAYS = 14;
    const dailyStart = startOfDay(now);
    dailyStart.setDate(dailyStart.getDate() - (DAILY_DAYS - 1));
    // KPI row: reservations still active (waiting + ready) and students with a loan issued in the last 30 days
    const memberSince = startOfDay(now);
    memberSince.setDate(memberSince.getDate() - 30);
    const [dailyLoans, dueToday, readyReservations, activeReservations, recentBorrowerIds] = await Promise.all([
      Transaction.find({ issueDate: { $gte: dailyStart }, status: { $in: LOAN_STATUSES } })
        .select('issueDate')
        .lean(),
      Transaction.countDocuments({ status: 'issued', dueDate: { $gte: startOfToday, $lte: endOfToday } }),
      Reservation.countDocuments({ status: 'ready' }),
      Reservation.countDocuments({ status: { $in: Reservation.ACTIVE_STATUSES } }),
      Transaction.distinct('userId', { issueDate: { $gte: memberSince }, status: { $in: LOAN_STATUSES } }),
    ]);
    const activeMembers = await User.countDocuments({ _id: { $in: recentBorrowerIds }, role: 'student' });
    const issuedDaily = Array.from({ length: DAILY_DAYS }, (_, i) => {
      const d = new Date(dailyStart);
      d.setDate(d.getDate() + i);
      return { date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, count: 0, start: d.getTime() };
    });
    dailyLoans.forEach((t) => {
      const i = Math.floor((startOfDay(t.issueDate).getTime() - dailyStart.getTime()) / 86400000 + 0.5); // DST-safe
      if (issuedDaily[i]) issuedDaily[i].count += 1;
    });
    issuedDaily.forEach((d) => delete d.start);

    // 8. Fines summary (server values): paid fines (minus waivers), fixed fines still payable
    //    after waivers, fines waived, and fines still growing on issued overdue loans
    const NET_FINE = { $max: [0, { $subtract: ['$fineAmount', { $ifNull: ['$fineWaived', 0] }] }] };
    const [fineAgg] = await Transaction.aggregate([
      { $match: { fineAmount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          collected: { $sum: { $cond: ['$finePaid', NET_FINE, 0] } },
          outstandingFixed: { $sum: { $cond: ['$finePaid', 0, NET_FINE] } },
          waived: { $sum: { $ifNull: ['$fineWaived', 0] } },
          loansWithFixedFines: { $sum: { $cond: [{ $or: ['$finePaid', { $gt: [NET_FINE, 0] }] }, 1, 0] } },
        },
      },
    ]);
    const accruing = overdueList.reduce((sum, item) => sum + (item.rawFineAmount || 0), 0);
    const fineSummary = {
      collected: fineAgg?.collected || 0,
      outstandingFixed: fineAgg?.outstandingFixed || 0,
      waived: fineAgg?.waived || 0,
      accruing,
      outstanding: (fineAgg?.outstandingFixed || 0) + accruing,
      loansWithFines: (fineAgg?.loansWithFixedFines || 0) + overdueList.length,
    };

    res.status(200).json({
      success: true,
      analytics: {
        fineSummary,
        totalUsers,
        totalBooks,
        issuedBooks,
        overdueBooks: overdueBooksCount,
        activeUsers,
        totalFines,
        issuedToday,
        returnedBooks,
        overdueList,
        pendingRequests,
        returnRequests,
        paymentPending,
        recentActivities,
        topBooks,
        booksByGenre,
        borrowedByGenre,
        weeklyData,
        issuedDaily,
        dueToday,
        readyReservations,
        activeReservations,
        activeMembers,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/users
 * @desc Create a new user directly from Admin Portal (Add New User)
 * @access Private/Admin
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', phone, address, libraryId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (req.user.role === 'librarian' && role !== 'student') {
      return res.status(403).json({ success: false, message: 'Librarians can only create student accounts' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // An ID typed in by the admin is kept (unique index guards it); otherwise the next short sequential ID
    const typedId = typeof libraryId === 'string' ? libraryId.trim().toUpperCase() : '';
    const generatedLibraryId = typedId || (await nextLibraryId());

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      address,
      libraryId: generatedLibraryId,
      isActive: true,
      emailVerified: true,
    });

    await audit(req, 'user.create', { type: 'User', id: newUser._id },
      `Created ${newUser.role} account for ${personLabel(newUser)}`, { role: newUser.role });

    res.status(201).json({
      success: true,
      message: `User ${newUser.name} created successfully as ${newUser.role}`,
      user: newUser,
    });
  } catch (error) {
    if (sendUserSaveError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/send-reminders
 * @desc Send notifications to all users with overdue books
 * @access Private/Admin
 */
exports.sendOverdueReminders = async (req, res, next) => {
  try {
    // Same logic as the hourly job, minus the once-per-day lock. Each loan is still only reminded
    // when it is due (due soon once, overdue at most every 7 days), so repeated clicks send nothing new.
    const result = await runReminders({ force: true });
    const count = result.dueSoon + result.overdue;

    await audit(req, 'reminders.send', { type: 'System' },
      `Sent reminders manually: ${result.dueSoon} due soon, ${result.overdue} overdue`,
      { dueSoon: result.dueSoon, overdue: result.overdue });

    res.status(200).json({
      success: true,
      message: count
        ? `Sent ${count} reminder${count === 1 ? '' : 's'} (${result.dueSoon} due soon, ${result.overdue} overdue).`
        : 'No reminders due right now. Every loan has already been reminded.',
      count,
      dueSoon: result.dueSoon,
      overdue: result.overdue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/issue-book
 * @desc Issue a book directly to a student by email/libraryId & book title/ID
 * @access Private/Admin
 */
exports.adminIssueBook = async (req, res, next) => {
  try {
    // Plain strings only - objects in the JSON body can never become Mongo operators
    const userEmail = toQueryString(req.body.userEmail);
    const libraryId = toQueryString(req.body.libraryId);
    const bookTitle = toQueryString(req.body.bookTitle);
    const bookId = toQueryString(req.body.bookId);
    const customDueDate = toQueryString(req.body.dueDate);

    if (!userEmail && !libraryId) {
      return res.status(400).json({ success: false, message: 'Please select a student' });
    }
    if (!bookTitle && !bookId) {
      return res.status(400).json({ success: false, message: 'Please select a book' });
    }

    // Find User
    let user;
    if (userEmail) {
      user = await User.findOne({ email: userEmail.trim().toLowerCase() });
    } else if (libraryId) {
      user = await User.findOne({ libraryId: libraryId.trim().toUpperCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: `Student not found with details provided` });
    }

    // Find Book
    let book;
    if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
      book = await Book.findById(bookId);
    }
    if (!book && bookTitle) {
      book = await Book.findOne({ title: { $regex: escapeRegex(bookTitle), $options: 'i' } });
    }

    if (!book || book.isActive === false) {
      return res.status(404).json({ success: false, message: `Book not found matching "${bookTitle || bookId}"` });
    }

    // Same rules as the scan desk (services/deskService): student, active, no open loan of this book,
    // atomic copy (their held copy for a ready reservation, never one held for someone else)
    const { transaction } = await issueAtDesk(req, user, book, { dueDate: customDueDate ? new Date(customDueDate) : undefined });

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" successfully issued to ${user.name}!`,
      transaction,
    });
  } catch (error) {
    if (error instanceof DeskError) return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/return-book
 * @desc Return an issued book directly by transactionId, book title, or student email
 * @access Private/Admin
 */
exports.adminReturnBook = async (req, res, next) => {
  try {
    const transactionId = toQueryString(req.body.transactionId);
    const query = toQueryString(req.body.query);
    const userEmail = toQueryString(req.body.userEmail);
    const bookId = toQueryString(req.body.bookId);

    let transaction;
    if (transactionId && mongoose.Types.ObjectId.isValid(transactionId)) {
      transaction = await Transaction.findById(transactionId);
    }

    if (!transaction && (userEmail || bookId || query)) {
      const filter = { status: 'issued' };

      if (userEmail) {
        const u = await User.findOne({ email: userEmail.trim().toLowerCase() });
        if (u) filter.userId = u._id;
      }
      if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
        filter.bookId = bookId;
      }

      if (!filter.userId && !filter.bookId && query) {
        const userMatch = await User.findOne({
          $or: [
            { email: query.trim().toLowerCase() },
            { libraryId: query.trim().toUpperCase() },
            { name: { $regex: escapeRegex(query), $options: 'i' } },
          ],
        });
        const bookMatch = await Book.findOne({
          title: { $regex: escapeRegex(query), $options: 'i' },
        });

        if (userMatch) filter.userId = userMatch._id;
        if (bookMatch) filter.bookId = bookMatch._id;
      }

      transaction = await Transaction.findOne(filter).sort('-createdAt');
    }

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Active issued transaction not found matching the criteria' });
    }

    // Same rules as the scan desk: an issued loan's fine is fixed and recorded; a return request with
    // nothing payable is completed; the copy goes to the next reservation first
    const { transaction: returned, fine, book } = await returnAtDesk(req, transaction);

    res.status(200).json({
      success: true,
      message: `Book "${book ? book.title : 'Book'}" returned successfully! ${fine > 0 ? `Fine incurred: ₹${fine}` : 'No fine.'}`,
      transaction: returned,
      fine,
    });
  } catch (error) {
    if (error instanceof DeskError) return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/notifications
 * @desc Get admin notifications
 * @access Private/Admin
 */
// Same paginated, own-notifications-only listing as GET /api/notifications (kept for existing clients)
exports.getNotifications = (req, res, next) => getUserNotifications(req, res, next);

/**
 * @route GET /api/admin/users
 * @desc Get all users with booksIssuedCount
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const role = toQueryString(req.query.role);
    const search = toQueryString(req.query.search);
    const status = toQueryString(req.query.status);
    const { limit, skip } = toPagination(req.query.page, req.query.limit, 50);

    const filter = {};
    if (role && role !== 'All Roles') {
      filter.role = role.toLowerCase();
    }
    // Librarians manage students and see fellow librarians, never admin accounts
    if (req.user.role === 'librarian') {
      filter.role = filter.role === 'admin' ? '__none__' : (filter.role || { $ne: 'admin' });
    }
    if (status === 'active') filter.isActive = { $ne: false };
    else if (status === 'inactive') filter.isActive = false;
    if (search) {
      const pattern = escapeRegex(search);
      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { email: { $regex: pattern, $options: 'i' } },
        { libraryId: { $regex: pattern, $options: 'i' } },
      ];
    }

    // ?sort=name|-name|libraryId|role|joined|-joined (default newest first); _id keeps pages stable
    const SORTS = { name: 'name', libraryId: 'libraryId', role: 'role', joined: 'createdAt' };
    const sortKey = toQueryString(req.query.sort) || '-joined';
    const desc = sortKey.startsWith('-');
    const field = SORTS[desc ? sortKey.slice(1) : sortKey] || 'createdAt';
    const dir = SORTS[desc ? sortKey.slice(1) : sortKey] ? (desc ? -1 : 1) : -1;

    const [rawUsers, total] = await Promise.all([
      User.find(filter)
        .select('-tokenVersion -cardVersion')
        .sort({ [field]: dir, _id: dir })
        .collation({ locale: 'en', strength: 2 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Open loans and fines still owed, for this page of users in one query
    const loanRows = await Transaction.aggregate([
      { $match: { userId: { $in: rawUsers.map((u) => u._id) }, status: { $in: ['issued', 'return_requested', 'payment_pending'] } } },
      {
        $group: {
          _id: '$userId',
          issued: { $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] } },
          open: { $sum: 1 },
          overdue: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'issued'] }, { $lt: ['$dueDate', startOfDay(new Date())] }] }, 1, 0] } },
          finesOwed: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$finePaid', true] }, { $ne: ['$status', 'issued'] }] },
                { $max: [0, { $subtract: [{ $ifNull: ['$fineAmount', 0] }, { $ifNull: ['$fineWaived', 0] }] }] },
                0,
              ],
            },
          },
        },
      },
    ]);
    const loansBy = new Map(loanRows.map((r) => [String(r._id), r]));
    const usersWithIssuedCount = rawUsers.map((u) => {
      const l = loansBy.get(String(u._id)) || {};
      return {
        ...u,
        booksIssued: l.issued || 0,
        openLoans: l.open || 0,
        overdueLoans: l.overdue || 0,
        finesOwed: l.finesOwed || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithIssuedCount.length,
      total,
      pages: Math.ceil(total / limit),
      users: usersWithIssuedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/admin/users/:id
 * @desc Update user
 * @access Private/Admin
 */
exports.updateUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Avoid accidentally overwriting sensitive fields via findByIdAndUpdate
    // (which bypasses the pre('save') password-hashing hook)
    const { name, email, role, phone, address, libraryId, isActive, password } = req.body;

    const denied = await checkUserChange(req.user, targetUser, { role, isActive });
    if (denied) {
      return res.status(denied.status).json({ success: false, message: denied.message });
    }

    const before = { role: targetUser.role, isActive: targetUser.isActive !== false };

    if (name !== undefined) targetUser.name = name;
    if (email !== undefined) targetUser.email = email.trim().toLowerCase();
    if (role !== undefined) targetUser.role = role;
    if (phone !== undefined) targetUser.phone = phone;
    if (address !== undefined) targetUser.address = address;
    if (libraryId !== undefined) targetUser.libraryId = libraryId;
    if (isActive !== undefined) targetUser.isActive = isActive;
    if (password) targetUser.password = password; // pre('save') hook will hash it

    // Names of the changed fields only (never their values), read before save clears them
    const changedFields = ['name', 'email', 'phone', 'address', 'libraryId', 'password'].filter((f) => targetUser.isModified(f));

    await targetUser.save();

    const who = personLabel(targetUser);
    const target = { type: 'User', id: targetUser._id };
    if (targetUser.role !== before.role) {
      await audit(req, 'user.role_change', target, `Changed role of ${who} from ${before.role} to ${targetUser.role}`,
        { from: before.role, to: targetUser.role });
    }
    if ((targetUser.isActive !== false) !== before.isActive) {
      const activated = targetUser.isActive !== false;
      await audit(req, activated ? 'user.activate' : 'user.deactivate', target, `${activated ? 'Activated' : 'Deactivated'} the account of ${who}`);
    }
    if (changedFields.length) {
      await audit(req, 'user.update', target, `Updated ${changedFields.join(', ')} for ${who}`, { fields: changedFields });
    }

    res.status(200).json({ success: true, message: 'User updated successfully', user: targetUser });
  } catch (error) {
    if (sendUserSaveError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete user (toggle active/inactive)
 * @access Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const denied = await checkUserChange(req.user, targetUser, { isActive: !targetUser.isActive });
    if (denied) {
      return res.status(denied.status).json({ success: false, message: denied.message });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !targetUser.isActive },
      { new: true }
    );

    await audit(req, updatedUser.isActive ? 'user.activate' : 'user.deactivate', { type: 'User', id: updatedUser._id },
      `${updatedUser.isActive ? 'Activated' : 'Deactivated'} the account of ${personLabel(updatedUser)}`);

    res.status(200).json({
      success: true,
      message: `User status changed to ${updatedUser.isActive ? 'active' : 'inactive'}`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/pending-requests
 * @desc Get pending book issue requests
 * @access Private/Admin
 */
exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Transaction.find({ status: 'pending' })
      .populate('userId', 'name email libraryId')
      .populate('bookId', 'title author')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/create-admin
 * @desc Create a new admin user
 * @access Private/Admin
 */
exports.createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      phone,
      address,
      emailVerified: true,
      libraryId: await nextLibraryId(),
    });

    await audit(req, 'user.create', { type: 'User', id: adminUser._id },
      `Created admin account for ${personLabel(adminUser)}`, { role: 'admin' });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        libraryId: adminUser.libraryId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/search
 * @desc Global search across books, users, transactions, categories, authors, ISBN
 * @access Private (all roles)
 */
exports.globalSearch = async (req, res, next) => {
  try {
    const query = toQueryString(req.query.query);
    const userRole = req.user?.role || 'student';

    if (!query) {
      return res.status(200).json({ success: true, results: [] });
    }

    // Escaped so the text is matched literally (every $regex below uses searchTerm)
    const searchTerm = escapeRegex(query);
    const results = [];

    // Helper to get role-based book URL
    const getBookUrl = (bookId) => {
      if (userRole === 'librarian') return `/librarian/books/${bookId}`;
      if (userRole === 'admin') return `/admin/books/${bookId}`;
      return `/student/books/${bookId}`;
    };

    // Users and loans open Student 360 for the signed-in role (routes: /admin|/librarian/users/:id)
    const staffBase = userRole === 'admin' ? '/admin' : '/librarian';
    const getUserUrl = (userId) => `${staffBase}/users/${userId}`;
    const getLoanUrl = (userId, transactionId) => `${staffBase}/users/${userId}?loan=${transactionId}`;

    // Search Books
    const books = await Book.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } },
        { isbn: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { genre: { $regex: searchTerm, $options: 'i' } },
      ],
      isActive: true,
    })
      .limit(5)
      .select('_id title author isbn category genre coverImage');

    books.forEach((book) => {
      results.push({
        type: 'book',
        id: book._id,
        title: book.title,
        subtitle: `by ${book.author}`,
        url: getBookUrl(book._id),
        icon: '📚',
        coverImage: book.coverImage || null,
      });
    });

    if (userRole === 'admin' || userRole === 'librarian') {
      // Users: librarians only ever see students (Student 360 is students-only for them)
      const roleFilter = userRole === 'admin' ? {} : { role: 'student' };
      const userMatch = {
        ...roleFilter,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { libraryId: { $regex: searchTerm, $options: 'i' } },
        ],
      };
      const users = await User.find(userMatch).limit(5).select('_id name libraryId role isActive profileImage');

      users.forEach((user) => {
        results.push({
          type: 'user',
          id: user._id,
          title: user.name,
          // Library ID and role only: no email in search results
          subtitle: [user.libraryId, user.role !== 'student' ? user.role : null, user.isActive === false ? 'inactive' : null].filter(Boolean).join(' • '),
          url: getUserUrl(user._id),
          icon: user.role === 'admin' ? '⚡' : user.role === 'librarian' ? '📚' : '👤',
          profileImage: user.profileImage || null,
        });
      });

      // Loans whose student or book matches (refs are ids, so match the people/books first)
      const [studentIds, bookIds] = await Promise.all([
        User.find({ ...userMatch, role: 'student' }).limit(50).distinct('_id'),
        Book.find({ title: { $regex: searchTerm, $options: 'i' } }).limit(50).distinct('_id'),
      ]);
      const transactions = studentIds.length || bookIds.length
        ? await Transaction.find({ $or: [{ userId: { $in: studentIds } }, { bookId: { $in: bookIds } }] })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate('userId', 'name role')
          .populate('bookId', 'title')
          .select('_id status dueDate userId bookId')
        : [];

      transactions
        .filter((tx) => tx.userId && (userRole === 'admin' || tx.userId.role === 'student'))
        .forEach((tx) => {
          const bookTitle = tx.bookId?.title || 'Unknown Book';
          results.push({
            type: 'transaction',
            id: tx._id,
            title: `${tx.userId.name} - ${bookTitle}`,
            subtitle: `Status: ${tx.status}${tx.dueDate ? ` • Due: ${new Date(tx.dueDate).toLocaleDateString('en-IN')}` : ''}`,
            url: getLoanUrl(tx.userId._id, tx._id),
            icon: '📋',
          });
        });
    }

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
