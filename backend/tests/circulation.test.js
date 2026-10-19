// Request -> approve -> return, fines and payment, renewals, races, inactive books
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, stockIsConsistent, DAY, PNG } = require('./helpers');
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { LOAN_DAYS, RENEWAL_DAYS, MAX_RENEWALS, FINE_PER_DAY } = require('../utils/loanRules');

let s1; let s2; let lib; let admin;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [s1, s2, lib, admin] = [await makeUser('student'), await makeUser('student'), await makeUser('librarian'), await makeUser('admin')];
});
afterEach(async () => {
  expect(await stockIsConsistent()).toEqual([]);
});

const stock = async (book) => {
  const b = await Book.findById(book._id).lean();
  return [b.availableCopies, b.issuedCopies];
};
const near = (date, expected, toleranceMs = 60 * 1000) => Math.abs(new Date(date) - expected) < toleranceMs;

test('no-fine loan: request, approve (dates reset at approval), return, approve-return', async () => {
  const book = await makeBook({ totalCopies: 5 });
  const req = await as(s1).post('/api/transactions/issue').send({ bookId: book._id });
  expect(req.status).toBe(201);
  const txId = req.body.transaction._id;
  expect(await stock(book)).toEqual([5, 0]); // a request does not take a copy

  const approve = await as(lib).put(`/api/transactions/${txId}/approve`);
  expect(approve.status).toBe(200);
  const tx = await Transaction.findById(txId).lean();
  expect(tx.status).toBe('issued');
  expect(near(tx.issueDate, Date.now())).toBe(true);
  expect(near(tx.dueDate, new Date(tx.issueDate).getTime() + LOAN_DAYS * DAY)).toBe(true);
  expect(await stock(book)).toEqual([4, 1]);

  const ret = await as(s1).put(`/api/transactions/${txId}/return`);
  expect(ret.status).toBe(200);
  expect(ret.body.hasFine).toBe(false);
  const done = await as(lib).put(`/api/transactions/${txId}/approve-return`);
  expect(done.status).toBe(200);
  expect(await stock(book)).toEqual([5, 0]);

  // Approving twice changes nothing
  expect((await as(lib).put(`/api/transactions/${txId}/approve-return`)).status).toBe(400);
  expect(await stock(book)).toEqual([5, 0]);
});

test('one copy per student: a second request (or admin issue) of the same book is refused', async () => {
  const book = await makeBook({ totalCopies: 5 });
  expect((await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).status).toBe(201);
  const dup = await as(s1).post('/api/transactions/issue').send({ bookId: book._id });
  expect(dup.status).toBe(400);
  expect(dup.body.message).toMatch(/already have a request or issued copy/);

  // Replaces the old batch2 h3 assertion: admin issue to a student who already holds the book is refused
  const held = await makeBook({ totalCopies: 3 });
  await makeLoan(s2, held);
  const adminIssue = await as(admin).post('/api/admin/issue-book').send({ libraryId: s2.libraryId, bookId: held._id });
  expect(adminIssue.status).toBe(400);
  expect(adminIssue.body.message).toMatch(/already has .* on loan/);
  const fresh = await as(admin).post('/api/admin/issue-book').send({ libraryId: s2.libraryId, bookId: book._id });
  expect(fresh.status).toBe(201);
});

test('requests for unavailable or inactive books are refused', async () => {
  const inactive = await makeBook({ isActive: false });
  expect((await as(s1).post('/api/transactions/issue').send({ bookId: inactive._id })).status).toBe(404);
  const none = await makeBook({ totalCopies: 1 });
  await makeLoan(s2, none);
  expect((await as(s1).post('/api/transactions/issue').send({ bookId: none._id })).status).toBe(400);
});

