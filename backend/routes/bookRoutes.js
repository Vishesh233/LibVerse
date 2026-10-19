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
const { protect, isStaff, blockDemo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/popular', getPopularBooks); // before /:id

// Protected routes
router.get('/recommendations', protect, getRecommendations);
router.get('/summary', protect, isStaff, getStockSummary); // before /:id
router.get('/:id', getBook);
router.post('/:id/review', protect, createReview);

// Admin only routes (the catalogue is shared: demo accounts can look, not change; an import
// preview writes nothing, so it stays open)
router.post('/upload-cover', protect, isStaff, blockDemo, uploadBookCover);
router.post('/import/preview', protect, isStaff, previewImport);
router.post('/import', protect, isStaff, blockDemo, importBooks);
router.post('/', protect, isStaff, blockDemo, createBook);
router.put('/:id', protect, isStaff, blockDemo, updateBook);
router.delete('/:id', protect, isStaff, blockDemo, deleteBook);

module.exports = router;
