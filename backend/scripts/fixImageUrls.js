const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';

// Clean ISBN to digits + optional X (used for a stable, per-book OpenLibrary URL).
const cleanIsbn = (isbn) => (isbn ? String(isbn).replace(/[^\dXx]/g, '').toUpperCase() : '');

// OpenLibrary canonical cover URL for a given ISBN.
const olUrl = (isbn) => (cleanIsbn(isbn) ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn(isbn)}-L.jpg` : '');

// Uploaded/local covers = data URIs, server upload paths, or localhost URLs.
const isLocal = (u) => u && typeof u === 'string' && (u.startsWith('data:') || u.includes('/uploads/') || /localhost/.test(u));

// A usable remote URL (http/https, not an upload).
const isRemote = (u) => u && typeof u === 'string' && /^https?:\/\//i.test(u) && !u.includes('/uploads/') && !/localhost/.test(u);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const Book = mongoose.connection.collection('books');
    const books = await Book.find({}).toArray();
    console.log('Total books to process:', books.length);

    let fixed = 0;
    let replacedLocal = 0;

    for (const book of books) {
      const canonical = olUrl(book.isbn);
      let img = book.imageUrl || '';
      let cov = book.coverImage || '';

      // Normalize OpenLibrary URLs (including corrupt -L-L / wrong-format / /isbn/ form)
      // to the canonical format. Preserve valid non-OpenLibrary manual URLs.
      if (typeof img === 'string' && (img.includes('openlibrary.org') || !isRemote(img))) {
        img = canonical;
      }
      if (typeof cov === 'string' && (cov.includes('openlibrary.org') || !isRemote(cov))) {
        cov = canonical;
      }
      if (!isRemote(img)) img = canonical;
      if (!isRemote(cov)) cov = img;

      const hadLocal = isLocal(book.coverImage) || isLocal(book.imageUrl);
      if (img !== (book.imageUrl || '') || cov !== (book.coverImage || '')) {
        await Book.updateOne({ _id: book._id }, { $set: { imageUrl: img, coverImage: cov } });
        fixed++;
        if (hadLocal) replacedLocal++;
      }
    }

    console.log('Updated docs:', fixed);
    console.log('Replaced local/uploaded covers:', replacedLocal);

    // === FINAL VERIFICATION ===
    const corrupt = await Book.countDocuments({
      $or: [
        { imageUrl: /-L-L\.jpg/i },
        { coverImage: /-L-L\.jpg/i },
        { imageUrl: /openlibrary\.org\/isbn\//i },
        { coverImage: /openlibrary\.org\/isbn\//i },
      ],
    });
    const missing = await Book.countDocuments({ $or: [{ imageUrl: { $in: [null, ''] } }, { imageUrl: { $exists: false } }] });
    const local = await Book.countDocuments({
      $or: [
        { coverImage: /^data:/ },
        { coverImage: /\/uploads\// },
        { coverImage: /localhost/ },
        { imageUrl: /^data:/ },
        { imageUrl: /\/uploads\// },
        { imageUrl: /localhost/ },
      ],
    });
    console.log('\n=== VERIFICATION ===');
    console.log('Corrupt / wrong-format OL URLs:', corrupt);
    console.log('Still missing imageUrl:', missing);
    console.log('Still local/uploaded covers:', local);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();