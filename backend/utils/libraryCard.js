const crypto = require('crypto');

/**
 * QR payloads for the scan desk.
 *   Book:          LV1:B:<bookId>                              (unsigned: a book id is not a secret)
 *   Library card:  LV1:U:<libraryId>:<cardVersion>:<sig>
 *     sig = base64url(HMAC-SHA256(cardKey, "U:<libraryId>:<cardVersion>")) truncated to 22 chars (132 bits)
 *     cardKey = HMAC-SHA256(JWT_SECRET, "libverse:library-card:v1") - derived, never the JWT secret
 *     itself and never sent anywhere.
 * Reissuing a card increments User.cardVersion, so every older card QR stops verifying.
 */

const PREFIX = 'LV1';
const SIG_LENGTH = 22;
const KEY_LABEL = 'libverse:library-card:v1';
const MAX_CODE_LENGTH = 300;

let cachedKey = null;
let cachedFrom = null;
const cardKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  if (cachedKey && cachedFrom === secret) return cachedKey;
  cachedKey = crypto.createHmac('sha256', secret).update(KEY_LABEL).digest();
  cachedFrom = secret;
  return cachedKey;
};

const sign = (libraryId, cardVersion) =>
  crypto.createHmac('sha256', cardKey()).update(`U:${libraryId}:${cardVersion}`).digest('base64url').slice(0, SIG_LENGTH);

/** The signed card code for a user (needs libraryId) */
const cardCodeFor = (user) => {
  const version = Number(user.cardVersion) || 1;
  return `${PREFIX}:U:${user.libraryId}:${version}:${sign(user.libraryId, version)}`;
};

const bookCodeFor = (bookId) => `${PREFIX}:B:${bookId}`;

/**
 * Parse a scanned or typed code. Never throws.
 * @param {string} raw
 * @returns {{ kind: 'card', libraryId, cardVersion, validSignature }
 *   | { kind: 'book', bookId }
 *   | { kind: 'legacy-book', bookId }       old stored QR: JSON with a bookId
 *   | { kind: 'text', text }                plain text typed by hand (library ID, ISBN, book id)
 *   | { kind: 'invalid', reason }}
 */
const parseDeskCode = (raw) => {
  if (typeof raw !== 'string') return { kind: 'invalid', reason: 'Scan or type a code' };
  const text = raw.trim();
  if (!text) return { kind: 'invalid', reason: 'Scan or type a code' };
  if (text.length > MAX_CODE_LENGTH) return { kind: 'invalid', reason: 'That code is too long to be a LibVerse code' };

  if (text.toUpperCase().startsWith(`${PREFIX}:`)) {
    const parts = text.split(':');
    const type = (parts[1] || '').toUpperCase();
    if (type === 'B') {
      const bookId = parts.slice(2).join(':');
      if (parts.length !== 3 || !/^[a-f0-9]{24}$/i.test(bookId)) return { kind: 'invalid', reason: 'This book code is damaged. Try typing the ISBN instead.' };
      return { kind: 'book', bookId };
    }
    if (type === 'U') {
      // LV1:U:<libraryId>:<version>:<sig> - the library ID itself never contains ':'
      if (parts.length !== 5) return { kind: 'invalid', reason: 'This library card code is damaged' };
      const [, , libraryId, versionText, sig] = parts;
      const cardVersion = Number(versionText);
      if (!libraryId || !Number.isInteger(cardVersion) || cardVersion < 1 || !/^[A-Za-z0-9_-]+$/.test(sig || '')) {
        return { kind: 'invalid', reason: 'This library card code is damaged' };
      }
      const expected = Buffer.from(sign(libraryId, cardVersion));
      const given = Buffer.from(sig);
      const validSignature = expected.length === given.length && crypto.timingSafeEqual(expected, given);
      return { kind: 'card', libraryId, cardVersion, validSignature };
    }
    return { kind: 'invalid', reason: 'Unknown LibVerse code type' };
  }

  // QR images stored by older versions: {"bookId":"...","title":"...","timestamp":"..."}
  if (text.startsWith('{')) {
    try {
      const data = JSON.parse(text);
      if (typeof data?.bookId === 'string' && /^[a-f0-9]{24}$/i.test(data.bookId)) return { kind: 'legacy-book', bookId: data.bookId };
    } catch {
      /* not JSON */
    }
    return { kind: 'invalid', reason: 'Not a LibVerse code' };
  }

  return { kind: 'text', text };
};

module.exports = { cardCodeFor, bookCodeFor, parseDeskCode, PREFIX };
