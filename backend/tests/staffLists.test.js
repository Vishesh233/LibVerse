// Server-side lists behind the staff pages: book sorting, low-stock filter and stock summary;
// user filters, sorting and loan/fine columns; one book's open loans
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan } = require('./helpers');
const User = require('../models/User');

let lib; let admin;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [lib, admin] = [await makeUser('librarian'), await makeUser('admin')];
});

describe('books', () => {
  let low; let out; let plenty; let one;
  beforeEach(async () => {
    low = await makeBook({ title: 'beta Book', author: 'Zed', genre: 'History', totalCopies: 5 }); // 1 of 5 after 4 loans
    out = await makeBook({ title: 'Alpha Book', author: 'Young', genre: 'Science', totalCopies: 1 }); // 0 of 1
    plenty = await makeBook({ title: 'Gamma Book', author: 'Xavier', genre: 'Fiction', totalCopies: 4 }); // 4 of 4
    one = await makeBook({ title: 'Delta Book', author: 'Walker', genre: 'Fiction', totalCopies: 1 }); // 1 of 1 (not low)
    for (let i = 0; i < 4; i++) await makeLoan(await makeUser('student'), low);
    await makeLoan(await makeUser('student'), out);
  });
  const titles = (r) => r.body.books.map((b) => b.title);

  test('sort by any column, both directions, case-insensitive', async () => {
    expect(titles(await as(lib).get('/api/books?sort=title&limit=10'))).toEqual(['Alpha Book', 'beta Book', 'Delta Book', 'Gamma Book']);
    expect(titles(await as(lib).get('/api/books?sort=-title&limit=10'))).toEqual(['Gamma Book', 'Delta Book', 'beta Book', 'Alpha Book']);
    expect(titles(await as(lib).get('/api/books?sort=author&limit=10'))).toEqual(['Delta Book', 'Gamma Book', 'Alpha Book', 'beta Book']);
    expect(titles(await as(lib).get('/api/books?sort=-available&limit=10'))[0]).toBe('Gamma Book');
    expect(titles(await as(lib).get('/api/books?sort=available&limit=10'))[0]).toBe('Alpha Book');
    // Paging a sorted list never repeats or skips a book
    const p1 = titles(await as(lib).get('/api/books?sort=genre&limit=2&page=1'));
    const p2 = titles(await as(lib).get('/api/books?sort=genre&limit=2&page=2'));
    expect(new Set([...p1, ...p2]).size).toBe(4);
    // Unknown sort keys are ignored
    expect((await as(lib).get('/api/books?sort=$where')).status).toBe(200);
  });

  test('low stock = a fifth or less on the shelf; out of stock; available', async () => {
    expect(titles(await as(lib).get('/api/books?availability=low&sort=title')).sort()).toEqual(['Alpha Book', 'beta Book']);
    expect(titles(await as(lib).get('/api/books?availability=unavailable'))).toEqual(['Alpha Book']);
    expect(titles(await as(lib).get('/api/books?availability=available&sort=title'))).toEqual(['beta Book', 'Delta Book', 'Gamma Book']);
  });

  test('stock summary (staff only)', async () => {
    await makeBook({ title: 'Removed', isActive: false, totalCopies: 9 });
    const r = await as(lib).get('/api/books/summary');
    expect(r.status).toBe(200);
    expect(r.body.summary).toEqual({ titles: 4, copies: 11, available: 6, issued: 5, held: 0, lowStock: 2, outOfStock: 1 });
    expect((await as(await makeUser('student')).get('/api/books/summary')).status).toBe(403);
  });

  test('one book\'s open loans (staff book page)', async () => {
    const r = await as(lib).get(`/api/transactions?bookId=${low._id}&status=open&limit=50`);
    expect(r.status).toBe(200);
    expect(r.body.transactions).toHaveLength(4);
    expect(r.body.transactions.every((t) => String(t.bookId._id) === String(low._id))).toBe(true);
    expect((await as(lib).get('/api/transactions?bookId=nope')).status).toBe(400);
    void plenty; void one;
  });
});

describe('users', () => {
  test('status filter, sort, open loans / overdue / fines owed per user', async () => {
    const a = await makeUser('student', { name: 'Zoya Khan' });
    const b = await makeUser('student', { name: 'aditya Rao' });
    await makeUser('student', { name: 'Old Account', isActive: false });
    await makeLoan(a, await makeBook(), { dueInDays: -2 });
    await makeLoan(a, await makeBook(), { status: 'return_requested', fineAmount: 25, fineWaived: 5 });
    await makeLoan(a, await makeBook(), { status: 'returned', fineAmount: 10, finePaid: true });

    const active = await as(lib).get('/api/admin/users?role=student&status=active&sort=name');
    expect(active.status).toBe(200);
    expect(active.body.users.map((u) => u.name)).toEqual(['aditya Rao', 'Zoya Khan']);
    const zoya = active.body.users.find((u) => u.name === 'Zoya Khan');
    expect(zoya).toMatchObject({ openLoans: 2, booksIssued: 1, overdueLoans: 1, finesOwed: 20 });
    expect(zoya).not.toHaveProperty('password');
    expect(zoya).not.toHaveProperty('tokenVersion');
    expect(active.body.users.find((u) => u.name === 'aditya Rao')).toMatchObject({ openLoans: 0, finesOwed: 0 });
    void b;

    const inactive = await as(lib).get('/api/admin/users?status=inactive');
    expect(inactive.body.users.map((u) => u.name)).toEqual(['Old Account']);

    const desc = await as(lib).get('/api/admin/users?role=student&status=active&sort=-name');
    expect(desc.body.users[0].name).toBe('Zoya Khan');
  });

  test('librarians never see admin accounts; admins see everyone', async () => {
    const forLib = await as(lib).get('/api/admin/users?limit=100');
    expect(forLib.body.users.some((u) => u.role === 'admin')).toBe(false);
    expect(forLib.body.total).toBe(forLib.body.users.length);
    expect((await as(lib).get('/api/admin/users?role=admin')).body.users).toHaveLength(0);
    const forAdmin = await as(admin).get('/api/admin/users?limit=100');
    expect(forAdmin.body.users.some((u) => u.role === 'admin')).toBe(true);
    expect(await User.countDocuments()).toBe(forAdmin.body.total);
  });
});
