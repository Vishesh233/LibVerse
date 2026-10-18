const { api, as, connect, disconnect, reset, makeUser, tokenFor, PASSWORD } = require('./helpers');
const User = require('../models/User');

beforeAll(connect);
afterAll(disconnect);
beforeEach(reset);

const login = (email, password = PASSWORD) => api().post('/api/auth/login').send({ email, password });

describe('signup and login', () => {
  test('signup creates a student with a short sequential Library ID and returns a token', async () => {
    const a = await api().post('/api/auth/signup').send({ name: 'New Reader', email: 'new.reader@example.com', password: 'secret123' });
    expect(a.status).toBe(201);
    expect(a.body.token).toEqual(expect.any(String));
    expect(a.body.user.role).toBe('student');
    expect(a.body.user.libraryId).toMatch(/^LIB-\d{4,6}$/);
    expect(a.body.user).not.toHaveProperty('password');
    expect(a.body.user).not.toHaveProperty('tokenVersion');

    const b = await api().post('/api/auth/signup').send({ name: 'Second', email: 'second@example.com', password: 'secret123' });
    const n = (id) => Number(id.split('-')[1]);
    expect(n(b.body.user.libraryId)).toBe(n(a.body.user.libraryId) + 1);
  });

  test('signup ignores a requested role and rejects duplicates / missing fields', async () => {
    const r = await api().post('/api/auth/signup').send({ name: 'Sneaky', email: 'sneaky@example.com', password: 'secret123', role: 'admin' });
    expect(r.status).toBe(201);
    expect((await User.findOne({ email: 'sneaky@example.com' })).role).toBe('student');
    expect((await api().post('/api/auth/signup').send({ name: 'Sneaky', email: 'sneaky@example.com', password: 'secret123' })).status).toBe(400);
    expect((await api().post('/api/auth/signup').send({ email: 'x@example.com' })).status).toBe(400);
  });

  test('login: right password 200, wrong password 401, unknown email 401, deactivated 403', async () => {
    const u = await makeUser('student');
    const ok = await login(u.email);
    expect(ok.status).toBe(200);
    expect(ok.body.user.email).toBe(u.email);
    expect((await login(u.email, 'wrong-password')).status).toBe(401);
    expect((await login('nobody@example.com')).status).toBe(401);
    await User.updateOne({ _id: u._id }, { isActive: false });
    expect((await login(u.email)).status).toBe(403);
  });

  test('/me needs a valid token; a deactivated account is refused', async () => {
    const u = await makeUser('student');
    expect((await api().get('/api/auth/me')).status).toBe(401);
    expect((await api().get('/api/auth/me').set('Authorization', 'Bearer not-a-token')).status).toBe(401);
    expect((await as(u).get('/api/auth/me')).status).toBe(200);
    await User.updateOne({ _id: u._id }, { isActive: false });
    const r = await as(u).get('/api/auth/me');
    expect(r.status).toBe(403);
    expect(r.body.message).toBe('Account is deactivated');
  });

  test('a token for a user that no longer exists is refused', async () => {
    const u = await makeUser('student');
    const token = tokenFor(u);
    await User.deleteOne({ _id: u._id });
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`)).status).toBe(401);
  });
});

describe('tokenVersion: a password change ends older sessions', () => {
  test('old token stops working, the returned token works, login uses the new password', async () => {
    const u = await makeUser('student');
    const oldToken = (await login(u.email)).body.token;
    const other = (await login(u.email)).body.token; // a second device

    const wrong = await api().put('/api/auth/change-password').set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: 'not-it', newPassword: 'brandnew1' });
    expect(wrong.status).toBe(401);
    // A failed attempt changes nothing
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${oldToken}`)).status).toBe(200);

    const short = await api().put('/api/auth/change-password').set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: PASSWORD, newPassword: '123' });
    expect(short.status).toBe(400);

    const changed = await api().put('/api/auth/change-password').set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: PASSWORD, newPassword: 'brandnew1' });
    expect(changed.status).toBe(200);
    expect(changed.body.token).toEqual(expect.any(String));

    for (const t of [oldToken, other]) {
      const r = await api().get('/api/auth/me').set('Authorization', `Bearer ${t}`);
      expect(r.status).toBe(401);
    }
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${changed.body.token}`)).status).toBe(200);
    expect((await User.findById(u._id)).tokenVersion).toBe(1);
    expect((await login(u.email)).status).toBe(401);
    expect((await login(u.email, 'brandnew1')).status).toBe(200);
  });

  test('tokens without a version (issued before this feature) still work while tokenVersion is 0', async () => {
    const jwt = require('jsonwebtoken');
    const u = await makeUser('student');
    const legacy = jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${legacy}`)).status).toBe(200);
    await User.updateOne({ _id: u._id }, { $inc: { tokenVersion: 1 } });
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${legacy}`)).status).toBe(401);
  });
});

describe('role-based access', () => {
  test('students are kept out of staff and admin routes; librarians out of admin-only routes', async () => {
    const [s, l, a] = [await makeUser('student'), await makeUser('librarian'), await makeUser('admin')];
    const staffOnly = ['/api/admin/dashboard', '/api/admin/users', '/api/transactions', '/api/admin/reports', '/api/reservations'];
    for (const url of staffOnly) {
      expect((await as(s).get(url)).status).toBe(403);
      expect((await as(l).get(url)).status).toBe(200);
      expect((await as(a).get(url)).status).toBe(200);
    }
    expect((await as(l).get('/api/admin/audit')).status).toBe(403);
    expect((await as(a).get('/api/admin/audit')).status).toBe(200);
    expect((await as(l).post('/api/admin/create-admin').send({ name: 'X', email: 'x1@example.com', password: 'secret123' })).status).toBe(403);
    // Student-only routes
    expect((await as(l).post('/api/transactions/issue').send({ bookId: '000000000000000000000000' })).status).toBe(403);
    expect((await as(l).get('/api/auth/me/reading-stats')).status).toBe(403);
  });

  test('librarians create students only; admins can create staff; roles are validated', async () => {
    const [l, a] = [await makeUser('librarian'), await makeUser('admin')];
    const body = (role, n) => ({ name: `New ${role}`, email: `new.${role}.${n}@example.com`, password: 'secret123', role });
    expect((await as(l).post('/api/admin/users').send(body('student', 1))).status).toBe(201);
    expect((await as(l).post('/api/admin/users').send(body('librarian', 2))).status).toBe(403);
    expect((await as(l).post('/api/admin/users').send(body('admin', 3))).status).toBe(403);
    expect((await as(a).post('/api/admin/users').send(body('librarian', 4))).status).toBe(201);
    expect((await as(a).post('/api/admin/users').send(body('superadmin', 5))).status).toBe(400);
    expect((await as(a).post('/api/admin/users').send({ ...body('student', 6), password: '123' })).status).toBe(400);
  });

  test('the last active admin cannot deactivate or demote themselves', async () => {
    const a = await makeUser('admin');
    const r1 = await as(a).delete(`/api/admin/users/${a._id}`);
    expect(r1.status).toBeGreaterThanOrEqual(400);
    const r2 = await as(a).put(`/api/admin/users/${a._id}`).send({ role: 'librarian' });
    expect(r2.status).toBeGreaterThanOrEqual(400);
    expect((await User.findById(a._id)).role).toBe('admin');
    expect((await User.findById(a._id)).isActive).not.toBe(false);
  });
});

describe('HTTP security headers and CORS', () => {
  test('helmet headers with an app-compatible CSP', async () => {
    const r = await api().get('/api/health');
    expect(r.status).toBe(200);
    expect(r.headers['x-powered-by']).toBeUndefined();
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['cross-origin-resource-policy']).toBe('cross-origin');
    const csp = r.headers['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain('https://fonts.googleapis.com');
    expect(csp).toContain('https://fonts.gstatic.com');
    expect(csp).toMatch(/img-src [^;]*https:/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('upgrade-insecure-requests'); // not in development/test
  });

  test('CORS allows the configured origin only', async () => {
    const ok = await api().get('/api/health').set('Origin', 'http://localhost:3000');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    const evil = await api().get('/api/health').set('Origin', 'https://evil.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('the production CSP upgrades insecure requests and names the API origin', () => {
    const { cspHeader } = require('../config/security');
    const header = cspHeader({ api: ['https://api.example.com'], production: true });
    expect(header).toContain('upgrade-insecure-requests');
    expect(header).toMatch(/connect-src 'self' https:\/\/api\.example\.com/);
  });
});
