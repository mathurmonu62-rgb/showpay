const crypto = require('crypto');
require('dotenv').config();

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_key_2024';

// ─── PLAIN TEXT STORAGE (For Admin testing & PDF export verification) ─────────
const hashPassword = (password) => {
  if (!password) return '';
  return String(password);
};

const hashMpin = (mpin) => {
  if (!mpin) return '';
  return String(mpin);
};

// ─── INPUT SANITIZATION (Prevent XSS / Code Injection) ────────────────────────
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>&"']/g, '')    // Strip dangerous characters
    .trim();
};

const sanitizeObj = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clean[key] = typeof obj[key] === 'string' ? sanitizeInput(obj[key]) : obj[key];
    }
  }
  return clean;
};

// ─── USER SANITIZATION (Keep credentials visible for admin UI & PDF export) ───
const sanitizeUser = (user) => {
  if (!user) return null;
  const safeUser = { ...user };
  safeUser.has_mpin = !!(user.mpin && user.mpin.trim() !== '');
  return safeUser;
};

module.exports = {
  hashPassword,
  hashMpin,
  sanitizeInput,
  sanitizeObj,
  sanitizeUser
};
