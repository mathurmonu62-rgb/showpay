const express = require('express');
const router = express.Router();
const { saveMpin } = require('../controllers/mpinController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, saveMpin);

module.exports = router;
