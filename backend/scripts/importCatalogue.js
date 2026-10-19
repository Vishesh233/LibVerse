/**
 * Import a catalogue exported by scripts/exportCatalogue.js into an EMPTY database (e.g. a new
 * MongoDB Atlas cluster). Refuses to run when the database already has books.
 *
 * Usage (from backend/):
 *   MONGODB_URI="<atlas connection string>" node scripts/importCatalogue.js            dry run
 *   MONGODB_URI="<atlas connection string>" node scripts/importCatalogue.js --apply    write
 *   add --file <path> to use another export file (default scripts/data/catalogue-export.json)
 *
 * MONGODB_URI from the shell wins over backend/.env, so the local database is not touched by mistake.
 */
const fs = require('fs');
const path = require('path');
const { DEFAULT_OUT } = require('./exportCatalogue');

/**
 * Validate and insert the exported books with fresh stock (every copy on the shelf).
 * @param {typeof import('mongoose')} mongoose - connected
 * @param {object[]} rows
 * @param {{ apply?: boolean }} options
 * @returns {Promise<{ books: number, copies: number, inserted: number, invalid: string[] }>}
 */
const importBooks = async (mongoose, rows, { apply = false } = {}) => {
  const Book = require('../models/Book');
  await Book.init(); // indexes (unique ISBN) before inserting
  if (await Book.estimatedDocumentCount()) {
    throw new Error('This database already has books. The import only fills an empty database.');
  }
  const docs = [];
  const invalid = [];
  rows.forEach((row, i) => {
    const total = Math.max(1, Number(row.totalCopies) || 1);
    const doc = new Book({ ...row, totalCopies: total, availableCopies: total, issuedCopies: 0, heldCopies: 0, isActive: true });
    const error = doc.validateSync();
    if (error) invalid.push(`#${i + 1} "${row.title || '?'}": ${Object.values(error.errors).map((e) => e.message).join(', ')}`);
    else docs.push(doc);
  });
  const report = { books: rows.length, copies: docs.reduce((s, d) => s + d.totalCopies, 0), inserted: 0, invalid };
  if (apply && !invalid.length) {
    const inserted = await Book.insertMany(docs, { ordered: true });
    report.inserted = inserted.length;
  }
  return report;
};

const main = async () => {
  // A MONGODB_URI given in the shell takes precedence (dotenv never overrides it)
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');
  const apply = process.argv.includes('--apply');
  const at = process.argv.indexOf('--file');
  const file = at > -1 ? path.resolve(process.argv[at + 1]) : DEFAULT_OUT;
  if (!fs.existsSync(file)) throw new Error(`No export file at ${file}. Run scripts/exportCatalogue.js first.`);
  const { books } = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(books)) throw new Error('The export file has no "books" list');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.db.databaseName} | ${apply ? 'IMPORTING' : 'dry run (add --apply to write)'}`);
  try {
    const report = await importBooks(mongoose, books, { apply });
    console.log(`${report.books} books (${report.copies} copies) in the file; ${report.invalid.length} invalid; ${report.inserted} inserted`);
    report.invalid.slice(0, 20).forEach((line) => console.log(`  ${line}`));
    if (report.invalid.length) console.log('Nothing was written: fix the invalid rows first.');
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { importBooks };
