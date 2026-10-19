/**
 * Shared test helpers: database lifecycle, fixtures and authenticated requests.
 * Fixture emails are @example.com and are never printed.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Reservation = require('../models/Reservation');
const { nextLibraryId } = require('../utils/libraryId');

const DAY = 24 * 60 * 60 * 1000;
const PASSWORD = 'Passw0rd!x';
let seq = 0;
const next = () => { seq += 1; return seq; };

/** Connect and build every model's indexes (unique Library ID, one active reservation per book...) */
const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
};

/** Empty every collection, GridFS files included (indexes stay) */
const reset = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

const disconnect = () => mongoose.disconnect();

const makeUser = async (role = 'student', extra = {}) => {
  const n = next();
  return User.create({
    name: `${role[0].toUpperCase()}${role.slice(1)} Tester ${n}`,
    email: `${role}.${n}.${Date.now()}@example.com`,
    password: PASSWORD,
    role,
    libraryId: await nextLibraryId(), // same short sequential IDs as signup
    isOnboardingCompleted: true,
    ...extra,
  });
};

const makeBook = async (extra = {}) => {
  const n = next();
  const total = extra.totalCopies ?? 2;
  return Book.create({
    title: `Test Book ${n}`,
    author: `Author ${n}`,
    isbn: `97800${String(n).padStart(8, '0')}`,
    genre: 'Fiction',
    description: 'A book used by the automated tests.',
    totalCopies: total,
    availableCopies: total,
    issuedCopies: 0,
    heldCopies: 0,
    ...extra,
  });
};

/** A loan that is already issued (stock moved), due in `dueInDays` (negative = overdue) */
const makeLoan = async (user, book, { dueInDays = 7, issuedDaysAgo = 7, status = 'issued', ...extra } = {}) => {
  const now = Date.now();
  const tx = await Transaction.create({
    userId: user._id,
    bookId: book._id,
    status,
    issueDate: new Date(now - issuedDaysAgo * DAY),
    dueDate: new Date(now + dueInDays * DAY),
    ...extra,
  });
  if (['issued', 'return_requested', 'payment_pending'].includes(status)) {
    await Book.updateOne({ _id: book._id }, { $inc: { availableCopies: -1, issuedCopies: 1 } });
  }
  return tx;
};

const tokenFor = (user) => jwt.sign({ id: user._id, tv: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '1h' });

const api = () => request(app);

/** Requests as a user: as(user).get('/api/...'), .post(url).send(body)... */
const as = (user) => {
  const auth = (req) => req.set('Authorization', `Bearer ${tokenFor(user)}`);
  return {
    get: (url) => auth(api().get(url)),
    post: (url) => auth(api().post(url)),
    put: (url) => auth(api().put(url)),
    patch: (url) => auth(api().patch(url)),
    delete: (url) => auth(api().delete(url)),
  };
};

/** Every book's counters add up and none is negative; held copies match ready reservations */
const stockIsConsistent = async () => {
  const [books, ready] = await Promise.all([
    Book.find().lean(),
    Reservation.aggregate([{ $match: { status: 'ready' } }, { $group: { _id: '$bookId', n: { $sum: 1 } } }]),
  ]);
  const readyBy = new Map(ready.map((r) => [String(r._id), r.n]));
  return books.filter((b) => {
    const a = b.availableCopies; const i = b.issuedCopies || 0; const h = b.heldCopies || 0;
    return a < 0 || i < 0 || h < 0 || a + i + h !== b.totalCopies || h !== (readyBy.get(String(b._id)) || 0);
  }).map((b) => `${b.title}: ${b.availableCopies}+${b.issuedCopies}+${b.heldCopies}/${b.totalCopies}`);
};

// A 1x1 PNG as a data URL (payment screenshots)
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

module.exports = {
  DAY, PASSWORD, PNG, connect, reset, disconnect, makeUser, makeBook, makeLoan, tokenFor, api, as, stockIsConsistent,
};
