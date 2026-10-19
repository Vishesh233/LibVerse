const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { saveFile, fileUrl } = require('../services/fileStore');

const CONTENT_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Allowed image MIME types
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Multer storage: keep in memory so we can process with sharp
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed'), false);
    }
  },
}).single('coverImage');

/**
 * @route POST /api/books/upload-cover
 * @desc Upload a book cover image
 * @access Private/Admin/Librarian
 */
exports.uploadBookCover = (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      // Process and compress the image
      let finalBuffer;
      let ext = '.jpg';

      try {
        // Resize to max 800px width, compress as JPEG
        finalBuffer = await sharp(req.file.buffer)
          .resize(800, 1100, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (sharpError) {
        // If sharp processing fails, use the original buffer
        console.error('Sharp processing failed, using original file:', sharpError.message);
        finalBuffer = req.file.buffer;
        const originalName = req.file.originalname || '';
        ext = path.extname(originalName).toLowerCase() || '.jpg';
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) ext = '.jpg';
      }

      // Stored in GridFS; the book form saves this host-independent path as coverImage
      const filename = `book-cover-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const id = await saveFile(finalBuffer, {
        filename,
        contentType: CONTENT_TYPES[ext] || 'image/jpeg',
        metadata: { kind: 'cover', uploadedBy: req.user._id },
      });
      const coverUrl = fileUrl(id);

      return res.status(200).json({
        success: true,
        message: 'Book cover uploaded successfully',
        coverUrl,
        filename,
      });
    } catch (error) {
      console.error('Book cover upload error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
};