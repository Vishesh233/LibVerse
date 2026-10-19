const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  createReview,
  getRecommendations,
  getPopularBooks,
  getStockSummary,
} = require('../controllers/bookController');
const { uploadBookCover } = require('../controllers/bookCoverUploadController');
const { previewImport, importBooks } = require('../controllers/bookImportController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/popular', getPopularBooks); // before /:id

// Protected routes
router.get('/recommendations', protect, getRecommendations);
router.get('/summary', protect, isStaff, getStockSummary); // before /:id
router.get('/:id', getBook);
router.post('/:id/review', protect, createReview);

// Admin only routes
router.post('/upload-cover', protect, isStaff, uploadBookCover);
router.post('/import/preview', protect, isStaff, previewImport);
router.post('/import', protect, isStaff, importBooks);
router.post('/', protect, isStaff, createBook);
router.put('/:id', protect, isStaff, updateBook);
router.delete('/:id', protect, isStaff, deleteBook);

module.exports = router;
