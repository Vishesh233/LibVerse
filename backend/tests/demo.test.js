// Live demo: one-click sign-in on the demo instance, demo accounts blocked from destructive actions
// (403 "Disabled in demo mode") while the normal flows work, a per-account write cap, and the
// scoped 6-hourly reset that never touches a non-demo account
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { api, as, connect, disconnect, reset, makeUser, makeBook, makeLoan, stockIsConsistent, PASSWORD, PNG } = require('./helpers');
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const PasswordResetCode = require('../models/PasswordResetCode');
const { saveFile, findFile } = require('../services/fileStore');
const { setTransportForTests } = require('../services/mailer');
const { resetDemo } = require('../scripts/resetDemo');
const { FINE_PER_DAY } = require('../utils/loanRules');

const DISABLED = 'Disabled in demo mode';
const demoUser = (role, extra = {}) => makeUser(role, { isDemo: true, ...extra });
const demoMode = (on) => { if (on) process.env.DEMO_MODE = 'true'; else delete process.env.DEMO_MODE; };
const expectBlocked = (r) => {
  expect(r.status).toBe(403);
  expect(r.body).toMatchObject({ success: false, code: 'DEMO_MODE', message: DISABLED });
};

beforeAll(connect);
afterAll(async () => { demoMode(false); setTransportForTests(null); await disconnect(); });
beforeEach(async () => {
  await reset();
  demoMode(false);
  delete process.env.RATE_LIMIT_DEMO_WRITES;
});

describe('demo instance switch (DEMO_MODE)', () => {
  test('GET /auth/demo reports the mode; demo-login is 404 unless DEMO_MODE=true', async () => {
    await demoUser('student');
    expect((await api().get('/api/auth/demo')).body).toMatchObject({ success: true, enabled: false });
    expect((await api().post('/api/auth/demo-login').send({ role: 'student' })).status).toBe(404);
    demoMode(true);
    expect((await api().get('/api/auth/demo')).body.enabled).toBe(true);
  });

  test('one click per role signs in as the oldest active demo account of that role, with a short session', async () => {
    demoMode(true);
    const s = await demoUser('student', { createdAt: new Date(Date.now() - 9e6) });
    await demoUser('student');
    await demoUser('student', { createdAt: new Date(Date.now() - 9e7), isActive: false });
    await makeUser('student', { createdAt: new Date(Date.now() - 9e8) }); // not a demo account
    const l = await demoUser('librarian');
    const a = await demoUser('admin');
    for (const [role, expected] of [['student', s], ['librarian', l], ['admin', a]]) {
      const r = await api().post('/api/auth/demo-login').send({ role });
      expect(r.status).toBe(200);
      expect(r.body.user).toMatchObject({ _id: String(expected._id), role, isDemo: true });
      const { exp, iat } = jwt.decode(r.body.token);
      expect(exp - iat).toBe(2 * 60 * 60);
      const me = await api().get('/api/auth/me').set('Authorization', `Bearer ${r.body.token}`);
      expect(me.status).toBe(200);
      expect(me.body.user.isDemo).toBe(true);
    }
  });

  test('demo-login: only the three roles; 503 while no demo account exists', async () => {
    demoMode(true);
    for (const role of ['superadmin', '', { $ne: null }, ['admin']]) {
      expect((await api().post('/api/auth/demo-login').send({ role })).status).toBe(400);
    }
    expect((await api().post('/api/auth/demo-login').send({})).status).toBe(400);
    await makeUser('admin');
    expect((await api().post('/api/auth/demo-login').send({ role: 'admin' })).status).toBe(503);
  });

  test('on the demo instance: no password login, signup or password reset (for any account)', async () => {
    demoMode(true);
    const real = await makeUser('admin');
    expectBlocked(await api().post('/api/auth/login').send({ email: real.email, password: PASSWORD }));
    expectBlocked(await api().post('/api/auth/signup').send({ name: 'Visitor', email: 'visitor@example.com', password: 'secret123' }));
    expectBlocked(await api().post('/api/auth/forgot-password').send({ email: real.email }));
    expectBlocked(await api().post('/api/auth/reset-password').send({ email: real.email, code: '123456', newPassword: 'whatever1' }));
    expect((await api().get('/api/auth/password-reset')).body.enabled).toBe(false);
    expect(await User.countDocuments({ email: 'visitor@example.com' })).toBe(0);
  });

  test('a demo account never signs in with a password, and never gets a reset code (production too)', async () => {
    const d = await demoUser('student');
    const r = await api().post('/api/auth/login').send({ email: d.email, password: PASSWORD });
    expect(r.status).toBe(401);
    expect(r.body.message).toBe('Invalid email or password');

    const sent = [];
    const smtp = { SMTP_HOST: 'smtp.test.invalid', SMTP_PORT: '587', SMTP_USER: 'u', SMTP_PASS: 'p', MAIL_FROM: 'LibVerse <no-reply@example.com>' };
    Object.assign(process.env, smtp);
    setTransportForTests({ sendMail: async (m) => { sent.push(m); return { messageId: 'fake' }; } });
    try {
      const f = await api().post('/api/auth/forgot-password').send({ email: d.email });
      expect(f.status).toBe(200); // the usual answer: nothing tells the account apart
      await new Promise((done) => setTimeout(done, 100));
      expect(sent).toHaveLength(0);
      expect(await PasswordResetCode.countDocuments({ userId: d._id })).toBe(0);
    } finally {
      Object.keys(smtp).forEach((k) => delete process.env[k]);
      setTransportForTests(null);
    }
  });

  test('isDemo can never be set through the API', async () => {
    const signup = await api().post('/api/auth/signup').send({ name: 'New Member', email: 'new.member@example.com', password: 'secret123', isDemo: true });
    expect(signup.status).toBe(201);
    expect(signup.body.user.isDemo).toBe(false);
    const admin = await makeUser('admin');
    const created = await as(admin).post('/api/admin/users').send({ name: 'Made By Admin', email: 'made@example.com', password: 'secret123', role: 'student', isDemo: true });
    expect(created.status).toBe(201);
    const target = await makeUser('student');
    expect((await as(admin).put(`/api/admin/users/${target._id}`).send({ name: 'Renamed', isDemo: true })).status).toBe(200);
    expect((await as(target).put('/api/auth/update-profile').send({ name: 'Self Renamed', isDemo: true })).status).toBe(200);
    expect(await User.countDocuments({ isDemo: true })).toBe(0);
  });
});

