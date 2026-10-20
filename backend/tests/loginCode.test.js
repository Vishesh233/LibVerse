// Passwordless sign-in ("Email me a code") with a fake Brevo API (nothing leaves the machine).
// Rate limits for these endpoints are tested in rateLimit.test.js; here they are raised.
process.env.RATE_LIMIT_LOGIN_CODE_REQUEST = '1000';
process.env.RATE_LIMIT_LOGIN_CODE_VERIFY = '1000';
process.env.RATE_LIMIT_PASSWORD_CHANGE = '1000';
const { api, as, connect, disconnect, reset, makeUser, PASSWORD } = require('./helpers');
const User = require('../models/User');
const EmailCode = require('../models/EmailCode');
const { setFetchForTests } = require('../services/mailer');

const BREVO = { BREVO_API_KEY: 'test-brevo-key-not-real', MAIL_FROM: 'no-reply@example.com' };
const sent = [];
const fakeFetch = async (url, options) => { sent.push(JSON.parse(options.body)); return { ok: true, status: 201 }; };
const nextMail = async () => {
  for (let i = 0; i < 50 && !sent.length; i++) await new Promise((r) => setTimeout(r, 20));
  return sent.shift();
};
const codeIn = (mail) => mail.textContent.match(/code is (\d{6})/)[1];
const quiet = () => new Promise((r) => setTimeout(r, 100));
const wrong = (code) => String((Number(code) + 1) % 1000000).padStart(6, '0');

const ask = (email) => api().post('/api/auth/login-code').send({ email });
const useIt = (email, code) => api().post('/api/auth/login-code/verify').send({ email, code });

beforeAll(async () => { await connect(); setFetchForTests(fakeFetch); });
afterAll(async () => { setFetchForTests(null); Object.keys(BREVO).forEach((k) => delete process.env[k]); await disconnect(); });
beforeEach(async () => {
  await reset();
  sent.length = 0;
  Object.assign(process.env, BREVO);
  delete process.env.DEMO_MODE;
});

test('off when email is not set up (and on the demo instance)', async () => {
  Object.keys(BREVO).forEach((k) => delete process.env[k]);
  expect((await api().get('/api/auth/email')).body.enabled).toBe(false);
  expect((await ask('someone@example.com')).status).toBe(503);
  expect((await useIt('someone@example.com', '123456')).status).toBe(503);
  Object.assign(process.env, BREVO, { DEMO_MODE: 'true' });
  expect((await api().get('/api/auth/email')).body.enabled).toBe(false);
  expect((await ask('someone@example.com')).status).toBe(403);
  expect((await useIt('someone@example.com', '123456')).status).toBe(403);
});

test('same answer for known, unknown, deactivated and demo emails; only the active owner gets a code', async () => {
  const u = await makeUser('student');
  const inactive = await makeUser('student', { isActive: false });
  const demo = await makeUser('student', { isDemo: true });
  const known = await ask(u.email.toUpperCase());
  const answers = [known, await ask('nobody.here@example.com'), await ask(inactive.email), await ask(demo.email)];
  answers.forEach((r) => {
    expect(r.status).toBe(200);
    expect(r.body).toEqual(known.body);
  });
  const mail = await nextMail();
  expect(mail.to).toEqual([{ email: u.email }]);
  expect(mail.subject).toMatch(/^\d{6} is your LibVerse sign-in code$/);
  await quiet();
  expect(sent).toHaveLength(0);

  const record = await EmailCode.findOne({ userId: u._id, purpose: 'login' }).lean();
  expect(record.codeHash).toMatch(/^[a-f0-9]{64}$/);
  expect(record.codeHash).not.toContain(codeIn(mail));
  expect(record.expiresAt - Date.now()).toBeLessThanOrEqual(10 * 60 * 1000);
});

test('the right code signs in once; the session works', async () => {
  const u = await makeUser('librarian');
  await ask(u.email);
  const code = codeIn(await nextMail());
  const r = await useIt(u.email, code);
  expect(r.status).toBe(200);
  expect(r.body.user).toMatchObject({ role: 'librarian', email: u.email });
  expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${r.body.token}`)).status).toBe(200);
  expect((await useIt(u.email, code)).status).toBe(400);
});

test('wrong codes: same message as unknown emails; 5 guesses end the code', async () => {
  const u = await makeUser('student');
  await ask(u.email);
  const code = codeIn(await nextMail());
  const unknown = await useIt('nobody.here@example.com', code);
  expect(unknown.status).toBe(400);
  for (let i = 0; i < 5; i++) {
    const r = await useIt(u.email, wrong(code));
    expect(r.status).toBe(400);
    expect(r.body).toEqual(unknown.body);
  }
  expect((await useIt(u.email, code)).status).toBe(400);
});

test('a new code at most once a minute; an expired code does not work', async () => {
  const u = await makeUser('student');
  await ask(u.email);
  const code = codeIn(await nextMail());
  await ask(u.email);
  await quiet();
  expect(sent).toHaveLength(0);
  await EmailCode.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  expect((await useIt(u.email, code)).status).toBe(400);
});

test('deactivated after the code was sent: 403, no token', async () => {
  const u = await makeUser('student');
  await ask(u.email);
  const code = codeIn(await nextMail());
  await User.updateOne({ _id: u._id }, { $set: { isActive: false } });
  const r = await useIt(u.email, code);
  expect(r.status).toBe(403);
  expect(r.body.message).toBe('Account is deactivated');
  expect(r.body.token).toBeUndefined();
});

test('a password change after the code was sent (tokenVersion) voids the code', async () => {
  const u = await makeUser('student');
  await ask(u.email);
  const code = codeIn(await nextMail());
  const changed = await as(u).put('/api/auth/change-password').send({ currentPassword: PASSWORD, newPassword: 'Another#Pass9' });
  expect(changed.status).toBe(200);
  expect((await useIt(u.email, code)).status).toBe(400);

  // A code sent after the change works, and its token carries the new version
  await EmailCode.deleteMany({});
  await ask(u.email);
  const fresh = codeIn(await nextMail());
  const r = await useIt(u.email, fresh);
  expect(r.status).toBe(200);
  expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${r.body.token}`)).status).toBe(200);
});

test('a login code also verifies an unverified email', async () => {
  const u = await makeUser('student', { emailVerified: false });
  await ask(u.email);
  const r = await useIt(u.email, codeIn(await nextMail()));
  expect(r.status).toBe(200);
  expect(r.body.user.emailVerified).toBe(true);
  expect((await User.findById(u._id)).emailVerified).toBe(true);
});
