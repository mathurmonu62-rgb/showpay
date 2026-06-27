const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  getUserDetail,
  getSettings,
  updateSettings,
  getReport,
  getNotices,
  createNotice,
  deleteNotice
} = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/authMiddleware');
const { uploadBanner } = require('../config/multer');
const { uploadLimiter } = require('../middleware/rateLimit');
const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const path = require('path');
const fs = require('fs');

// All admin routes require admin JWT
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);

// Report
router.get('/report', getReport);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Notices
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

// ─── BANNER ────────────────────────────────────────────────────────────────────
router.get('/banner', async (req, res) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (fetchError) throw fetchError;
    return success(res, 'Banner fetched', data);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
});

// Banner upload protected by uploadLimiter
router.post('/banner', uploadLimiter, uploadBanner.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'No image provided');
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/banner/${req.file.filename}`;
    const { data, error: insertError } = await supabase
      .from('banners')
      .insert({ image_url: imageUrl, filename: req.file.filename })
      .select()
      .single();
    if (insertError) throw insertError;
    return success(res, 'Banner uploaded', data, 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
});

router.delete('/banner/:id', async (req, res) => {
  try {
    const { data: banner } = await supabase.from('banners').select('*').eq('id', req.params.id).single();
    if (banner?.filename) {
      const filePath = path.join(__dirname, '../uploads/banner', banner.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    const { error: deleteError } = await supabase.from('banners').delete().eq('id', req.params.id);
    if (deleteError) throw deleteError;
    return success(res, 'Banner deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
});

module.exports = router;
