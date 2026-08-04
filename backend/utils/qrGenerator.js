const QRCode = require('qrcode');

/**
 * Generate QR code for a book
 * @param {String} bookId - Book MongoDB ObjectId
 * @param {String} bookTitle - Book title
 * @returns {Promise<String>} - QR code data URL
 */
const generateQRCode = async (bookId, bookTitle) => {
  try {
    // Create QR code data (book ID and title)
    const qrData = JSON.stringify({
      bookId: bookId,
      title: bookTitle,
      timestamp: new Date().toISOString(),
    });

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Generate QR code as a file
 * @param {String} data - Data to encode
 * @param {String} filePath - File path to save QR code
 */
const generateQRCodeFile = async (data, filePath) => {
  try {
    await QRCode.toFile(filePath, data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
    });
    return true;
  } catch (error) {
    console.error('Error generating QR code file:', error);
    throw error;
  }
};

module.exports = { generateQRCode, generateQRCodeFile };
