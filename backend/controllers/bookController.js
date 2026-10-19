const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const Transaction = require('../models/Transaction');
const { afterCopyFreed, cancelBookReservations } = require('../services/reservationService');
const recommendationService = require('../services/recommendationService');
const { armRestockAlert } = require('../utils/bookStock');
const { escapeRegex, toQueryString, toPagination } = require('../utils/escapeRegex');
const { audit } = require('../utils/audit');
const { normaliseIsbn } = require('../utils/isbn');

// ?sort= values for GET /api/books (anything else keeps the default order). Table columns sort by
// <column> ascending or -<column> descending; _id breaks ties so pages never overlap.
const BOOK_SORTS = {
  newest: { createdAt: -1, _id: -1 },
  rating: { rating: -1, title: 1 },
};
const SORT_COLUMNS = {
  title: 'title', author: 'author', genre: 'genre', available: 'availableCopies', total: 'totalCopies', added: 'createdAt',
};
const sortFrom = (value) => {
  if (!value) return null;
  if (BOOK_SORTS[value]) return BOOK_SORTS[value];
  const desc = value.startsWith('-');
  const field = SORT_COLUMNS[desc ? value.slice(1) : value];
  if (!field) return null;
  const dir = desc ? -1 : 1;
  return field === 'title' ? { title: dir, _id: dir } : { [field]: dir, title: 1, _id: 1 };
};
// "Low stock": a fifth or less of the copies on the shelf (always includes "none left")
const LOW_STOCK = { $expr: { $lte: [{ $multiply: ['$availableCopies', 5] }, '$totalCopies'] } };
// Loans that count as a borrow for "popular" (requests and rejections do not)
const BORROWED_STATUSES = ['issued', 'return_requested', 'payment_pending', 'returned'];
// "Picked for you": how many, which loans count as read, and which books never to suggest
const RECOMMENDATION_LIMIT = 6;
const RECOMMEND_READ_STATUSES = BORROWED_STATUSES;
const RECOMMEND_EXCLUDE_STATUSES = ['pending', ...BORROWED_STATUSES];

/**
 * @route GET /api/books
 * @desc Get all books with filters
 * @access Public
 */
exports.getBooks = async (req, res, next) => {
  try {
    // Only plain strings are used; objects/arrays (e.g. ?genre[$ne]=x) are treated as absent
    const title = toQueryString(req.query.title);
    const author = toQueryString(req.query.author);
    const genre = toQueryString(req.query.genre);
    const rating = toQueryString(req.query.rating);
    const availability = toQueryString(req.query.availability);
    const { page, limit, skip } = toPagination(req.query.page, req.query.limit, 10);
    const sort = sortFrom(toQueryString(req.query.sort));

    let filter = { isActive: true };

    // ?ids=a,b,c - specific books (QR label sheets); invalid ids are ignored, at most 100 (one page)
    const ids = toQueryString(req.query.ids);
    if (ids) {
      const valid = ids.split(',').map((s) => s.trim()).filter((s) => /^[a-f0-9]{24}$/i.test(s)).slice(0, 100);
      filter._id = { $in: valid };
    }

    // ?q= one search box: title OR author (escaped, case-insensitive)
    const q = toQueryString(req.query.q); // already trimmed; undefined when absent or not a string
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: 'i' };
      filter.$or = [{ title: rx }, { author: rx }];
    }
    if (title) {
      filter.title = { $regex: escapeRegex(title), $options: 'i' };
    }
    if (author) {
      filter.author = { $regex: escapeRegex(author), $options: 'i' };
    }
    if (genre) {
      filter.genre = genre;
    }
    if (rating) {
      const minRating = parseFloat(rating);
      if (!isNaN(minRating) && minRating > 0) {
        filter.rating = { $gte: minRating };
      }
    }
    if (availability === 'available') {
      filter.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      filter.availableCopies = { $lte: 0 };
    } else if (availability === 'low') {
      Object.assign(filter, LOW_STOCK);
    }

    let query = Book.find(filter);
    // Case-insensitive A-Z for text columns ("ikigai" sorts with "Ikigai")
    if (sort) query = query.sort(sort).collation({ locale: 'en', strength: 2 });
    const books = await query.limit(limit).skip(skip).exec();

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
 * @route GET /api/books/summary
 * @desc Stock totals for the staff books page: titles, copies (on the shelf / on loan / held),
 *       low stock (a fifth or less on the shelf) and out of stock, over active books
 * @access Private/Staff
 */
