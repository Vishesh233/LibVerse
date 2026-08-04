const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const { generateQRCode } = require('../utils/qrGenerator');

/**
 * @route GET /api/books
 * @desc Get all books with filters
 * @access Public
 */
exports.getBooks = async (req, res, next) => {
  try {
    const { title, author, genre, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }
    if (genre) {
      filter.genre = genre;
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .exec();

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / limit),
      books,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/books/:id/review
 * @desc Add a review for a book
 * @access Private
 */
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const bookId = req.params.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ userId, bookId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book',
      });
    }

    // Create review
    const review = await Review.create({
      userId,
      bookId,
      rating,
      comment,
    });

    // Update book's average rating
    const reviews = await Review.find({ bookId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    book.rating = Math.round(avgRating * 10) / 10;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/books/:id
 * @desc Get single book
 * @access Public
 */
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Get reviews
    const reviews = await Review.find({ bookId: req.params.id }).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      book,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/books
 * @desc Add a new book (Admin only)
 * @access Private/Admin
 */
exports.createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      genre,
      isbn,
      publisher,
      totalCopies,
      availableCopies,
      issuedCopies,
      rating,
      description,
      publicationYear,
      location,
      coverImage,
    } = req.body;

    // Check if book already exists
    if (isbn) {
      const bookExists = await Book.findOne({ isbn });
      if (bookExists) {
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists',
        });
      }
    }

    const book = await Book.create({
      title,
      author,
      genre,
      isbn,
      publisher,
      totalCopies,
      availableCopies: availableCopies ?? totalCopies,
      issuedCopies: issuedCopies ?? 0,
      rating: rating ?? 0,
      description,
      publicationYear,
      location,
      coverImage,
    });

    // Generate QR code
    const qrCode = await generateQRCode(book._id, book.title);
    book.qrCode = qrCode;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route PUT /api/books/:id
 * @desc Update book (Admin only)
 * @access Private/Admin
 */
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const {
      title,
      author,
      genre,
      isbn,
      publisher,
      totalCopies,
      availableCopies,
      issuedCopies,
      rating,
      description,
      publicationYear,
      location,
      coverImage,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (genre !== undefined) updateData.genre = genre;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (publisher !== undefined) updateData.publisher = publisher;
    if (totalCopies !== undefined) updateData.totalCopies = totalCopies;
    if (availableCopies !== undefined) updateData.availableCopies = availableCopies;
    if (issuedCopies !== undefined) updateData.issuedCopies = issuedCopies;
    if (rating !== undefined) updateData.rating = rating;
    if (description !== undefined) updateData.description = description;
    if (publicationYear !== undefined) updateData.publicationYear = publicationYear;
    if (location !== undefined) updateData.location = location;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route DELETE /api/books/:id
 * @desc Delete book (Admin only)
 * @access Private/Admin
 */
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/books/recommendations
 * @desc Get personalized book recommendations based on user's favorite genres
 * @access Private
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('favoriteGenres');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user has no favorite genres, return empty array
    if (!user.favoriteGenres || user.favoriteGenres.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: 'Please complete onboarding to get personalized recommendations',
      });
    }

    // Get user's transaction history to exclude borrowed/returned books
    const Transaction = require('../models/Transaction');
    const userTransactions = await Transaction.find({ userId })
      .select('bookId status')
      .exec();

    // Extract book IDs that user has interacted with (issued, pending, or returned)
    const excludedBookIds = userTransactions
      .filter(t => t.bookId && (t.status === 'issued' || t.status === 'pending' || t.status === 'returned'))
      .map(t => t.bookId);

    // Build query for books matching favorite genres
    const favoriteGenres = user.favoriteGenres;
    const genreQuery = { genre: { $in: favoriteGenres } };
    
    // Get books matching favorite genres, excluding user's interacted books
    const matchedBooks = await Book.find({
      isActive: true,
      ...genreQuery,
      _id: { $nin: excludedBookIds },
    })
      .sort({ rating: -1, publicationYear: -1 })
      .limit(6)
      .exec();

    // If we have 6 or more matched books, return them
    if (matchedBooks.length >= 6) {
      return res.status(200).json({
        success: true,
        recommendations: matchedBooks.slice(0, 6),
        favoriteGenres: favoriteGenres,
      });
    }

    // If fewer than 6 matched books, fill remaining slots with highest-rated books from other genres
    const remainingSlots = 6 - matchedBooks.length;
    
    // Get IDs of already recommended books to avoid duplicates
    const matchedBookIds = matchedBooks.map(b => b._id);
    const allExcludedIds = [...matchedBookIds, ...excludedBookIds];

    const fillerBooks = await Book.find({
      isActive: true,
      _id: { $nin: allExcludedIds },
    })
      .sort({ rating: -1, publicationYear: -1 })
      .limit(remainingSlots)
      .exec();

    const recommendations = [...matchedBooks, ...fillerBooks];

    return res.status(200).json({
      success: true,
      recommendations: recommendations.slice(0, 6),
      favoriteGenres: favoriteGenres,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
