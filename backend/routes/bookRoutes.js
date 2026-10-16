const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  createReview,
  getRecommendations,
} = require('../controllers/bookController');
const { uploadBookCover } = require('../controllers/bookCoverUploadController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBooks);

// Protected routes
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getBook);
router.post('/:id/review', protect, createReview);

// Admin only routes
router.post('/upload-cover', protect, isStaff, uploadBookCover);
router.post('/', protect, isStaff, createBook);
router.put('/:id', protect, isStaff, updateBook);
router.delete('/:id', protect, isStaff, deleteBook);

module.exports = router;