describe('demo accounts: destructive actions are refused', () => {
  test('every blocked action answers 403 "Disabled in demo mode" and changes nothing', async () => {
    const [student, librarian, admin] = [await demoUser('student'), await demoUser('librarian'), await demoUser('admin')];
    const other = await demoUser('student');
    const book = await makeBook({ totalCopies: 2 });
    const csv = 'title,author,genre\nImported,Someone,Fiction';
    const cases = [
      [student, 'put', '/api/auth/change-password', { currentPassword: PASSWORD, newPassword: 'brandnew1' }],
      [admin, 'put', '/api/auth/change-password', { currentPassword: PASSWORD, newPassword: 'brandnew1' }],
      [student, 'put', '/api/auth/update-profile', { profileImage: 'https://example.com/me.png' }],
      [student, 'post', '/api/profile/upload-avatar', {}],
      [admin, 'post', '/api/admin/users', { name: 'Someone', email: 'someone@example.com', password: 'secret123', role: 'admin' }],
      [admin, 'put', `/api/admin/users/${other._id}`, { role: 'admin' }],
      [admin, 'put', `/api/admin/users/${other._id}`, { email: 'changed@example.com' }],
      [admin, 'put', `/api/admin/users/${other._id}`, { isActive: false }],
      [admin, 'put', `/api/admin/users/${other._id}`, { password: 'takeover1' }],
      [librarian, 'put', `/api/admin/users/${other._id}`, { name: 'Renamed' }],
      [admin, 'delete', `/api/admin/users/${other._id}`],
      [admin, 'post', '/api/admin/create-admin', { name: 'X', email: 'x@example.com', password: 'secret123' }],
      [admin, 'post', `/api/admin/users/${other._id}/reissue-card`],
      [librarian, 'post', '/api/admin/send-reminders'],
      [librarian, 'post', '/api/books', { title: 'New', author: 'A', genre: 'Fiction', totalCopies: 1 }],
      [admin, 'put', `/api/books/${book._id}`, { title: 'Defaced' }],
      [librarian, 'delete', `/api/books/${book._id}`],
      [admin, 'delete', `/api/books/${book._id}`],
      [librarian, 'post', '/api/books/import', { csv }],
      [admin, 'post', '/api/books/upload-cover', {}],
    ];
    for (const [who, method, url, body] of cases) {
      const r = await as(who)[method](url).send(body);
      try { expectBlocked(r); } catch (e) { throw new Error(`${method.toUpperCase()} ${url} ${JSON.stringify(body || {})}: ${r.status}`); }
    }
    const after = await User.findById(other._id).select('+password').lean();
    expect(after).toMatchObject({ role: 'student', isActive: true, email: other.email, name: other.name, cardVersion: 1 });
    expect(await (await User.findById(student._id).select('+password')).matchPassword(PASSWORD)).toBe(true);
    expect(await Book.findById(book._id).lean()).toMatchObject({ title: book.title, isActive: true });
    expect(await Book.countDocuments()).toBe(1);
    expect(await User.countDocuments()).toBe(4);
  });

  test('the same actions still work for non-demo staff', async () => {
    const admin = await makeUser('admin');
    const target = await makeUser('student');
    const book = await makeBook();
    expect((await as(admin).put(`/api/admin/users/${target._id}`).send({ role: 'librarian' })).status).toBe(200);
    expect((await as(admin).put(`/api/books/${book._id}`).send({ title: 'Edited' })).status).toBe(200);
    expect((await as(admin).delete(`/api/books/${book._id}`)).status).toBe(200);
    expect((await as(admin).post('/api/books/import').send({ csv: 'title,author,genre\nImported,Someone,Fiction' })).status).toBe(201);
    expect((await as(admin).put('/api/auth/change-password').send({ currentPassword: PASSWORD, newPassword: 'brandnew1' })).status).toBe(200);
  });
});

