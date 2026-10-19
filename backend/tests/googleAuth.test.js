// Sign in with Google: ID tokens signed with a test RSA key and checked by google-auth-library
// (signature, audience, issuer, expiry); linking rules, new students only, set-password,
// Google accounts' onboarding, connecting from Settings, and the Google-only reset email
// Many password and Google-link calls from one test IP: lift those limits for this file (set before the app loads)
process.env.RATE_LIMIT_PASSWORD_CHANGE = '100';
process.env.RATE_LIMIT_GOOGLE_LINK = '100';
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { api, as, connect, disconnect, reset, makeUser, PASSWORD } = require('./helpers');
const User = require('../models/User');
const PasswordResetCode = require('../models/PasswordResetCode');
const { setGoogleCertsForTests } = require('../services/googleAuth');
const { setTransportForTests } = require('../services/mailer');

const CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
const keyPair = () => crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const google = keyPair();
const stranger = keyPair();

let n = 0;
/** A Google ID token; override any claim, or sign with another key / key id */
const idToken = (claims = {}, { key = google.privateKey, kid = 'test-kid' } = {}) => {
  n += 1;
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({
    iss: 'https://accounts.google.com', aud: CLIENT_ID, sub: `1000000000${n}`, email: `google.user.${n}@example.com`,
    email_verified: true, name: `Google User ${n}`, iat: now, exp: now + 3600, ...claims,
  }, key, { algorithm: 'RS256', keyid: kid });
};
const signIn = (credential, extra = {}) => api().post('/api/auth/google').send({ credential, ...extra });

beforeAll(async () => {
  await connect();
  setGoogleCertsForTests({ 'test-kid': google.publicKey });
});
afterAll(async () => {
  setGoogleCertsForTests(null);
  delete process.env.GOOGLE_CLIENT_ID;
  await disconnect();
});
beforeEach(async () => {
  await reset();
  process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
  delete process.env.DEMO_MODE;
});

describe('availability', () => {
  test('off without GOOGLE_CLIENT_ID (404) and on the demo instance (403)', async () => {
    expect((await api().get('/api/auth/google')).body.enabled).toBe(true);
    delete process.env.GOOGLE_CLIENT_ID;
    expect((await api().get('/api/auth/google')).body.enabled).toBe(false);
    expect((await signIn(idToken())).status).toBe(404);
    process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
    process.env.DEMO_MODE = 'true';
    expect((await api().get('/api/auth/google')).body.enabled).toBe(false);
    const r = await signIn(idToken());
    expect(r.status).toBe(403);
    expect(r.body.message).toBe('Disabled in demo mode');
    expect(await User.countDocuments()).toBe(0);
  });
});

describe('token checks', () => {
  test('a valid token creates a student; the same Google account signs in again', async () => {
    const token = idToken({ sub: 'google-sub-1', email: 'Asha.Rao@Example.com', name: '  Asha   Rao ' });
    const first = await signIn(token);
    expect(first.status).toBe(201);
    expect(first.body.created).toBe(true);
    expect(first.body.user).toMatchObject({
      name: 'Asha Rao', email: 'asha.rao@example.com', role: 'student', isDemo: false, hasPassword: false,
      googleLinked: true, createdWith: 'google', isOnboardingCompleted: false, libraryId: expect.stringMatching(/^LIB-\d{4}$/),
    });
    expect(first.body.user).not.toHaveProperty('googleId');
    const stored = await User.findOne({ email: 'asha.rao@example.com' }).select('+googleId +password').lean();
    expect(stored).toMatchObject({ googleId: 'google-sub-1' });
    expect(stored.password).toBeUndefined();

    // Same Google account, even after its email changed at Google: identified by sub
    const again = await signIn(idToken({ sub: 'google-sub-1', email: 'new.address@example.com' }));
    expect(again.status).toBe(200);
    expect(again.body.user._id).toBe(String(stored._id));
    expect(await User.countDocuments()).toBe(1);

    const me = await api().get('/api/auth/me').set('Authorization', `Bearer ${again.body.token}`);
    expect(me.body.user).toMatchObject({ googleLinked: true, hasPassword: false });
    expect(me.body.user).not.toHaveProperty('googleId');
  });

  test('invalid, forged, foreign, expired or missing tokens -> 401 and nothing created', async () => {
    const now = Math.floor(Date.now() / 1000);
    const bad = [
      'not-a-jwt',
      '',
      undefined,
      idToken({}, { key: stranger.privateKey }), // signed by someone else
      idToken({}, { kid: 'unknown-kid' }),
      idToken({ aud: 'another-app.apps.googleusercontent.com' }),
      idToken({ iss: 'https://evil.example.com' }),
      idToken({ iat: now - 7200, exp: now - 3600 }), // expired an hour ago
      jwt.sign({ iss: 'https://accounts.google.com', aud: CLIENT_ID, sub: 'x', email: 'x@example.com', email_verified: true }, 'shared-secret', { algorithm: 'HS256', keyid: 'test-kid' }),
    ];
    for (const credential of bad) {
      const r = await signIn(credential);
      expect([String(credential).slice(0, 20), r.status]).toEqual([String(credential).slice(0, 20), 401]);
      expect(r.body.message).toBe('Google sign-in failed. Please try again.');
    }
    expect(await User.countDocuments()).toBe(0);
  });

  test('role and isDemo in the request are ignored: always a plain student', async () => {
    const r = await signIn(idToken(), { role: 'admin', isDemo: true, isActive: true, libraryId: 'LIB-0001' });
    expect(r.status).toBe(201);
    expect(r.body.user).toMatchObject({ role: 'student', isDemo: false });
    expect(r.body.user.libraryId).not.toBe('LIB-0001');
    // A token carrying such claims changes nothing either
    const r2 = await signIn(idToken({ role: 'admin', isDemo: true }));
    expect(r2.body.user).toMatchObject({ role: 'student', isDemo: false });
    expect(await User.countDocuments({ role: { $ne: 'student' } })).toBe(0);
  });
});

