const User = require('../models/User');
const { createNotification } = require('./notificationController');

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
      // Non-fatal - never fails the main operation
      try {
        await createNotification(
          req.user.id,
          'admin',
          'NAME_CHANGE',
          'Student Name Change',
          `Student ${user.libraryId} changed name from "${oldName}" to "${name}"`
        );
      } catch (notifError) {
        console.error('Notification creation failed (non-fatal):', notifError.message);
      }
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};