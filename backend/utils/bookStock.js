const Book = require('../models/Book');

/**
 * Atomically take one copy of an active book (availableCopies -1, issuedCopies +1).
 * The local MongoDB is standalone (no multi-document transactions), so the stock
 * check and the decrement happen in a single conditional update.
 * @param {String|ObjectId} bookId
 * @returns {Promise<Object|null>} - Updated book, or null if inactive / no copies left
 */
const takeBookCopy = (bookId) =>
  Book.findOneAndUpdate(
    { _id: bookId, isActive: true, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1, issuedCopies: 1 } },
    { new: true }
  );

/**
 * Atomically give one copy back (availableCopies +1, issuedCopies -1),
 * never letting issuedCopies go below 0.
 * @param {String|ObjectId} bookId
 * @returns {Promise<Object|null>} - Updated book, or null if the book no longer exists
 */
const returnBookCopy = async (bookId) => {
  const book = await Book.findOneAndUpdate(
    { _id: bookId, issuedCopies: { $gt: 0 } },
    { $inc: { availableCopies: 1, issuedCopies: -1 } },
    { new: true }
  );
  if (book) return book;
  return Book.findOneAndUpdate({ _id: bookId }, { $inc: { availableCopies: 1 } }, { new: true });
};

module.exports = { takeBookCopy, returnBookCopy };
