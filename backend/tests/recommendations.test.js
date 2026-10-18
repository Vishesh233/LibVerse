// "Picked for you": AI service up / unconfigured / down / slow / untrained, retraining, fallback.
// A small fake AI service stands in for ai-service (its own ranking is tested with pytest).
const http = require('http');
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan } = require('./helpers');
const recommendationService = require('../services/recommendationService');

const TOKEN = 'fake-ai-token';
const fake = {
  mode: 'up', // up | untrained | slow | error
  trained: null, // the last /api/train body
  trainCalls: 0,
  lastRecommend: null,
  ranking: () => [],
};
let server; let port;

const startFake = () => new Promise((resolve) => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const send = (status, json) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(json)); };
      if (req.headers['x-service-token'] !== TOKEN) return send(401, { error: 'Unauthorized' });
      const data = body ? JSON.parse(body) : {};
      if (req.url === '/api/train') {
        fake.trainCalls += 1;
        fake.trained = data;
        if (fake.mode === 'untrained') fake.mode = 'up';
        return send(200, { success: true, trained: data.books.length });
      }
      if (req.url === '/api/recommend') {
        fake.lastRecommend = data;
        if (fake.mode === 'untrained') return send(409, { error: 'not trained' });
        if (fake.mode === 'error') return send(500, { error: 'boom' });
        if (fake.mode === 'slow') return setTimeout(() => send(200, { recommendations: fake.ranking(data) }), 4000);
        return send(200, { success: true, recommendations: fake.ranking(data) });
      }
      return send(404, {});
    });
  });
  server.listen(0, '127.0.0.1', () => { port = server.address().port; resolve(); });
});

const until = async (fn, ms = 5000) => {
  const t = Date.now();
  while (Date.now() - t < ms) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 50)); }
  return false;
};

let student; let lib; let read; let similar; let history1; let history2; let onLoan;
beforeAll(async () => { await connect(); await startFake(); });
afterAll(async () => { await new Promise((r) => server.close(r)); await disconnect(); });
beforeEach(async () => {
  await reset();
  Object.assign(fake, { mode: 'up', trained: null, trainCalls: 0, lastRecommend: null });
  process.env.AI_SERVICE_URL = `http://127.0.0.1:${port}`;
  process.env.AI_SERVICE_TOKEN = TOKEN;
  student = await makeUser('student', { favoriteGenres: ['History'] });
  lib = await makeUser('librarian');
  read = await makeBook({ title: 'Learning Python', genre: 'Technology' });
  similar = await makeBook({ title: 'Fluent Python', genre: 'Technology' });
  history1 = await makeBook({ title: 'Sapiens', genre: 'History', rating: 4.8 });
  history2 = await makeBook({ title: 'The Silk Roads', genre: 'History', rating: 4.5 });
  onLoan = await makeBook({ title: 'On Loan Now', genre: 'History', rating: 5 });
  await makeLoan(student, read, { status: 'returned', returnDate: new Date() });
  await makeLoan(student, onLoan);
  fake.ranking = () => [
    { id: String(similar._id), score: 0.6, reason: 'Because you read Learning Python', basis: 'content' },
    { id: String(history2._id), score: 0.01, reason: 'Popular in History', basis: 'genre' },
    { id: 'not-an-object-id', score: 0.01, reason: 'x', basis: 'genre' },
  ];
});
afterEach(() => {
  delete process.env.AI_SERVICE_URL;
  delete process.env.AI_SERVICE_TOKEN;
});

const picks = () => as(student).get('/api/books/recommendations');

test('service up: AI ranking with reasons, filled from the fallback, read/on-loan books never suggested', async () => {
  const r = await picks();
  expect(r.status).toBe(200);
  expect(r.body.source).toBe('ai');
  const recs = r.body.recommendations;
  expect(recs[0]).toMatchObject({ title: 'Fluent Python', recommendationReason: 'Because you read Learning Python', recommendationSource: 'ai' });
  expect(recs[1]).toMatchObject({ title: 'The Silk Roads', recommendationReason: 'Popular in History', recommendationSource: 'ai' });
  // The rest is the MongoDB fallback, with its own reasons
  expect(recs.slice(2).every((b) => b.recommendationSource === 'fallback' && b.recommendationReason)).toBe(true);
  expect(recs.map((b) => b.title)).not.toEqual(expect.arrayContaining(['Learning Python']));
  expect(recs.map((b) => b.title)).not.toContain('On Loan Now');
  expect(typeof recs[0].availableCopies).toBe('number');

  // What the backend sent: history, favourite genres, exclusions
  expect(fake.lastRecommend).toEqual({
    readIds: expect.arrayContaining([String(read._id), String(onLoan._id)]),
    favouriteGenres: ['History'],
    excludeIds: expect.arrayContaining([String(read._id), String(onLoan._id)]),
    limit: 6,
  });
});

