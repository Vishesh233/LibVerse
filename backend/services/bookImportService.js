/**
 * Bulk book import from CSV (staff): parse, validate every row, find duplicates (by ISBN, or by
 * title + author) against the catalogue and earlier rows of the same file, then create the valid
 * rows. The preview and the import run the same checks, so the server never trusts the preview.
 *
 * Columns: title, author, genre, isbn, year, publisher, pages, copies, description, location
 * (title, author and genre are required; copies defaults to 1).
 */
const Book = require('../models/Book');
const { parseCsv, CsvError } = require('../utils/csvParse');

const GENRES = Book.schema.path('genre').enumValues;
const COLUMNS = ['title', 'author', 'genre', 'isbn', 'year', 'publisher', 'pages', 'copies', 'description', 'location'];
const REQUIRED = ['title', 'author', 'genre'];
// Other header spellings people use (after lower-casing and removing spaces, _ and -)
const ALIASES = {
  name: 'title', booktitle: 'title', authors: 'author', category: 'genre', isbn13: 'isbn',
  publicationyear: 'year', publishedyear: 'year', published: 'year', pagecount: 'pages',
  totalcopies: 'copies', quantity: 'copies', shelf: 'location', shelflocation: 'location',
};
const MAX_ROWS = 1000;
const MAX_CSV_CHARS = 2 * 1024 * 1024;
const LIMITS = { title: 200, author: 120, publisher: 120, description: 4000, location: 40 };
const MAX_COPIES = 500;

class ImportError extends Error {
  constructor(message) { super(message); this.status = 400; }
}

// "ai and machine-learning" -> "aiandmachinelearning" (also used for "&")
const genreKey = (g) => String(g).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
const GENRE_BY_KEY = new Map(GENRES.map((g) => [genreKey(g), g]));

/** Same book regardless of case, spacing and punctuation: "The  Hobbit," = "the hobbit" */
const titleAuthorKey = (title, author) => {
  const norm = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return `${norm(title)}|${norm(author)}`;
};

/** ISBN with spaces and hyphens removed (the form stored for imported books) */
const normaliseIsbn = (value) => String(value || '').replace(/[\s-]/g, '').toUpperCase();

/** A 13-digit ISBN whose check digit is right */
const isIsbn13 = (isbn) => {
  if (!/^97[89]\d{10}$/.test(isbn)) return false;
  const sum = [...isbn.slice(0, 12)].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(isbn[12]);
};

