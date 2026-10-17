/**
 * Expand the book catalogue from verified data (idempotent, additive only).
 *
 *   node scripts/expandCatalogue.js            dry run: prints what would be inserted/updated per genre
 *   node scripts/expandCatalogue.js --apply    inserts new books and fills empty descriptions
 *   --db=<name>                                use another database on the same server (e.g. a test copy)
 *
 * Data:
 *   scripts/data/catalogue-expansion.json   new books (verified against Open Library)
 *   scripts/data/description-backfill.json  [{ _id, description }] for existing books with no description
 *
 * SAFETY:
 * - Never deletes anything and never overwrites a non-empty field
 * - Skips a new book when its normalised ISBN or normalised title + author already exists
 * - Descriptions are only written where the current description is missing or blank
 * - Running --apply twice inserts nothing the second time
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Book = require('../models/Book');

const APPLY = process.argv.includes('--apply');
const DB_OVERRIDE = (process.argv.find((a) => a.startsWith('--db=')) || '').slice(5);
const DATA_DIR = path.join(__dirname, 'data');
const GENRES = Book.schema.path('genre').enumValues;
const SCHEMA_FIELDS = new Set(Object.keys(Book.schema.paths).filter((p) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(p)));

const stripAccents = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const normText = (s) => stripAccents(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const normTitle = (s) => normText(s).replace(/^(the|a|an) /, '');
const mainTitle = (s) => normTitle(String(s || '').split(/[:(]/)[0]);
const surname = (author) => normText(author).split(' ').filter(Boolean).pop() || '';
const normIsbn = (v) => String(v || '').replace(/[^0-9Xx]/g, '').toUpperCase();
const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// Two keys per book: exact (full title + full author) and loose (main title + author surname)
const titleKeys = (b) => [`${normTitle(b.title)}|${normText(b.author)}`, `${mainTitle(b.title)}|${surname(b.author)}`];

const resolveUri = () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Set MONGODB_URI or MONGO_URI in backend/.env');
  if (!DB_OVERRIDE) return uri;
  if (!/^[A-Za-z0-9_-]+$/.test(DB_OVERRIDE)) throw new Error('Invalid --db name');
  const u = new URL(uri);
  u.pathname = `/${DB_OVERRIDE}`;
  return u.toString();
};

const readJson = (file, fallback) => {
  const full = path.join(DATA_DIR, file);
  return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : fallback;
};

const genreCounts = async () => {
  const rows = await Book.aggregate([{ $match: { isActive: { $ne: false } } }, { $group: { _id: '$genre', n: { $sum: 1 } } }]);
  const counts = Object.fromEntries(GENRES.map((g) => [g, 0]));
  rows.forEach((r) => { counts[r._id] = r.n; });
  return counts;
};

const toBookDoc = (raw) => {
  const doc = {};
  Object.entries(raw).forEach(([k, v]) => {
    if (SCHEMA_FIELDS.has(k) && !isBlank(v)) doc[k] = v;
  });
  doc.isbn = normIsbn(doc.isbn);
  doc.issuedCopies = 0;
  doc.availableCopies = doc.totalCopies;
  doc.isActive = true;
  return doc;
};

(async () => {
  const newBooks = readJson('catalogue-expansion.json', []);
  const backfill = readJson('description-backfill.json', []);

  await mongoose.connect(resolveUri(), { serverSelectionTimeoutMS: 5000 });
  const dbName = mongoose.connection.db.databaseName;
  console.log(`${APPLY ? 'MODE: APPLY' : 'MODE: DRY RUN (no writes)'} | database: ${dbName}`);

  const before = await genreCounts();
  const existing = await Book.find({}).select('title author isbn').lean();
  const isbns = new Set(existing.map((b) => normIsbn(b.isbn)).filter(Boolean));
  const keys = new Set(existing.flatMap(titleKeys));

  // ---- new books ----
  const planned = [];
  const skipped = [];
  for (const raw of newBooks) {
    const doc = toBookDoc(raw);
    let reason = null;
    if (!GENRES.includes(doc.genre)) reason = `invalid genre "${doc.genre}"`;
    else if (doc.isbn && isbns.has(doc.isbn)) reason = 'ISBN already exists';
    else if (titleKeys(doc).some((k) => keys.has(k))) reason = 'title + author already exists';
    else {
      const err = new Book(doc).validateSync();
      if (err) reason = `validation: ${Object.values(err.errors).map((e) => e.message).join('; ')}`;
    }
    if (reason) { skipped.push({ title: doc.title, reason }); continue; }
    // Reserve the keys so duplicates inside the data file are caught too
    if (doc.isbn) isbns.add(doc.isbn);
    titleKeys(doc).forEach((k) => keys.add(k));
    planned.push(doc);
  }

  const plannedByGenre = {};
  planned.forEach((b) => { plannedByGenre[b.genre] = (plannedByGenre[b.genre] || 0) + 1; });
  console.log(`New books: ${planned.length} to insert, ${skipped.length} skipped (of ${newBooks.length} in file)`);
  GENRES.forEach((g) => console.log(`  ${g.padEnd(22)} ${String(before[g]).padStart(3)} + ${String(plannedByGenre[g] || 0).padStart(2)} = ${before[g] + (plannedByGenre[g] || 0)}`));
  const skipReasons = {};
  skipped.forEach((s) => { skipReasons[s.reason] = (skipReasons[s.reason] || 0) + 1; });
  Object.entries(skipReasons).forEach(([r, n]) => console.log(`  skipped (${r}): ${n}`));

  // ---- description backfill ----
  const blankFilter = { $or: [{ description: { $exists: false } }, { description: null }, { description: { $regex: /^\s*$/ } }] };
  let fillable = 0;
  for (const item of backfill) {
    if (!mongoose.isValidObjectId(item._id) || isBlank(item.description)) continue;
    if (await Book.exists({ _id: item._id, ...blankFilter })) fillable++;
  }
  console.log(`Descriptions: ${fillable} of ${backfill.length} backfill entries target a book whose description is empty`);

  if (!APPLY) {
    console.log('Dry run only. Re-run with --apply to write.');
    await mongoose.disconnect();
    return;
  }

  // ---- apply ----
  let inserted = 0;
  const failed = [];
  for (const doc of planned) {
    try {
      await Book.create(doc);
      inserted++;
    } catch (err) {
      failed.push({ title: doc.title, reason: err.code === 11000 ? 'duplicate key' : err.message });
    }
  }

  let filled = 0;
  for (const item of backfill) {
    if (!mongoose.isValidObjectId(item._id) || isBlank(item.description)) continue;
    const res = await Book.updateOne({ _id: item._id, ...blankFilter }, { $set: { description: item.description.trim() } });
    filled += res.modifiedCount;
  }

  const after = await genreCounts();
  console.log(`Inserted ${inserted} books, ${failed.length} failed; filled ${filled} descriptions`);
  failed.forEach((f) => console.log(`  failed: ${f.title} (${f.reason})`));
  console.log('Active books per genre (before -> after):');
  GENRES.forEach((g) => console.log(`  ${g.padEnd(22)} ${String(before[g]).padStart(3)} -> ${after[g]}`));
  const sum = (c) => Object.values(c).reduce((a, b) => a + b, 0);
  console.log(`Total active: ${sum(before)} -> ${sum(after)}`);
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('expandCatalogue failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
