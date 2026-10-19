/**
 * A small generated "payment receipt" image (PNG data URL) for demo data: the seeded payments
 * waiting for verification, and every payment a demo account submits (the visitor's own upload is
 * never stored on the shared demo).
 */
const sharp = require('sharp');

/**
 * @param {number} amount - rupees shown on the receipt
 * @param {string} ref - a made-up UPI reference
 * @returns {Promise<string>} data:image/png;base64,...
 */
const receiptImage = async (amount, ref) => {
  const safeRef = String(ref).replace(/[^A-Za-z0-9-]/g, '').slice(0, 24);
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520">
    <rect width="360" height="520" fill="#ffffff"/><rect width="360" height="96" fill="#1f7a4d"/>
    <text x="180" y="58" font-family="Arial" font-size="26" fill="#fff" text-anchor="middle">Payment successful</text>
    <text x="180" y="190" font-family="Arial" font-size="56" font-weight="bold" fill="#111" text-anchor="middle">₹${safeAmount}</text>
    <text x="180" y="250" font-family="Arial" font-size="18" fill="#555" text-anchor="middle">Paid to LibVerse Library</text>
    <text x="180" y="300" font-family="Arial" font-size="16" fill="#555" text-anchor="middle">UPI ref ${safeRef}</text>
    <text x="180" y="470" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">Demo receipt (not a real payment)</text></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
};

module.exports = { receiptImage };
