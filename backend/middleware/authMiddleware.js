const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  // Signed before the last password change/reset: that session is over
  if ((decoded.tv || 0) !== (req.user.tokenVersion || 0)) {
    return res.status(401).json({ success: false, message: 'Your session has ended. Please log in again.' });
  }

  if (req.user.isActive === false) {
    return res.status(403).json({ success: false, message: 'Account is deactivated' });
  }

  next();
};

/**
 * Middleware to check if user is staff (librarian or admin)
 */
exports.isStaff = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'librarian')) {
    return res.status(403).json({
      success: false,
      message: 'Librarian/Admin access required'
    });
  }
  next();
};

/**
 * Middleware to check if user is admin (top-level role)
 */
exports.isAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};
/**
 * Middleware to check if user is student
 */
exports.isStudent = async (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can access this route' });
  }
  next();
};
