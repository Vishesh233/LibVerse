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

test('the demo seed refuses every database except libverse_demo', async () => {
  const { seedDemo, dropDemo } = require('../scripts/seedDemo');
  await makeBook({ title: 'Must survive' });
  await expect(seedDemo(process.env.MONGODB_URI)).rejects.toThrow(/only writes to "libverse_demo"/);
  await expect(dropDemo(process.env.MONGODB_URI)).rejects.toThrow(/only "libverse_demo"/);
  expect(await Book.countDocuments({ title: 'Must survive' })).toBe(1);
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

test('render.yaml: demo API, production API and one shared AI service; health checks, env var names but no values', () => {
  const yaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf8');
  const services = yaml.split(/\r?\n {2}- type: web\r?\n/).slice(1);
  const byName = Object.fromEntries(services.map((s) => [s.match(/name: (\S+)/)[1], s]));
  expect(Object.keys(byName)).toEqual(['libverse-demo-api', 'libverse-api', 'libverse-ai']);
  const keys = (name) => [...byName[name].matchAll(/- key: (\w+)/g)].map((m) => m[1]);
  ['libverse-demo-api', 'libverse-api'].forEach((api) => {
    expect(byName[api]).toContain('healthCheckPath: /api/health');
    expect(keys(api)).toEqual(expect.arrayContaining(['MONGODB_URI', 'JWT_SECRET', 'CORS_ORIGINS', 'AI_SERVICE_URL', 'AI_SERVICE_TOKEN', 'AI_CATALOG']));
  });
  expect(keys('libverse-demo-api')).toContain('DEMO_MODE');
  expect(keys('libverse-demo-api')).not.toEqual(expect.arrayContaining(['GOOGLE_CLIENT_ID']));
  // The demo sends no email at all
  expect(keys('libverse-demo-api').filter((k) => k.startsWith('SMTP_') || k.startsWith('MAIL_') || k.startsWith('BREVO_'))).toEqual([]);
  expect(keys('libverse-api')).toEqual(expect.arrayContaining([
    'GOOGLE_CLIENT_ID', 'BREVO_API_KEY', 'MAIL_FROM', 'MAIL_FROM_NAME', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'JWT_EXPIRE',
  ]));
  expect(keys('libverse-api')).not.toContain('DEMO_MODE');
  expect(byName['libverse-ai']).toContain('healthCheckPath: /health');
  // The only fixed value is the AI service's Python version (not a secret), equal to ai-service/.python-version;
  // every other variable is a name only, filled in on Render
  const pythonVersion = fs.readFileSync(path.join(ROOT, 'ai-service', '.python-version'), 'utf8').trim();
  expect(pythonVersion).toMatch(/^3\.11\.\d+$/);
  expect(byName['libverse-ai']).toMatch(new RegExp(`- key: PYTHON_VERSION\\r?\\n\\s+value: "${pythonVersion.replace(/\./g, '\\.')}"`));
  expect(yaml.match(/^\s*value:/gm)).toHaveLength(1);
  expect(yaml.match(/^\s+- key: /gm).length).toBe(yaml.match(/^\s+sync: false$/gm).length + 1);
});

test('CI tests the AI service on the same Python minor as production', () => {
  const ci = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
  const pythonVersion = fs.readFileSync(path.join(ROOT, 'ai-service', '.python-version'), 'utf8').trim();
  expect(ci).toContain(`python-version: '${pythonVersion.split('.').slice(0, 2).join('.')}'`);
});

test('the demo reset workflow: every 6 hours, a secret for the URI, only resetDemo.js --apply', () => {
  const wf = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'demo-reset.yml'), 'utf8');
  expect(wf).toMatch(/cron: '30 \*\/6 \* \* \*'/);
  expect(wf).toContain('workflow_dispatch');
  expect(wf).toContain('DEMO_MONGODB_URI: ${{ secrets.DEMO_MONGODB_URI }}');
  expect(wf).toContain('node scripts/resetDemo.js --apply');
  expect(wf).not.toMatch(/mongodb(\+srv)?:\/\//);
});
