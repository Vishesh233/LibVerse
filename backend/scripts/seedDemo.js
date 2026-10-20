/**
 * Demo database for screenshots, walkthroughs and the live demo: libverse_demo ONLY (never libraryDB).
 *
 * Recreates the database from scratch with the full catalogue (scripts/data/demo-catalogue.json),
 * fictional members (Indian names, @example.com emails) and about four months of activity: loans
 * returned on time and late, fines paid and waived, overdue books, open requests, payments
 * waiting for verification, reservations (waiting and ready), wishlists, reviews, notifications
 * and audit-log entries, so every screen has something to show. The same data every run
 * (seeded random numbers, scripts/demo/buildDemoData.js); dates are relative to today.
 *
 * Usage (from backend/):
 *   node scripts/seedDemo.js                  recreate libverse_demo on mongodb://127.0.0.1:27017
 *   DEMO_MONGODB_URI=mongodb://host:27017/libverse_demo node scripts/seedDemo.js
 *   node scripts/seedDemo.js --live           for the live demo instance (DEMO_MODE=true): accounts
 *                                             marked isDemo, with a random password nobody knows
 *                                             (sign-in only through the demo buttons). Resets every 6 hours:
 *                                             scripts/resetDemo.js
 *   node scripts/seedDemo.js --drop           delete libverse_demo
 *
 * Without --live every demo account uses the password DEMO_PASSWORD (local demo data only).
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { buildDemoData, bindModels, rng, startOfDay, SEED, DEMO_PASSWORD } = require('./demo/buildDemoData');

const DEMO_DB = 'libverse_demo';
const DEFAULT_URI = `mongodb://127.0.0.1:27017/${DEMO_DB}`;
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

/**
 * Drop and recreate the demo database. Returns a summary and the demo accounts.
 * @param {string} uri - must name the database libverse_demo
 * @param {{ live?: boolean }} options - live: isDemo accounts with a random password
 */
const seedDemo = async (uri = process.env.DEMO_MONGODB_URI || DEFAULT_URI, { live = false } = {}) => {
  const conn = await mongoose.createConnection(uri).asPromise();
  try {
    if (conn.db.databaseName !== DEMO_DB) throw new Error(`Refusing: the demo seed only writes to "${DEMO_DB}" (got "${conn.db.databaseName}")`);
    // Collection by collection: an Atlas user with only readWrite on libverse_demo may not drop the database
    for (const c of await conn.db.collections()) await c.drop();

    const models = await bindModels(conn);
    const col = (name) => conn.db.collection(models[name].collection.collectionName);
    const random = rng(SEED);
    const between = (a, b) => a + Math.floor(random() * (b - a + 1));
    const now = new Date();
    const ago = (days, hours = 0) => new Date(now.getTime() - days * DAY - hours * HOUR);

    // ---- Books
    const catalogue = require('./data/demo-catalogue.json');
    const books = catalogue.map((b, i) => {
      const createdAt = i % 40 === 7 ? ago(between(1, 12), between(1, 9)) : ago(between(150, 210));
      return {
        _id: new mongoose.Types.ObjectId(), ...b, totalCopies: Math.max(1, b.totalCopies || 1), availableCopies: 0, issuedCopies: 0, heldCopies: 0,
        rating: b.rating || 0, isActive: true, restockAlertPending: false, createdAt, updatedAt: createdAt,
      };
    });

    // ---- People and activity (the same random sequence as before the builder was split out)
    const password = live ? crypto.randomBytes(24).toString('base64url') : DEMO_PASSWORD;
    const data = await buildDemoData({ books, random, now, passwordHash: await bcrypt.hash(password, 10), isDemo: live });
    const { staff, students, aarav, hot, newMember, tx, reservations, reviews, notes, audits, seq } = data;

    await col('User').insertMany(data.users);
    await col('Book').insertMany(books);
    await col('Transaction').insertMany(tx);
    await col('Reservation').insertMany(reservations);
    await col('Review').insertMany(reviews);
    await col('Notification').insertMany(notes);
    await col('AuditLog').insertMany(audits);
    await col('Counter').insertOne({ _id: 'libraryId', seq });

    const count = (status) => tx.filter((t) => t.status === status).length;
    const reviewsBy = new Map();
    reviews.forEach((r) => reviewsBy.set(String(r.bookId), (reviewsBy.get(String(r.bookId)) || 0) + 1));
    const reviewedBook = [...reviewsBy].sort((a, b) => b[1] - a[1])[0]?.[0] || String(books[0]._id);
    return {
      database: DEMO_DB,
      live,
      books: books.length,
      copies: books.reduce((s, b) => s + b.totalCopies, 0),
      members: students.length,
      staff: Object.keys(staff).length,
      loans: { returned: count('returned'), issued: count('issued'), overdue: tx.filter((t) => t.status === 'issued' && t.dueDate < startOfDay(now)).length, returnRequested: count('return_requested'), paymentPending: count('payment_pending'), pending: count('pending'), rejected: count('rejected') },
      finesPaid: tx.filter((t) => t.finePaid).length,
      finesWaived: tx.filter((t) => t.fineWaived > 0).length,
      reservations: reservations.length,
      reviews: reviews.length,
      notifications: notes.length,
      auditEntries: audits.length,
      accounts: {
        admin: staff.admin.email,
        librarian: staff.lib1.email,
        student: aarav.email,
        newStudent: newMember.email,
        // A live seed's password is random and never shown
        password: live ? null : DEMO_PASSWORD,
      },
      ids: { aarav: String(aarav._id), reviewedBook, hotBook: hot[0] ? String(hot[0]._id) : null, payableFine: String(tx.find((t) => String(t.userId) === String(aarav._id) && t.status === 'return_requested' && t.fineAmount > 0)?._id || '') },
    };
  } finally {
    await conn.close();
  }
};

/** Delete the demo database (only libverse_demo) */
const dropDemo = async (uri = process.env.DEMO_MONGODB_URI || DEFAULT_URI) => {
  const conn = await mongoose.createConnection(uri).asPromise();
  try {
    if (conn.db.databaseName !== DEMO_DB) throw new Error(`Refusing: only "${DEMO_DB}" can be dropped here`);
    await conn.db.dropDatabase();
  } finally {
    await conn.close();
  }
};

if (require.main === module) {
  const live = process.argv.includes('--live');
  (process.argv.includes('--drop') ? dropDemo().then(() => console.log(`Dropped ${DEMO_DB}`)) : seedDemo(undefined, { live }).then((s) => {
    const { accounts, ids, ...counts } = s;
    console.log(JSON.stringify(counts, null, 2));
    if (live) console.log('Live demo accounts created (isDemo, random password). Sign in with the demo buttons on the demo instance.');
    else console.log(`Demo accounts (password ${accounts.password}): admin ${accounts.admin}, librarian ${accounts.librarian}, student ${accounts.student}`);
  })).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { seedDemo, dropDemo, DEMO_DB, DEMO_PASSWORD };
