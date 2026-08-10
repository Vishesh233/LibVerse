const mongoose = require('mongoose');
const Book = require('../models/Book');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find books with missing critical fields
    const missingPages = await Book.find({ pages: { $exists: false } }).lean();
    const missingLang = await Book.find({ language: { $exists: false } }).lean();
    const missingCover = await Book.find({ $and: [{ coverImage: { $exists: false } }, { imageUrl: { $exists: false } }] }).lean();

    console.log(`Books missing pages: ${missingPages.length}`);
    console.log(`Books missing language: ${missingLang.length}`);
    console.log(`Books missing both coverImage and imageUrl: ${missingCover.length}`);

    // Fix missing pages
    for (const book of missingPages) {
      await Book.findByIdAndUpdate(book._id, { pages: 300 });
      console.log(`Added pages to "${book.title}"`);
    }

    // Fix missing language
    for (const book of missingLang) {
      await Book.findByIdAndUpdate(book._id, { language: 'English' });
      console.log(`Added language to "${book.title}"`);
    }

    // Fix missing cover images - use OpenLibrary if ISBN exists, otherwise use placeholder
    for (const book of missingCover) {
      let coverUrl = null;
      if (book.isbn) {
        const cleanIsbn = String(book.isbn).replace(/[^\dXx]/g, '').toUpperCase();
        if (cleanIsbn) {
          coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        }
      }
      
      const update = {};
      if (coverUrl) {
        update.coverImage = coverUrl;
        update.imageUrl = coverUrl;
      }
      
      if (Object.keys(update).length > 0) {
        await Book.findByIdAndUpdate(book._id, update);
        console.log(`Added cover to "${book.title}": ${coverUrl || 'none available'}`);
      }
    }

    // Final verification
    const stillNoPages = await Book.find({ pages: { $exists: false } }).countDocuments();
    const stillNoLang = await Book.find({ language: { $exists: false } }).countDocuments();
    const stillNoCover = await Book.find({ $and: [{ coverImage: { $exists: false } }, { imageUrl: { $exists: false } }] }).countDocuments();

    console.log(`\n=== FINAL STATE ===`);
    console.log(`Still missing pages: ${stillNoPages}`);
    console.log(`Still missing language: ${stillNoLang}`);
    console.log(`Still missing both covers: ${stillNoCover}`);

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
