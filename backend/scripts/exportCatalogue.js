/**
 * Export the catalogue (every active book) to JSON, to seed another database (e.g. MongoDB Atlas)
 * with scripts/importCatalogue.js. Only book data is exported: no users, loans or other records.
 * Stock is exported as the number of copies; the new database starts with every copy on the shelf.
 *
 * Usage (from backend/, reads MONGODB_URI from backend/.env):
 *   node scripts/exportCatalogue.js [--out scripts/data/catalogue-export.json]
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_OUT = path.join(__dirname, 'data', 'catalogue-export.json');
const FIELDS = ['title', 'author', 'genre', 'isbn', 'publisher', 'publicationYear', 'pages', 'language', 'rating', 'description', 'totalCopies', 'location', 'imageUrl', 'coverImage'];
// Uploaded covers (/api/files/<id>) live in this database's GridFS, not in the new one
const isRemote = (url) => typeof url === 'string' && /^https?:\/\//i.test(url);

/**
 * The export rows for the active books (sorted by title), and how many uploaded covers were left out
 * @param {import('mongodb').Db} db
 */
const exportBooks = async (db) => {
  const docs = await db.collection('books').find({ isActive: { $ne: false } }).sort({ title: 1, _id: 1 }).toArray();
  let localCoversDropped = 0;
  const books = docs.map((d) => {
    const row = {};
    FIELDS.forEach((f) => { if (d[f] !== undefined && d[f] !== null && d[f] !== '') row[f] = d[f]; });
    if (row.publicationYear === undefined && d.publishedYear) row.publicationYear = d.publishedYear;
    ['imageUrl', 'coverImage'].forEach((f) => {
      if (row[f] !== undefined && !isRemote(row[f])) { delete row[f]; localCoversDropped += 1; }
    });
    row.totalCopies = Math.max(1, Number(row.totalCopies) || 1);
    return row;
  });
  return { books, localCoversDropped };
};

const main = async () => {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');
  const at = process.argv.indexOf('--out');
  const out = at > -1 ? path.resolve(process.argv[at + 1]) : DEFAULT_OUT;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI is not set (backend/.env)');
  await mongoose.connect(uri);
  const { books, localCoversDropped } = await exportBooks(mongoose.connection.db);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify({ exportedAt: new Date().toISOString(), count: books.length, books }, null, 2)}\n`);
  console.log(`Exported ${books.length} books from "${mongoose.connection.db.databaseName}" to ${path.relative(process.cwd(), out)}`);
  if (localCoversDropped) console.log(`${localCoversDropped} uploaded cover link(s) left out (those books fall back to their Open Library cover)`);
  await mongoose.disconnect();
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { exportBooks, DEFAULT_OUT };
