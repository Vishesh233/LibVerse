// Sign-up email verification with a fake Brevo API (nothing leaves the machine), the accounts that
// are verified from the start (Google, admin-created) and the migration for existing accounts.
// Rate limits for these endpoints are tested in rateLimit.test.js; here they are raised.
process.env.RATE_LIMIT_SIGNUP = '1000';
process.env.RATE_LIMIT_LOGIN = '1000';
process.env.RATE_LIMIT_VERIFY_EMAIL = '1000';
process.env.RATE_LIMIT_RESEND_VERIFICATION = '1000';
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { api, as, connect, disconnect, reset, makeUser } = require('./helpers');
const User = require('../models/User');
const EmailCode = require('../models/EmailCode');
const { setFetchForTests } = require('../services/mailer');
const { setGoogleCertsForTests } = require('../services/googleAuth');
const { createAdmin } = require('../scripts/createAdmin');
const { markEmailsVerified } = require('../scripts/markEmailsVerified');

const BREVO = { BREVO_API_KEY: 'test-brevo-key-not-real', MAIL_FROM: 'no-reply@example.com' };
const sent = [];
const fakeFetch = async (url, options) => { sent.push(JSON.parse(options.body)); return { ok: true, status: 201 }; };
const nextMail = async () => {
  for (let i = 0; i < 50 && !sent.length; i++) await new Promise((r) => setTimeout(r, 20));
  return sent.shift();
};
const codeIn = (mail) => mail.textContent.match(/code is (\d{6})/)[1];
const quiet = () => new Promise((r) => setTimeout(r, 100));

let n = 0;
const newMember = () => { n += 1; return { name: `New Member ${n}`, email: `new.member.${n}@example.com`, password: 'secret123' }; };
const signup = (body) => api().post('/api/auth/signup').send(body);
const login = (email, password) => api().post('/api/auth/login').send({ email, password });
const verify = (email, code) => api().post('/api/auth/verify-email').send({ email, code });
const resend = (email) => api().post('/api/auth/resend-verification').send({ email });
const wrong = (code) => String((Number(code) + 1) % 1000000).padStart(6, '0');

beforeAll(async () => { await connect(); setFetchForTests(fakeFetch); });
afterAll(async () => { setFetchForTests(null); await disconnect(); });
beforeEach(async () => {
  await reset();
  sent.length = 0;
  Object.keys(BREVO).forEach((k) => delete process.env[k]);
  delete process.env.DEMO_MODE;
});

describe('when email is not set up', () => {
  test('sign-up works as before: signed in at once, verified', async () => {
    const body = newMember();
    const r = await signup(body);
    expect(r.status).toBe(201);
    expect(r.body.token).toBeTruthy();
    expect(r.body.user.emailVerified).toBe(true);
    expect((await User.findOne({ email: body.email })).emailVerified).toBe(true);
    expect((await api().post('/api/auth/verify-email').send({ email: body.email, code: '123456' })).status).toBe(503);
    expect((await resend(body.email)).status).toBe(503);
  });
});

