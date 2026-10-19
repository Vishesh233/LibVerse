const User = require('../models/User');
const Book = require('../models/Book');
const { createNotification } = require('./notificationController');

/**
 * @route GET /api/wishlist
 * @desc Get current user's wishlist
 * @access Private
 */
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/wishlist/:bookId
 * @desc Add book to wishlist
 * @access Private
 */
exports.addToWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.wishlist.includes(bookId)) {
      user.wishlist.push(bookId);
      await user.save();

      // Create notification for student (non-fatal - never fails the main operation)
      try {
        await createNotification(
          req.user.id,
          'student',
          'WISHLIST_AVAILABLE',
          'Added to Wishlist',
          `"${book.title}" has been added to your wishlist.`,
          { link: '/student/wishlist', meta: { bookId: book._id } }
        );
      } catch (notifError) {
        console.error('Notification creation failed (non-fatal):', notifError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Book added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route DELETE /api/wishlist/:bookId
 * @desc Remove book from wishlist
 * @access Private
 */
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== bookId);
    await user.save();

    // Get book title for notification
    const removedBook = await Book.findById(bookId);

    // Create notification for student (non-fatal - never fails the main operation)
    try {
      await createNotification(
        req.user.id,
        'student',
        'WISHLIST_AVAILABLE',
        'Removed from Wishlist',
        `"${removedBook?.title || 'Book'}" has been removed from your wishlist.`,
        { link: '/student/wishlist' }
      );
    } catch (notifError) {
      console.error('Notification creation failed (non-fatal):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Book removed from wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};