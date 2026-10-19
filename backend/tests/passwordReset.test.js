// Forgot password by emailed code, with a fake mail transport (nothing leaves the machine).
// Rate limits for these endpoints are tested in rateLimit.test.js; here they are raised.
process.env.RATE_LIMIT_FORGOT_PASSWORD = '1000';
process.env.RATE_LIMIT_RESET_PASSWORD = '1000';

const { api, connect, disconnect, reset, makeUser, tokenFor, PASSWORD } = require('./helpers');
const User = require('../models/User');
const PasswordResetCode = require('../models/PasswordResetCode');
const Notification = require('../models/Notification');
const { setTransportForTests } = require('../services/mailer');

const SMTP = { SMTP_HOST: 'smtp.test.invalid', SMTP_PORT: '587', SMTP_USER: 'user', SMTP_PASS: 'pass', MAIL_FROM: 'LibVerse <no-reply@example.com>' };
const sent = [];
const fakeTransport = { sendMail: async (message) => { sent.push(message); return { messageId: 'fake' }; } };

const forgot = (email) => api().post('/api/auth/forgot-password').send({ email });
const resetWith = (email, code, newPassword = 'Brand#New42') => api().post('/api/auth/reset-password').send({ email, code, newPassword });
const login = (email, password) => api().post('/api/auth/login').send({ email, password });
// The mail is sent without delaying the answer: wait for it
const nextMail = async () => {
  for (let i = 0; i < 50 && !sent.length; i++) await new Promise((r) => setTimeout(r, 20));
  return sent.shift();
};
const codeIn = (mail) => mail.text.match(/code is (\d{6})/)[1];

beforeAll(connect);
afterAll(async () => { setTransportForTests(null); await disconnect(); });
beforeEach(async () => {
  await reset();
  sent.length = 0;
});

describe('when email is not set up', () => {
  test('status says disabled; both endpoints refuse with the "ask your librarian" message', async () => {
    expect((await api().get('/api/auth/password-reset')).body).toEqual({ success: true, enabled: false });
    const r = await forgot('someone@example.com');
    expect(r.status).toBe(503);
    expect(r.body.message).toMatch(/Ask your librarian or admin/);
    expect((await resetWith('someone@example.com', '123456')).status).toBe(503);
  });

  test('all five SMTP settings are needed', async () => {
    Object.assign(process.env, SMTP);
    delete process.env.MAIL_FROM;
    expect((await api().get('/api/auth/password-reset')).body.enabled).toBe(false);
    Object.keys(SMTP).forEach((k) => delete process.env[k]);
  });
});

