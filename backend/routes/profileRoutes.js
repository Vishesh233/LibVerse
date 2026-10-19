const express = require('express');
const { protect, blockDemo } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../controllers/profileController');

const router = express.Router();

router.post('/upload-avatar', protect, blockDemo, uploadAvatar);

module.exports = router;
