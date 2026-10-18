const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { toQueryString, toPagination } = require('../utils/escapeRegex');

const STAFF_ROLES = ['librarian', 'admin'];
const STAFF_BASE = { librarian: '/librarian', admin: '/admin' };

const cleanMeta = (meta = {}) => {
  const out = {};
  ['transactionId', 'bookId'].forEach((k) => {
    const v = meta[k]?._id || meta[k];
    if (v && mongoose.isValidObjectId(v)) out[k] = v;
  });
  return Object.keys(out).length ? out : undefined;
};

/**
 * Safely create a notification. Never throws - logs errors and returns null.
 * Notification failures must NEVER fail the main operation (book requests,
 * approvals, rejections, issues, returns, etc.).
 * @param {Object} [extra] - { link, meta: { transactionId, bookId } }
 */
exports.createNotification = async (userId, role, type, title, message, extra = {}) => {
  try {
    if (!userId) {
      console.error('Cannot create notification: userId is required');
      return null;
    }

    const notification = await Notification.create({
      userId,
      role: role || 'student',
      type,
      title,
      message,
      link: extra.link,
      meta: cleanMeta(extra.meta),
    });

    return notification;
  } catch (error) {
    // Log internally only - users should never see this message
    console.error('Error creating notification (non-fatal, continuing):', error.message);
    return null;
  }
};

/**
 * Student-facing notification (userId = the student). Never throws.
 * @param {Object} n - { type, title, message, link, meta }
 */
exports.notifyStudent = (studentId, n) =>
  exports.createNotification(studentId, 'student', n.type, n.title, n.message, { link: n.link, meta: n.meta });

/**
 * Staff-facing notification: one per active librarian/admin, each addressed to that staff user.
 * `path` is appended to the staff member's base route (/librarian or /admin). Never throws.
 * @param {Object} n - { type, title, message, path, meta }
 * @returns {Promise<number>} notifications created
 */
exports.notifyStaff = async (n) => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES }, isActive: { $ne: false } }).select('_id role').lean();
    if (!staff.length) return 0;
    const meta = cleanMeta(n.meta);
    const docs = staff.map((s) => ({
      userId: s._id,
      role: s.role,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.path ? `${STAFF_BASE[s.role]}${n.path}` : undefined,
      meta,
    }));
    const created = await Notification.insertMany(docs, { ordered: false });
    return created.length;
  } catch (error) {
    console.error('Staff notification failed (non-fatal, continuing):', error.message);
    return 0;
  }
};

const unreadCountFor = (userId) => Notification.countDocuments({ userId, isRead: false });

/**
 * @route GET /api/notifications (also GET /api/admin/notifications)
 * @desc The signed-in user's own notifications, newest first, paginated
 * Query: page, limit (max 50), unread=true, category=request|approval|return|fine|reminder|reservation|system
 */
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = toPagination(req.query.page, req.query.limit, 20, 50);
    const category = toQueryString(req.query.category);

    const filter = { userId };
    if (toQueryString(req.query.unread) === 'true') filter.isRead = false;
    if (category && Notification.CATEGORIES.includes(category)) {
      const listed = Object.values(Notification.CATEGORY_TYPES).flat();
      filter.type = category === 'system' ? { $nin: listed } : { $in: Notification.CATEGORY_TYPES[category] };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      unreadCountFor(userId),
    ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params; // MongoDB _id or NOTIF-<id>
    const userId = req.user.id;

    // Strip NOTIF- prefix if present
    const actualId = id.startsWith('NOTIF-') ? id.slice(6) : id;
    if (!mongoose.isValidObjectId(actualId)) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: actualId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification, unreadCount: await unreadCountFor(userId) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updated: result.modifiedCount,
      unreadCount: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create admin notification (legacy - updated for new schema)
exports.createAdminNotification = async (req, res, next) => {
  try {
    const { type, message, title } = req.body;
    if (!type || !message) {
      return res.status(400).json({ success: false, message: 'Type and message are required' });
    }

    const notification = await Notification.create({
      userId: req.user.id,
      role: req.user.role || 'admin',
      type,
      title: title || 'Admin Notification',
      message,
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
