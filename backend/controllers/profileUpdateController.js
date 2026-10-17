const User = require('../models/User');
const { notifyStaff } = require('./notificationController');

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldName = user.name;
    user.name = name;
    await user.save();

    if (user.role === 'student' && oldName !== name) {
      // Staff-facing, one per active librarian/admin (non-fatal: notifyStaff never throws)
      await notifyStaff({
        type: 'NAME_CHANGE',
        title: 'Student name change',
        message: `${user.libraryId ? `Student ${user.libraryId}` : 'A student'} changed their name from "${oldName}" to "${name}".`,
        path: '/users',
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};