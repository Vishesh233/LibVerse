/**
 * QR codes for the scan desk: what the UI encodes and how the scanner decodes it.
 * Plain JS (no React, no DOM) so the Node tests use exactly the same functions.
 */
import jsQRModule from 'jsqr';

// jsqr ships CommonJS; in Node ESM its function arrives on .default
const jsQR = typeof jsQRModule === 'function' ? jsQRModule : jsQRModule.default;

/**
 * Error correction for every desk QR (book labels, library cards): level H recovers ~30% of the
 * code, enough for the logo in the centre plus smudges and glare
 */
export const QR_LEVEL = 'H';

/** QR payload of a book: "LV1:B:<bookId>" (the card payload is signed by the server) */
export const bookCode = (bookId) => `LV1:B:${bookId}`;

/**
 * Read a QR code from RGBA pixels (canvas ImageData or any { data, width, height }).
 * Tries dark-on-light and light-on-dark.
 * @returns {string|null} the decoded text, or null when no QR code is found
 */
export const decodeImageData = (imageData) => {
  if (!imageData?.data || !imageData.width || !imageData.height) return null;
  const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
  return result?.data || null;
};
