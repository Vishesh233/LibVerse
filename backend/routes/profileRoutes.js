const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../controllers/profileController');

const router = express.Router();

router.post('/upload-avatar', protect, uploadAvatar);

module.exports = router;
