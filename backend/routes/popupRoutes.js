const express = require('express');
const router = express.Router();
const { getTelegramPopup, updateTelegramPopup } = require('../controllers/popupController');
const { adminMiddleware } = require('../middleware/authMiddleware');
const { uploadPopup } = require('../config/multer');
const { uploadLimiter } = require('../middleware/rateLimit');

// Public — user app fetches this
router.get('/', getTelegramPopup);

// Admin only with upload rate limiting
router.put('/admin', adminMiddleware, uploadLimiter, uploadPopup.single('image'), updateTelegramPopup);
router.get('/admin', adminMiddleware, getTelegramPopup);

module.exports = router;
