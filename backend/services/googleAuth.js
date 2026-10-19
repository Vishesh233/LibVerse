/**
 * Google sign-in: verify a Google Identity Services ID token (the `credential` the "Sign in with
 * Google" button returns) with google-auth-library: RS256 signature against Google's published
 * certificates, audience = GOOGLE_CLIENT_ID, issuer accounts.google.com, not expired.
 *
 * Enabled only when GOOGLE_CLIENT_ID is set and this is not the demo instance.
 */
const { OAuth2Client } = require('google-auth-library');
const { isDemoMode } = require('../config/demo');

const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];
const client = new OAuth2Client();
let certsForTests = null;

const clientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();

const isGoogleEnabled = () => Boolean(clientId()) && !isDemoMode();

/**
 * Verify an ID token. Resolves to its payload ({ sub, email, email_verified, name, ... });
 * rejects for a bad signature, another audience or issuer, or an expired token.
 * @param {string} idToken
 */
const verifyGoogleIdToken = async (idToken) => {
  if (typeof idToken !== 'string' || !idToken || idToken.length > 4096) throw new Error('No Google credential');
  // Google's certificates (cached by the library until they expire), or a test key pair
  const certs = certsForTests || (await client.getFederatedSignonCertsAsync()).certs;
  const ticket = await client.verifySignedJwtWithCertsAsync(idToken, certs, clientId(), ISSUERS);
  const payload = ticket.getPayload();
  if (!payload || typeof payload.sub !== 'string' || !payload.sub) throw new Error('No Google account id');
  return payload;
};

/** Tests only: verify against these PEM public keys ({ kid: pem }) instead of Google's */
const setGoogleCertsForTests = (certs) => { certsForTests = certs; };

module.exports = { isGoogleEnabled, verifyGoogleIdToken, setGoogleCertsForTests };
