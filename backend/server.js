require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes   = require('./routes/authRoutes');
const mpinRoutes   = require('./routes/mpinRoutes');
const sliderRoutes = require('./routes/sliderRoutes');
const videoRoutes  = require('./routes/videoRoutes');
const adminRoutes  = require('./routes/adminRoutes');
const popupRoutes  = require('./routes/popupRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CREATE UPLOAD DIRECTORIES ─────────────────────────────────────────────────
['uploads/slider', 'uploads/banner', 'uploads/video', 'uploads/popup'].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// ─── SECURITY & PARSING MIDDLEWARE ────────────────────────────────────────────
// Helmet security headers — configured to allow cross-origin media serving for uploads
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors({
  origin: true, // Automatically reflects the requesting origin (supports all Vercel domains)
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES (With General API Rate Limiting) ─────────────────────────────────
app.use('/api', apiLimiter); // Apply general rate limiting to all /api routes
app.use('/api/auth',    authRoutes);
app.use('/api/mpin',    mpinRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/videos',  videoRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/popup',   popupRoutes);
app.use('/api/reports', reportRoutes);

// ─── PUBLIC BANNER (user app) ─────────────────────────────────────────────────
const supabase = require('./config/supabase');
app.get('/api/banner', async (req, res) => {
  try {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, data: null });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ShowPay API is running 🚀', timestamp: new Date() });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER (Production hardened — no stack traces) ─────────────
app.use((err, req, res, next) => {
  // Generic production error message without exposing sensitive details or internal stack traces
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ShowPay Backend running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel API: http://localhost:${PORT}/api/admin`);
  console.log(`💊 Health Check: http://localhost:${PORT}/api/health\n`);
});
