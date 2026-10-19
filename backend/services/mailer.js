/**
 * Outgoing email. Two transports, tried in this order:
 *  1. Brevo's transactional email HTTPS API (BREVO_API_KEY + MAIL_FROM; plain fetch, no SDK)
 *  2. SMTP with nodemailer (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS + MAIL_FROM)
 * SMTP is used when Brevo is not configured, and as a fallback when a Brevo send fails.
 *
 * Email features (sign-up verification, login codes, forgot password) are on when either transport
 * is fully configured; otherwise they stay off (the login page keeps "Ask your librarian or admin").
 *
 * MAIL_FROM is the sender address (a bare address, or the older "Name <address>" form);
 * MAIL_FROM_NAME is the display name (default LibVerse). API keys, passwords and recipients are
 * never logged.
 */
const nodemailer = require('nodemailer');

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = 10000;
const BREVO_VARS = ['BREVO_API_KEY', 'MAIL_FROM'];
const SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
const DEFAULT_FROM_NAME = 'LibVerse';

let transport = null;
let testTransport = null;
let testFetch = null;

const allSet = (names) => names.every((name) => (process.env[name] || '').trim() !== '');

/** true when the Brevo API settings are present */
const isBrevoConfigured = () => allSet(BREVO_VARS);
/** true when every SMTP setting is present */
const isSmtpConfigured = () => allSet(SMTP_VARS);
/** true when at least one transport can send */
const isEmailEnabled = () => isBrevoConfigured() || isSmtpConfigured();

/** The sender: { name, email } from MAIL_FROM ("a@b.c" or "Name <a@b.c>") and MAIL_FROM_NAME */
const sender = () => {
  const raw = (process.env.MAIL_FROM || '').trim();
  const match = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const email = (match ? match[2] : raw).trim();
  const name = (process.env.MAIL_FROM_NAME || '').trim() || (match && match[1].trim()) || DEFAULT_FROM_NAME;
  return { name, email };
};

const getTransport = () => {
  if (testTransport) return testTransport;
  if (!transport) {
    const port = Number(process.env.SMTP_PORT);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: port === 465, // 465 = TLS from the start; 587/25 upgrade with STARTTLS
      auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transport;
};

const sendWithBrevo = async ({ to, subject, text, html }) => {
  const doFetch = testFetch || fetch;
  const response = await doFetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY.trim(),
    },
    body: JSON.stringify({
      sender: sender(),
      to: [{ email: to }],
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
    }),
    signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
  });
  if (!response.ok) {
    const error = new Error('Brevo refused the email');
    error.code = `HTTP ${response.status}`;
    throw error;
  }
};

const sendWithSmtp = async ({ to, subject, text, html }) => {
  const { name, email } = sender();
  await getTransport().sendMail({ from: { name, address: email }, to, subject, text, html });
};

/**
 * Send one email. Resolves to true when a transport accepted it, false otherwise (never throws).
 * @param {{ to: string, subject: string, text: string, html?: string }} message
 */
const sendMail = async (message) => {
  if (isBrevoConfigured()) {
    try {
      await sendWithBrevo(message);
      return true;
    } catch (error) {
      // The status or error code only: bodies can echo the recipient or account details
      console.error(`Brevo email could not be sent (${error.code || error.name || 'error'})${isSmtpConfigured() ? ': trying SMTP' : ''}`);
    }
  }
  if (isSmtpConfigured()) {
    try {
      await sendWithSmtp(message);
      return true;
    } catch (error) {
      console.error(`Email could not be sent (${error.code || 'error'})`);
    }
  }
  return false;
};

/** Tests: replace the SMTP transport with a fake ({ sendMail(message) }); null restores it */
const setTransportForTests = (fake) => { testTransport = fake; };
/** Tests: replace fetch for the Brevo API with a fake (url, options) => ({ ok, status }); null restores it */
const setFetchForTests = (fake) => { testFetch = fake; };

module.exports = {
  isEmailEnabled, isBrevoConfigured, isSmtpConfigured, sendMail, sender,
  setTransportForTests, setFetchForTests, SMTP_VARS, BREVO_VARS, BREVO_URL,
};
