const User = require('../models/User');
const Slider = require('../models/Slider');
const Video = require('../models/Video');
const Settings = require('../models/Settings');
const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const { sanitizeInput, sanitizeUser } = require('../utils/hash');

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [total, pending, completed, todayLogin, sliderCount, videoCount, latest] = await Promise.all([
      User.count(),
      User.count({ status: 'pending' }),
      User.count({ status: 'completed' }),
      User.count({ last_login_gte: todayISO }),
      Slider.count(),
      Video.count(),
      User.findLatest(5)
    ]);

    // Get telegram popup count
    let telegramPopupCount = 0;
    try {
      const { count } = await supabase.from('telegram_popup').select('*', { count: 'exact', head: true }).eq('is_active', true);
      telegramPopupCount = count || 0;
    } catch (e) { /* ignore */ }

    // Sanitize latest users to ensure no password hashes or mpins are exposed
    const safeLatest = (latest || []).map(u => sanitizeUser(u));

    return success(res, 'Dashboard data', {
      totalUsers: total,
      pendingUsers: pending,
      completedUsers: completed,
      todayLogins: todayLogin,
      totalSliders: sliderCount,
      totalVideos: videoCount,
      telegramPopupCount,
      latest: safeLatest
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── ALL USERS ────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const search = sanitizeInput(req.query.search || '');
    const date = sanitizeInput(req.query.date || '');
    const status = sanitizeInput(req.query.status || '');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await User.findAll({
      search,
      date,
      status,
      page,
      limit
    });

    const safeUsers = (result.users || []).map(u => sanitizeUser(u));

    return success(res, 'Users fetched', {
      users: safeUsers,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit)
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── SINGLE USER DETAIL ───────────────────────────────────────────────────────
const getUserDetail = async (req, res) => {
  try {
    const id = sanitizeInput(req.params.id);
    const user = await User.findById(id);
    if (!user) return error(res, 'User not found', 404);
    return success(res, 'User detail', sanitizeUser(user));
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// ─── GET SETTINGS ─────────────────────────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.get();
    if (!settings) settings = await Settings.upsert({});
    return success(res, 'Settings', settings);
  } catch (err) {
    console.error('Settings error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── UPDATE SETTINGS ──────────────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const fields = [
      'usdt_ratio', 'bonus_ratio', 'inr_bonus_ratio', 'tutorial_link',
      'mpin_popup_delay', 'slider_enabled', 'video_popup_enabled',
      'telegram_popup_enabled', 'banner_enabled'
    ];
    const updates = {};
    fields.forEach(f => { 
      if (req.body[f] !== undefined) {
        updates[f] = typeof req.body[f] === 'string' ? sanitizeInput(req.body[f]) : req.body[f];
      } 
    });

    const settings = await Settings.upsert(updates);
    return success(res, 'Settings updated', settings);
  } catch (err) {
    console.error('Update settings error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── GET REPORT (Login Logs) ──────────────────────────────────────────────────
const getReport = async (req, res) => {
  try {
    const startDate = sanitizeInput(req.query.startDate || '');
    const endDate = sanitizeInput(req.query.endDate || '');
    const LoginLog = require('../models/LoginLog');
    const data = await LoginLog.findAll({ startDate, endDate });
    return success(res, 'Report data', data);
  } catch (err) {
    console.error('Report error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── NOTICES ──────────────────────────────────────────────────────────────────
const getNotices = async (req, res) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchError) throw fetchError;
    return success(res, 'Notices fetched', data);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const createNotice = async (req, res) => {
  try {
    const title = sanitizeInput(req.body.title);
    const description = sanitizeInput(req.body.description || '');
    if (!title) return error(res, 'Title is required');
    const { data, error: insertError } = await supabase
      .from('notices')
      .insert({ title, description })
      .select()
      .single();
    if (insertError) throw insertError;
    return success(res, 'Notice created', data, 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const deleteNotice = async (req, res) => {
  try {
    const id = sanitizeInput(req.params.id);
    const { error: deleteError } = await supabase.from('notices').delete().eq('id', id);
    if (deleteError) throw deleteError;
    return success(res, 'Notice deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = {
  getDashboard, getAllUsers, getUserDetail,
  getSettings, updateSettings,
  getReport,
  getNotices, createNotice, deleteNotice
};
