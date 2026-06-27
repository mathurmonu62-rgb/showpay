// controllers/reportController.js — Reports and PDF export
const LoginLog = require('../models/LoginLog');
const User = require('../models/User');
const { generateUserPDF } = require('../utils/pdf');
const { success, error } = require('../utils/response');

// ─── GET REPORT DATA ──────────────────────────────────────────────────────────
const getReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await LoginLog.findAll({ startDate, endDate, limit: 500 });
    return success(res, 'Report data', data);
  } catch (err) {
    console.error('Report error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── DOWNLOAD PDF ─────────────────────────────────────────────────────────────
const downloadPDF = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let users = [];

    if (startDate || endDate) {
      // Date-filtered: use login_logs
      const logs = await LoginLog.findAll({ startDate, endDate, limit: 1000 });
      users = logs;
    } else {
      // All users with optional status filter
      const result = await User.findAll({ status, limit: 1000 });
      users = result.users;
    }

    generateUserPDF(users, res);
  } catch (err) {
    console.error('PDF download error:', err.message);
    if (!res.headersSent) {
      return error(res, 'Server error generating PDF', 500);
    }
  }
};

module.exports = { getReport, downloadPDF };
