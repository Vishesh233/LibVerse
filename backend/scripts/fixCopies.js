const mongoose = require('mongoose');
const Book = require('../models/Book');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find books with inconsistent copies
    const inconsistent = await Book.find({
      $expr: { $ne: [{ $add: ['$availableCopies', '$issuedCopies'] }, '$totalCopies'] }
    }).lean();

    console.log(`Found ${inconsistent.length} books with inconsistent copies`);

    for (const book of inconsistent) {
      // Fix: set issuedCopies = totalCopies - availableCopies
      const newIssued = (book.totalCopies || 0) - (book.availableCopies || 0);
      const update = {
        issuedCopies: Math.max(0, newIssued),
      };

      // Ensure availableCopies is not greater than totalCopies
      if ((book.availableCopies || 0) > (book.totalCopies || 0)) {
        update.availableCopies = book.totalCopies;
        update.issuedCopies = 0;
      }

      await Book.findByIdAndUpdate(book._id, update);
      console.log(`Fixed "${book.title}": total=${book.totalCopies}, available=${book.availableCopies}, issued=${update.issuedCopies}`);
    }

    // Also fix books with 0 available and 0 issued but total > 0
    const zeroZero = await Book.find({ availableCopies: 0, issuedCopies: 0, totalCopies: { $gt: 0 } }).lean();
    console.log(`\nFound ${zeroZero.length} books with 0/0 but total > 0`);
    for (const book of zeroZero) {
      // Make all copies available if none are issued
      await Book.findByIdAndUpdate(book._id, { availableCopies: book.totalCopies, issuedCopies: 0 });
      console.log(`Fixed "${book.title}": set available=${book.totalCopies}`);
    }

    // Verification
    const stillBad = await Book.find({
      $expr: { $ne: [{ $add: ['$availableCopies', '$issuedCopies'] }, '$totalCopies'] }
    }).countDocuments();
    console.log(`\nRemaining inconsistent books: ${stillBad}`);

    const zeroAvail = await Book.find({ availableCopies: { $lte: 0 } }).countDocuments();
    console.log(`Unavailable books: ${zeroAvail}`);

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
