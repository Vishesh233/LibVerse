/**
 * Outgoing email (nodemailer over SMTP). Enabled only when SMTP_HOST, SMTP_PORT, SMTP_USER,
 * SMTP_PASS and MAIL_FROM are all set; otherwise features that need email stay off (the login page
 * keeps "Ask your librarian or admin"). Credentials and recipients are never logged.
 */
const nodemailer = require('nodemailer');

const SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

let transport = null;
let testTransport = null;

/** true when every SMTP setting is present */
const isEmailEnabled = () => SMTP_VARS.every((name) => (process.env[name] || '').trim() !== '');

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

/**
 * Send one email. Resolves to true when the SMTP server accepted it, false otherwise (never throws).
 * @param {{ to: string, subject: string, text: string, html?: string }} message
 */
const sendMail = async ({ to, subject, text, html }) => {
  if (!isEmailEnabled()) return false;
  try {
    await getTransport().sendMail({ from: process.env.MAIL_FROM.trim(), to, subject, text, html });
    return true;
  } catch (error) {
    // The error code only: messages can echo the recipient or server details
    console.error(`Email could not be sent (${error.code || 'error'})`);
    return false;
  }
};

/** Tests: replace the SMTP transport with a fake ({ sendMail(message) }); null restores it */
const setTransportForTests = (fake) => { testTransport = fake; };

module.exports = { isEmailEnabled, sendMail, setTransportForTests, SMTP_VARS };
