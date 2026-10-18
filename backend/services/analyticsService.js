/**
 * Real analytics and report tables for staff, computed from transactions, books, reservations
 * and the audit log. Every number is a count or sum over stored documents; nothing is estimated.
 *
 * Range: [from, to] in server local time, inclusive of both days. Default: the 1st of the month
 * 11 months ago through today (12 monthly buckets). Ranges of up to 62 days are bucketed by day.
 *
 * Definitions:
 * - loan: a transaction that was actually lent (issued, return_requested, payment_pending, returned)
 * - loans issued in range: issueDate in range; returned in range: status returned, returnDate in range
 * - fine charged: fineAmount > 0, fixed in range (returnRequestedAt, or returnDate for a desk return)
 * - fine collected: paid fines, fineAmount - fineWaived, by paymentApprovedAt (or returnDate)
 * - fine waived: fineWaived, by waivedAt
 * - outstanding (now): fixed fines still payable after waivers + fines growing on overdue loans
 * - overdue aging (now): issued loans past their due day, by calendar days overdue
 * - active borrowers: distinct students with a loan issued in range
 * - reservations: created by createdAt; fulfilled / expired / cancelled by updatedAt (the time of
 *   that final status change)
 * - staff activity: audit log entries of loan-handling actions in range, per staff member
 */
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const AuditLog = require('../models/AuditLog');
const { APPROVAL_ACTIONS } = require('../models/AuditLog');
const { getDaysOverdue, calculateFine, startOfDay, fineOf, payableFineOf, paidFineOf, getDaysLateOf } = require('../utils/fineCalculator');

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const DAY_MS = 24 * 60 * 60 * 1000;
const LOAN_STATUSES = ['issued', 'return_requested', 'payment_pending', 'returned'];
const OPEN_STATUSES = ['issued', 'return_requested', 'payment_pending'];
const DAILY_MAX_DAYS = 62;
const MAX_RANGE_DAYS = 3700; // about 10 years
const REPORT_ROW_CAP = 2000;
const AGING_BUCKETS = [
  { key: '1-7', label: '1–7 days', min: 1, max: 7 },
  { key: '8-30', label: '8–30 days', min: 8, max: 30 },
  { key: '31+', label: '31+ days', min: 31, max: Infinity },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// fineAmount - fineWaived, never below 0
const NET_FINE = { $max: [0, { $subtract: [{ $ifNull: ['$fineAmount', 0] }, { $ifNull: ['$fineWaived', 0] }] }] };

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

class RangeError400 extends Error {}

/** 'YYYY-MM-DD' (or any date string) -> local Date, or null when absent; throws when invalid */
const parseDay = (value, name) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new RangeError400(`Invalid ${name} date`);
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (Number.isNaN(d.getTime()) || (m && d.getDate() !== Number(m[3]))) throw new RangeError400(`Invalid ${name} date`);
  return d;
};

/**
 * Parse ?from=&to= into { from, to, bucket, buckets }. Throws RangeError400 for bad input.
 * @param {Object} query
 * @param {Date} [now]
 */