// Exports from spreadsheets (and our own CSV export) put ' before text that starts like a formula
const unescapeCell = (v) => (/^'[=+\-@]/.test(v) ? v.slice(1) : v);

const wholeNumber = (raw, label, min, max, errors) => {
  if (raw === '') return undefined;
  if (!/^\d+$/.test(raw)) { errors.push(`${label} must be a whole number`); return undefined; }
  const n = Number(raw);
  if (n < min || n > max) { errors.push(`${label} must be between ${min} and ${max}`); return undefined; }
  return n;
};

/** Validate one row's values; returns the book fields and the problems found */
const validateRow = (values) => {
  const v = {};
  // Line breaks and runs of spaces become single spaces (descriptions included)
  COLUMNS.forEach((c) => { v[c] = unescapeCell(values[c] ?? '').replace(/\s+/g, ' ').trim(); });
  const errors = [];

  REQUIRED.forEach((c) => { if (!v[c]) errors.push(`${c[0].toUpperCase()}${c.slice(1)} is required`); });
  Object.entries(LIMITS).forEach(([c, max]) => {
    if (v[c].length > max) errors.push(`${c[0].toUpperCase()}${c.slice(1)} is longer than ${max} characters`);
  });

  let genre;
  if (v.genre) {
    genre = GENRE_BY_KEY.get(genreKey(v.genre));
    if (!genre) errors.push(`Unknown genre "${v.genre.slice(0, 40)}"`);
  }

  let isbn;
  if (v.isbn) {
    isbn = normaliseIsbn(v.isbn);
    if (!isIsbn13(isbn)) {
      errors.push(/^\d{9}[\dX]$/.test(isbn) ? 'ISBN-10 given: use the 13-digit ISBN (starts with 978 or 979)' : 'ISBN must be a valid 13-digit ISBN');
      isbn = undefined;
    }
  }

  const thisYear = new Date().getFullYear();
  const year = wholeNumber(v.year, 'Year', 1000, thisYear + 1, errors);
  const pages = wholeNumber(v.pages, 'Pages', 1, 20000, errors);
  const copies = v.copies === '' ? 1 : wholeNumber(v.copies, 'Copies', 1, MAX_COPIES, errors);

  const book = {
    title: v.title,
    author: v.author,
    genre: genre || v.genre,
    isbn,
    publicationYear: year,
    publisher: v.publisher || undefined,
    pages,
    totalCopies: copies ?? 1,
    description: v.description || undefined,
    location: v.location || undefined,
  };
  return { book, errors };
};

/**
 * Parse and check a CSV against the catalogue. Nothing is written.
 * @param {string} csv
 * @returns {Promise<{ columns, summary, rows }>}
 * @throws {ImportError} unreadable file, missing columns, too many rows
 */
const analyse = async (csv) => {
  if (typeof csv !== 'string' || !csv.trim()) throw new ImportError('The file is empty.');
  if (csv.length > MAX_CSV_CHARS) throw new ImportError('The file is larger than 2 MB. Split it into smaller files.');

  let parsed;
  try {
    parsed = parseCsv(csv);
  } catch (e) {
    if (e instanceof CsvError) throw new ImportError(`The file could not be read as CSV. ${e.message}.`);
    throw e;
  }
  const headers = parsed.headers.map((h) => ALIASES[h] || h);
  const missing = REQUIRED.filter((c) => !headers.includes(c));
  if (missing.length) throw new ImportError(`Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Download the template for the expected header row.`);
  if (!parsed.rows.length) throw new ImportError('The file has a header row but no books.');
  if (parsed.rows.length > MAX_ROWS) throw new ImportError(`The file has ${parsed.rows.length} books; import at most ${MAX_ROWS} at a time.`);

  // Every existing book (including removed ones: an ISBN stays taken)
  const existing = await Book.find({}, 'title author isbn isActive').lean();
  const byIsbn = new Map();
  const byTitleAuthor = new Map();
  existing.forEach((b) => {
    if (b.isbn) byIsbn.set(normaliseIsbn(b.isbn), b);
    byTitleAuthor.set(titleAuthorKey(b.title, b.author), b);
  });
  const seenIsbn = new Map();
  const seenTitleAuthor = new Map();

  const rows = parsed.rows.map(({ line, values, extraFields }) => {
    const mapped = {};
    Object.entries(values).forEach(([h, val]) => { const key = ALIASES[h] || h; if (mapped[key] === undefined) mapped[key] = val; });
    const { book, errors } = validateRow(mapped);
    if (extraFields) errors.push(`${extraFields} more value${extraFields > 1 ? 's' : ''} than there are columns (a comma that should be inside quotes?)`);

    const duplicates = [];
    if (!errors.length) {
      const removed = (b) => (b.isActive === false ? ' (removed from the catalogue)' : '');
      if (book.isbn) {
        const inDb = byIsbn.get(book.isbn);
        if (inDb) duplicates.push(`Same ISBN as "${inDb.title}"${removed(inDb)}`);
        else if (seenIsbn.has(book.isbn)) duplicates.push(`Same ISBN as line ${seenIsbn.get(book.isbn)} of this file`);
      }
      const key = titleAuthorKey(book.title, book.author);
      const inDb = byTitleAuthor.get(key);
      if (inDb && !duplicates.length) duplicates.push(`Already in the catalogue: "${inDb.title}" by ${inDb.author}${removed(inDb)}`);
      else if (!inDb && seenTitleAuthor.has(key)) duplicates.push(`Same title and author as line ${seenTitleAuthor.get(key)} of this file`);
      // Only rows that would be imported claim their ISBN / title for later rows
      if (!duplicates.length) {
        if (book.isbn) seenIsbn.set(book.isbn, line);
        seenTitleAuthor.set(key, line);
      }
    }

    const status = errors.length ? 'error' : duplicates.length ? 'duplicate' : 'ready';
    return { line, status, errors: errors.length ? errors : duplicates, book };
  });

  const count = (s) => rows.filter((r) => r.status === s).length;
  return {
    columns: {
      found: COLUMNS.filter((c) => headers.includes(c)),
      missingOptional: COLUMNS.filter((c) => !headers.includes(c)),
      ignored: parsed.headers.filter((h, i) => h && !COLUMNS.includes(headers[i])),
    },
    summary: { total: rows.length, ready: count('ready'), errors: count('error'), duplicates: count('duplicate') },
    rows,
  };
};

// ---- Optional cover check (Open Library), never blocks the import for long
const COVER_TIMEOUT_MS = 4000;
const COVER_DEADLINE_MS = 30000;
const COVER_CONCURRENCY = 6;
const coverUrl = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

/** true when Open Library has a cover for the ISBN (?default=false makes a missing one a 404) */
const hasCover = async (isbn) => {
  try {
    const res = await fetch(`${coverUrl(isbn)}?default=false`, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(COVER_TIMEOUT_MS) });
    return res.ok;
  } catch {
    return false;
  }
};

