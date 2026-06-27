const rateLimit = require('express-rate-limit');

// ─── LOGIN RATE LIMITER (Prevent brute-force on user login) ──────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── ADMIN LOGIN RATE LIMITER (Protect admin panel credentials) ──────────────
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 admin login requests per windowMs
  message: { success: false, message: 'Too many admin login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── UPLOAD RATE LIMITER (Prevent disk exhaustion / abuse) ───────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per windowMs
  message: { success: false, message: 'Upload limit reached for this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── GENERAL API LIMITER ──────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  adminLoginLimiter,
  uploadLimiter,
  apiLimiter
};
