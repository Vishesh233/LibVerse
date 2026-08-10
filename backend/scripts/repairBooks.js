const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Book = require('../models/Book');
const { BOOK_METADATA } = require('./bookMetadata');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';

// Correct OpenLibrary cover URL format
const correctCoverUrl = (isbn) => {
  if (!isbn) return null;
  const cleanIsbn = String(isbn).replace(/[^\dXx]/g, '').toUpperCase();
  if (!cleanIsbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
};

// Fix a wrong-format OpenLibrary URL to the correct format
const fixOpenLibraryUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  // Match covers.openlibrary.org/isbn/XXX-L.jpg (wrong format)
  const match = url.match(/covers\.openlibrary\.org\/isbn\/([^/]+)\.jpg/i);
  if (match) {
    return `https://covers.openlibrary.org/b/isbn/${match[1]}-L.jpg`;
  }
  return url;
};

const isUploadedCover = (url) => {
  return url && (url.startsWith('data:image/') || url.includes('/uploads/'));
};

const repairBooks = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for repair...');

    const books = await Book.find({});
    console.log(`Total books to process: ${books.length}`);

    let fixedImageFormat = 0;
    let addedImage = 0;
    let enrichedMetadata = 0;
    let preservedUploads = 0;

    for (const book of books) {
      const updates = {};
      let changed = false;

      // 1. Fix wrong-format OpenLibrary URLs (only if NOT an uploaded cover)
      if (book.coverImage && !isUploadedCover(book.coverImage)) {
        const fixed = fixOpenLibraryUrl(book.coverImage);
        if (fixed !== book.coverImage) {
          updates.coverImage = fixed;
          changed = true;
          fixedImageFormat++;
        }
      }
      if (book.imageUrl && !isUploadedCover(book.imageUrl)) {
        const fixed = fixOpenLibraryUrl(book.imageUrl);
        if (fixed !== book.imageUrl) {
          updates.imageUrl = fixed;
          changed = true;
          fixedImageFormat++;
        }
      }

      // 2. Add image for books with no coverImage and no imageUrl (use OpenLibrary ISBN)
      if (!book.coverImage && !book.imageUrl && book.isbn) {
        const url = correctCoverUrl(book.isbn);
        if (url) {
          updates.coverImage = url;
          updates.imageUrl = url;
          changed = true;
          addedImage++;
        }
      }

      // 3. Enrich metadata from BOOK_METADATA (only fill MISSING fields)
      const meta = BOOK_METADATA[book.title];
      if (meta) {
        if (!book.publisher && meta.publisher) {
          updates.publisher = meta.publisher;
          changed = true;
        }
        if ((!book.rating || book.rating === 0) && meta.rating) {
          updates.rating = meta.rating;
          changed = true;
        }
        if (!book.pages && meta.pages) {
          updates.pages = meta.pages;
          changed = true;
        }
        if (!book.language && meta.language) {
          updates.language = meta.language;
          changed = true;
        }
      }

      // Track preserved uploaded covers
      if (isUploadedCover(book.coverImage)) {
        preservedUploads++;
      }

      if (changed) {
        await Book.findByIdAndUpdate(book._id, updates, { runValidators: true });
        enrichedMetadata++;
      }
    }

    console.log(`\n=== REPAIR SUMMARY ===`);
    console.log(`Fixed wrong-format OpenLibrary URLs: ${fixedImageFormat}`);
    console.log(`Added OpenLibrary ISBN covers for books with no image: ${addedImage}`);
    console.log(`Books enriched with metadata: ${enrichedMetadata}`);
    console.log(`Uploaded covers preserved: ${preservedUploads}`);

    // Final verification
    const after = await Book.find({}).select('title coverImage imageUrl pages language publisher rating').lean();
    const stillWrong = after.filter((b) =>
      (b.coverImage && b.coverImage.includes('covers.openlibrary.org/isbn/')) ||
      (b.imageUrl && b.imageUrl.includes('covers.openlibrary.org/isbn/'))
    );
    const stillNoPages = after.filter((b) => !b.pages);
    const stillNoLang = after.filter((b) => !b.language);
    const stillNoPub = after.filter((b) => !b.publisher);
    const stillZeroRating = after.filter((b) => !b.rating || b.rating === 0);
    const stillNoImage = after.filter((b) => !b.coverImage && !b.imageUrl);

    console.log(`\n=== POST-REPAIR VERIFICATION ===`);
    console.log(`Still wrong-format URLs: ${stillWrong.length}`);
    console.log(`Still missing pages: ${stillNoPages.length}`);
    console.log(`Still missing language: ${stillNoLang.length}`);
    console.log(`Still missing publisher: ${stillNoPub.length}`);
    console.log(`Still rating 0/missing: ${stillZeroRating.length}`);
    console.log(`Still no image: ${stillNoImage.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error during repair:', error);
    process.exit(1);
  }
};

repairBooks();