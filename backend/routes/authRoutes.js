const express = require('express');
const router = express.Router();
const { login, adminLogin } = require('../controllers/authController');
const { loginLimiter, adminLoginLimiter } = require('../middleware/rateLimit');

router.post('/login', loginLimiter, login);
router.post('/admin/login', adminLoginLimiter, adminLogin);

module.exports = router;
