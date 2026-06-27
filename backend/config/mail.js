// config/mail.js - Nodemailer config (optional - for future email features)
const nodemailer = require('nodemailer');

// Gmail forward is done client-side via mailto: link
// This is available for server-side email if needed in future
const createTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || ''
    }
  });
};

module.exports = { createTransport };