exports.getStockSummary = async (req, res) => {
  try {
    const [totals = {}] = await Book.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          titles: { $sum: 1 },
          copies: { $sum: '$totalCopies' },
          available: { $sum: '$availableCopies' },
          issued: { $sum: { $ifNull: ['$issuedCopies', 0] } },
          held: { $sum: { $ifNull: ['$heldCopies', 0] } },
          lowStock: { $sum: { $cond: [LOW_STOCK.$expr, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $lte: ['$availableCopies', 0] }, 1, 0] } },
        },
      },
    ]);
    const { _id, ...summary } = totals;
    res.status(200).json({
      success: true,
      summary: { titles: 0, copies: 0, available: 0, issued: 0, held: 0, lowStock: 0, outOfStock: 0, ...summary },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/books/popular
 * @desc Most borrowed active books (count of issued/returned loans), optional ?genre=, ?limit= (max 20)
 * @access Public
 */
exports.getPopularBooks = async (req, res, next) => {
  try {
    const genre = toQueryString(req.query.genre);
    const { limit } = toPagination(1, req.query.limit, 10, 20);

    const rows = await Transaction.aggregate([
      { $match: { status: { $in: BORROWED_STATUSES } } },
      { $group: { _id: '$bookId', borrowCount: { $sum: 1 } } },
      { $lookup: { from: Book.collection.name, localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $match: { 'book.isActive': true, ...(genre ? { 'book.genre': genre } : {}) } },
      { $sort: { borrowCount: -1, 'book.rating': -1, 'book.title': 1 } },
      { $limit: limit },
    ]);

    const books = rows.map((r) => ({ ...r.book, borrowCount: r.borrowCount }));
    res.status(200).json({ success: true, count: books.length, books });
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

    if (!book || book.isActive === false) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Get reviews (public page: reviewer name only, never the email)
    const reviews = await Review.find({ bookId: req.params.id }).populate('userId', 'name');

    // Waiting-list size (counts only, no names)
    const [waiting, ready] = await Promise.all([
      Reservation.countDocuments({ bookId: book._id, status: 'waiting' }),
      Reservation.countDocuments({ bookId: book._id, status: 'ready' }),
    ]);

    res.status(200).json({
      success: true,
      book,
      reviews,
      reservations: { waiting, ready },
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
      publishedYear,
      location,
      coverImage,
      imageUrl,
      pages,
      language,
    } = req.body;

    // Check if book already exists (ISBNs are stored as digits only)
    const cleanIsbn = isbn ? normaliseIsbn(isbn) : undefined;
    if (cleanIsbn) {
      const bookExists = await Book.findOne({ isbn: cleanIsbn });
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
      isbn: cleanIsbn,
      publisher,
      totalCopies,
      availableCopies: availableCopies ?? totalCopies,
      issuedCopies: issuedCopies ?? 0,
      rating: rating ?? 0,
      description,
      // publishedYear: older clients' name for the same field
      publicationYear: publicationYear ?? publishedYear,
      location,
      coverImage,
      imageUrl,
      pages,
      language,
    });

    // No stored QR image: the desk QR ("LV1:B:<bookId>") is drawn on the fly by the frontend

    await audit(req, 'book.create', { type: 'Book', id: book._id },
      `Added "${book.title}" by ${book.author} (${book.totalCopies} cop${book.totalCopies === 1 ? 'y' : 'ies'})`,
      { genre: book.genre, totalCopies: book.totalCopies });
    recommendationService.scheduleRetrain();

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
      publishedYear,
      location,
      coverImage,
      imageUrl,
      pages,
      language,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (genre !== undefined) updateData.genre = genre;
    if (isbn !== undefined) updateData.isbn = isbn ? normaliseIsbn(isbn) : isbn;
    if (publisher !== undefined) updateData.publisher = publisher;
    if (totalCopies !== undefined) updateData.totalCopies = totalCopies;
    if (availableCopies !== undefined) updateData.availableCopies = availableCopies;
    if (issuedCopies !== undefined) updateData.issuedCopies = issuedCopies;
    if (rating !== undefined) updateData.rating = rating;
    if (description !== undefined) updateData.description = description;
    // publishedYear: older clients' name for publicationYear
    if (publicationYear !== undefined) updateData.publicationYear = publicationYear;
    else if (publishedYear !== undefined) updateData.publicationYear = publishedYear;
    if (location !== undefined) updateData.location = location;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (pages !== undefined) updateData.pages = pages;
    if (language !== undefined) updateData.language = language;

    // Copy counts must keep available + issued + held (for reservations) === total, none negative
    const copiesChanged = ['totalCopies', 'availableCopies', 'issuedCopies'].some((k) => updateData[k] !== undefined);
    const held = Number(book.heldCopies) || 0;
    if (copiesChanged) {
      const next = {
        total: Number(updateData.totalCopies ?? book.totalCopies),
        available: Number(updateData.availableCopies ?? book.availableCopies),
        issued: Number(updateData.issuedCopies ?? book.issuedCopies ?? 0),
      };
      const valid = Object.values(next).every((n) => Number.isInteger(n) && n >= 0);
      if (!valid || next.available + next.issued + held !== next.total) {
        return res.status(400).json({
          success: false,
          message: `Copy counts don't add up: available (${updateData.availableCopies ?? book.availableCopies}) + issued (${updateData.issuedCopies ?? book.issuedCopies ?? 0})${held ? ` + held for reservations (${held})` : ''} must equal total (${updateData.totalCopies ?? book.totalCopies}).`,
        });
      }
    }

    // Only the counts checked above may change: conditional on the stock not moving meanwhile
    // (a 0 count may be missing on older documents)
    const sameCount = (n) => (n ? n : { $in: [0, null] });
    book = await Book.findOneAndUpdate(
      copiesChanged
        ? {
            _id: book._id,
            availableCopies: sameCount(book.availableCopies),
            issuedCopies: sameCount(book.issuedCopies),
            heldCopies: sameCount(held),
          }
        : { _id: book._id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(409).json({ success: false, message: 'Copies of this book were just issued or returned. Reload and try again.' });
    }

    // New free copies go to the waiting list first, then wishlisters hear it is back
    if (copiesChanged && book.availableCopies > 0) await afterCopyFreed(book._id);
    // No free copy left after the edit: wishlisters hear when one is back
    else if (copiesChanged) await armRestockAlert(book);

    const fields = Object.keys(updateData);
    await audit(req, 'book.update', { type: 'Book', id: book._id },
      `Edited "${book.title}"${fields.length ? `: ${fields.join(', ')}` : ''}`,
      { fields, ...(copiesChanged ? { totalCopies: book.totalCopies, availableCopies: book.availableCopies } : {}) });
    recommendationService.scheduleRetrain();

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

    // Nobody can borrow it any more: cancel its waiting list and release held copies
    await cancelBookReservations(book._id, req.user);

    await audit(req, 'book.delete', { type: 'Book', id: book._id }, `Removed "${book.title}" by ${book.author} from the catalogue`);
    recommendationService.scheduleRetrain();

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
 * @desc "Picked for you": up to 6 books, each with a reason. Ranked by the AI service
 *       (content similarity to books the student read, then favourite genres) when it answers
 *       within 1.5 s; otherwise, or to fill remaining slots, the MongoDB genre logic.
 *       Response: { recommendations: [book + { recommendationReason, recommendationSource }],
 *                   source: 'ai' | 'fallback', favoriteGenres }
 * @access Private
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('favoriteGenres');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const favoriteGenres = user.favoriteGenres || [];

    const [userTransactions, activeReservations] = await Promise.all([
      Transaction.find({ userId }).select('bookId status').lean(),
      Reservation.find({ userId, status: { $in: ['waiting', 'ready'] } }).select('bookId').lean(),
    ]);
    // Read = the book was handed out at some point; their content drives the AI ranking
    const readIds = [...new Set(userTransactions
      .filter((t) => t.bookId && RECOMMEND_READ_STATUSES.includes(t.status))
      .map((t) => String(t.bookId)))];
    // Never suggest a book they have, asked for, read or are waiting for
    const excludedIds = [...new Set([
      ...userTransactions.filter((t) => t.bookId && RECOMMEND_EXCLUDE_STATUSES.includes(t.status)).map((t) => String(t.bookId)),
      ...activeReservations.map((r) => String(r.bookId)),
    ])];

    if (!favoriteGenres.length && !readIds.length) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        source: 'fallback',
        message: 'Please complete onboarding to get personalized recommendations',
      });
    }

    const picks = [];
    let source = 'fallback';
    if (recommendationService.isEnabled()) {
      try {
        const ranked = await recommendationService.recommend({
          readIds, favouriteGenres: favoriteGenres, excludeIds: excludedIds, limit: RECOMMENDATION_LIMIT,
        });
        const ids = ranked.map((r) => r.id).filter((id) => mongoose.isValidObjectId(id));
        // Re-read from MongoDB: current stock, and only books that are still active
        const found = await Book.find({ _id: { $in: ids }, isActive: true }).lean();
        const byId = new Map(found.map((b) => [String(b._id), b]));
        for (const r of ranked) {
          const book = byId.get(String(r.id));
          if (book) picks.push({ ...book, recommendationReason: r.reason, recommendationSource: 'ai' });
        }
        if (picks.length) source = 'ai';
      } catch (error) {
        // Service down, slow, untrained or unconfigured: the fallback below answers instead
      }
    }

    if (picks.length < RECOMMENDATION_LIMIT) {
      const taken = [...excludedIds, ...picks.map((b) => String(b._id))];
      const fill = await fallbackRecommendations(favoriteGenres, taken, RECOMMENDATION_LIMIT - picks.length);
      picks.push(...fill);
    }

    return res.status(200).json({
      success: true,
      recommendations: picks.slice(0, RECOMMENDATION_LIMIT),
      source,
      favoriteGenres,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * The MongoDB genre logic: top-rated books in the favourite genres, then top-rated books from any
 * genre for the remaining slots. Each book gets a reason and recommendationSource 'fallback'.
 */
const fallbackRecommendations = async (favoriteGenres, excludedIds, limit) => {
  const favourites = new Set(favoriteGenres);
  const matched = favoriteGenres.length
    ? await Book.find({ isActive: true, genre: { $in: favoriteGenres }, _id: { $nin: excludedIds } })
      .sort({ rating: -1, publicationYear: -1 })
      .limit(limit)
      .lean()
    : [];
  const filler = matched.length < limit
    ? await Book.find({ isActive: true, _id: { $nin: [...excludedIds, ...matched.map((b) => b._id)] } })
      .sort({ rating: -1, publicationYear: -1 })
      .limit(limit - matched.length)
      .lean()
    : [];
  return [...matched, ...filler].map((book) => ({
    ...book,
    recommendationReason: favourites.has(book.genre) ? `Top rated in ${book.genre}` : 'Highly rated by readers',
    recommendationSource: 'fallback',
  }));
};
