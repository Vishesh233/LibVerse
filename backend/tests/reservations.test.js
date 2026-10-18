// Reservations / waitlist: rules, queue order, holds, borrowing a held copy, expiry, cancellation
const mongoose = require('mongoose');
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, stockIsConsistent, DAY } = require('./helpers');
const Book = require('../models/Book');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const { runReservationExpiry } = require('../jobs/reminders');

let s1; let s2; let s3; let holder; let lib; let one;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [s1, s2, s3, holder, lib] = [await makeUser('student'), await makeUser('student'), await makeUser('student'), await makeUser('student'), await makeUser('librarian')];
  one = await makeBook({ totalCopies: 1 });
  await makeLoan(holder, one); // the only copy is out
});
afterEach(async () => {
  expect(await stockIsConsistent()).toEqual([]);
});

const reserve = (who, book) => as(who).post('/api/reservations').send({ bookId: String(book._id) });
const stock = async (book) => {
  const b = await Book.findById(book._id).lean();
  return { available: b.availableCopies, issued: b.issuedCopies, held: b.heldCopies };
};
const returnTheCopy = async () => {
  const loan = await mongoose.model('Transaction').findOne({ bookId: one._id, userId: holder._id, status: 'issued' });
  expect((await as(holder).put(`/api/transactions/${loan._id}/return`)).status).toBe(200);
  expect((await as(lib).put(`/api/transactions/${loan._id}/approve-return`)).status).toBe(200);
};

test('rules: only unavailable active books, once per book, at most 3, not while borrowing it, students only', async () => {
  const free = await makeBook({ totalCopies: 2 });
  expect((await reserve(s1, free)).status).toBe(400);
  expect((await reserve(s1, await makeBook({ isActive: false }))).status).toBe(404);
  expect((await as(s1).post('/api/reservations').send({ bookId: 'not-an-id' })).status).toBe(404);

  const first = await reserve(s1, one);
  expect(first.status).toBe(201);
  expect(first.body.position).toBe(1);
  expect((await reserve(s1, one)).status).toBe(400);
  expect((await reserve(holder, one)).status).toBe(400); // already has it on loan
  expect((await reserve(lib, one)).status).toBe(403);

  for (let i = 0; i < 2; i++) {
    const b = await makeBook({ totalCopies: 1 });
    await makeLoan(holder, b);
    expect((await reserve(s1, b)).status).toBe(201);
  }
  const fourth = await makeBook({ totalCopies: 1 });
  await makeLoan(holder, fourth);
  const r = await reserve(s1, fourth);
  expect(r.status).toBe(400);
  expect(r.body.message).toMatch(/at most 3 active reservations/);
});

test('race: two identical reservations at once -> exactly one', async () => {
  const results = await Promise.all([reserve(s1, one), reserve(s1, one)]);
  expect(results.map((r) => r.status).sort()).toEqual([201, 400]);
});

test('queue: returned copy is held for the oldest reservation, others move up', async () => {
  await reserve(s1, one);
  expect((await reserve(s2, one)).body.position).toBe(2);
  expect((await reserve(s3, one)).body.position).toBe(3);

  await returnTheCopy();
  const r1 = await Reservation.findOne({ userId: s1._id, bookId: one._id }).lean();
  expect(r1.status).toBe('ready');
  expect(Math.round((new Date(r1.expiresAt) - Date.now()) / (60 * 60 * 1000))).toBe(48);
  expect(await stock(one)).toEqual({ available: 0, issued: 0, held: 1 });
  expect(await Notification.countDocuments({ userId: s1._id, type: /RESERV/ })).toBeGreaterThan(0);

  const mine = await as(s3).get('/api/reservations/me');
  expect(mine.status).toBe(200);
  const r3 = mine.body.reservations.find((r) => String(r.bookId?._id || r.bookId) === String(one._id));
  expect(r3).toMatchObject({ status: 'waiting', position: 2 });

  // Staff queue view never includes student emails
  const queue = await as(lib).get(`/api/reservations?bookId=${one._id}`);
  expect(queue.status).toBe(200);
  for (const r of queue.body.reservations) expect(Object.keys(r.userId || {})).not.toContain('email');
});

test('the ready student borrows the held copy; others cannot jump the queue', async () => {
  await reserve(s1, one);
  await reserve(s2, one);
  await returnTheCopy();

  expect((await as(s2).post('/api/transactions/issue').send({ bookId: one._id })).status).toBe(400);
  const req = await as(s1).post('/api/transactions/issue').send({ bookId: one._id });
  expect(req.status).toBe(201);
  expect((await as(lib).put(`/api/transactions/${req.body.transaction._id}/approve`)).status).toBe(200);
  expect(await stock(one)).toEqual({ available: 0, issued: 1, held: 0 });
  expect((await Reservation.findOne({ userId: s1._id, bookId: one._id })).status).toBe('fulfilled');
  expect((await Reservation.findOne({ userId: s2._id, bookId: one._id })).status).toBe('waiting');
});

test('expiry after 48 hours releases the hold to the next in line', async () => {
  await reserve(s1, one);
  await reserve(s2, one);
  await returnTheCopy();
  const later = new Date(Date.now() + 49 * 60 * 60 * 1000);
  const result = await runReservationExpiry({ now: later, force: true });
  expect(result).toMatchObject({ expired: 1, promoted: 1 });
  expect((await Reservation.findOne({ userId: s1._id, bookId: one._id })).status).toBe('expired');
  expect((await Reservation.findOne({ userId: s2._id, bookId: one._id })).status).toBe('ready');
  expect(await stock(one)).toEqual({ available: 0, issued: 0, held: 1 });
});

test('cancelling: the owner or staff; a cancelled ready hold goes to the next student or back on the shelf', async () => {
  const own = (await reserve(s1, one)).body.reservation._id;
  const other = (await reserve(s2, one)).body.reservation._id;
  expect((await as(s3).delete(`/api/reservations/${own}`)).status).toBe(403);
  expect((await as(s1).delete(`/api/reservations/${new mongoose.Types.ObjectId()}`)).status).toBe(404);

  await returnTheCopy();
  expect((await as(s1).delete(`/api/reservations/${own}`)).status).toBe(200); // ready -> next in line
  expect((await Reservation.findById(other)).status).toBe('ready');

  expect((await as(lib).delete(`/api/reservations/${other}`)).status).toBe(200); // staff cancel
  expect(await stock(one)).toEqual({ available: 1, issued: 0, held: 0 });
});

test('a later expiry run is a no-op; staff lists are paginated and validate status', async () => {
  await reserve(s1, one);
  expect(await runReservationExpiry({ now: new Date(Date.now() + 10 * DAY), force: true })).toMatchObject({ expired: 0 });
  const list = await as(lib).get('/api/reservations?status=waiting&limit=1');
  expect(list.status).toBe(200);
  expect(list.body.reservations).toHaveLength(1);
  expect((await as(lib).get('/api/reservations?status=bogus')).status).toBe(400);
});
