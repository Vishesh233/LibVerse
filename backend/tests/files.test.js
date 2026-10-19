// Uploaded images in GridFS: avatar and cover uploads, serving with caching, health check,
// and the migration of old backend/uploads files
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const mongoose = require('mongoose');
const { api, as, connect, disconnect, reset, makeUser, makeBook } = require('./helpers');
const User = require('../models/User');
const { migrate } = require('../scripts/migrateUploadsToGridFS');

let png;
beforeAll(async () => {
  await connect();
  png = await sharp({ create: { width: 60, height: 40, channels: 3, background: '#3355aa' } }).png().toBuffer();
});
afterAll(disconnect);
beforeEach(reset);

const fileCount = () => mongoose.connection.db.collection('uploads.files').countDocuments();

test('avatar upload: stored in GridFS, served with a long cache, the old one removed', async () => {
  const u = await makeUser('student');
  const first = await as(u).post('/api/profile/upload-avatar').attach('avatar', png, 'me.png');
  expect(first.status).toBe(200);
  expect(first.body.avatarUrl).toMatch(/^\/api\/files\/[a-f0-9]{24}$/);
  expect((await User.findById(u._id)).profileImage).toBe(first.body.avatarUrl);

  const file = await api().get(first.body.avatarUrl);
  expect(file.status).toBe(200);
  expect(file.headers['content-type']).toBe('image/png');
  expect(file.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  expect(file.headers['cross-origin-resource-policy']).toBe('cross-origin');
  expect(file.body.subarray(0, 4).toString('hex')).toBe('89504e47'); // a PNG
  const again = await api().get(first.body.avatarUrl).set('If-None-Match', file.headers.etag);
  expect(again.status).toBe(304);

  const fresh = await as(await User.findById(u._id)).post('/api/profile/upload-avatar').attach('avatar', png, 'me2.png');
  expect(fresh.status).toBe(200);
  expect((await api().get(first.body.avatarUrl)).status).toBe(404);
  expect((await api().get(fresh.body.avatarUrl)).status).toBe(200);
  expect(await fileCount()).toBe(1);
});

test('cover upload: staff only, returns a file path the book can store', async () => {
  const lib = await makeUser('librarian');
  const r = await as(lib).post('/api/books/upload-cover').attach('coverImage', png, 'cover.png');
  expect(r.status).toBe(200);
  expect(r.body.coverUrl).toMatch(/^\/api\/files\/[a-f0-9]{24}$/);
  const file = await api().get(r.body.coverUrl);
  expect(file.headers['content-type']).toBe('image/jpeg'); // covers are re-encoded as JPEG
  expect((await as(await makeUser('student')).post('/api/books/upload-cover').attach('coverImage', png, 'c.png')).status).toBe(403);
});

test('unknown or malformed file ids are 404', async () => {
  expect((await api().get('/api/files/not-an-id')).status).toBe(404);
  expect((await api().get(`/api/files/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
});

test('health reports the database connection', async () => {
  const r = await api().get('/api/health');
  expect(r.status).toBe(200);
  expect(r.body).toMatchObject({ status: 'ok', db: 'connected' });
  expect(r.headers['cache-control']).toBe('no-store');
});

test('migration copies used files once, rewrites only local /uploads URLs, lists unused files', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'libverse-uploads-'));
  try {
    fs.writeFileSync(path.join(dir, 'avatar-x-1.png'), png);
    fs.writeFileSync(path.join(dir, 'book-cover-unused.jpg'), png);
    fs.writeFileSync(path.join(dir, 'notes.txt'), 'not an image');
    const u = await makeUser('student', { profileImage: 'http://localhost:5001/uploads/avatar-x-1.png' });
    const remote = 'https://covers.openlibrary.org/b/isbn/9780306406157-L.jpg';
    const b = await makeBook({ coverImage: remote });

    const dry = await migrate(mongoose.connection.db, dir);
    expect(dry).toMatchObject({ files: 2, used: 1, copied: 1, documentsUpdated: 1, unused: ['book-cover-unused.jpg'] });
    expect(await fileCount()).toBe(0);
    expect((await User.findById(u._id)).profileImage).toMatch(/\/uploads\//);

    const applied = await migrate(mongoose.connection.db, dir, { apply: true });
    expect(applied).toMatchObject({ copied: 1, documentsUpdated: 1 });
    const url = (await User.findById(u._id)).profileImage;
    expect(url).toMatch(/^\/api\/files\/[a-f0-9]{24}$/);
    expect((await api().get(url)).status).toBe(200);
    expect((await mongoose.connection.db.collection('books').findOne({ _id: b._id })).coverImage).toBe(remote);

    // Again: nothing left that points at /uploads, nothing copied twice
    const second = await migrate(mongoose.connection.db, dir, { apply: true });
    expect(second).toMatchObject({ used: 0, copied: 0 });
    expect(await fileCount()).toBe(1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
