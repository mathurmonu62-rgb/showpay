// controllers/userController.js — User management (admin use)
const User = require('../models/User');
const { success, error } = require('../utils/response');

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { search, date, status, page = 1, limit = 20 } = req.query;
    const result = await User.findAll({
      search,
      date,
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    return success(res, 'Users fetched', {
      users: result.users,
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit))
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── GET SINGLE USER ──────────────────────────────────────────────────────────
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    return success(res, 'User detail', user);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { getAllUsers, getUserDetail };