describe('demo accounts: the normal flows work', () => {
  test('request -> approve -> return -> pay (generated receipt) -> verify; reject; waive', async () => {
    const [s, lib, admin] = [await demoUser('student'), await demoUser('librarian'), await demoUser('admin')];
    const book = await makeBook({ totalCopies: 3 });
    const req = await as(s).post('/api/transactions/issue').send({ bookId: book._id });
    expect(req.status).toBe(201);
    expect((await as(lib).put(`/api/transactions/${req.body.transaction._id}/approve`)).status).toBe(200);
    expect((await as(s).put(`/api/transactions/${req.body.transaction._id}/renew`)).status).toBe(200);
    expect((await as(s).put(`/api/transactions/${req.body.transaction._id}/return`)).status).toBe(200);
    expect((await as(lib).put(`/api/transactions/${req.body.transaction._id}/approve-return`)).status).toBe(200);

    const late = await makeLoan(s, await makeBook(), { dueInDays: -3, issuedDaysAgo: 17 });
    expect((await as(s).put(`/api/transactions/${late._id}/return`)).status).toBe(200);
    const pay = await as(s).put(`/api/transactions/${late._id}/submit-payment`).send({ paymentScreenshot: PNG });
    expect(pay.status).toBe(200);
    const stored = await Transaction.findById(late._id).lean();
    expect(stored.paymentScreenshot).toMatch(/^data:image\/png;base64,/);
    expect(stored.paymentScreenshot).not.toBe(PNG); // the visitor's image is never kept
    const shot = await as(lib).get(`/api/transactions/${late._id}/payment-screenshot`);
    expect(shot.status).toBe(200);
    expect((await as(admin).put(`/api/transactions/${late._id}/approve-payment`)).status).toBe(200);

    const second = await as(s).post('/api/transactions/issue').send({ bookId: (await makeBook())._id });
    expect((await as(admin).put(`/api/transactions/${second.body.transaction._id}/reject`)).status).toBe(200);

    const fined = await makeLoan(s, await makeBook(), { dueInDays: -2, issuedDaysAgo: 16 });
    expect((await as(s).put(`/api/transactions/${fined._id}/return`)).status).toBe(200);
    expect((await as(lib).post(`/api/transactions/${fined._id}/waive`).send({ amount: 2 * FINE_PER_DAY, reason: 'Demo walkthrough waiver' })).status).toBe(200);
  });

  test('reservations, wishlist, reviews, notifications, profile name and onboarding', async () => {
    const [s, other] = [await demoUser('student'), await makeUser('student')];
    const out = await makeBook({ totalCopies: 1 });
    await makeLoan(other, out);
    const reserve = await as(s).post('/api/reservations').send({ bookId: out._id });
    expect(reserve.status).toBe(201);
    expect((await as(s).get('/api/reservations/me')).status).toBe(200);
    expect((await as(s).delete(`/api/reservations/${reserve.body.reservation._id}`)).status).toBe(200);
    expect((await as(s).post(`/api/wishlist/${out._id}`)).status).toBeLessThan(300);
    expect((await as(s).post(`/api/books/${out._id}/review`).send({ rating: 5, comment: 'Great demo read' })).status).toBe(201);
    await Notification.create({ userId: s._id, role: 'student', type: 'NEW_RECOMMENDATIONS', title: 'Hi', message: 'Hello' });
    expect((await as(s).get('/api/notifications')).status).toBe(200);
    expect((await as(s).put('/api/notifications/read-all')).status).toBe(200);
    expect((await as(s).put('/api/auth/update-profile').send({ name: 'Demo Student' })).status).toBe(200);
    expect((await as(s).put('/api/auth/update-favorite-genres').send({ favoriteGenres: ['Fiction', 'Science'] })).status).toBe(200);
  });

  test('staff: dashboards, analytics, reports, audit log, users, import preview and the QR desk', async () => {
    const [lib, admin, s] = [await demoUser('librarian'), await demoUser('admin'), await demoUser('student')];
    const book = await makeBook({ totalCopies: 2 });
    for (const url of ['/api/admin/dashboard', '/api/admin/analytics', '/api/admin/reports', '/api/admin/users', '/api/admin/pending-requests', `/api/admin/users/${s._id}/overview`, '/api/books/summary', '/api/transactions', '/api/reservations']) {
      expect([url, (await as(lib).get(url)).status]).toEqual([url, 200]);
    }
    expect((await as(admin).get('/api/admin/audit')).status).toBe(200);
    expect((await as(lib).post('/api/books/import/preview').send({ csv: 'title,author,genre\nPreviewed,Someone,Fiction' })).status).toBe(200);
    expect(await Book.countDocuments({ title: 'Previewed' })).toBe(0);

    const card = (await as(lib).get(`/api/admin/users/${s._id}/card`)).body.card;
    expect((await as(lib).get(`/api/admin/desk/resolve?code=${encodeURIComponent(card.code)}`)).status).toBe(200);
    const issue = await as(lib).post('/api/admin/desk/issue').send({ userId: s._id, bookId: book._id });
    expect(issue.status).toBe(201);
    expect((await as(lib).post('/api/admin/desk/return').send({ transactionId: issue.body.transaction._id })).status).toBe(200);
    expect(await stockIsConsistent()).toEqual([]);
  });
});

