// controllers/popupController.js — Telegram Popup management
const Popup = require('../models/Popup');
const { success, error } = require('../utils/response');
const path = require('path');
const fs = require('fs');

// ─── GET POPUP (Public) ───────────────────────────────────────────────────────
const getTelegramPopup = async (req, res) => {
  try {
    const popup = await Popup.get();
    return success(res, 'Telegram popup', popup);
  } catch (err) {
    console.error('Get popup error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// ─── UPDATE POPUP (Admin) ─────────────────────────────────────────────────────
const updateTelegramPopup = async (req, res) => {
  try {
    const { title, description, telegram_link, is_active } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (telegram_link !== undefined) updates.telegram_link = telegram_link;
    if (is_active !== undefined) {
      updates.is_active = is_active === 'true' || is_active === true;
    }

    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/popup/${req.file.filename}`;
      updates.image_url = imageUrl;
      updates.filename = req.file.filename;
    }

    const popup = await Popup.upsert(updates);
    return success(res, 'Telegram popup updated', popup);
  } catch (err) {
    console.error('Update popup error:', err.message);
    return error(res, 'Server error', 500);
  }
};

module.exports = { getTelegramPopup, updateTelegramPopup };
