const express = require('express');
const router = express.Router();
const { getVideo, uploadVideo, deleteVideo } = require('../controllers/videoController');
const { adminMiddleware } = require('../middleware/authMiddleware');
const { videoUpload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimit');

// Public - home page uses this
router.get('/', getVideo);

// Admin only with upload rate limiting
router.post('/', adminMiddleware, uploadLimiter, videoUpload.single('video'), uploadVideo);
router.delete('/:id', adminMiddleware, deleteVideo);

module.exports = router;