describe('linking to existing accounts', () => {
  test('a student with the same email is connected only when Google says the email is verified', async () => {
    const student = await makeUser('student');
    const unverified = await signIn(idToken({ email: student.email, email_verified: false }));
    expect(unverified.status).toBe(403);
    expect(unverified.body.message).toMatch(/not verified/);
    expect((await User.findById(student._id).select('+googleId').lean()).googleId).toBeUndefined();
    expect(await User.countDocuments()).toBe(1);

    const verified = await signIn(idToken({ sub: 'student-sub', email: student.email.toUpperCase() }));
    expect(verified.status).toBe(200);
    expect(verified.body).toMatchObject({ linked: true, user: { _id: String(student._id), googleLinked: true, hasPassword: true, createdWith: 'email' } });
    // The password still works
    expect((await api().post('/api/auth/login').send({ email: student.email, password: PASSWORD })).status).toBe(200);
  });

  test('an unverified Google email never creates an account either', async () => {
    expect((await signIn(idToken({ email_verified: false }))).status).toBe(403);
    expect((await signIn(idToken({ email_verified: 'true' }))).status).toBe(403);
    expect(await User.countDocuments()).toBe(0);
  });

  test('staff accounts are never connected automatically; demo and deactivated accounts never', async () => {
    const lib = await makeUser('librarian');
    const admin = await makeUser('admin');
    const demo = await makeUser('student', { isDemo: true });
    const inactive = await makeUser('student', { isActive: false });
    for (const u of [lib, admin]) {
      const r = await signIn(idToken({ email: u.email }));
      expect(r.status).toBe(409);
      expect(r.body.message).toMatch(/staff account/);
    }
    const d = await signIn(idToken({ email: demo.email }));
    expect(d.status).toBe(403);
    expect(d.body.message).toMatch(/Demo accounts/);
    expect((await signIn(idToken({ email: inactive.email }))).status).toBe(403);
    expect(await User.countDocuments({ googleLinkedAt: { $exists: true } })).toBe(0);
    expect(await User.countDocuments()).toBe(4);
  });

  test('an account already connected to another Google account is not taken over', async () => {
    const student = await makeUser('student');
    expect((await signIn(idToken({ sub: 'first-sub', email: student.email }))).status).toBe(200);
    const other = await signIn(idToken({ sub: 'second-sub', email: student.email }));
    expect(other.status).toBe(409);
    expect((await User.findById(student._id).select('+googleId').lean()).googleId).toBe('first-sub');
  });
});

describe('passwords for Google accounts', () => {
  test('no password login; set a first password once, then change it as usual', async () => {
    const r = await signIn(idToken({ email: 'pw.user@example.com' }));
    const user = await User.findById(r.body.user._id);
    const login = (password) => api().post('/api/auth/login').send({ email: 'pw.user@example.com', password });
    expect((await login('anything1')).status).toBe(401);
    expect((await login('')).status).toBe(400);

    const change = await as(user).put('/api/auth/change-password').send({ currentPassword: 'x', newPassword: 'brandnew1' });
    expect(change.status).toBe(400);
    expect(change.body.message).toMatch(/no password yet/);
    expect((await as(user).put('/api/auth/set-password').send({ newPassword: '123' })).status).toBe(400);

    const set = await as(user).put('/api/auth/set-password').send({ newPassword: 'first-pass-1' });
    expect(set.status).toBe(200);
    expect(set.body.user.hasPassword).toBe(true);
    expect((await login('first-pass-1')).status).toBe(200);
    expect((await as(user).put('/api/auth/set-password').send({ newPassword: 'other-pass-1' })).status).toBe(400);
    expect((await as(user).put('/api/auth/change-password').send({ currentPassword: 'first-pass-1', newPassword: 'second-pass-2' })).status).toBe(200);
  });

  test('forgot password: Google-only accounts get a "use Google" email and no code', async () => {
    const sent = [];
    const smtp = { SMTP_HOST: 'smtp.test.invalid', SMTP_PORT: '587', SMTP_USER: 'u', SMTP_PASS: 'p', MAIL_FROM: 'LibVerse <no-reply@example.com>' };
    Object.assign(process.env, smtp);
    setTransportForTests({ sendMail: async (m) => { sent.push(m); return { messageId: 'fake' }; } });
    try {
      const r = await signIn(idToken({ email: 'only.google@example.com' }));
      const f = await api().post('/api/auth/forgot-password').send({ email: 'only.google@example.com' });
      expect(f.status).toBe(200);
      expect(f.body.message).toMatch(/If an account uses that email/);
      for (let i = 0; i < 50 && !sent.length; i++) await new Promise((done) => setTimeout(done, 20));
      expect(sent).toHaveLength(1);
      expect(sent[0].subject).toBe('Signing in to LibVerse');
      expect(sent[0].text).toMatch(/Sign in with Google/);
      expect(sent[0].text).not.toMatch(/\d{6}/);
      expect(await PasswordResetCode.countDocuments({ userId: r.body.user._id })).toBe(0);
      expect((await api().post('/api/auth/reset-password').send({ email: 'only.google@example.com', code: '123456', newPassword: 'whatever1' })).status).toBe(400);
    } finally {
      Object.keys(smtp).forEach((k) => delete process.env[k]);
      setTransportForTests(null);
    }
  });
});