const parseRange = (query = {}, now = new Date()) => {
  const fromIn = parseDay(query.from, 'from');
  const toIn = parseDay(query.to, 'to');
  const to = new Date(startOfDay(toIn || now).getTime() + DAY_MS - 1);
  let from;
  if (fromIn) from = startOfDay(fromIn);
  else {
    const anchor = toIn || now;
    from = new Date(anchor.getFullYear(), anchor.getMonth() - 11, 1);
  }
  if (from > to) throw new RangeError400('The start date must be on or before the end date');
  const days = Math.round((startOfDay(to) - from) / DAY_MS) + 1;
  if (days > MAX_RANGE_DAYS) throw new RangeError400('Choose a range of at most 10 years');
  const bucket = days <= DAILY_MAX_DAYS ? 'day' : 'month';

  const buckets = [];
  if (bucket === 'day') {
    for (let d = new Date(from); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      buckets.push({ key: dayKey(d), label: `${d.getDate()} ${MONTHS[d.getMonth()]}` });
    }
  } else {
    for (let d = new Date(from.getFullYear(), from.getMonth(), 1); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      buckets.push({ key: monthKey(d), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }
  }
  return { from, to, days, bucket, buckets };
};

/**
 * Optional day bounds without a default or span limit (audit log filters):
 * { from: start of that day | undefined, to: end of that day | undefined }. Throws RangeError400.
 */
const parseDayBounds = (query = {}) => {
  const fromIn = parseDay(query.from, 'from');
  const toIn = parseDay(query.to, 'to');
  const from = fromIn ? startOfDay(fromIn) : undefined;
  const to = toIn ? new Date(startOfDay(toIn).getTime() + DAY_MS - 1) : undefined;
  if (from && to && from > to) throw new RangeError400('The start date must be on or before the end date');
  return { from, to };
};

const bucketExpr = (range, field) => ({
  $dateToString: { format: range.bucket === 'day' ? '%Y-%m-%d' : '%Y-%m', date: field, timezone: TZ },
});

/** Fill a { key: value } map into the range's bucket list (0 where empty) */
const series = (range, rows) => {
  const map = new Map(rows.map((r) => [r._id, r.value]));
  return range.buckets.map((b) => round2(map.get(b.key) || 0));
};

// When a fine was fixed / paid (older docs may lack the dedicated field)
const FIXED_AT = { $ifNull: ['$returnRequestedAt', '$returnDate'] };
const PAID_AT = { $ifNull: ['$paymentApprovedAt', '$returnDate'] };

/** Current overdue loans (issued, past their due day) with days overdue and the growing fine */
const loadOverdue = async (now = new Date()) => {
  const docs = await Transaction.find({ status: 'issued', dueDate: { $lt: startOfDay(now) } })
    .select('userId bookId dueDate issueDate status fineWaived')
    .populate('userId', 'name libraryId')
    .populate('bookId', 'title author genre')
    .sort('dueDate')
    .lean();
  return docs.map((t) => {
    const daysOverdue = getDaysOverdue(t.dueDate, now);
    const bucket = AGING_BUCKETS.find((b) => daysOverdue >= b.min && daysOverdue <= b.max);
    return {
      _id: t._id,
      student: t.userId?.name || 'Deleted user',
      libraryId: t.userId?.libraryId || '',
      book: t.bookId?.title || 'Unknown book',
      genre: t.bookId?.genre || '',
      issueDate: t.issueDate,
      dueDate: t.dueDate,
      daysOverdue,
      fine: calculateFine(t.dueDate, now),
      bucket: bucket?.key || '31+',
    };
  });
};

const loadTopBooks = async (range, limit = 10) => {
  const rows = await Transaction.aggregate([
    { $match: { status: { $in: LOAN_STATUSES }, issueDate: { $gte: range.from, $lte: range.to } } },
    { $group: { _id: '$bookId', loans: { $sum: 1 }, borrowers: { $addToSet: '$userId' } } },
    { $lookup: { from: Book.collection.name, localField: '_id', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $project: { loans: 1, borrowers: { $size: '$borrowers' }, title: '$book.title', author: '$book.author', genre: '$book.genre' } },
    { $sort: { loans: -1, title: 1 } },
    { $limit: limit },
  ]);
  return rows.map((r, i) => ({ rank: i + 1, bookId: r._id, title: r.title, author: r.author, genre: r.genre || '', loans: r.loans, borrowers: r.borrowers }));
};

const loadStaffActivity = async (range) => {
  const rows = await AuditLog.aggregate([
    { $match: { action: { $in: APPROVAL_ACTIONS }, createdAt: { $gte: range.from, $lte: range.to } } },
    { $group: { _id: { actor: '$actorId', action: '$action' }, n: { $sum: 1 }, role: { $last: '$actorRole' } } },
  ]);
  const byActor = new Map();
  for (const r of rows) {
    const key = String(r._id.actor);
    const entry = byActor.get(key) || { actorId: r._id.actor, role: r.role, counts: {}, total: 0 };
    entry.counts[r._id.action] = r.n;
    entry.total += r.n;
    byActor.set(key, entry);
  }
  const users = await User.find({ _id: { $in: [...byActor.values()].map((e) => e.actorId) } }).select('name role').lean();
  const names = new Map(users.map((u) => [String(u._id), u]));
  // counts in a fixed action order ($group returns groups in no particular order)
  const ordered = (counts) => Object.fromEntries(APPROVAL_ACTIONS.filter((a) => counts[a]).map((a) => [a, counts[a]]));
  return [...byActor.values()]
    .map((e) => ({
      ...e,
      counts: ordered(e.counts),
      name: names.get(String(e.actorId))?.name || 'Deleted user',
      role: names.get(String(e.actorId))?.role || e.role,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
};

/**
 * Charts and summary numbers for the Analytics page
 * @param {Object} range - from parseRange
 */
const getAnalytics = async (range, now = new Date()) => {
  const inRange = { $gte: range.from, $lte: range.to };

  const [
    issuedRows,
    returnedRows,
    collectedRows,
    chargedRows,
    waivedRows,
    [fineTotals = {}],
    [outstandingFixed = {}],
    overdue,
    catalogueRows,
    borrowedRows,
    topBooks,
    activeBorrowerIds,
    currentBorrowerIds,
    reservationRows,
    reservationsCreated,
    activeReservations,
    staffActivity,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: { $in: LOAN_STATUSES }, issueDate: inRange } },
      { $group: { _id: bucketExpr(range, '$issueDate'), value: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'returned', returnDate: inRange } },
      { $group: { _id: bucketExpr(range, '$returnDate'), value: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { finePaid: true, fineAmount: { $gt: 0 } } },
      { $addFields: { paidAt: PAID_AT } },
      { $match: { paidAt: inRange } },
      { $group: { _id: bucketExpr(range, '$paidAt'), value: { $sum: NET_FINE } } },
    ]),
    Transaction.aggregate([
      { $match: { fineAmount: { $gt: 0 }, status: { $in: LOAN_STATUSES } } },
      { $addFields: { fixedAt: FIXED_AT } },
      { $match: { fixedAt: inRange } },
      { $group: { _id: bucketExpr(range, '$fixedAt'), value: { $sum: '$fineAmount' } } },
    ]),
    Transaction.aggregate([
      { $match: { fineWaived: { $gt: 0 }, waivedAt: inRange } },
      { $group: { _id: bucketExpr(range, '$waivedAt'), value: { $sum: '$fineWaived' } } },
    ]),
    Transaction.aggregate([
      { $match: { fineAmount: { $gt: 0 }, status: { $in: LOAN_STATUSES } } },
      { $addFields: { fixedAt: FIXED_AT } },
      { $match: { fixedAt: inRange } },
      { $group: { _id: null, loans: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { finePaid: { $ne: true }, fineAmount: { $gt: 0 }, status: { $in: ['return_requested', 'payment_pending', 'returned'] } } },
      { $group: { _id: null, amount: { $sum: NET_FINE }, loans: { $sum: { $cond: [{ $gt: [NET_FINE, 0] }, 1, 0] } } } },
    ]),
    loadOverdue(now),
    Book.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$genre', n: { $sum: 1 } } }]),
    Transaction.aggregate([
      { $match: { status: { $in: LOAN_STATUSES }, issueDate: inRange } },
      { $lookup: { from: Book.collection.name, localField: 'bookId', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $group: { _id: '$book.genre', n: { $sum: 1 } } },
    ]),
    loadTopBooks(range, 10),
    Transaction.distinct('userId', { status: { $in: LOAN_STATUSES }, issueDate: inRange }),
    Transaction.distinct('userId', { status: { $in: OPEN_STATUSES } }),
    Reservation.aggregate([
      { $match: { status: { $in: ['fulfilled', 'expired', 'cancelled'] }, updatedAt: inRange } },
      { $group: { _id: '$status', n: { $sum: 1 } } },
    ]),
    Reservation.countDocuments({ createdAt: inRange }),
    Reservation.aggregate([{ $match: { status: { $in: ['waiting', 'ready'] } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    loadStaffActivity(range),
  ]);

  const issued = series(range, issuedRows);
  const returned = series(range, returnedRows);
  const collected = series(range, collectedRows);
  const charged = series(range, chargedRows);
  const waived = series(range, waivedRows);
  const sum = (arr) => round2(arr.reduce((a, b) => a + b, 0));

  const aging = AGING_BUCKETS.map((b) => {
    const rows = overdue.filter((o) => o.bucket === b.key);
    return { key: b.key, label: b.label, loans: rows.length, fine: rows.reduce((s, o) => s + o.fine, 0) };
  });
  const accruing = overdue.reduce((s, o) => s + o.fine, 0);

  const genres = Book.schema.path('genre').enumValues;
  const catalogue = Object.fromEntries(catalogueRows.map((r) => [r._id, r.n]));
  const borrowed = Object.fromEntries(borrowedRows.map((r) => [r._id, r.n]));
  const byGenre = genres
    .map((genre) => ({ genre, catalogue: catalogue[genre] || 0, borrowed: borrowed[genre] || 0 }))
    .sort((a, b) => b.borrowed - a.borrowed || b.catalogue - a.catalogue || a.genre.localeCompare(b.genre));

  const resByStatus = Object.fromEntries(reservationRows.map((r) => [r._id, r.n]));
  const activeRes = Object.fromEntries(activeReservations.map((r) => [r._id, r.n]));

  return {
    range: { from: range.from, to: range.to, days: range.days, bucket: range.bucket, timezone: TZ },
    labels: range.buckets.map((b) => b.label),
    bucketKeys: range.buckets.map((b) => b.key),
    summary: {
      loansIssued: sum(issued),
      loansReturned: sum(returned),
      activeBorrowers: activeBorrowerIds.length,
      currentBorrowers: currentBorrowerIds.length,
      overdueNow: overdue.length,
    },
    fines: {
      charged: sum(charged),
      chargedLoans: fineTotals.loans || 0,
      collected: sum(collected),
      waived: sum(waived),
      outstanding: round2((outstandingFixed.amount || 0) + accruing),
      outstandingFixed: round2(outstandingFixed.amount || 0),
      outstandingFixedLoans: outstandingFixed.loans || 0,
      accruing: round2(accruing),
    },
    loansSeries: { issued, returned },
    finesSeries: { charged, collected, waived },
    aging,
    byGenre,
    topBooks,
    reservations: {
      created: reservationsCreated,
      fulfilled: resByStatus.fulfilled || 0,
      expired: resByStatus.expired || 0,
      cancelled: resByStatus.cancelled || 0,
      waitingNow: activeRes.waiting || 0,
      readyNow: activeRes.ready || 0,
    },
    staffActivity,
  };
};

/** Fine status label for a report row */
const fineStatusOf = (t) => {
  const waived = Number(t.fineWaived) || 0;
  if (t.finePaid) return waived > 0 ? 'Paid (part waived)' : 'Paid';
  if (payableFineOf(t) <= 0 && waived > 0) return 'Waived';
  if (t.status === 'issued') return 'Growing';
  return waived > 0 ? 'Unpaid (part waived)' : 'Unpaid';
};

/**
 * Row tables for the Reports page (same range and definitions as getAnalytics)
 * @param {Object} range - from parseRange
 */
const getReportTables = async (range, now = new Date()) => {
  const inRange = { $gte: range.from, $lte: range.to };
  const loanFilter = { status: { $in: LOAN_STATUSES }, issueDate: inRange };
  const fineFilter = {
    fineAmount: { $gt: 0 },
    status: { $in: LOAN_STATUSES },
    $or: [
      { returnRequestedAt: inRange },
      { returnRequestedAt: { $exists: false }, returnDate: inRange },
      { waivedAt: inRange },
      { paymentApprovedAt: inRange },
    ],
  };

  const select = 'userId bookId status issueDate dueDate returnDate returnRequestedAt fineAmount fineWaived finePaid waiverReason waivedBy waivedAt paymentApprovedAt';
  const [loanCount, loanDocs, fineCount, fineDocs, overdue, topBooks, staffActivity, loanStatusRows, loansOverdueNow, fineSums, borrowAgg] = await Promise.all([
    Transaction.countDocuments(loanFilter),
    Transaction.find(loanFilter).select(select).populate('userId', 'name libraryId').populate('bookId', 'title genre')
      .sort('-issueDate').limit(REPORT_ROW_CAP).lean(),
    Transaction.countDocuments(fineFilter),
    Transaction.find(fineFilter).select(select).populate('userId', 'name libraryId').populate('bookId', 'title')
      .populate('waivedBy', 'name').sort('-returnRequestedAt -returnDate').limit(REPORT_ROW_CAP).lean(),
    loadOverdue(now),
    loadTopBooks(range, 10),
    loadStaffActivity(range),
    // Summary cards: counted over every matching loan, not just the (capped) rows sent
    Transaction.aggregate([{ $match: loanFilter }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Transaction.countDocuments({ ...loanFilter, status: 'issued', dueDate: { $lt: startOfDay(now) } }),
    Transaction.find(fineFilter).select('status dueDate fineAmount fineWaived finePaid').lean(),
    Transaction.aggregate([
      { $match: loanFilter },
      { $lookup: { from: Book.collection.name, localField: 'bookId', foreignField: '_id', as: 'book' } },
      { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, books: { $addToSet: '$bookId' }, borrowers: { $addToSet: '$userId' }, genres: { $push: '$book.genre' } } },
    ]),
  ]);

  const byStatus = Object.fromEntries(loanStatusRows.map((r) => [r._id, r.n]));
  const genreCounts = {};
  (borrowAgg[0]?.genres || []).forEach((g) => { if (g) genreCounts[g] = (genreCounts[g] || 0) + 1; });
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || null;
  const summary = {
    loans: {
      total: loanCount,
      onLoan: (byStatus.issued || 0) + (byStatus.return_requested || 0) + (byStatus.payment_pending || 0),
      returned: byStatus.returned || 0,
      overdue: loansOverdueNow,
    },
    fines: {
      count: fineCount,
      charged: round2(fineSums.reduce((s, t) => s + fineOf(t), 0)),
      collected: round2(fineSums.reduce((s, t) => s + paidFineOf(t), 0)),
      waived: round2(fineSums.reduce((s, t) => s + (Number(t.fineWaived) || 0), 0)),
      payable: round2(fineSums.reduce((s, t) => s + payableFineOf(t), 0)),
    },
    overdue: {
      count: overdue.length,
      fineSoFar: round2(overdue.reduce((s, r) => s + r.fine, 0)),
      averageDays: overdue.length ? Math.round((overdue.reduce((s, r) => s + r.daysOverdue, 0) / overdue.length) * 10) / 10 : 0,
      over30: overdue.filter((r) => r.daysOverdue > 30).length,
    },
    topBooks: {
      loans: loanCount,
      titles: borrowAgg[0]?.books.length || 0,
      borrowers: borrowAgg[0]?.borrowers.length || 0,
      topGenre: topGenre ? { genre: topGenre[0], loans: topGenre[1] } : null,
    },
    staff: {
      actions: staffActivity.reduce((s, r) => s + r.total, 0),
      members: staffActivity.length,
      mostActive: staffActivity[0] ? { name: staffActivity[0].name, total: staffActivity[0].total } : null,
    },
  };

  const loans = loanDocs.map((t) => ({
    _id: t._id,
    issueDate: t.issueDate,
    dueDate: t.dueDate,
    returnDate: t.status === 'returned' ? t.returnDate : null,
    status: t.status,
    student: t.userId?.name || 'Deleted user',
    libraryId: t.userId?.libraryId || '',
    book: t.bookId?.title || 'Unknown book',
    genre: t.bookId?.genre || '',
    daysLate: getDaysLateOf(t),
    fine: fineOf(t),
    waived: round2(t.fineWaived),
    payable: payableFineOf(t),
  }));

  const fines = fineDocs.map((t) => ({
    _id: t._id,
    fixedOn: t.returnRequestedAt || t.returnDate || null,
    student: t.userId?.name || 'Deleted user',
    libraryId: t.userId?.libraryId || '',
    book: t.bookId?.title || 'Unknown book',
    fine: round2(t.fineAmount),
    waived: round2(t.fineWaived),
    waiverReason: t.waiverReason || '',
    waivedBy: t.waivedBy?.name || '',
    waivedOn: t.waivedAt || null,
    paid: paidFineOf(t),
    paidOn: t.finePaid ? t.paymentApprovedAt || t.returnDate || null : null,
    payable: payableFineOf(t),
    status: fineStatusOf(t),
  }));

  return {
    range: { from: range.from, to: range.to, days: range.days, bucket: range.bucket, timezone: TZ },
    loans,
    loansTotal: loanCount,
    loansTruncated: loanCount > loans.length,
    fines,
    finesTotal: fineCount,
    finesTruncated: fineCount > fines.length,
    overdue,
    topBooks,
    staffActivity,
    summary,
    rowCap: REPORT_ROW_CAP,
  };
};

module.exports = {
  parseRange,
  parseDayBounds,
  getAnalytics,
  getReportTables,
  RangeError400,
  AGING_BUCKETS,
  LOAN_STATUSES,
  TZ,
  isObjectId: (v) => typeof v === 'string' && mongoose.isValidObjectId(v),
};
