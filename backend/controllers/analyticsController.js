const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const { AUDIT_ACTIONS } = require('../models/AuditLog');
const User = require('../models/User');
const { parseRange, parseDayBounds, getAnalytics, getReportTables, RangeError400 } = require('../services/analyticsService');
const { toQueryString, toPagination } = require('../utils/escapeRegex');

const sendRangeError = (res, error) => {
  if (error instanceof RangeError400) {
    res.status(400).json({ success: false, message: error.message });
    return true;
  }
  return false;
};

/**
 * @route GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 * @desc Fines, loans, overdue aging, genres, top books, borrowers, reservations, staff activity
 * @access Private/Staff
 */
exports.getAnalytics = async (req, res) => {
  try {
    const range = parseRange({ from: toQueryString(req.query.from), to: toQueryString(req.query.to) });
    const analytics = await getAnalytics(range);
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    if (sendRangeError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD
 * @desc Report tables for the same period: loans, fines (with waivers), overdue, top books, staff activity
 * @access Private/Staff
 */
exports.getReports = async (req, res) => {
  try {
    const range = parseRange({ from: toQueryString(req.query.from), to: toQueryString(req.query.to) });
    const reports = await getReportTables(range);
    res.status(200).json({ success: true, reports });
  } catch (error) {
    if (sendRangeError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/audit?actor=&action=&from=&to=&page=&limit=
 * @desc Audit log, newest first. Filters: actor (user id), action, from/to (YYYY-MM-DD, inclusive)
 * @access Private/Admin
 */
exports.getAuditLog = async (req, res) => {
  try {
    const actor = toQueryString(req.query.actor);
    const action = toQueryString(req.query.action);
    const from = toQueryString(req.query.from);
    const to = toQueryString(req.query.to);
    const { page, limit, skip } = toPagination(req.query.page, req.query.limit, 20, 100);

    const filter = {};
    if (actor) {
      if (!mongoose.isValidObjectId(actor)) return res.status(400).json({ success: false, message: 'Invalid staff member' });
      filter.actorId = actor;
    }
    if (action) {
      if (!AUDIT_ACTIONS.includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });
      filter.action = action;
    }
    if (from || to) {
      // Same day parsing as the analytics range; both ends inclusive, either may be open
      const bounds = parseDayBounds({ from, to });
      filter.createdAt = {};
      if (bounds.from) filter.createdAt.$gte = bounds.from;
      if (bounds.to) filter.createdAt.$lte = bounds.to;
    }

    const [entries, total, actorIds] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).populate('actorId', 'name role libraryId').lean(),
      AuditLog.countDocuments(filter),
      AuditLog.distinct('actorId'),
    ]);
    const actors = await User.find({ _id: { $in: actorIds } }).select('name role').sort('name').lean();

    res.status(200).json({
      success: true,
      entries: entries.map((e) => ({
        _id: e._id,
        createdAt: e.createdAt,
        action: e.action,
        actor: e.actorId ? { _id: e.actorId._id, name: e.actorId.name, role: e.actorId.role, libraryId: e.actorId.libraryId } : null,
        actorRole: e.actorRole,
        targetType: e.targetType,
        targetId: e.targetId,
        summary: e.summary,
        meta: e.meta || null,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      actors: actors.map((a) => ({ _id: a._id, name: a.name, role: a.role })),
      actions: AUDIT_ACTIONS,
    });
  } catch (error) {
    if (sendRangeError(res, error)) return;
    res.status(500).json({ success: false, message: error.message });
  }
};