describe('when email is set up', () => {
  beforeEach(() => Object.assign(process.env, BREVO));

  test('a new account starts unverified, gets a hashed 10-minute code and no token', async () => {
    const body = newMember();
    const r = await signup(body);
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ success: true, verificationRequired: true, email: body.email });
    expect(r.body.token).toBeUndefined();
    const user = await User.findOne({ email: body.email });
    expect(user.emailVerified).toBe(false);

    const mail = await nextMail();
    expect(mail.to).toEqual([{ email: body.email }]);
    expect(mail.subject).toMatch(/^\d{6} is your LibVerse verification code$/);
    const code = codeIn(mail);
    const record = await EmailCode.findOne({ userId: user._id, purpose: 'verify' }).lean();
    expect(record.codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record.codeHash).not.toContain(code);
    const ttl = record.expiresAt - Date.now();
    expect(ttl).toBeGreaterThan(9 * 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(10 * 60 * 1000);
  });

  test('password login while unverified: 403 "Please verify your email"; the code signs in', async () => {
    const body = newMember();
    await signup(body);
    const code = codeIn(await nextMail());

    const blocked = await login(body.email, body.password);
    expect(blocked.status).toBe(403);
    expect(blocked.body).toMatchObject({ code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email' });
    expect(blocked.body.token).toBeUndefined();
    // A wrong password still gets the usual answer (nothing about verification)
    expect((await login(body.email, 'not-the-password')).status).toBe(401);

    const ok = await verify(body.email.toUpperCase(), code);
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();
    expect(ok.body.user.emailVerified).toBe(true);
    expect((await User.findOne({ email: body.email })).emailVerified).toBe(true);
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${ok.body.token}`)).status).toBe(200);
    // Single use, and password login works now
    expect((await verify(body.email, code)).status).toBe(400);
    expect((await login(body.email, body.password)).status).toBe(200);
  });

  test('5 wrong guesses end the code', async () => {
    const body = newMember();
    await signup(body);
    const code = codeIn(await nextMail());
    for (let i = 0; i < 5; i++) expect((await verify(body.email, wrong(code))).status).toBe(400);
    expect((await verify(body.email, code)).status).toBe(400);
    expect(await EmailCode.countDocuments()).toBe(0);
  });

  test('an expired code does not work', async () => {
    const body = newMember();
    await signup(body);
    const code = codeIn(await nextMail());
    await EmailCode.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await verify(body.email, code)).status).toBe(400);
  });

  test('resend: at most once a minute, the new code replaces the old one; same answer for everyone', async () => {
    const body = newMember();
    await signup(body);
    const first = codeIn(await nextMail());

    const soon = await resend(body.email);
    expect(soon.status).toBe(200);
    await quiet();
    expect(sent).toHaveLength(0); // within 60 s: no new email

    await EmailCode.updateMany({}, { $set: { createdAt: new Date(Date.now() - 61 * 1000) } });
    const later = await resend(body.email);
    expect(later.body).toEqual(soon.body);
    const second = codeIn(await nextMail());
    if (second !== first) expect((await verify(body.email, first)).status).toBe(400);
    expect((await verify(body.email, second)).status).toBe(200);

    // Unknown and already verified emails: the same answer, no email
    const verified = await makeUser('student');
    expect((await resend('nobody.here@example.com')).body).toEqual(soon.body);
    expect((await resend(verified.email)).body).toEqual(soon.body);
    await quiet();
    expect(sent).toHaveLength(0);
  });

  test('blocked login sends a fresh code (respecting the minute between codes)', async () => {
    const body = newMember();
    await signup(body);
    await nextMail();
    await EmailCode.updateMany({}, { $set: { createdAt: new Date(Date.now() - 61 * 1000) } });
    expect((await login(body.email, body.password)).status).toBe(403);
    const code = codeIn(await nextMail());
    expect((await login(body.email, body.password)).status).toBe(403);
    await quiet();
    expect(sent).toHaveLength(0);
    expect((await verify(body.email, code)).status).toBe(200);
  });

  test('an unverified account can still sign in if email is switched off later (it could not verify)', async () => {
    const body = newMember();
    await signup(body);
    await nextMail();
    Object.keys(BREVO).forEach((k) => delete process.env[k]);
    expect((await login(body.email, body.password)).status).toBe(200);
  });

  test('admin-created users and the create-admin script are verified', async () => {
    const admin = await makeUser('admin');
    const r = await as(admin).post('/api/admin/users').send({ name: 'Made By Admin', email: 'made.by.admin@example.com', password: 'secret123', role: 'librarian' });
    expect(r.status).toBe(201);
    expect((await User.findOne({ email: 'made.by.admin@example.com' })).emailVerified).toBe(true);
    expect((await login('made.by.admin@example.com', 'secret123')).status).toBe(200);

    const a = await as(admin).post('/api/admin/create-admin').send({ name: 'Second Admin', email: 'second.admin@example.com', password: 'secret123' });
    expect(a.status).toBe(201);
    expect((await User.findOne({ email: 'second.admin@example.com' })).emailVerified).toBe(true);

    await createAdmin({ name: 'Script Admin', email: 'script.admin@example.com', password: 'Long-enough-pass-42' });
    expect((await User.findOne({ email: 'script.admin@example.com' })).emailVerified).toBe(true);
  });

  test('Google sign-ups are verified', async () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    setGoogleCertsForTests({ kid1: publicKey });
    try {
      const now = Math.floor(Date.now() / 1000);
      const credential = jwt.sign({
        iss: 'https://accounts.google.com', aud: process.env.GOOGLE_CLIENT_ID, sub: '2000000001', email: 'google.new@example.com',
        email_verified: true, name: 'Google New', iat: now, exp: now + 3600,
      }, privateKey, { algorithm: 'RS256', keyid: 'kid1' });
      const r = await api().post('/api/auth/google').send({ credential });
      expect(r.status).toBe(201);
      expect(r.body.user.emailVerified).toBe(true);
      expect((await User.findOne({ email: 'google.new@example.com' })).emailVerified).toBe(true);
    } finally {
      setGoogleCertsForTests(null);
      delete process.env.GOOGLE_CLIENT_ID;
    }
  });

  test('off on the demo instance', async () => {
    process.env.DEMO_MODE = 'true';
    expect((await api().get('/api/auth/email')).body.enabled).toBe(false);
    expect((await verify('someone@example.com', '123456')).status).toBe(403);
    expect((await resend('someone@example.com')).status).toBe(403);
  });
});

describe('migration: mark existing accounts verified', () => {
  test('dry run counts, --apply sets emailVerified: true on every account; safe to repeat', async () => {
    const users = mongoose.connection.db.collection('users');
    await users.insertMany([
      { name: 'Old One', email: 'old.one@example.com', role: 'student' }, // no field at all
      { name: 'Old Two', email: 'old.two@example.com', role: 'librarian', emailVerified: false },
      { name: 'Old Three', email: 'old.three@example.com', role: 'admin', emailVerified: true },
    ]);
    expect(await markEmailsVerified()).toEqual({ users: 3, toUpdate: 2, updated: 0 });
    expect(await users.countDocuments({ emailVerified: true })).toBe(1);
    expect(await markEmailsVerified({ apply: true })).toEqual({ users: 3, toUpdate: 2, updated: 2 });
    expect(await users.countDocuments({ emailVerified: true })).toBe(3);
    expect(await markEmailsVerified({ apply: true })).toEqual({ users: 3, toUpdate: 0, updated: 0 });
  });
});
