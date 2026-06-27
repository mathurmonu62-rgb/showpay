const express = require('express');
const router = express.Router();
const { getSliders, uploadSlider, deleteSlider } = require('../controllers/sliderController');
const { adminMiddleware } = require('../middleware/authMiddleware');
const { sliderUpload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimit');

// Public - home page uses this
router.get('/', getSliders);

// Admin only with upload rate limiting
router.post('/', adminMiddleware, uploadLimiter, sliderUpload.single('image'), uploadSlider);
router.delete('/:id', adminMiddleware, deleteSlider);

module.exports = router;
