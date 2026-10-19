/**
 * Data clean-up for the original catalogue (the books that predate scripts/expandCatalogue.js):
 * original descriptions, ISBNs as digits only, and one year field (publicationYear; the old
 * publishedYear is merged into it and removed).
 *
 * Input: scripts/data/description-rewrite.json
 *   [{ _id, title, author, isbn, publicationYear, description }]
 *
 * Usage (from backend/, uses MONGODB_URI from backend/.env):
 *   node scripts/applyDescriptionRewrite.js            dry run: counts what would change
 *   node scripts/applyDescriptionRewrite.js --apply    writes the changes (back the database up first)
 *   add --samples 10 to print that many random entries
 *
 * Safe to run again: books already up to date are not touched. A book whose title no longer
 * matches the file is skipped; an ISBN that another book already has (a duplicate record of the
 * same book) is left as it is while the rest still applies. Both are reported.
 */
const path = require('path');
const { normaliseIsbn } = require('../utils/isbn');

const DATA_FILE = path.join(__dirname, 'data', 'description-rewrite.json');

/** What has to change for one book (null when nothing does) */
const planFor = (entry, doc) => {
  const set = {};
  const unset = {};
  if (entry.description && doc.description !== entry.description) set.description = entry.description;
  const isbn = normaliseIsbn(entry.isbn || doc.isbn);
  if (isbn && doc.isbn !== isbn) set.isbn = isbn;
  const year = entry.publicationYear ?? doc.publicationYear ?? doc.publishedYear;
  if (year != null && doc.publicationYear !== year) set.publicationYear = year;
  if (doc.publishedYear !== undefined) unset.publishedYear = '';
  if (!Object.keys(set).length && !Object.keys(unset).length) return null;
  return { set, unset };
};

/**
 * Check every entry against the books collection and (with apply) write the changes.
 * @param {import('mongodb').Collection} books - the raw books collection
 * @param {object[]} entries
 * @param {{ apply?: boolean }} options
 */
const run = async (books, entries, { apply = false } = {}) => {
  const report = { entries: entries.length, matched: 0, upToDate: 0, changed: 0, description: 0, isbn: 0, publicationYear: 0, publishedYearRemoved: 0, skipped: [], isbnKept: [] };
  const { ObjectId } = require('mongoose').Types;

  for (const entry of entries) {
    if (!ObjectId.isValid(entry._id)) { report.skipped.push(`${entry._id}: not a valid id`); continue; }
    const doc = await books.findOne({ _id: new ObjectId(entry._id) });
    if (!doc) { report.skipped.push(`${entry._id}: no such book`); continue; }
    if (doc.title !== entry.title) { report.skipped.push(`${entry._id}: title is now "${doc.title}", file says "${entry.title}"`); continue; }
    report.matched += 1;

    const plan = planFor(entry, doc);
    if (!plan) { report.upToDate += 1; continue; }
    if (plan.set.isbn) {
      const clash = await books.findOne({ _id: { $ne: doc._id }, isbn: plan.set.isbn }, { projection: { title: 1 } });
      // A duplicate record of the same book: keep this ISBN as it is (the rest still applies)
      if (clash) {
        report.isbnKept.push(`${entry._id} "${doc.title}": ISBN ${plan.set.isbn} already belongs to "${clash.title}" (${clash._id})`);
        delete plan.set.isbn;
        if (!Object.keys(plan.set).length && !Object.keys(plan.unset).length) { report.upToDate += 1; continue; }
      }
    }

    report.changed += 1;
    if (plan.set.description) report.description += 1;
    if (plan.set.isbn) report.isbn += 1;
    if (plan.set.publicationYear !== undefined) report.publicationYear += 1;
    if (plan.unset.publishedYear !== undefined) report.publishedYearRemoved += 1;
    if (apply) {
      const update = {};
      if (Object.keys(plan.set).length) update.$set = plan.set;
      if (Object.keys(plan.unset).length) update.$unset = plan.unset;
      await books.updateOne({ _id: doc._id }, update);
    }
  }
  return report;
};

const main = async () => {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');
  const apply = process.argv.includes('--apply');
  const samplesAt = process.argv.indexOf('--samples');
  const samples = samplesAt > -1 ? Number(process.argv[samplesAt + 1]) || 10 : 0;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI is not set (backend/.env)');

  const entries = require(DATA_FILE);
  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.db.databaseName} | ${apply ? 'APPLYING CHANGES' : 'dry run (add --apply to write)'}`);
  const report = await run(mongoose.connection.db.collection('books'), entries, { apply });
  const { skipped, isbnKept, ...counts } = report;
  console.table(counts);
  if (skipped.length) console.log(`Skipped ${skipped.length}:\n  ${skipped.join('\n  ')}`);
  if (isbnKept.length) console.log(`ISBN left as it is (duplicate record of another book) ${isbnKept.length}:\n  ${isbnKept.join('\n  ')}`);

  if (samples) {
    const pool = [...entries];
    for (let i = 0; i < Math.min(samples, pool.length); i++) {
      const [e] = pool.splice(Math.floor(Math.random() * pool.length), 1);
      console.log(`\n${e.title} (${e.author}) | ISBN ${e.isbn} | ${e.publicationYear ?? '-'}\n  ${e.description}`);
    }
  }
  await mongoose.disconnect();
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { planFor, run };
