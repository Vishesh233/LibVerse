const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/User');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
}).single('avatar');

/**
 * Crop an image buffer to a circular avatar.
 * The crop region is provided by the frontend (which already did face detection
 * and let the user position the crop). We extract the circular region and
 * return a PNG buffer.
 */
const cropToCircle = async (buffer, crop) => {
  const { width, height, x, y } = crop;

  // Extract the crop region
  const extracted = await sharp(buffer)
    .extract({ left: Math.round(x), top: Math.round(y), width: Math.round(width), height: Math.round(height) })
    .toBuffer();

  // Create circular mask and composite
  const size = Math.min(width, height);
  const circleSvg = `
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" />
    </svg>
  `;

  const result = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: extracted,
        blend: 'over',
      },
      {
        input: Buffer.from(circleSvg),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  return result;
};

/**
 * @route POST /api/profile/upload-avatar
 * @desc Upload and crop avatar (circular)
 * @access Private
 */
exports.uploadAvatar = (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      // Parse crop info from the request body (sent by frontend)
      let crop;
      try {
        crop = req.body.crop ? JSON.parse(req.body.crop) : null;
      } catch (e) {
        crop = null;
      }

      let finalBuffer;
      let ext = '.png';

      if (crop) {
        // Use the crop region provided by the frontend
        finalBuffer = await cropToCircle(req.file.buffer, crop);
      } else {
        // Fallback: center-crop to a square then circle
        const metadata = await sharp(req.file.buffer).metadata();
        const size = Math.min(metadata.width, metadata.height);
        const left = Math.round((metadata.width - size) / 2);
        const top = Math.round((metadata.height - size) / 2);
        finalBuffer = await cropToCircle(req.file.buffer, {
          x: left,
          y: top,
          width: size,
          height: size,
        });
      }

      // Generate filename
      const filename = `avatar-${req.user.id}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, finalBuffer);

      // Build full avatar URL so frontend can display it correctly
      const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

      // Update user profile
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profileImage: avatarUrl },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        user,
        avatarUrl,
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
};