describe('demo write cap (per account)', () => {
  test('after the cap a demo account gets 429; reads, other demo accounts and real accounts are not affected', async () => {
    process.env.RATE_LIMIT_DEMO_WRITES = '3';
    const [d1, d2, real] = [await demoUser('student'), await demoUser('student'), await makeUser('student')];
    const write = (who) => as(who).put('/api/notifications/read-all');
    for (let i = 0; i < 3; i++) expect((await write(d1)).status).toBe(200);
    const capped = await write(d1);
    expect(capped.status).toBe(429);
    expect(capped.body.message).toMatch(/Too many changes from this demo account/);
    expect((await as(d1).get('/api/notifications')).status).toBe(200);
    expect((await write(d2)).status).toBe(200);
    for (let i = 0; i < 5; i++) expect((await write(real)).status).toBe(200);
  });
});

describe('scripts/resetDemo.js', () => {
  const GENRES = ['Programming', 'Computer Science', 'AI & Machine Learning', 'Fiction', 'Psychology', 'Self-Help', 'History', 'Biography',
    'Non-Fiction', 'Finance', 'Business', 'Startup', 'Science', 'Technology', 'Database', 'Cyber Security', 'Networking', 'Motivation'];
  const catalogue = async (n = 60) => {
    for (let i = 0; i < n; i++) await makeBook({ genre: GENRES[i % GENRES.length], totalCopies: 3 });
  };
  const run = (opts) => resetDemo({ uri: process.env.MONGODB_URI, ...opts });

  test('dry run changes nothing; needs demo accounts (or --bootstrap) and a catalogue', async () => {
    await expect(run({ apply: true, bootstrap: true })).rejects.toThrow(/at least 20/);
    await catalogue();
    await expect(run({ apply: true })).rejects.toThrow(/No demo accounts/);
    const dry = await run({ bootstrap: true });
    expect(dry.mode).toMatch(/dry run/);
    expect(dry.created.accounts).toBe(28);
    expect(await User.countDocuments()).toBe(0);
    expect(await Transaction.countDocuments()).toBe(0);
  });

  test('refuses any database not named libverse_demo (outside Jest test databases)', async () => {
    const other = process.env.MONGODB_URI.replace(/\/[^/?]+(\?|$)/, '/libverse_not_demo$1');
    await expect(run({ uri: other, apply: true, bootstrap: true })).rejects.toThrow(/only runs on "libverse_demo"/);
  });

  test('bootstrap, visitor activity, reset: demo data back to fresh, real accounts untouched, old sessions end', async () => {
    await catalogue();
    // A real member with a loan, a review, a notification and an avatar file
    const real = await makeUser('student');
    const realBook = await Book.findOne().sort({ _id: -1 });
    const realLoan = await makeLoan(real, realBook);
    await Review.create({ userId: real._id, bookId: realBook._id, rating: 4, comment: 'Real review' });
    await Notification.create({ userId: real._id, role: 'student', type: 'BOOK_ISSUED', title: 'Real', message: 'Real note' });
    const fileId = await saveFile(Buffer.from('real avatar'), { filename: 'a.png', contentType: 'image/png', metadata: { kind: 'avatar', userId: real._id } });

    const first = await run({ apply: true, bootstrap: true });
    expect(first.deleted.accounts).toBe(0);
    expect(first.created.accounts).toBe(28);
    expect(await User.countDocuments({ isDemo: true })).toBe(28);
    expect(await stockIsConsistent()).toEqual([]);
    const fresh = { tx: await Transaction.countDocuments({ userId: { $ne: real._id } }), res: await Reservation.countDocuments() };

    // A visitor signs in and leaves a mark
    demoMode(true);
    const login = await api().post('/api/auth/demo-login').send({ role: 'student' });
    expect(login.status).toBe(200);
    const token = login.body.token;
    const demoStudent = await User.findById(login.body.user._id);
    expect(demoStudent.name).toBe('Aarav Sharma');
    const reviewed = await Review.distinct('bookId', { userId: demoStudent._id });
    const target = await Book.findOne({ _id: { $nin: [...reviewed, realBook._id] } });
    const review = await api().post(`/api/books/${target._id}/review`).set('Authorization', `Bearer ${token}`).send({ rating: 1, comment: 'Visitor review' });
    expect(review.status).toBe(201);
    const visit = { body: { transaction: await Transaction.create({ userId: demoStudent._id, bookId: target._id, status: 'pending', issueDate: new Date(), dueDate: new Date(Date.now() + 14 * 864e5) }) } };

    const second = await run({ apply: true });
    expect(second.deleted.accounts).toBe(28);
    expect(second.created.accounts).toBe(28);
    expect(await Transaction.countDocuments({ _id: visit.body.transaction._id })).toBe(0);
    expect(await Review.countDocuments({ comment: 'Visitor review' })).toBe(0);
    expect(await Transaction.countDocuments({ userId: { $ne: real._id } })).toBe(fresh.tx);
    expect(await Reservation.countDocuments()).toBe(fresh.res);
    expect(await stockIsConsistent()).toEqual([]);

    // The old demo session is over; a new click works
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`)).status).toBe(401);
    expect((await api().post('/api/auth/demo-login').send({ role: 'student' })).status).toBe(200);

    // The real member kept everything
    expect(await User.findById(real._id).lean()).toMatchObject({ email: real.email, isDemo: false });
    expect(await Transaction.findById(realLoan._id).lean()).toMatchObject({ status: 'issued' });
    expect(await Review.countDocuments({ userId: real._id })).toBe(1);
    expect(await Notification.countDocuments({ userId: real._id })).toBe(1);
    expect(await findFile(fileId)).not.toBeNull();
    // New real accounts never get a demo Library ID
    const demoIds = (await User.find({ isDemo: true }).select('libraryId').lean()).map((u) => u.libraryId);
    demoMode(false);
    const signup = await api().post('/api/auth/signup').send({ name: 'After Reset', email: 'after.reset@example.com', password: 'secret123' });
    expect(signup.status).toBe(201);
    expect(demoIds).not.toContain(signup.body.user.libraryId);
  });

  test('refuses (and changes nothing) when a non-demo account uses a demo email', async () => {
    await catalogue();
    await run({ apply: true, bootstrap: true });
    const before = await Transaction.countDocuments();
    await User.updateOne({ email: 'diya.patel@example.com' }, { $set: { isDemo: false } });
    await expect(run({ apply: true })).rejects.toThrow(/non-demo account/);
    expect(await Transaction.countDocuments()).toBe(before);
    expect(await User.countDocuments({ isDemo: true })).toBe(27);
  });

  test('two resets at once: the second is refused by the lock', async () => {
    await catalogue();
    await run({ apply: true, bootstrap: true });
    const results = await Promise.allSettled([run({ apply: true }), run({ apply: true })]);
    const refused = results.filter((r) => r.status === 'rejected');
    expect(results.filter((r) => r.status === 'fulfilled').length).toBeGreaterThanOrEqual(1);
    refused.forEach((r) => expect(r.reason.message).toMatch(/Another demo reset is running/));
    expect(await User.countDocuments({ isDemo: true })).toBe(28);
    expect(await stockIsConsistent()).toEqual([]);
    await mongoose.connection.db.collection('joblocks').deleteMany({});
  });
});