describe('onboarding', () => {
  const genres = ['Fiction', 'Science'];

  test('Google accounts must give a phone number; email signups are unchanged', async () => {
    const r = await signIn(idToken());
    const g = await User.findById(r.body.user._id);
    const missing = await as(g).put('/api/auth/complete-onboarding').send({ favoriteGenres: genres });
    expect(missing.status).toBe(400);
    expect(missing.body.message).toMatch(/phone/);
    expect((await as(g).put('/api/auth/complete-onboarding').send({ favoriteGenres: genres, phone: 'call me' })).status).toBe(400);
    const done = await as(g).put('/api/auth/complete-onboarding').send({ favoriteGenres: genres, phone: '+91 98765 43210', address: 'Pune' });
    expect(done.status).toBe(200);
    expect(done.body.user).toMatchObject({ phone: '+91 98765 43210', address: 'Pune', isOnboardingCompleted: true, libraryId: r.body.user.libraryId });

    const signup = await api().post('/api/auth/signup').send({ name: 'Email Member', email: 'email.member@example.com', password: 'secret123' });
    const e = await User.findById(signup.body.user._id);
    expect(signup.body.user.createdWith).toBe('email');
    expect((await as(e).put('/api/auth/complete-onboarding').send({ favoriteGenres: genres })).status).toBe(200);
  });
});

describe('connecting Google from Settings', () => {
  test('staff connect with their current password; then the Google button signs them in', async () => {
    const lib = await makeUser('librarian');
    const credential = idToken({ sub: 'librarian-sub', email: 'personal.address@example.com' });
    expect((await as(lib).post('/api/auth/google/link').send({ credential, currentPassword: 'wrong-one' })).status).toBe(401);
    expect((await as(lib).post('/api/auth/google/link').send({ credential: 'garbage', currentPassword: PASSWORD })).status).toBe(401);
    expect((await as(lib).post('/api/auth/google/link').send({ credential: idToken({ email_verified: false }), currentPassword: PASSWORD })).status).toBe(403);
    const ok = await as(lib).post('/api/auth/google/link').send({ credential, currentPassword: PASSWORD });
    expect(ok.status).toBe(200);
    expect(ok.body.user.googleLinked).toBe(true);
    expect((await as(lib).post('/api/auth/google/link').send({ credential, currentPassword: PASSWORD })).status).toBe(409);

    const viaGoogle = await signIn(idToken({ sub: 'librarian-sub', email: 'personal.address@example.com' }));
    expect(viaGoogle.status).toBe(200);
    expect(viaGoogle.body.user).toMatchObject({ _id: String(lib._id), role: 'librarian' });

    // That Google account cannot be connected to a second LibVerse account
    const other = await makeUser('admin');
    expect((await as(other).post('/api/auth/google/link').send({ credential: idToken({ sub: 'librarian-sub' }), currentPassword: PASSWORD })).status).toBe(409);
  });

  test('disconnect needs a password on the account; demo accounts cannot connect', async () => {
    const r = await signIn(idToken({ sub: 'g-only' }));
    const g = await User.findById(r.body.user._id);
    const noPassword = await as(g).delete('/api/auth/google/link').send({ currentPassword: '' });
    expect(noPassword.status).toBe(400);
    expect(noPassword.body.message).toMatch(/Set a password first/);
    await as(g).put('/api/auth/set-password').send({ newPassword: 'first-pass-1' });
    expect((await as(g).delete('/api/auth/google/link').send({ currentPassword: 'nope' })).status).toBe(401);
    const off = await as(g).delete('/api/auth/google/link').send({ currentPassword: 'first-pass-1' });
    expect(off.status).toBe(200);
    expect(off.body.user.googleLinked).toBe(false);
    expect((await User.findById(g._id).select('+googleId').lean()).googleId).toBeUndefined();

    const demo = await makeUser('student', { isDemo: true });
    const blocked = await as(demo).post('/api/auth/google/link').send({ credential: idToken(), currentPassword: PASSWORD });
    expect(blocked.status).toBe(403);
    expect(blocked.body.message).toBe('Disabled in demo mode');
  });
});
