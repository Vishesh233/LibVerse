const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reservation = require('../models/Reservation');
const AuditLog = require('../models/AuditLog');
const { fineOf, payableFineOf, paidFineOf, getDaysOverdue, getDaysRemaining, startOfDay } = require('../utils/fineCalculator');
const { MAX_RENEWALS } = require('../utils/loanRules');
const { queuePositions } = require('../services/reservationService');
const { escapeRegex, toQueryString, toPagination } = require('../utils/escapeRegex');

const OPEN_LOAN = ['issued', 'return_requested', 'payment_pending'];
const HISTORY_LIMIT = 10;
const AUDIT_LIMIT = 25;

/** Librarians see students only; admins see everyone */
const mayView = (actor, target) => actor.role === 'admin' || target.role === 'student';

const bookOf = (b) => (b && typeof b === 'object'
  ? { _id: b._id, title: b.title || 'Unknown book', author: b.author || '', cover: b.imageUrl || b.coverImage || null }
  : { _id: b || null, title: 'Unknown book', author: '', cover: null });

const loanRow = (t, now) => {
  const fine = fineOf(t);
  const waived = Number(t.fineWaived) || 0;
  return {
    _id: t._id,
    book: bookOf(t.bookId),
    status: t.status,
    requestDate: t.requestDate || t.createdAt,
    issueDate: t.issueDate || null,
    dueDate: t.dueDate || null,
    returnDate: t.status === 'returned' ? t.returnDate || null : null,
    daysRemaining: t.status === 'issued' && t.dueDate ? getDaysRemaining(t.dueDate) : null,
    daysOverdue: t.status === 'issued' && t.dueDate ? getDaysOverdue(t.dueDate, now) : 0,
    fine,
    waived,
    paid: paidFineOf(t),
    payable: payableFineOf(t),
    finePaid: !!t.finePaid,
    fineGrowing: t.status === 'issued' && fine > 0,
    waiverReason: t.waiverReason || '',
    renewalCount: Number(t.renewalCount) || 0,
    maxRenewals: MAX_RENEWALS,
    canRenew: t.status === 'issued' && (Number(t.renewalCount) || 0) < MAX_RENEWALS && getDaysOverdue(t.dueDate, now) === 0,
  };
};

/**
 * @route GET /api/admin/users/:id/overview?historyPage=
 * @desc Student 360: profile, stats, current loans, history (paginated), fines, reservations,
 *       wishlist count and (admins only) recent audit entries about the user.
 * @access Private/Staff (librarians: students only)
 */