test('unconfigured: MongoDB fallback, favourite genre first', async () => {
  delete process.env.AI_SERVICE_TOKEN;
  const r = await picks();
  expect(r.body.source).toBe('fallback');
  expect(r.body.recommendations[0]).toMatchObject({ title: 'Sapiens', recommendationReason: 'Top rated in History', recommendationSource: 'fallback' });
  expect(fake.lastRecommend).toBeNull();
});

test('service down or failing: fallback', async () => {
  fake.mode = 'error';
  expect((await picks()).body.source).toBe('fallback');
  process.env.AI_SERVICE_URL = 'http://127.0.0.1:1'; // nothing listens there
  const r = await picks();
  expect(r.status).toBe(200);
  expect(r.body.source).toBe('fallback');
});

test('slow service: answered from the fallback within the 1.5 s budget', async () => {
  fake.mode = 'slow';
  const t0 = Date.now();
  const r = await picks();
  expect(r.body.source).toBe('fallback');
  expect(Date.now() - t0).toBeLessThan(recommendationService.AI_TIMEOUT_MS + 1000);
});

test('untrained service (409): fallback now, retrained for the next request', async () => {
  fake.mode = 'untrained';
  expect((await picks()).body.source).toBe('fallback');
  expect(await until(() => fake.trainCalls === 1)).toBe(true);
  expect(fake.trained.books.map((b) => b.title)).toEqual(expect.arrayContaining(['Learning Python', 'Sapiens']));
  expect((await picks()).body.source).toBe('ai');
});

test('training payload: active books with text fields and borrow counts', async () => {
  await makeBook({ title: 'Hidden', isActive: false });
  expect(await recommendationService.trainNow()).toBe(5);
  const byTitle = Object.fromEntries(fake.trained.books.map((b) => [b.title, b]));
  expect(byTitle.Hidden).toBeUndefined();
  expect(byTitle['Learning Python']).toEqual({ id: String(read._id), title: 'Learning Python', author: read.author, genre: 'Technology', description: read.description, popularity: 1 });
  expect(byTitle.Sapiens.popularity).toBe(0);
});

test('catalogue edits retrain once (debounced)', async () => {
  const body = { title: 'New Arrival', author: 'Someone', isbn: '9781111111111', genre: 'History', description: 'Fresh.', totalCopies: 1 };
  const created = await as(lib).post('/api/books').send(body);
  expect(created.status).toBe(201);
  await as(lib).put(`/api/books/${created.body.book._id}`).send({ description: 'Fresh, edited.' });
  expect(await until(() => fake.trainCalls >= 1)).toBe(true);
  await new Promise((r) => setTimeout(r, 300));
  expect(fake.trainCalls).toBe(1); // two edits, one training run
  expect(fake.trained.books.map((b) => b.title)).toContain('New Arrival');

  await as(lib).delete(`/api/books/${created.body.book._id}`);
  expect(await until(() => fake.trainCalls === 2)).toBe(true);
});

test('startup training retries until the service answers', async () => {
  process.env.AI_SERVICE_URL = 'http://127.0.0.1:1'; // not up yet
  recommendationService.trainOnStartup();
  await new Promise((r) => setTimeout(r, 300));
  expect(fake.trainCalls).toBe(0);
  process.env.AI_SERVICE_URL = `http://127.0.0.1:${port}`; // the service comes up
  expect(await until(() => fake.trainCalls === 1, 4000)).toBe(true); // first retry after 2 s
});

test('no favourite genres and no history: empty list with the onboarding hint', async () => {
  const fresh = await makeUser('student', { favoriteGenres: [] });
  const r = await as(fresh).get('/api/books/recommendations');
  expect(r.body.recommendations).toEqual([]);
  expect(r.body.message).toMatch(/onboarding/);
});