test('overdue return: fine fixed per calendar day, return blocked until paid, payment approved', async () => {
  const book = await makeBook({ totalCopies: 2 });
  const loan = await makeLoan(s1, book, { dueInDays: -3, issuedDaysAgo: 17 });

  const ret = await as(s1).put(`/api/transactions/${loan._id}/return`);
  expect(ret.status).toBe(200);
  expect(ret.body.fine).toBe(3 * FINE_PER_DAY);
  expect((await User.findById(s1._id)).fineAmount).toBe(3 * FINE_PER_DAY); // running total grows

  // Asking twice does not file (or charge) twice
  expect((await as(s1).put(`/api/transactions/${loan._id}/return`)).status).toBe(400);
  expect((await User.findById(s1._id)).fineAmount).toBe(3 * FINE_PER_DAY);

  expect((await as(lib).put(`/api/transactions/${loan._id}/approve-return`)).status).toBe(400);

  // Only the borrower submits payment; the screenshot must be an image
  expect((await as(s2).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: PNG })).status).toBe(403);
  expect((await as(s1).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: 'not an image' })).status).toBe(400);
  const pay = await as(s1).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: PNG });
  expect(pay.status).toBe(200);
  expect((await Transaction.findById(loan._id)).status).toBe('payment_pending');

  // Replaces the old requests "fields" assertion: lists never carry the screenshot, only hasScreenshot
  const list = await as(lib).get('/api/transactions?status=payment_pending&limit=100');
  expect(list.status).toBe(200);
  const row = list.body.transactions.find((t) => t._id === String(loan._id));
  expect(row).toMatchObject({ fineAmount: 3 * FINE_PER_DAY, finePaid: false, hasScreenshot: true });
  expect(row).not.toHaveProperty('paymentScreenshot');
  expect(row.userId).toMatchObject({ name: s1.name, libraryId: s1.libraryId });
  expect(row.bookId).toMatchObject({ title: book.title });
  const shot = await as(lib).get(`/api/transactions/${loan._id}/payment-screenshot`);
  expect(shot.status).toBe(200);
  expect(shot.body.paymentScreenshot).toBe(PNG);
  expect((await as(s1).get(`/api/transactions/${loan._id}/payment-screenshot`)).status).toBe(403);

  const approve = await as(lib).put(`/api/transactions/${loan._id}/approve-payment`);
  expect(approve.status).toBe(200);
  const tx = await Transaction.findById(loan._id).lean();
  expect(tx).toMatchObject({ status: 'returned', finePaid: true });
  expect((await User.findById(s1._id)).fineAmount).toBe(0); // and shrinks again
  expect(await stock(book)).toEqual([2, 0]);
  expect((await as(lib).put(`/api/transactions/${loan._id}/approve-payment`)).status).toBe(400);
});

test('a book due today is not overdue: no fine', async () => {
  const book = await makeBook();
  const loan = await makeLoan(s1, book, { dueInDays: 0 });
  const ret = await as(s1).put(`/api/transactions/${loan._id}/return`);
  expect(ret.body.fine).toBe(0);
});

test('renewals: borrower or staff, up to the limit, never when overdue', async () => {
  const book = await makeBook();
  const loan = await makeLoan(s1, book, { dueInDays: 3 });
  const due0 = new Date((await Transaction.findById(loan._id)).dueDate).getTime();

  expect((await as(s2).put(`/api/transactions/${loan._id}/renew`)).status).toBe(403);
  for (let i = 1; i <= MAX_RENEWALS; i++) {
    const who = i === MAX_RENEWALS ? lib : s1;
    const r = await as(who).put(`/api/transactions/${loan._id}/renew`);
    expect(r.status).toBe(200);
    expect(new Date(r.body.newDueDate).getTime()).toBe(due0 + i * RENEWAL_DAYS * DAY);
  }
  const over = await as(lib).put(`/api/transactions/${loan._id}/renew`);
  expect(over.status).toBe(400);
  expect((await Transaction.findById(loan._id)).renewalCount).toBe(MAX_RENEWALS);

  const late = await makeLoan(s2, await makeBook(), { dueInDays: -1 });
  expect((await as(s2).put(`/api/transactions/${late._id}/renew`)).status).toBe(400);
});

