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
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBooks);

// Protected routes
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getBook);
router.post('/:id/review', protect, createReview);

// Admin only routes
router.post('/upload-cover', protect, isAdmin, uploadBookCover);
router.post('/', protect, isAdmin, createBook);
router.put('/:id', protect, isAdmin, updateBook);
router.delete('/:id', protect, isAdmin, deleteBook);

module.exports = router;