exports.getUserOverview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'User not found' });
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!mayView(req.user, user)) return res.status(403).json({ success: false, message: 'Librarians can only view student accounts' });

    const now = new Date();
    const { page, limit, skip } = toPagination(req.query.historyPage, req.query.historyLimit, HISTORY_LIMIT, 50);
    const isAdmin = req.user.role === 'admin';

    const [all, historyTotal, historyDocs, reservations] = await Promise.all([
      Transaction.find({ userId: user._id }).populate('bookId', 'title author imageUrl coverImage').sort({ createdAt: -1 }).lean(),
      Transaction.countDocuments({ userId: user._id }),
      Transaction.find({ userId: user._id }).populate('bookId', 'title author imageUrl coverImage').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      Reservation.find({ userId: user._id }).populate('bookId', 'title author imageUrl coverImage').sort({ createdAt: -1 }).lean(),
    ]);

    const today = startOfDay(now);
    const open = all.filter((t) => OPEN_LOAN.includes(t.status));
    const issued = all.filter((t) => t.status === 'issued');
    const fixed = all.filter((t) => ['return_requested', 'payment_pending', 'returned'].includes(t.status));
    const positions = await queuePositions(reservations);

    const stats = {
      booksRead: all.filter((t) => t.status === 'returned').length,
      onLoan: open.length,
      overdue: issued.filter((t) => t.dueDate && new Date(t.dueDate) < today).length,
      pendingRequests: all.filter((t) => t.status === 'pending').length,
      finesPaid: all.reduce((s, t) => s + paidFineOf(t), 0),
      finesPayable: fixed.reduce((s, t) => s + payableFineOf(t), 0), // fixed fines still owed
      finesAccruing: issued.reduce((s, t) => s + fineOf(t), 0), // still growing on overdue loans
      finesWaived: all.reduce((s, t) => s + (Number(t.fineWaived) || 0), 0),
      wishlist: (user.wishlist || []).length,
      activeReservations: reservations.filter((r) => Reservation.ACTIVE_STATUSES.includes(r.status)).length,
    };

    let audit = null;
    if (isAdmin) {
      const txIds = all.map((t) => t._id);
      const resIds = reservations.map((r) => r._id);
      const entries = await AuditLog.find({
        $or: [
          { targetType: 'User', targetId: user._id },
          { targetType: 'Transaction', targetId: { $in: txIds } },
          { targetType: 'Reservation', targetId: { $in: resIds } },
        ],
      }).sort({ createdAt: -1, _id: -1 }).limit(AUDIT_LIMIT).populate('actorId', 'name role').lean();
      audit = entries.map((e) => ({ _id: e._id, at: e.createdAt, action: e.action, summary: e.summary, actor: e.actorId?.name || 'Staff', actorRole: e.actorRole }));
    }

    res.status(200).json({
      success: true,
      overview: {
        profile: {
          _id: user._id,
          name: user.name,
          profileImage: user.profileImage || null,
          role: user.role,
          libraryId: user.libraryId || '',
          memberSince: user.createdAt || null,
          isActive: user.isActive !== false,
          cardVersion: Number(user.cardVersion) || 1,
          // Staff-only endpoint: contact details for the desk
          phone: user.phone || '',
          address: user.address || '',
        },
        stats,
        currentLoans: open.map((t) => loanRow(t, now)),
        pendingRequests: all.filter((t) => t.status === 'pending').map((t) => loanRow(t, now)),
        history: {
          rows: historyDocs.map((t) => loanRow(t, now)),
          page,
          pages: Math.max(1, Math.ceil(historyTotal / limit)),
          total: historyTotal,
        },
        fines: all.filter((t) => fineOf(t) > 0 || (Number(t.fineWaived) || 0) > 0).map((t) => loanRow(t, now)),
        reservations: reservations.map((r) => ({
          _id: r._id,
          book: bookOf(r.bookId),
          status: r.status,
          createdAt: r.createdAt,
          readyAt: r.readyAt || null,
          expiresAt: r.expiresAt || null,
          position: positions.get(String(r._id)) || null,
        })),
        audit,
        permissions: {
          isAdmin,
          canChangeStatus: req.user._id.toString() !== user._id.toString(),
          canReissueCard: isAdmin && !!user.libraryId,
          canIssue: user.role === 'student' && user.isActive !== false,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/users/lookup?q=
 * @desc "Find a student": exact Library ID (any case) first, then name or email contains.
 *       Librarians only find students. At most 10 matches.
 * @access Private/Staff
 */
exports.lookupUsers = async (req, res) => {
  try {
    const q = (toQueryString(req.query.q) || '').trim();
    if (!q) return res.status(400).json({ success: false, message: 'Type a Library ID, name or email' });
    const roleFilter = req.user.role === 'admin' ? {} : { role: 'student' };
    const exact = await User.findOne({ ...roleFilter, libraryId: { $regex: `^${escapeRegex(q)}$`, $options: 'i' } })
      .select('name libraryId role isActive profileImage').lean();
    if (exact) return res.status(200).json({ success: true, exact: true, users: [exact] });
    const pattern = escapeRegex(q);
    const users = await User.find({
      ...roleFilter,
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        { email: { $regex: pattern, $options: 'i' } },
        { libraryId: { $regex: pattern, $options: 'i' } },
      ],
    }).select('name libraryId role isActive profileImage').sort({ name: 1 }).limit(10).lean();
    res.status(200).json({ success: true, exact: false, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
