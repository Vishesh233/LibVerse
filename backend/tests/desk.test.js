// Scan desk and the signed library card
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, stockIsConsistent } = require('./helpers');
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { FINE_PER_DAY } = require('../utils/loanRules');

let student; let other; let lib; let admin; let book;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [student, other, lib, admin] = [await makeUser('student'), await makeUser('student'), await makeUser('librarian'), await makeUser('admin')];
  book = await makeBook({ totalCopies: 2 });
});
afterEach(async () => {
  expect(await stockIsConsistent()).toEqual([]);
});

const resolve = (who, code) => as(who).get(`/api/admin/desk/resolve?code=${encodeURIComponent(code)}`);
const cardOf = async (user) => (await as(lib).get(`/api/admin/users/${user._id}/card`)).body.card;

test('library card: staff and the owner see the same signed code; other students cannot', async () => {
  const card = await cardOf(student);
  expect(card.code).toMatch(/^LV1:U:/);
  expect(card).toMatchObject({ libraryId: student.libraryId, role: 'student', cardVersion: 1 });
  expect(card.rules).toEqual(expect.objectContaining({ loanDays: expect.any(Number), finePerDay: FINE_PER_DAY }));
  const own = await as(student).get('/api/auth/me/card');
  expect(own.body.card.code).toBe(card.code);
  expect((await as(other).get(`/api/admin/users/${student._id}/card`)).status).toBe(403);
});

test('resolve: card -> user, book QR -> book, ISBN typed -> book, damaged / forged codes refused', async () => {
  const card = await cardOf(student);
  const u = await resolve(lib, card.code);
  expect(u.status).toBe(200);
  expect(String(u.body.user._id)).toBe(String(student._id));

  const b = await resolve(lib, `LV1:B:${book._id}`);
  expect(b.status).toBe(200);
  expect(String(b.body.book._id)).toBe(String(book._id));

  const typed = await resolve(lib, book.isbn);
  expect(typed.status).toBe(200);
  expect(typed.body.typed).toBe(true);

  expect((await resolve(lib, 'LV1:B:nothex')).status).toBe(400);
  const forged = card.code.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));
  expect((await resolve(lib, forged)).status).toBeGreaterThanOrEqual(400);
  expect((await resolve(student, `LV1:B:${book._id}`)).status).toBe(403);
});

test('desk issue and return move stock once; double actions are refused', async () => {
  const issue = await as(lib).post('/api/admin/desk/issue').send({ userId: student._id, bookId: book._id });
  expect(issue.status).toBe(201);
  expect(issue.body.transaction.status).toBe('issued');
  let b = await Book.findById(book._id).lean();
  expect([b.availableCopies, b.issuedCopies]).toEqual([1, 1]);
  expect((await as(lib).post('/api/admin/desk/issue').send({ userId: student._id, bookId: book._id })).status).toBe(400);
  expect((await as(lib).post('/api/admin/desk/issue').send({ bookId: book._id })).status).toBe(400);

  const ret = await as(lib).post('/api/admin/desk/return').send({ transactionId: issue.body.transaction._id });
  expect(ret.status).toBe(200);
  expect(ret.body.fine).toBe(0);
  b = await Book.findById(book._id).lean();
  expect([b.availableCopies, b.issuedCopies]).toEqual([2, 0]);
  expect((await as(lib).post('/api/admin/desk/return').send({ transactionId: issue.body.transaction._id })).status).toBe(400);
});

test('desk return of an overdue loan records the fine on the loan and the running total', async () => {
  const loan = await makeLoan(student, book, { dueInDays: -4 });
  const ret = await as(lib).post('/api/admin/desk/return').send({ transactionId: loan._id });
  expect(ret.status).toBe(200);
  expect(ret.body.fine).toBe(4 * FINE_PER_DAY);
  expect((await Transaction.findById(loan._id)).status).toBe('returned');
  expect((await User.findById(student._id)).fineAmount).toBe(4 * FINE_PER_DAY);
});

test('desk issue fulfils the pending request of that student for that book', async () => {
  const req = await as(student).post('/api/transactions/issue').send({ bookId: book._id });
  const issue = await as(lib).post('/api/admin/desk/issue').send({ userId: student._id, bookId: book._id });
  expect(issue.status).toBe(201);
  expect(issue.body.fromRequest).toBeTruthy();
  expect((await Transaction.countDocuments({ userId: student._id, bookId: book._id }))).toBe(1);
  expect((await Transaction.findById(req.body.transaction._id)).status).toBe('issued');
});

test('card reissue (admin only) invalidates the old card', async () => {
  const old = await cardOf(student);
  expect((await as(lib).post(`/api/admin/users/${student._id}/reissue-card`)).status).toBe(403);
  const re = await as(admin).post(`/api/admin/users/${student._id}/reissue-card`);
  expect(re.status).toBe(200);
  expect(re.body.cardVersion).toBe(2);
  expect((await resolve(lib, old.code)).status).toBeGreaterThanOrEqual(400);
  const fresh = await cardOf(student);
  expect((await resolve(lib, fresh.code)).status).toBe(200);
});

test('issue with a custom due date: after today and within a year', async () => {
  const pad = (n) => String(n).padStart(2, '0');
  const day = (offset) => { const d = new Date(Date.now() + offset * 864e5); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const issue = (dueDate) => as(lib).post('/api/admin/issue-book').send({ libraryId: student.libraryId, bookId: book._id, dueDate });
  expect((await issue(day(-1))).status).toBe(400);
  expect((await issue(day(0))).status).toBe(400);
  expect((await issue(day(400))).status).toBe(400);
  expect((await issue('not-a-date')).status).toBe(400);
  const ok = await issue(day(10));
  expect(ok.status).toBe(201);
  expect(new Date(ok.body.transaction.dueDate).toISOString().slice(0, 10)).toBe(new Date(`${day(10)}`).toISOString().slice(0, 10));
});

test('a deactivated student cannot be issued a book at the desk', async () => {
  await User.updateOne({ _id: student._id }, { isActive: false });
  const r = await as(lib).post('/api/admin/desk/issue').send({ userId: student._id, bookId: book._id });
  expect(r.status).toBeGreaterThanOrEqual(400);
  expect(r.status).toBeLessThan(500);
});
