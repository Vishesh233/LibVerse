// Analytics, reports and dashboard numbers against a hand-computed fixture
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, DAY } = require('./helpers');
const Transaction = require('../models/Transaction');
const { FINE_PER_DAY } = require('../utils/loanRules');

const pad = (n) => String(n).padStart(2, '0');
const dayString = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const ago = (days) => new Date(Date.now() - days * DAY);

let lib; let admin; let a; let b; let c;
beforeAll(async () => {
  await connect();
  await reset();
  [lib, admin, a, b, c] = [await makeUser('librarian'), await makeUser('admin'), await makeUser('student'), await makeUser('student'), await makeUser('student')];
  const [b1, b2, b3, b4, b5, b6, b7] = await Promise.all([1, 2, 3, 4, 5, 6, 7].map((i) => makeBook({ genre: i % 2 ? 'Fiction' : 'History', totalCopies: 3 })));

  // L1 open loan, not due yet
  await makeLoan(a, b1, { issuedDaysAgo: 5, dueInDays: 9 });
  // L2 returned in range, no fine
  await makeLoan(b, b2, { status: 'returned', issuedDaysAgo: 10, dueInDays: 4, returnDate: ago(3) });
  // L3 return requested with an unpaid fine of 30
  await makeLoan(a, b3, { status: 'return_requested', issuedDaysAgo: 20, dueInDays: -6, returnRequestedAt: ago(2), fineAmount: 30 });
  // L4 fine of 20 paid
  await makeLoan(b, b4, { status: 'returned', issuedDaysAgo: 25, dueInDays: -11, returnRequestedAt: ago(2), fineAmount: 20, finePaid: true, paymentApprovedAt: ago(1), returnDate: ago(1) });
  // L5 fine of 40, 15 waived, rest paid
  await makeLoan(c, b5, { status: 'returned', issuedDaysAgo: 22, dueInDays: -8, returnRequestedAt: ago(2), fineAmount: 40, fineWaived: 15, waivedAt: ago(1), waiverReason: 'Partial hardship waiver', waivedBy: lib._id, finePaid: true, paymentApprovedAt: ago(1), returnDate: ago(1) });
  // L6 overdue by 4 days, still out (fine growing)
  await makeLoan(c, b6, { issuedDaysAgo: 18, dueInDays: -4 });
  // L7 outside the range
  await makeLoan(a, b7, { status: 'returned', issuedDaysAgo: 100, dueInDays: -86, returnDate: ago(90) });
  // A request is not a loan
  await Transaction.create({ userId: b._id, bookId: b1._id, status: 'pending', dueDate: new Date(Date.now() + 14 * DAY) });
});
afterAll(disconnect);

const range = `from=${dayString(40)}&to=${dayString(0)}`;

test('analytics summary and fine totals', async () => {
  const r = await as(lib).get(`/api/admin/analytics?${range}`);
  expect(r.status).toBe(200);
  const { summary, fines, reservations, byGenre } = r.body.analytics;
  expect(summary).toEqual({ loansIssued: 6, loansReturned: 3, activeBorrowers: 3, currentBorrowers: 2, overdueNow: 1 });
  expect(fines).toEqual({
    charged: 90,
    chargedLoans: 3,
    collected: 45,
    waived: 15,
    outstanding: 30 + 4 * FINE_PER_DAY,
    outstandingFixed: 30,
    outstandingFixedLoans: 1,
    accruing: 4 * FINE_PER_DAY,
  });
  expect(reservations).toMatchObject({ created: 0, waitingNow: 0, readyNow: 0 });
  const fiction = byGenre.find((g) => g.genre === 'Fiction');
  const history = byGenre.find((g) => g.genre === 'History');
  expect(fiction).toMatchObject({ catalogue: 4, borrowed: 3 }); // books 1,3,5 (7 is outside the range)
  expect(history).toMatchObject({ catalogue: 3, borrowed: 3 });
  expect(r.body.analytics.loansSeries.issued.reduce((s, n) => s + n, 0)).toBe(6);
});

test('reports: loan and fine rows with statuses; overdue table', async () => {
  const r = await as(lib).get(`/api/admin/reports?${range}`);
  expect(r.status).toBe(200);
  const { loans, fines, overdue } = r.body.reports;
  expect(r.body.reports.loansTotal).toBe(6);
  expect(loans).toHaveLength(6);
  const status = Object.fromEntries(fines.map((f) => [f.fine, f.status]));
  expect(status).toMatchObject({ 30: 'Unpaid', 20: 'Paid', 40: 'Paid (part waived)' });
  const waived = fines.find((f) => f.fine === 40);
  expect(waived).toMatchObject({ waived: 15, paid: 25, payable: 0, waiverReason: 'Partial hardship waiver' });
  expect(overdue).toHaveLength(1);
  expect(JSON.stringify(r.body)).not.toMatch(/@example\.com/); // no student emails in reports
});

test('range validation', async () => {
  expect((await as(lib).get('/api/admin/analytics?from=2026-13-40&to=x')).status).toBe(400);
  expect((await as(lib).get(`/api/admin/analytics?from=${dayString(0)}&to=${dayString(5)}`)).status).toBe(400);
  expect((await as(a).get(`/api/admin/analytics?${range}`)).status).toBe(403);
});

test('dashboard counters', async () => {
  const r = await as(admin).get('/api/admin/dashboard');
  expect(r.status).toBe(200);
  const d = r.body.analytics;
  expect(d.totalBooks).toBe(7);
  expect(d.issuedBooks).toBe(2); // L1 and L6 are out right now
  expect(d.overdueBooks).toBe(1);
  // The queues are lists (shown on the dashboard), not counts
  expect(d.pendingRequests).toHaveLength(1);
  expect(d.returnRequests).toHaveLength(1);
  expect(d.paymentPending).toHaveLength(0);
});

test('student stats and reading stats', async () => {
  const stats = await as(a).get('/api/auth/me/stats');
  expect(stats.status).toBe(200);
  const reading = await as(b).get('/api/auth/me/reading-stats');
  expect(reading.status).toBe(200);
  // L2 and L4 were handed out to b (both returned, one late)
  expect(reading.body.stats).toEqual(expect.objectContaining({ totalRead: 2, onTimeReturns: 1, onTimeRate: 50 }));
  expect(stats.body.stats).toEqual(expect.objectContaining({ currentlyBorrowed: 2 })); // a: L1 issued + L3 return requested
});
