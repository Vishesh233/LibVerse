/**
 * Reset of the live demo (every 6 hours): the demo accounts (isDemo: true) and everything they own go back
 * to the fresh seeded state. Nothing else is touched: books are never deleted or created, and an
 * account without isDemo keeps all of its loans, reservations, reviews, notifications and files.
 *
 * Usage (from backend/; the database is DEMO_MONGODB_URI only, never MONGODB_URI or backend/.env):
 *   DEMO_MONGODB_URI=mongodb+srv://.../libverse_demo node scripts/resetDemo.js            dry run
 *   DEMO_MONGODB_URI=mongodb+srv://.../libverse_demo node scripts/resetDemo.js --apply    reset
 *   ... --apply --bootstrap   also when the database has no demo accounts yet (a catalogue is needed)
 * Scheduled every 6 hours by .github/workflows/demo-reset.yml.
 *
 * What a reset does (with --apply):
 *  1. finds the demo accounts by their isDemo flag
 *  2. deletes only what they own: loans, reservations, reviews, wishlists, notifications (also the
 *     staff ones about their loans), audit entries by or about them, password reset codes, files
 *  3. replaces the accounts with freshly seeded ones (same names, emails and Library IDs, a new
 *     random password nobody knows, so every old demo session ends) and inserts their activity
 *  4. recounts every book's stock from the loans and holds that exist (a book's totalCopies is
 *     only ever raised, when the demo loans need more copies than it has) and the ratings of the
 *     books whose reviews changed
 *
 * SAFETY:
 * - Runs only on a database named libverse_demo (or a *_test database under Jest)
 * - Refuses before changing anything if a non-demo account uses a demo email or Library ID
 * - Every delete is filtered by the demo account ids; a lock stops two resets at once
 * - Prints counts only: no connection string, emails or names
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { buildDemoData, bindModels, rng, SEED } = require('./demo/buildDemoData');

const DEMO_DB = 'libverse_demo';
const OPEN_LOAN = ['issued', 'return_requested', 'payment_pending'];
const LOCK_ID = 'demo-reset';
const LOCK_MS = 10 * 60 * 1000;
const MIN_BOOKS = 20;

const allowedDatabase = (name) => name === DEMO_DB || (process.env.NODE_ENV === 'test' && /_test$/.test(name));
// Error messages may quote a connection string: never print one
const redact = (message) => String(message).replace(/mongodb(\+srv)?:\/\/\S+/gi, 'mongodb://<redacted>');

/**
 * Reset the demo accounts. Returns what was (or, on a dry run, would be) deleted and created.
 * @param {{ uri?: string, apply?: boolean, bootstrap?: boolean, now?: Date }} options
 */
