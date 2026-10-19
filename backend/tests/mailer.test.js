// Mail service: Brevo HTTPS API first, SMTP as the fallback, both replaced by fakes (nothing is sent)
const { api, connect, disconnect } = require('./helpers');
const {
  sendMail, isEmailEnabled, isBrevoConfigured, isSmtpConfigured, setFetchForTests, setTransportForTests, BREVO_URL,
} = require('../services/mailer');
const { verificationEmail, loginCodeEmail, passwordResetEmail } = require('../services/emailTemplates');

const BREVO = { BREVO_API_KEY: 'test-brevo-key-not-real', MAIL_FROM: 'no-reply@example.com' };
const SMTP = { SMTP_HOST: 'smtp.test.invalid', SMTP_PORT: '587', SMTP_USER: 'user', SMTP_PASS: 'pass', MAIL_FROM: 'no-reply@example.com' };
const ALL = ['BREVO_API_KEY', 'MAIL_FROM', 'MAIL_FROM_NAME', ...Object.keys(SMTP)];

const calls = [];
const smtpSent = [];
let brevoAnswer;
const fakeFetch = async (url, options) => {
  calls.push({ url, options });
  return brevoAnswer();
};
const fakeTransport = { sendMail: async (message) => { smtpSent.push(message); return { messageId: 'fake' }; } };
const message = { to: 'reader@example.com', subject: 'Hello', text: 'Plain', html: '<p>Html</p>' };

beforeAll(async () => {
  await connect();
  setFetchForTests(fakeFetch);
  setTransportForTests(fakeTransport);
});
afterAll(async () => {
  setFetchForTests(null);
  setTransportForTests(null);
  await disconnect();
});
beforeEach(() => {
  ALL.forEach((k) => delete process.env[k]);
  calls.length = 0;
  smtpSent.length = 0;
  brevoAnswer = () => ({ ok: true, status: 201 });
});
afterEach(() => ALL.forEach((k) => delete process.env[k]));

test('nothing configured: email is off and nothing is sent', async () => {
  expect(isEmailEnabled()).toBe(false);
  expect(await sendMail(message)).toBe(false);
  expect(calls).toHaveLength(0);
  expect(smtpSent).toHaveLength(0);
  expect((await api().get('/api/auth/email')).body).toEqual({ success: true, enabled: false });
});

test('Brevo alone turns email on and sends through the HTTPS API', async () => {
  Object.assign(process.env, BREVO, { MAIL_FROM_NAME: 'LibVerse Library' });
  expect(isBrevoConfigured()).toBe(true);
  expect(isSmtpConfigured()).toBe(false);
  expect(isEmailEnabled()).toBe(true);
  expect((await api().get('/api/auth/email')).body.enabled).toBe(true);
  expect((await api().get('/api/auth/password-reset')).body.enabled).toBe(true);

  expect(await sendMail(message)).toBe(true);
  expect(calls).toHaveLength(1);
  const { url, options } = calls[0];
  expect(url).toBe(BREVO_URL);
  expect(options.method).toBe('POST');
  expect(options.headers['api-key']).toBe(BREVO.BREVO_API_KEY);
  expect(options.signal).toBeDefined();
  expect(JSON.parse(options.body)).toEqual({
    sender: { name: 'LibVerse Library', email: 'no-reply@example.com' },
    to: [{ email: 'reader@example.com' }],
    subject: 'Hello',
    textContent: 'Plain',
    htmlContent: '<p>Html</p>',
  });
  expect(smtpSent).toHaveLength(0);
});

test('the older "Name <address>" MAIL_FROM still works', async () => {
  Object.assign(process.env, BREVO, { MAIL_FROM: 'LibVerse <no-reply@example.com>' });
  await sendMail(message);
  expect(JSON.parse(calls[0].options.body).sender).toEqual({ name: 'LibVerse', email: 'no-reply@example.com' });
});

test('SMTP alone: nodemailer transport, Brevo never called', async () => {
  Object.assign(process.env, SMTP);
  expect(await sendMail(message)).toBe(true);
  expect(calls).toHaveLength(0);
  expect(smtpSent).toHaveLength(1);
  expect(smtpSent[0]).toMatchObject({ to: 'reader@example.com', subject: 'Hello', from: { name: 'LibVerse', address: 'no-reply@example.com' } });
});

test('Brevo refuses: falls back to SMTP; logs carry no key or recipient', async () => {
  Object.assign(process.env, BREVO, SMTP);
  brevoAnswer = () => ({ ok: false, status: 401 });
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(await sendMail(message)).toBe(true);
  expect(calls).toHaveLength(1);
  expect(smtpSent).toHaveLength(1);
  const logged = errors.mock.calls.flat().join(' ');
  errors.mockRestore();
  expect(logged).toMatch(/HTTP 401/);
  expect(logged).not.toContain(BREVO.BREVO_API_KEY);
  expect(logged).not.toContain('reader@example.com');
});

test('Brevo network error and no SMTP: false, never throws', async () => {
  Object.assign(process.env, BREVO);
  brevoAnswer = () => { throw Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' }); };
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(await sendMail(message)).toBe(false);
  errors.mockRestore();
  expect(smtpSent).toHaveLength(0);
});

test('every SMTP setting is needed for SMTP; Brevo needs the key and MAIL_FROM', () => {
  Object.assign(process.env, SMTP);
  delete process.env.SMTP_PASS;
  expect(isEmailEnabled()).toBe(false);
  process.env.BREVO_API_KEY = 'k';
  expect(isEmailEnabled()).toBe(true);
  delete process.env.MAIL_FROM;
  expect(isEmailEnabled()).toBe(false);
});

test('templates: dark HTML + plain text with the code; names are escaped', () => {
  for (const make of [verificationEmail, loginCodeEmail, passwordResetEmail]) {
    const mail = make('<b>Eve</b> & co', '042137');
    expect(mail.subject).toMatch(/^042137 is your LibVerse /);
    expect(mail.text).toContain('042137');
    expect(mail.text).toMatch(/expires in 10 minutes/);
    expect(mail.html).toContain('042137');
    expect(mail.html).toContain('background:#020713');
    expect(mail.html).toContain('&lt;b&gt;Eve&lt;/b&gt; &amp; co');
    expect(mail.html).not.toContain('<b>Eve</b>');
  }
});