test('renewal clears the due-soon reminder mark', async () => {
  const loan = await makeLoan(s1, await makeBook(), { dueInDays: 1, remindersSent: { dueSoon: new Date() } });
  expect((await as(s1).put(`/api/transactions/${loan._id}/renew`)).status).toBe(200);
  expect((await Transaction.findById(loan._id).lean()).remindersSent?.dueSoon).toBeUndefined();
});

test('race: two renewals at once with one renewal left -> exactly one succeeds', async () => {
  const loan = await makeLoan(s1, await makeBook(), { dueInDays: 5, renewalCount: MAX_RENEWALS - 1 });
  const results = await Promise.all([as(s1).put(`/api/transactions/${loan._id}/renew`), as(s1).put(`/api/transactions/${loan._id}/renew`)]);
  expect(results.map((r) => r.status).sort()).toEqual([200, expect.any(Number)]);
  expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  const tx = await Transaction.findById(loan._id);
  expect(tx.renewalCount).toBe(MAX_RENEWALS);
});

test('race: two return requests at once charge the fine once', async () => {
  const loan = await makeLoan(s1, await makeBook(), { dueInDays: -2 });
  const results = await Promise.all([as(s1).put(`/api/transactions/${loan._id}/return`), as(s1).put(`/api/transactions/${loan._id}/return`)]);
  expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  expect((await User.findById(s1._id)).fineAmount).toBe(2 * FINE_PER_DAY);
});

