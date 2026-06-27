const express = require('express');
const router = express.Router();
const { getReport, downloadPDF } = require('../controllers/reportController');
const { adminMiddleware } = require('../middleware/authMiddleware');

// All report routes are admin only
router.use(adminMiddleware);

router.get('/', getReport);
router.get('/pdf', downloadPDF);

module.exports = router;
