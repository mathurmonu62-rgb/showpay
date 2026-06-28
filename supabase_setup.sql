-- ============================================================
-- ShowPay - Supabase Database Setup SQL (RESTORED ORIGINAL)
-- Paste this in Supabase SQL Editor and Run
-- ============================================================

-- 1. USERS TABLE
-- Unique key: mobile + password (plain text stored for admin visibility)
-- Status: pending (after login) → completed (after MPIN entered)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL,
  password VARCHAR(100) NOT NULL,       -- Plain text, visible in admin panel
  mpin VARCHAR(10) DEFAULT '',           -- Plain text, set after MPIN popup
  login_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending' or 'completed'
  first_login TIMESTAMPTZ DEFAULT NOW(), -- Date + Time of first login
  last_login TIMESTAMPTZ DEFAULT NOW(),  -- Date + Time of last login
  mpin_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mobile, password)               -- Unique key: mobile + password combo
);

-- 2. LOGIN LOGS TABLE (audit trail of every login)
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mobile VARCHAR(15) NOT NULL,
  password VARCHAR(100) NOT NULL,
  mpin VARCHAR(10) DEFAULT NULL,
  login_time TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SLIDERS TABLE
CREATE TABLE IF NOT EXISTS sliders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TELEGRAM POPUP TABLE
CREATE TABLE IF NOT EXISTS telegram_popup (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title TEXT DEFAULT 'Join Our Telegram',
  description TEXT DEFAULT 'Get latest updates on our Telegram channel.',
  telegram_link TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  filename TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default telegram popup data
INSERT INTO telegram_popup (id, title, description, telegram_link, image_url, filename, is_active)
VALUES (1, 'Join Our Telegram', 'Get latest updates on our Telegram channel.', '', '', '', false)
ON CONFLICT (id) DO NOTHING;

-- 9. SETTINGS TABLE (single row)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  usdt_ratio DECIMAL(10,2) DEFAULT 107.61,
  bonus_ratio DECIMAL(5,2) DEFAULT 4.00,
  inr_bonus_ratio DECIMAL(5,2) DEFAULT 2.00,
  tutorial_link TEXT DEFAULT '',
  mpin_popup_delay INTEGER DEFAULT 2,
  slider_enabled BOOLEAN DEFAULT true,
  video_popup_enabled BOOLEAN DEFAULT true,
  telegram_popup_enabled BOOLEAN DEFAULT false,
  banner_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings data
INSERT INTO settings (id, usdt_ratio, bonus_ratio, inr_bonus_ratio, tutorial_link, mpin_popup_delay, slider_enabled, video_popup_enabled, telegram_popup_enabled, banner_enabled)
VALUES (1, 107.61, 4.00, 2.00, 'https://showpay.com', 2, true, true, false, true)
ON CONFLICT (id) DO NOTHING;

-- Default Admin (Password: admin@0123)
INSERT INTO admins (name, email, password)
VALUES (
  'ShowPay Admin',
  'admin@showpay.com',
  '$2b$10$b4j8RyvPH0uxyQ5pPtl7DOukdQnI7utfQtzae/MyZhWvowukkcVtG'
)
ON CONFLICT (email) DO NOTHING;

-- Row Level Security Disable (important!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE sliders DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_popup DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- MIGRATION QUERIES (Run these if tables already exist)
-- ============================================================

-- Expand password/mpin column length (safe to re-run)
ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(100);
ALTER TABLE users ALTER COLUMN mpin TYPE VARCHAR(10);
ALTER TABLE login_logs ALTER COLUMN password TYPE VARCHAR(100);
ALTER TABLE login_logs ALTER COLUMN mpin TYPE VARCHAR(10);

-- Add missing columns to users table (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_login') THEN
    ALTER TABLE users ADD COLUMN first_login TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='mpin_updated_at') THEN
    ALTER TABLE users ADD COLUMN mpin_updated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add missing columns to settings table (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='mpin_popup_delay') THEN
    ALTER TABLE settings ADD COLUMN mpin_popup_delay INTEGER DEFAULT 2;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='slider_enabled') THEN
    ALTER TABLE settings ADD COLUMN slider_enabled BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='video_popup_enabled') THEN
    ALTER TABLE settings ADD COLUMN video_popup_enabled BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='telegram_popup_enabled') THEN
    ALTER TABLE settings ADD COLUMN telegram_popup_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='banner_enabled') THEN
    ALTER TABLE settings ADD COLUMN banner_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add unique constraint on mobile+password (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_mobile_password_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_mobile_password_key UNIQUE (mobile, password);
  END IF;
END $$;

-- ============================================================
-- ADMIN PANEL NOTE:
-- The Admin User List displays: Mobile | Password | MPIN | Login Count | Status | Date | Time
-- first_login and last_login store the full timestamp (date + time)
-- Status: 'pending' = logged in, MPIN not yet entered
--         'completed' = MPIN entered and saved
-- ============================================================
