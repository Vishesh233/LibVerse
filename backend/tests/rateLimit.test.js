// Rate limits (a separate file: its own app instance and limiter memory)
const { api, as, connect, disconnect, reset, makeUser, PASSWORD } = require('./helpers');

beforeAll(async () => { await connect(); await reset(); });
afterAll(disconnect);

test('login: 10 failed attempts per 15 minutes, successful logins do not count', async () => {
  const u = await makeUser('student');
  for (let i = 0; i < 3; i++) {
    expect((await api().post('/api/auth/login').send({ email: u.email, password: PASSWORD })).status).toBe(200);
  }
  for (let i = 0; i < 10; i++) {
    expect((await api().post('/api/auth/login').send({ email: u.email, password: 'wrong' })).status).toBe(401);
  }
  const blocked = await api().post('/api/auth/login').send({ email: u.email, password: PASSWORD });
  expect(blocked.status).toBe(429);
  expect(blocked.body.message).toMatch(/Too many login attempts/);
  expect(blocked.headers).toHaveProperty('ratelimit-policy');
});

test('signup: 10 per hour', async () => {
  for (let i = 0; i < 10; i++) {
    const r = await api().post('/api/auth/signup').send({ name: `Rate ${i}`, email: `rate.${i}@example.com`, password: 'secret123' });
    expect(r.status).toBe(201);
  }
  expect((await api().post('/api/auth/signup').send({ name: 'Rate x', email: 'rate.x@example.com', password: 'secret123' })).status).toBe(429);
});

test('password change: 5 per 15 minutes', async () => {
  const u = await makeUser('student');
  for (let i = 0; i < 5; i++) {
    expect((await as(u).put('/api/auth/change-password').send({ currentPassword: 'wrong', newPassword: 'whatever1' })).status).toBe(401);
  }
  expect((await as(u).put('/api/auth/change-password').send({ currentPassword: 'wrong', newPassword: 'whatever1' })).status).toBe(429);
});

test('forgot password: 5 code emails per 15 minutes; entering a code: 10 per 15 minutes', async () => {
  // Counted even while email is not set up (the limit runs first)
  for (let i = 0; i < 5; i++) {
    expect((await api().post('/api/auth/forgot-password').send({ email: `nobody.${i}@example.com` })).status).toBe(503);
  }
  const blocked = await api().post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
  expect(blocked.status).toBe(429);
  expect(blocked.body.message).toMatch(/Too many password reset requests/);
  for (let i = 0; i < 10; i++) {
    expect((await api().post('/api/auth/reset-password').send({ email: 'nobody@example.com', code: '123456', newPassword: 'whatever1' })).status).toBe(503);
  }
  expect((await api().post('/api/auth/reset-password').send({ email: 'nobody@example.com', code: '123456', newPassword: 'whatever1' })).status).toBe(429);
});
