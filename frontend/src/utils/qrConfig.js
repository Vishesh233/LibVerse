/**
 * What every desk QR encodes, shared by the generator (qrLayout) and the scanner (qrDecode).
 * Kept free of imports so pages that only draw QR codes don't download the scanner (jsqr).
 */

/**
 * Error correction for every desk QR (book labels, library cards): level H recovers ~30% of the
 * code, enough for the logo in the centre plus smudges and glare
 */
export const QR_LEVEL = 'H';

/** QR payload of a book: "LV1:B:<bookId>" (the card payload is signed by the server) */
export const bookCode = (bookId) => `LV1:B:${bookId}`;
