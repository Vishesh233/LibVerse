/**
 * Move images that older versions saved in backend/uploads into MongoDB GridFS and point the
 * documents at them: users.profileImage, books.coverImage and books.imageUrl values ending in
 * "/uploads/<file>" become "/api/files/<id>". Remote URLs (Open Library etc.) are not touched.
 *
 * Only files that some document uses are copied; unused files are listed. Files stay on disk.
 *
 * Usage (from backend/, uses MONGODB_URI from backend/.env):
 *   node scripts/migrateUploadsToGridFS.js            dry run
 *   node scripts/migrateUploadsToGridFS.js --apply    copy and update (back the database up first)
 *
 * Safe to run again: a file already copied (same original name) is reused, not copied twice.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { saveFile, fileUrl, BUCKET } = require('../services/fileStore');

const UPLOADS = path.join(__dirname, '..', 'uploads');
const FIELDS = [['users', 'profileImage'], ['books', 'coverImage'], ['books', 'imageUrl']];
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @param {import('mongodb').Db} db
 * @param {string} dir - the uploads folder
 * @param {{ apply?: boolean }} options
 */
const migrate = async (db, dir, { apply = false } = {}) => {
  const report = { files: 0, used: 0, copied: 0, reused: 0, documentsUpdated: 0, unused: [] };
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => TYPES[path.extname(f).toLowerCase()]) : [];
  report.files = names.length;
  const gridFiles = db.collection(`${BUCKET}.files`);

  for (const name of names) {
    const pattern = new RegExp(`/uploads/${escape(name)}$`);
    const refs = [];
    for (const [collection, field] of FIELDS) {
      const docs = await db.collection(collection).find({ [field]: pattern }, { projection: { _id: 1 } }).toArray();
      docs.forEach((d) => refs.push({ collection, field, _id: d._id }));
    }
    if (!refs.length) { report.unused.push(name); continue; }
    report.used += 1;

    const existing = await gridFiles.findOne({ 'metadata.legacyName': name });
    let id = existing?._id;
    if (existing) report.reused += 1;
    else if (apply) {
      id = await saveFile(fs.readFileSync(path.join(dir, name)), {
        filename: name,
        contentType: TYPES[path.extname(name).toLowerCase()],
        metadata: { kind: name.startsWith('avatar-') ? 'avatar' : 'cover', legacyName: name },
      });
      report.copied += 1;
    } else report.copied += 1; // would copy

    for (const ref of refs) {
      report.documentsUpdated += 1;
      if (apply) await db.collection(ref.collection).updateOne({ _id: ref._id }, { $set: { [ref.field]: fileUrl(id) } });
    }
  }
  return report;
};

const main = async () => {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const apply = process.argv.includes('--apply');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI is not set (backend/.env)');
  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.db.databaseName} | ${apply ? 'APPLYING CHANGES' : 'dry run (add --apply to write)'}`);
  const { unused, ...counts } = await migrate(mongoose.connection.db, UPLOADS, { apply });
  console.table(counts);
  if (unused.length) console.log(`Not used by any document (left on disk, not copied): ${unused.length}`);
  await mongoose.disconnect();
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { migrate };