const resetDemo = async ({ uri = process.env.DEMO_MONGODB_URI, apply = false, bootstrap = false, now = new Date() } = {}) => {
  if (!uri || !uri.trim()) throw new Error('Set DEMO_MONGODB_URI to the demo database (its name must be libverse_demo)');
  const conn = await mongoose.createConnection(uri.trim(), { serverSelectionTimeoutMS: 15000 }).asPromise();
  const locks = conn.db.collection('joblocks');
  let locked = false;
  try {
    const database = conn.db.databaseName;
    if (!allowedDatabase(database)) throw new Error(`Refusing: the demo reset only runs on "${DEMO_DB}" (got "${database}")`);
    const M = await bindModels(conn, ['User', 'Book', 'Transaction', 'Reservation', 'Notification', 'Review', 'AuditLog', 'Counter', 'PasswordResetCode']);
    const col = (name) => conn.db.collection(M[name].collection.collectionName);

    if (apply) {
      // Claim the lock: a running reset holds it for up to LOCK_MS (the upsert then hits the same _id)
      try {
        await locks.updateOne(
          { _id: LOCK_ID, $or: [{ lockedUntil: { $exists: false } }, { lockedUntil: { $lt: now } }] },
          { $set: { lockedUntil: new Date(now.getTime() + LOCK_MS) } },
          { upsert: true }
        );
        locked = true;
      } catch (error) {
        if (error.code === 11000) throw new Error('Another demo reset is running. Try again in a few minutes.');
        throw error;
      }
    }

    // ---- The demo accounts and what they own
    const demoIds = (await M.User.find({ isDemo: true }).select('_id').lean()).map((u) => u._id);
    if (!demoIds.length && !bootstrap) {
      throw new Error('No demo accounts in this database. Seed it first (seedDemo.js --live) or pass --bootstrap.');
    }
    const books = await M.Book.find({ isActive: { $ne: false } }).sort({ _id: 1 }).lean();
    if (books.length < MIN_BOOKS) throw new Error(`The catalogue has ${books.length} active books; the demo needs at least ${MIN_BOOKS}`);

    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('base64url'), 10);
    const build = (libraryNumberBase) => buildDemoData({
      books: books.map((b) => ({ ...b })), random: rng(SEED), now, passwordHash, isDemo: true, libraryNumberBase,
    });
    // Demo Library IDs start at LIB-1001, unless a non-demo account already uses one in that range:
    // then they start after the highest short ID in use (the same data otherwise)
    const taken = (await M.User.find({ isDemo: { $ne: true }, libraryId: { $regex: '^LIB-\\d{4,6}$' } }).select('libraryId').lean())
      .map((u) => Number(u.libraryId.slice(4)));
    let data = await build(1000);
    if (data.users.some((u) => taken.includes(Number(u.libraryId.slice(4))))) data = await build(Math.max(...taken));

    const clash = await M.User.countDocuments({
      isDemo: { $ne: true },
      $or: [{ email: { $in: data.users.map((u) => u.email) } }, { libraryId: { $in: data.users.map((u) => u.libraryId) } }],
    });
    if (clash) throw new Error(`Refusing: ${clash} non-demo account(s) use a demo email or Library ID. Nothing was changed.`);

    const byUser = { userId: { $in: demoIds } };
    const oldTxIds = (await M.Transaction.find(byUser).select('_id').lean()).map((t) => t._id);
    const notificationFilter = { $or: [byUser, { 'meta.transactionId': { $in: oldTxIds } }] };
    const auditFilter = { $or: [{ actorId: { $in: demoIds } }, { targetId: { $in: [...demoIds, ...oldTxIds] } }] };
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    const files = await bucket.find({ 'metadata.userId': { $in: demoIds } }).toArray();
    const oldReviewBooks = await M.Review.distinct('bookId', byUser);

    const summary = {
      database,
      mode: apply ? 'apply' : 'dry run (no changes)',
      deleted: {
        accounts: demoIds.length,
        transactions: oldTxIds.length,
        reservations: await M.Reservation.countDocuments(byUser),
        reviews: await M.Review.countDocuments(byUser),
        notifications: await M.Notification.countDocuments(notificationFilter),
        auditEntries: await M.AuditLog.countDocuments(auditFilter),
        resetCodes: await M.PasswordResetCode.countDocuments(byUser),
        files: files.length,
      },
      created: {
        accounts: data.users.length,
        transactions: data.tx.length,
        reservations: data.reservations.length,
        reviews: data.reviews.length,
        notifications: data.notes.length,
        auditEntries: data.audits.length,
      },
    };
    if (!apply) return summary;

    // ---- Delete (each filter limited to the demo accounts and their loans)
    await M.Transaction.deleteMany(byUser);
    await M.Reservation.deleteMany(byUser);
    await M.Review.deleteMany(byUser);
    await M.Notification.deleteMany(notificationFilter);
    await M.AuditLog.deleteMany(auditFilter);
    await M.PasswordResetCode.deleteMany(byUser);
    for (const f of files) await bucket.delete(f._id).catch(() => {});
    await M.User.deleteMany({ _id: { $in: demoIds }, isDemo: true });

    // ---- Insert the fresh demo data
    await col('User').insertMany(data.users);
    if (data.tx.length) await col('Transaction').insertMany(data.tx);
    if (data.reservations.length) await col('Reservation').insertMany(data.reservations);
    if (data.reviews.length) await col('Review').insertMany(data.reviews);
    if (data.notes.length) await col('Notification').insertMany(data.notes);
    if (data.audits.length) await col('AuditLog').insertMany(data.audits);
    // New real accounts must never get a demo Library ID
    await col('Counter').updateOne({ _id: 'libraryId' }, { $max: { seq: data.seq } }, { upsert: true });

    // ---- Stock from the loans and holds that exist now (every account), ratings from the reviews
    const countBy = async (Model, match) => new Map((await Model.aggregate([{ $match: match }, { $group: { _id: '$bookId', n: { $sum: 1 } } }]))
      .map((r) => [String(r._id), r.n]));
    const [issuedBy, heldBy] = [await countBy(M.Transaction, { status: { $in: OPEN_LOAN } }), await countBy(M.Reservation, { status: 'ready' })];
    let booksRecounted = 0;
    for (const b of await M.Book.find({}).select('totalCopies availableCopies issuedCopies heldCopies').lean()) {
      const issued = issuedBy.get(String(b._id)) || 0;
      const held = heldBy.get(String(b._id)) || 0;
      const total = Math.max(b.totalCopies || 0, issued + held);
      const next = { totalCopies: total, issuedCopies: issued, heldCopies: held, availableCopies: total - issued - held };
      if (Object.entries(next).some(([k, v]) => b[k] !== v)) {
        await M.Book.updateOne({ _id: b._id }, { $set: next });
        booksRecounted += 1;
      }
    }
    const ratingBooks = [...new Set([...oldReviewBooks, ...data.reviews.map((r) => r.bookId)].map(String))].map((id) => new mongoose.Types.ObjectId(id));
    const averages = new Map((await M.Review.aggregate([{ $match: { bookId: { $in: ratingBooks } } }, { $group: { _id: '$bookId', avg: { $avg: '$rating' } } }]))
      .map((r) => [String(r._id), Math.round(r.avg * 10) / 10]));
    for (const id of ratingBooks) await M.Book.updateOne({ _id: id }, { $set: { rating: averages.get(String(id)) || 0 } });

    return { ...summary, booksRecounted, ratingsUpdated: ratingBooks.length };
  } finally {
    if (locked) await locks.updateOne({ _id: LOCK_ID }, { $set: { lockedUntil: new Date(0), lastRunAt: new Date() } }).catch(() => {});
    await conn.close();
  }
};

if (require.main === module) {
  resetDemo({ apply: process.argv.includes('--apply'), bootstrap: process.argv.includes('--bootstrap') })
    .then((s) => {
      console.log(JSON.stringify(s, null, 2));
      if (s.mode !== 'apply') console.log('Dry run only. Run again with --apply to reset the demo accounts.');
    })
    .catch((error) => {
      console.error('Demo reset failed:', redact(error.message));
      process.exitCode = 1;
    });
}

module.exports = { resetDemo, DEMO_DB };
