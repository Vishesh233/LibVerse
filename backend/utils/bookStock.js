const Book = require('../models/Book');

/*
 * Stock invariant: availableCopies + issuedCopies + heldCopies === totalCopies, none negative.
 * The local MongoDB is standalone (no multi-document transactions), so every helper below is a
 * single conditional update: the check and the change happen together.
 */

/** When the last free copy is gone, arm the one-off "back in stock" alert for wishlisters. */
const armRestockAlert = async (book) => {
  if (book && book.availableCopies === 0 && !book.restockAlertPending) {
    await Book.updateOne({ _id: book._id, availableCopies: 0 }, { $set: { restockAlertPending: true } });
  }
  return book;
};

/**
 * Atomically take one free copy of an active book (availableCopies -1, issuedCopies +1).
 * Held copies are never taken here.
 * @param {String|ObjectId} bookId
 * @returns {Promise<Object|null>} - Updated book, or null if inactive / no copies left
 */
const takeBookCopy = async (bookId) =>
  armRestockAlert(
    await Book.findOneAndUpdate(
      { _id: bookId, isActive: true, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1, issuedCopies: 1 } },
      { new: true }
    )
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
  // issuedCopies was already 0 (older data): only add the copy back if the counts leave room for it
  const repaired = await Book.findOneAndUpdate(
    {
      _id: bookId,
      $expr: {
        $lt: [
          { $add: ['$availableCopies', '$issuedCopies', { $ifNull: ['$heldCopies', 0] }] },
          '$totalCopies',
        ],
      },
    },
    { $inc: { availableCopies: 1 } },
    { new: true }
  );
  return repaired || Book.findById(bookId);
};

/**
 * Atomically set a free copy aside for a ready reservation (availableCopies -1, heldCopies +1).
 * @returns {Promise<Object|null>} - Updated book, or null if inactive / no free copy
 */
const holdBookCopy = async (bookId) =>
  armRestockAlert(
    await Book.findOneAndUpdate(
      { _id: bookId, isActive: true, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1, heldCopies: 1 } },
      { new: true }
    )
  );

/**
 * Atomically put a held copy back on the shelf (heldCopies -1, availableCopies +1).
 * @returns {Promise<Object|null>} - Updated book, or null if nothing was held
 */
const releaseHeldCopy = (bookId) =>
  Book.findOneAndUpdate(
    { _id: bookId, heldCopies: { $gt: 0 } },
    { $inc: { heldCopies: -1, availableCopies: 1 } },
    { new: true }
  );

/**
 * Atomically lend a held copy to the student it was held for (heldCopies -1, issuedCopies +1).
 * @returns {Promise<Object|null>} - Updated book, or null if nothing was held
 */
const consumeHeldCopy = (bookId) =>
  Book.findOneAndUpdate(
    { _id: bookId, heldCopies: { $gt: 0 } },
    { $inc: { heldCopies: -1, issuedCopies: 1 } },
    { new: true }
  );

/**
 * Atomically turn a returned copy straight into a held one for the next reservation
 * (issuedCopies -1, heldCopies +1), so it is never free for anyone else in between.
 * @returns {Promise<Object|null>} - Updated book, or null if inactive / nothing was issued
 */
const returnCopyToHold = (bookId) =>
  Book.findOneAndUpdate(
    { _id: bookId, isActive: true, issuedCopies: { $gt: 0 } },
    { $inc: { issuedCopies: -1, heldCopies: 1 } },
    { new: true }
  );

/** Undo consumeHeldCopy (issuedCopies -1, heldCopies +1) when the loan could not be recorded. */
const restoreHeldCopy = (bookId) =>
  Book.findOneAndUpdate(
    { _id: bookId, issuedCopies: { $gt: 0 } },
    { $inc: { issuedCopies: -1, heldCopies: 1 } },
    { new: true }
  );

module.exports = {
  takeBookCopy,
  returnBookCopy,
  holdBookCopy,
  releaseHeldCopy,
  consumeHeldCopy,
  returnCopyToHold,
  restoreHeldCopy,
  armRestockAlert,
};