/** Checks covers for books with an ISBN; sets imageUrl where one exists. Returns { checked, found } */
const findCovers = async (books) => {
  const queue = books.filter((b) => b.isbn);
  const deadline = Date.now() + COVER_DEADLINE_MS;
  let checked = 0; let found = 0;
  const worker = async () => {
    while (queue.length && Date.now() < deadline) {
      const book = queue.shift();
      checked += 1;
      if (await hasCover(book.isbn)) { book.imageUrl = coverUrl(book.isbn); found += 1; }
    }
  };
  await Promise.all(Array.from({ length: COVER_CONCURRENCY }, worker));
  return { checked, found };
};

/**
 * Create the ready rows. Rows are re-checked here (the catalogue may have changed since the preview).
 * @returns {Promise<{ imported, skipped, covers, rows }>}
 */
const importBooks = async (csv, { checkCovers = false } = {}) => {
  const { rows } = await analyse(csv);
  const ready = rows.filter((r) => r.status === 'ready');
  const covers = checkCovers ? await findCovers(ready.map((r) => r.book)) : null;

  for (const row of ready) {
    const b = row.book;
    try {
      const created = await Book.create({
        ...b,
        publishedYear: b.publicationYear,
        availableCopies: b.totalCopies,
        issuedCopies: 0,
        heldCopies: 0,
        language: 'English',
      });
      row.status = 'imported';
      row.bookId = created._id;
    } catch (e) {
      row.status = e.code === 11000 ? 'duplicate' : 'error';
      row.errors = [e.code === 11000 ? 'Same ISBN as a book added a moment ago' : 'Could not be saved'];
    }
  }

  const imported = rows.filter((r) => r.status === 'imported');
  return {
    imported: imported.length,
    copies: imported.reduce((s, r) => s + r.book.totalCopies, 0),
    skipped: rows.length - imported.length,
    covers,
    rows: rows.map(({ line, status, errors, book, bookId }) => ({ line, status, errors, title: book.title, author: book.author, bookId })),
  };
};

module.exports = {
  analyse, importBooks, ImportError, COLUMNS, GENRES, MAX_ROWS, isIsbn13, normaliseIsbn, titleAuthorKey, _internal: { hasCover },
};