describe('when email is set up', () => {
  beforeAll(() => { Object.assign(process.env, SMTP); setTransportForTests(fakeTransport); });
  afterAll(() => { Object.keys(SMTP).forEach((k) => delete process.env[k]); });

  test('same answer for known and unknown emails; only the account owner gets a code', async () => {
    const u = await makeUser('student');
    expect((await api().get('/api/auth/password-reset')).body.enabled).toBe(true);
    const known = await forgot(u.email.toUpperCase());
    const unknown = await forgot('nobody.here@example.com');
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);

    const mail = await nextMail();
    expect(mail.to).toBe(u.email);
    expect(mail.from).toBe(SMTP.MAIL_FROM);
    expect(mail.subject).toMatch(/^\d{6} is your LibVerse password reset code$/);
    const code = codeIn(mail);
    await new Promise((r) => setTimeout(r, 100));
    expect(sent).toHaveLength(0); // nothing for the unknown address

    // Stored hashed, for 10 minutes
    const record = await PasswordResetCode.findOne({ userId: u._id }).lean();
    expect(record.codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record.codeHash).not.toContain(code);
    const ttl = record.expiresAt - Date.now();
    expect(ttl).toBeGreaterThan(9 * 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(10 * 60 * 1000);
  });

  test('the right code sets the new password, signs out old sessions and works only once', async () => {
    const u = await makeUser('student');
    const oldToken = tokenFor(u);
    await forgot(u.email);
    const code = codeIn(await nextMail());

    const ok = await resetWith(u.email, code, 'Brand#New42');
    expect(ok.status).toBe(200);
    expect(ok.body).not.toHaveProperty('token');
    expect((await login(u.email, PASSWORD)).status).toBe(401);
    expect((await login(u.email, 'Brand#New42')).status).toBe(200);
    // An old session token no longer works
    expect((await api().get('/api/auth/me').set('Authorization', `Bearer ${oldToken}`)).status).toBe(401);
    expect((await User.findById(u._id)).tokenVersion).toBe(1);
    expect(await Notification.countDocuments({ userId: u._id, type: 'PASSWORD_CHANGED' })).toBe(1);

    expect((await resetWith(u.email, code, 'Another#Pass1')).status).toBe(400);
    expect(await PasswordResetCode.countDocuments()).toBe(0);
  });

  test('5 wrong guesses use up the code (the right one then fails too)', async () => {
    const u = await makeUser('student');
    await forgot(u.email);
    const code = codeIn(await nextMail());
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      const r = await resetWith(u.email, wrong);
      expect(r.status).toBe(400);
      expect(r.body.message).toMatch(/wrong or has expired/);
    }
    expect(await PasswordResetCode.countDocuments({ userId: u._id })).toBe(0);
    expect((await resetWith(u.email, code)).status).toBe(400);
    expect((await login(u.email, PASSWORD)).status).toBe(200);
  });

  test('parallel guesses cannot go past 5', async () => {
    const u = await makeUser('student');
    await forgot(u.email);
    const code = codeIn(await nextMail());
    const wrong = code === '000000' ? '111111' : '000000';
    await Promise.all(Array.from({ length: 12 }, () => resetWith(u.email, wrong)));
    expect(await PasswordResetCode.countDocuments({ userId: u._id })).toBe(0);
    expect((await resetWith(u.email, code)).status).toBe(400);
  });

  test('an expired code fails', async () => {
    const u = await makeUser('student');
    await forgot(u.email);
    const code = codeIn(await nextMail());
    await PasswordResetCode.updateOne({ userId: u._id }, { expiresAt: new Date(Date.now() - 1000) });
    expect((await resetWith(u.email, code)).status).toBe(400);
    expect((await login(u.email, PASSWORD)).status).toBe(200);
  });

  test('a new code at most once a minute; a newer code replaces the old one', async () => {
    const u = await makeUser('student');
    await forgot(u.email);
    const first = codeIn(await nextMail());
    expect((await forgot(u.email)).status).toBe(200);
    await new Promise((r) => setTimeout(r, 100));
    expect(sent).toHaveLength(0);

    await PasswordResetCode.updateOne({ userId: u._id }, { createdAt: new Date(Date.now() - 2 * 60 * 1000) });
    await forgot(u.email);
    const second = codeIn(await nextMail());
    expect(await PasswordResetCode.countDocuments({ userId: u._id })).toBe(1);
    if (first !== second) expect((await resetWith(u.email, first)).status).toBe(400);
    expect((await resetWith(u.email, second)).status).toBe(200);
  });

  test('deactivated accounts get no code; bad input is rejected', async () => {
    const u = await makeUser('student', { isActive: false });
    expect((await forgot(u.email)).status).toBe(200);
    await new Promise((r) => setTimeout(r, 100));
    expect(sent).toHaveLength(0);

    expect((await forgot('not-an-email')).status).toBe(400);
    expect((await api().post('/api/auth/forgot-password').send({ email: { $ne: null } })).status).toBe(400);
    expect((await resetWith('a@example.com', '12345')).status).toBe(400);
    expect((await resetWith('a@example.com', '123456', 'short')).body.message).toMatch(/6 to 128/);
    expect((await api().post('/api/auth/reset-password').send({ email: { $gt: '' }, code: '123456', newPassword: 'whatever1' })).status).toBe(400);
  });

  test('a failed send is not reported to the requester and logs no address or code', async () => {
    const u = await makeUser('student');
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    setTransportForTests({ sendMail: async () => { const e = new Error(`could not deliver to ${u.email}`); e.code = 'EAUTH'; throw e; } });
    try {
      expect((await forgot(u.email)).status).toBe(200);
      await new Promise((r) => setTimeout(r, 100));
      const logged = errors.mock.calls.flat().join(' ');
      expect(logged).toMatch(/EAUTH/);
      expect(logged).not.toContain(u.email);
    } finally {
      setTransportForTests(fakeTransport);
      errors.mockRestore();
    }
  });
});
