// Deployment helpers: catalogue export/import for a new database, the first admin, and the
// static host config (frontend/vercel.json, render.yaml) staying in line with the API
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { api, connect, disconnect, reset, makeBook } = require('./helpers');
const Book = require('../models/Book');
const User = require('../models/User');
const { exportBooks } = require('../scripts/exportCatalogue');
const { importBooks } = require('../scripts/importCatalogue');
const { createAdmin, passwordProblem } = require('../scripts/createAdmin');

const ROOT = path.join(__dirname, '..', '..');

beforeAll(connect);
afterAll(disconnect);
beforeEach(reset);

test('export: active books only, catalogue fields only, uploaded cover links left out', async () => {
  await makeBook({ title: 'B Book', isbn: '9780306406157', totalCopies: 3, imageUrl: 'https://covers.openlibrary.org/b/isbn/9780306406157-M.jpg', location: 'A-1' });
  await makeBook({ title: 'A Book', coverImage: '/api/files/0123456789abcdef01234567', totalCopies: 1 });
  await makeBook({ title: 'Removed', isActive: false });
  const { books, localCoversDropped } = await exportBooks(mongoose.connection.db);
  expect(books.map((b) => b.title)).toEqual(['A Book', 'B Book']);
  expect(localCoversDropped).toBe(1);
  expect(books[1]).toMatchObject({ isbn: '9780306406157', totalCopies: 3, location: 'A-1', imageUrl: expect.stringContaining('openlibrary') });
  expect(Object.keys(books[1])).not.toEqual(expect.arrayContaining(['_id', 'availableCopies', 'issuedCopies', 'createdAt']));
});

test('import: empty database only, fresh stock, nothing written on a dry run or with invalid rows', async () => {
  const rows = [
    { title: 'One', author: 'X', genre: 'Science', isbn: '9780306406157', totalCopies: 2 },
    { title: 'Two', author: 'Y', genre: 'History' },
  ];
  expect(await importBooks(mongoose, rows)).toMatchObject({ books: 2, copies: 3, inserted: 0, invalid: [] });
  expect(await Book.countDocuments()).toBe(0);

  const bad = await importBooks(mongoose, [...rows, { title: 'Bad', author: 'Z', genre: 'Poetry' }], { apply: true });
  expect(bad.invalid).toHaveLength(1);
  expect(bad.inserted).toBe(0);
  expect(await Book.countDocuments()).toBe(0);

  expect((await importBooks(mongoose, rows, { apply: true })).inserted).toBe(2);
  expect(await Book.findOne({ title: 'One' }).lean()).toMatchObject({ totalCopies: 2, availableCopies: 2, issuedCopies: 0, heldCopies: 0, isActive: true });
  await expect(importBooks(mongoose, rows, { apply: true })).rejects.toThrow(/already has books/);
});

test('export then import round-trips the catalogue', async () => {
  await makeBook({ title: 'Round', author: 'Trip', genre: 'Science', isbn: '9781593279929', totalCopies: 4, description: 'Kept.' });
  const { books } = await exportBooks(mongoose.connection.db);
  await reset();
  await importBooks(mongoose, books, { apply: true });
  expect(await Book.findOne({ isbn: '9781593279929' }).lean()).toMatchObject({ title: 'Round', description: 'Kept.', totalCopies: 4, availableCopies: 4 });
});

test('createAdmin: strong password, unique email, admin role with a Library ID', async () => {
  expect(passwordProblem('short1')).toMatch(/12 characters/);
  expect(passwordProblem('longpasswordnodigits')).toMatch(/number/);
  expect(passwordProblem('Long-enough-pass-1')).toBeNull();
  await expect(createAdmin({ name: 'Admin', email: 'nope', password: 'Long-enough-pass-1' })).rejects.toThrow(/valid email/);
  const admin = await createAdmin({ name: ' Head Librarian ', email: 'Head@Example.com', password: 'Long-enough-pass-1' });
  expect(admin.libraryId).toMatch(/^LIB-/);
  const stored = await User.findById(admin._id).select('+password').lean();
  expect(stored).toMatchObject({ name: 'Head Librarian', email: 'head@example.com', role: 'admin' });
  expect(stored.password).not.toContain('Long-enough');
  expect((await api().post('/api/auth/login').send({ email: 'head@example.com', password: 'Long-enough-pass-1' })).body.user.role).toBe('admin');
  await expect(createAdmin({ name: 'Again', email: 'head@example.com', password: 'Long-enough-pass-1' })).rejects.toThrow(/already exists/);
});

test('vercel.json: SPA fallback and the same CSP as the API (production)', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend', 'vercel.json'), 'utf8'));
  expect(vercel.rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }]);
  const all = vercel.headers.find((h) => h.source === '/(.*)').headers;
  const csp = all.find((h) => h.key === 'Content-Security-Policy').value;
  const { cspHeader } = require('../config/security');
  expect(csp).toBe(cspHeader({ api: ['https://*.onrender.com'], production: true }));
  expect(all.find((h) => h.key === 'Permissions-Policy').value).toContain('camera=(self)');
});

test('render.yaml: both services with health checks, env var names but no values', () => {
  const yaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf8');
  expect(yaml).toMatch(/name: libverse-api[\s\S]*healthCheckPath: \/api\/health/);
  expect(yaml).toMatch(/name: libverse-ai[\s\S]*healthCheckPath: \/health/);
  ['MONGODB_URI', 'JWT_SECRET', 'CORS_ORIGINS', 'AI_SERVICE_URL', 'AI_SERVICE_TOKEN', 'SMTP_HOST', 'MAIL_FROM'].forEach((k) => expect(yaml).toContain(`key: ${k}`));
  expect(yaml).not.toMatch(/^\s*value:/m);
  expect(yaml.match(/^\s+- key: /gm).length).toBe(yaml.match(/^\s+sync: false$/gm).length);
});