test('race: two requests for the last copy approved at once -> one issued, stock never negative', async () => {
  const book = await makeBook({ totalCopies: 1 });
  const a = (await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  const b = (await as(s2).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  const results = await Promise.all([as(lib).put(`/api/transactions/${a}/approve`), as(admin).put(`/api/transactions/${b}/approve`)]);
  expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
  expect(await stock(book)).toEqual([0, 1]);
  const loser = await Transaction.findById(results[0].status === 400 ? a : b).lean();
  expect(loser.status).toBe('pending');
});

test('race: the same request approved twice at once takes one copy', async () => {
  const book = await makeBook({ totalCopies: 3 });
  const id = (await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  const results = await Promise.all([as(lib).put(`/api/transactions/${id}/approve`), as(admin).put(`/api/transactions/${id}/approve`)]);
  expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  expect(await stock(book)).toEqual([2, 1]);
});

test('reject a request', async () => {
  const book = await makeBook();
  const id = (await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  expect((await as(s1).put(`/api/transactions/${id}/reject`)).status).toBe(403);
  expect((await as(lib).put(`/api/transactions/${id}/reject`)).status).toBe(200);
  expect((await Transaction.findById(id)).status).toBe('rejected');
});

test('reject after approve -> 409, the loan stays issued and keeps its copy', async () => {
  const book = await makeBook({ totalCopies: 3 });
  const id = (await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  expect((await as(lib).put(`/api/transactions/${id}/approve`)).status).toBe(200);
  const reject = await as(admin).put(`/api/transactions/${id}/reject`);
  expect(reject.status).toBe(409);
  expect(reject.body.message).toMatch(/already processed/);
  expect((await Transaction.findById(id)).status).toBe('issued');
  expect(await stock(book)).toEqual([2, 1]);
  expect(await Notification.countDocuments({ userId: s1._id, type: 'ISSUE_REJECTED' })).toBe(0);
});

test('approve after reject fails, the request stays rejected and no copy is taken', async () => {
  const book = await makeBook({ totalCopies: 3 });
  const id = (await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  expect((await as(lib).put(`/api/transactions/${id}/reject`)).status).toBe(200);
  expect((await as(admin).put(`/api/transactions/${id}/approve`)).status).toBe(400);
  expect((await Transaction.findById(id)).status).toBe('rejected');
  expect(await stock(book)).toEqual([3, 0]);
});

test('race: approve and reject at once -> exactly one wins and stock matches the winner', async () => {
  const book = await makeBook({ totalCopies: 3 });
  const id = (await as(s1).post('/api/transactions/issue').send({ bookId: book._id })).body.transaction._id;
  const [approve, reject] = await Promise.all([as(lib).put(`/api/transactions/${id}/approve`), as(admin).put(`/api/transactions/${id}/reject`)]);
  expect([approve.status, reject.status].filter((s) => s === 200)).toHaveLength(1);
  const tx = await Transaction.findById(id).lean();
  if (approve.status === 200) {
    expect(tx.status).toBe('issued');
    expect(await stock(book)).toEqual([2, 1]);
  } else {
    expect(tx.status).toBe('rejected');
    expect(await stock(book)).toEqual([3, 0]);
  }
});

test('submit payment after the fine was waived and the return approved -> 409, stays returned', async () => {
  const book = await makeBook({ totalCopies: 2 });
  const loan = await makeLoan(s1, book, { dueInDays: -3, issuedDaysAgo: 17 });
  expect((await as(s1).put(`/api/transactions/${loan._id}/return`)).status).toBe(200);
  expect((await as(lib).post(`/api/transactions/${loan._id}/waive`).send({ amount: 3 * FINE_PER_DAY, reason: 'Medical certificate provided' })).status).toBe(200);
  expect((await as(lib).put(`/api/transactions/${loan._id}/approve-return`)).status).toBe(200);

  const pay = await as(s1).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: PNG });
  expect(pay.status).toBe(409);
  const tx = await Transaction.findById(loan._id).lean();
  expect(tx.status).toBe('returned');
  expect(tx.paymentScreenshot).toBeFalsy();
  expect(await stock(book)).toEqual([2, 0]);
  expect(await Notification.countDocuments({ type: 'PAYMENT_PENDING', 'meta.transactionId': loan._id })).toBe(0);
});

test('race: payment submitted twice at once -> second is 409, notifications sent once', async () => {
  const loan = await makeLoan(s1, await makeBook(), { dueInDays: -2 });
  expect((await as(s1).put(`/api/transactions/${loan._id}/return`)).status).toBe(200);
  const results = await Promise.all([
    as(s1).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: PNG }),
    as(s1).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: PNG }),
  ]);
  expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  expect((await Transaction.findById(loan._id)).status).toBe('payment_pending');
  const sent = await Notification.find({ type: 'PAYMENT_PENDING', 'meta.transactionId': loan._id }).lean();
  // One for the student, one for each active staff member (lib and admin)
  expect(sent.filter((n) => String(n.userId) === String(s1._id))).toHaveLength(1);
  expect(sent).toHaveLength(3);

  // And a later click on a stale page is refused too
  expect((await as(s1).put(`/api/transactions/${loan._id}/submit-payment`).send({ paymentScreenshot: PNG })).status).toBe(409);
  expect(await Notification.countDocuments({ type: 'PAYMENT_PENDING', 'meta.transactionId': loan._id })).toBe(3);
});

test('student transaction list only shows their own loans', async () => {
  await makeLoan(s1, await makeBook());
  await makeLoan(s2, await makeBook());
  const r = await as(s1).get('/api/transactions/user/me');
  expect(r.status).toBe(200);
  expect(r.body.transactions).toHaveLength(1);
  expect(String(r.body.transactions[0].userId?._id || r.body.transactions[0].userId)).toBe(String(s1._id));
});

test('query injection is ignored: operators in query strings are treated as absent', async () => {
  const r = await as(lib).get('/api/transactions?status[$ne]=x&limit=100000');
  expect(r.status).toBe(200);
  expect(r.body.transactions.length).toBeLessThanOrEqual(100);
});
