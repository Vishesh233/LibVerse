// Fine waivers: validation, partial and full waivers, audit, running total, return unblocked
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, stockIsConsistent } = require('./helpers');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Book = require('../models/Book');

let student; let lib; let admin; let book; let tx;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [student, lib, admin] = [await makeUser('student'), await makeUser('librarian'), await makeUser('admin')];
  book = await makeBook({ totalCopies: 1 });
  // A late return waiting for staff, with a fixed fine of 50 (already on the user's running total)
  tx = await makeLoan(student, book, { status: 'return_requested', dueInDays: -10, issuedDaysAgo: 24, fineAmount: 50, returnRequestedAt: new Date() });
  await User.updateOne({ _id: student._id }, { fineAmount: 50 });
});

const waive = (who, amount, reason = 'Medical certificate provided') => as(who).post(`/api/transactions/${tx._id}/waive`).send({ amount, reason });

test('validation: staff only, reason >= 10 chars, 0 < amount <= payable', async () => {
  expect((await waive(student, 10)).status).toBe(403);
  expect((await waive(lib, 10, 'short')).status).toBe(400);
  expect((await waive(lib, 10, 'x'.repeat(501))).status).toBe(400);
  expect((await waive(lib, 0)).status).toBe(400);
  expect((await waive(lib, -5)).status).toBe(400);
  expect((await waive(lib, 51)).status).toBe(400);
  expect((await as(lib).post('/api/transactions/not-an-id/waive').send({ amount: 1, reason: 'Medical certificate provided' })).status).toBe(404);
  expect((await Transaction.findById(tx._id)).fineWaived || 0).toBe(0);
});

test('partial then full waiver; audit entries; running total; return no longer blocked', async () => {
  const part = await waive(lib, 20);
  expect(part.status).toBe(200);
  expect((await Transaction.findById(tx._id)).fineWaived).toBe(20);
  expect((await User.findById(student._id)).fineAmount).toBe(30);
  expect(await AuditLog.countDocuments({ action: 'fine.waive' })).toBe(1);

  // Not yet fully waived: the return still needs payment
  expect((await as(lib).put(`/api/transactions/${tx._id}/approve-return`)).status).toBe(400);

  const rest = await waive(admin, 30, 'Remaining amount waived by admin');
  expect(rest.status).toBe(200);
  const t = await Transaction.findById(tx._id).lean();
  expect(t.fineWaived).toBe(50);
  expect(t.waiverReason).toBe('Remaining amount waived by admin');
  expect((await User.findById(student._id)).fineAmount).toBe(0);
  expect((await waive(admin, 1, 'Nothing should be left here')).status).toBe(400);

  const approve = await as(lib).put(`/api/transactions/${tx._id}/approve-return`);
  expect(approve.status).toBe(200);
  const b = await Book.findById(book._id).lean();
  expect([b.availableCopies, b.issuedCopies]).toEqual([1, 0]);
  expect(await stockIsConsistent()).toEqual([]);
});

test('a fine that is still growing (issued) or already paid cannot be waived', async () => {
  const growing = await makeLoan(await makeUser('student'), await makeBook(), { dueInDays: -3 });
  const r1 = await as(lib).post(`/api/transactions/${growing._id}/waive`).send({ amount: 5, reason: 'Medical certificate provided' });
  expect(r1.status).toBe(400);
  expect(r1.body.message).toMatch(/still growing/);
  await Transaction.updateOne({ _id: tx._id }, { finePaid: true, status: 'returned' });
  expect((await waive(lib, 5)).status).toBe(400);
});

test('waiving a fine while payment is pending puts the loan back to return_requested', async () => {
  await Transaction.updateOne({ _id: tx._id }, { status: 'payment_pending', paymentSubmittedAt: new Date() });
  expect((await waive(lib, 50)).status).toBe(200);
  const t = await Transaction.findById(tx._id).lean();
  expect(t.status).toBe('return_requested');
  expect(t.paymentSubmittedAt).toBeUndefined();
});

test('race: two waivers of the full amount at once -> only one succeeds', async () => {
  const results = await Promise.all([waive(lib, 50), waive(admin, 50)]);
  expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  expect((await Transaction.findById(tx._id)).fineWaived).toBe(50);
  expect((await User.findById(student._id)).fineAmount).toBe(0);
});
