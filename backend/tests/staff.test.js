// Staff tools: find a student, Student 360, global search, user management, audit log;
// and null-safe handling of loans whose user (or book) was deleted
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, PASSWORD } = require('./helpers');
const User = require('../models/User');
const Book = require('../models/Book');
const AuditLog = require('../models/AuditLog');
const Transaction = require('../models/Transaction');
const { api } = require('./helpers');

let lib; let admin; let s1; let s2;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [lib, admin] = [await makeUser('librarian'), await makeUser('admin')];
  s1 = await makeUser('student', { name: 'Aarav Mehta' });
  s2 = await makeUser('student', { name: 'Aarav Kapoor' });
});

describe('find a student and Student 360', () => {
  test('lookup by Library ID is exact; by name is partial; never for students', async () => {
    const exact = await as(lib).get(`/api/admin/users/lookup?q=${s1.libraryId}`);
    expect(exact.status).toBe(200);
    expect(exact.body.exact).toBe(true);
    expect(exact.body.users).toHaveLength(1);
    const byName = await as(lib).get('/api/admin/users/lookup?q=Aarav');
    expect(byName.body.users).toHaveLength(2);
    expect((await as(s1).get('/api/admin/users/lookup?q=Aarav')).status).toBe(403);
    // Regex characters are matched literally (no 500, no match-all)
    expect((await as(lib).get('/api/admin/users/lookup?q=(')).status).toBe(200);
  });

  test('overview: profile, loans and fines; 404 for a bad id; staff only', async () => {
    await makeLoan(s1, await makeBook(), { dueInDays: -2 });
    const r = await as(lib).get(`/api/admin/users/${s1._id}/overview`);
    expect(r.status).toBe(200);
    expect(JSON.stringify(r.body)).toContain(s1.libraryId);
    expect((await as(lib).get('/api/admin/users/not-an-id/overview')).status).toBe(404);
    expect((await as(s2).get(`/api/admin/users/${s1._id}/overview`)).status).toBe(403);
  });

  test('global search finds books and (for staff) users', async () => {
    await makeBook({ title: 'The Unique Search Target' });
    const books = await as(s1).get('/api/admin/search?query=Unique%20Search');
    expect(books.status).toBe(200);
    expect(books.body.results.some((r) => r.type === 'book' && /Unique Search Target/.test(r.title))).toBe(true);
    const users = await as(lib).get('/api/admin/search?query=Aarav');
    expect(users.body.results.filter((r) => r.type === 'user').length).toBeGreaterThanOrEqual(2);
    const asStudent = await as(s1).get('/api/admin/search?query=Aarav');
    expect(asStudent.body.results.filter((r) => r.type === 'user')).toHaveLength(0);
    expect((await as(lib).get('/api/admin/search?query=(')).status).toBe(200);
  });
});

describe('user management', () => {
  test('edit, deactivate (toggle) and audit', async () => {
    const edit = await as(lib).put(`/api/admin/users/${s1._id}`).send({ name: 'Aarav M.' });
    expect(edit.status).toBe(200);
    expect((await User.findById(s1._id)).name).toBe('Aarav M.');
    expect((await as(lib).put(`/api/admin/users/${s1._id}`).send({ role: 'admin' })).status).toBe(403);

    const toggle = await as(lib).delete(`/api/admin/users/${s2._id}`);
    expect(toggle.status).toBe(200);
    expect((await User.findById(s2._id)).isActive).toBe(false);
    expect((await api().post('/api/auth/login').send({ email: s2.email, password: PASSWORD })).status).toBe(403);

    expect(await AuditLog.countDocuments({ action: 'user.update' })).toBeGreaterThanOrEqual(1);
    const log = await as(admin).get('/api/admin/audit');
    expect(log.status).toBe(200);
    expect(log.body.entries.length).toBeGreaterThan(0);
    expect(log.body.entries[0]).toEqual(expect.objectContaining({ action: expect.any(String), summary: expect.any(String) }));
  });

  test('admin can promote a librarian; librarians cannot touch admins', async () => {
    const l2 = await makeUser('librarian');
    expect((await as(lib).put(`/api/admin/users/${admin._id}`).send({ name: 'Renamed' })).status).toBe(403);
    expect((await as(lib).delete(`/api/admin/users/${admin._id}`)).status).toBe(403);
    expect((await as(admin).put(`/api/admin/users/${l2._id}`).send({ role: 'admin' })).status).toBe(200);
    expect((await User.findById(l2._id)).role).toBe('admin');
  });

  test('user list: search, role filter, pagination, no passwords', async () => {
    const r = await as(lib).get('/api/admin/users?search=Aarav');
    expect(r.status).toBe(200);
    expect(r.body.users).toHaveLength(2);
    expect(JSON.stringify(r.body)).not.toMatch(/"password"/);
  });
});

describe('deleted users and books (null-safe)', () => {
  beforeEach(async () => {
    const book = await makeBook({ title: 'Orphaned Loan Book' });
    await makeLoan(s1, book, { dueInDays: -3 });
    await makeLoan(s1, await makeBook(), { status: 'return_requested', fineAmount: 10, returnRequestedAt: new Date() });
    await Transaction.create({ userId: s1._id, bookId: book._id, status: 'pending', dueDate: new Date(Date.now() + 864e6) });
    await makeLoan(s2, await makeBook(), { dueInDays: 2 });
    // The student and one book disappear from the database (e.g. removed by hand)
    await User.deleteOne({ _id: s1._id });
    await Book.deleteOne({ _id: book._id });
  });

  test.each([
    '/api/admin/dashboard',
    '/api/admin/reports',
    '/api/admin/analytics',
    '/api/transactions?limit=100',
    '/api/transactions?status=pending',
    '/api/transactions?status=return_requested',
    '/api/admin/pending-requests',
    '/api/reservations',
    '/api/admin/audit',
  ])('%s still answers 200', async (url) => {
    const who = url.includes('audit') ? admin : lib;
    const r = await as(who).get(url);
    expect(r.status).toBe(200);
  });

  test('overview of the deleted user is 404, not 500', async () => {
    expect((await as(lib).get(`/api/admin/users/${s1._id}/overview`)).status).toBe(404);
  });

  test('reminders skip loans whose user is gone', async () => {
    const { runReminders } = require('../jobs/reminders');
    await expect(runReminders({ force: true })).resolves.toEqual(expect.objectContaining({ skipped: false }));
  });
});
