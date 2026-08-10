const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Book = require('../models/Book');
const { NEW_BOOKS } = require('./newBooksData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';

/**
 * Idempotent seed script for expanding the book collection.
 *
 * SAFETY:
 * - Does NOT wipe any collections
 * - Does NOT delete existing books / users / transactions / notifications / reviews / wishlists
 * - Only ADDS missing books
 * - Can be run multiple times safely
 *
 * Uniqueness:
 * - Primary: ISBN
 * - Secondary: title + author (when ISBN is missing)
 */
const seedBooks = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Read existing books and build uniqueness maps
    const existingBooks = await Book.find({}).select('title author isbn').lean();
    console.log(`Existing books in database: ${existingBooks.length}`);

    const existingIsbns = new Set();
    const existingTitleAuthor = new Set();
    existingBooks.forEach((b) => {
      if (b.isbn) existingIsbns.add(String(b.isbn).trim().toLowerCase());
      if (b.title && b.author) {
        existingTitleAuthor.add(`${String(b.title).trim().toLowerCase()}|${String(b.author).trim().toLowerCase()}`);
      }
    });

    // 2. Filter out books that already exist
    const toInsert = NEW_BOOKS.filter((b) => {
      const isbnKey = b.isbn ? String(b.isbn).trim().toLowerCase() : null;
      if (isbnKey && existingIsbns.has(isbnKey)) return false;

      const titleAuthorKey = `${String(b.title).trim().toLowerCase()}|${String(b.author).trim().toLowerCase()}`;
      if (existingTitleAuthor.has(titleAuthorKey)) return false;

      return true;
    });

    console.log(`Books to insert: ${toInsert.length}`);

    if (toInsert.length === 0) {
      console.log('No new books to insert. Current count already meets the requirement.');
      const total = await Book.countDocuments();
      console.log(`Total books in database: ${total}`);
      process.exit(0);
    }

    // 3. Insert only missing books
    let insertedCount = 0;
    let skippedCount = 0;
    for (const bookData of toInsert) {
      try {
        await Book.create(bookData);
        insertedCount++;
      } catch (err) {
        // Skip duplicate key errors and validation errors for individual books
        skippedCount++;
        console.warn(`Skipped "${bookData.title}": ${err.message}`);
      }
    }

    // 4. Report final count
    const total = await Book.countDocuments();
    console.log(`\nInserted ${insertedCount} new books.`);
    console.log(`Skipped ${skippedCount} books (duplicates/errors).`);
    console.log(`Total books in database: ${total}`);

    if (total >= 200) {
      console.log('✅ Collection size requirement met (200+ books).');
    } else {
      console.log(`⚠️  Collection still below 200 books (current: ${total}).`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedBooks();