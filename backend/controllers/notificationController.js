const Notification = require('../models/Notification');

/**
 * Safely create a notification. Never throws - logs errors and returns null.
 * Notification failures must NEVER fail the main operation (book requests,
 * approvals, rejections, issues, returns, etc.).
 */
exports.createNotification = async (userId, role, type, title, message) => {
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
    });

    return notification;
  } catch (error) {
    // Log internally only - users should never see this message
    console.error('Error creating notification (non-fatal, continuing):', error.message);
    return null;
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const notifications = await Notification.find({
      userId,
      role: userRole,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId,
      role: userRole,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params; // MongoDB _id
    const userId = req.user.id;
    const userRole = req.user.role;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId, role: userRole },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    await Notification.updateMany(
      { userId, role: userRole, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
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