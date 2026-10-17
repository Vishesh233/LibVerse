const Transaction = require('../models/Transaction');

// Loans that are still out with the student (same set as the My books page)
const ON_LOAN = ['issued', 'return_requested', 'payment_pending', 'overdue'];
const ACTIVITY_LIMIT = 10;

const isStaffRole = (role) => role === 'librarian' || role === 'admin';

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * What counts as one approval by staff member `me`. approvePayment sets both paymentApprovedBy and
 * returnApprovedBy in a single action, so a return approval only counts when it was not part of a
 * payment approval by the same person - otherwise one click would be counted twice.
 */
const approvalKinds = (me) => [
  { kind: 'issue_approved', filter: { approvedBy: me, approvalDate: { $exists: true } }, dateField: 'approvalDate' },
  { kind: 'return_approved', filter: { returnApprovedBy: me, paymentApprovedBy: { $ne: me }, returnDate: { $exists: true } }, dateField: 'returnDate' },
  { kind: 'payment_approved', filter: { paymentApprovedBy: me, paymentApprovedAt: { $exists: true } }, dateField: 'paymentApprovedAt' },
];

/** Events in a student's own loan history, each dated by its own field */
const studentEventKinds = (me) => [
  { kind: 'requested', filter: { userId: me }, dateField: 'createdAt' },
  { kind: 'issued', filter: { userId: me, approvalDate: { $exists: true } }, dateField: 'approvalDate' },
  { kind: 'rejected', filter: { userId: me, status: 'rejected', returnDate: { $exists: true } }, dateField: 'returnDate' },
  { kind: 'return_requested', filter: { userId: me, returnRequestedAt: { $exists: true } }, dateField: 'returnRequestedAt' },
  { kind: 'payment_submitted', filter: { userId: me, paymentSubmittedAt: { $exists: true } }, dateField: 'paymentSubmittedAt' },
  { kind: 'payment_approved', filter: { userId: me, paymentApprovedAt: { $exists: true } }, dateField: 'paymentApprovedAt' },
  { kind: 'returned', filter: { userId: me, status: 'returned', returnDate: { $exists: true } }, dateField: 'returnDate' },
];

/**
 * @route GET /api/auth/me/stats
 * @desc Profile numbers for the signed-in user only (no user id is accepted from the request)
 * @access Private
 */
exports.getMyStats = async (req, res) => {
  try {
    const me = req.user._id;

    if (isStaffRole(req.user.role)) {
      const monthStart = startOfMonth();
      const kinds = approvalKinds(me);
      const counts = await Promise.all(
        kinds.flatMap(({ filter, dateField }) => [
          Transaction.countDocuments(filter),
          Transaction.countDocuments({ ...filter, [dateField]: { $gte: monthStart } }),
        ])
      );
      const [issueTotal, issueMonth, returnTotal, returnMonth, paymentTotal, paymentMonth] = counts;

      return res.status(200).json({
        success: true,
        role: req.user.role,
        stats: {
          approvalsTotal: issueTotal + returnTotal + paymentTotal,
          approvalsThisMonth: issueMonth + returnMonth + paymentMonth,
          issueApprovals: issueTotal,
          returnApprovals: returnTotal,
          paymentApprovals: paymentTotal,
        },
      });
    }

    const [booksRead, currentlyBorrowed, paid] = await Promise.all([
      Transaction.countDocuments({ userId: me, status: 'returned' }),
      Transaction.countDocuments({ userId: me, status: { $in: ON_LOAN } }),
      Transaction.aggregate([
        { $match: { userId: me, finePaid: true } },
        { $group: { _id: null, total: { $sum: '$fineAmount' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      role: req.user.role,
      stats: {
        booksRead,
        currentlyBorrowed,
        finesPaid: paid[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/auth/me/activity
 * @desc Last 10 activity items for the signed-in user only:
 *       students - their own loans, returns and payments; staff - the approvals they made
 * @access Private
 */
exports.getMyActivity = async (req, res) => {
  try {
    const me = req.user._id;
    const staff = isStaffRole(req.user.role);
    const kinds = staff ? approvalKinds(me) : studentEventKinds(me);

    // Newest 10 of each kind, then the newest 10 overall - exact without loading the whole history
    const perKind = await Promise.all(
      kinds.map(async ({ kind, filter, dateField }) => {
        let query = Transaction.find(filter)
          .sort({ [dateField]: -1 })
          .limit(ACTIVITY_LIMIT)
          .select(`bookId userId status fineAmount ${dateField}`)
          .populate('bookId', 'title');
        if (staff) query = query.populate('userId', 'name libraryId');
        const docs = await query.lean();
        return docs.map((t) => ({
          id: `${t._id}-${kind}`,
          transactionId: t._id,
          kind,
          date: t[dateField],
          status: t.status,
          book: t.bookId ? { _id: t.bookId._id, title: t.bookId.title } : null,
          amount: kind.startsWith('payment') ? t.fineAmount || 0 : undefined,
          // Staff see who the approval was for; students only ever see their own records
          student: staff && t.userId ? { name: t.userId.name, libraryId: t.userId.libraryId } : undefined,
        }));
      })
    );

    const activity = perKind
      .flat()
      .filter((a) => a.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, ACTIVITY_LIMIT);

    res.status(200).json({ success: true, role: req.user.role, activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
