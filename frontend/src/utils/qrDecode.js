/**
 * QR decoding for the scan desk (pulls in jsqr: import it only where codes are scanned).
 * Plain JS (no React, no DOM) so the Node tests use exactly the same functions.
 */
import jsQRModule from 'jsqr';

// What the codes contain lives in qrConfig (no dependencies); re-exported for existing callers
export { QR_LEVEL, bookCode } from './qrConfig.js';

// jsqr ships CommonJS; in Node ESM its function arrives on .default
const jsQR = typeof jsQRModule === 'function' ? jsQRModule : jsQRModule.default;

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
