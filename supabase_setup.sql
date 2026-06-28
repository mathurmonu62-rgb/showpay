-- ============================================================
-- ShowPay Database Setup — Supabase SQL Editor me paste karo
-- ============================================================

-- 1. USERS TABLE (fresh create)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL,
  password VARCHAR(100) NOT NULL,
  mpin VARCHAR(6) DEFAULT '',
  login_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  first_login TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  mpin_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agar table pehle se exist karti hai to missing columns add karo
ALTER TABLE users ADD COLUMN IF NOT EXISTS mpin VARCHAR(6) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS mpin_updated_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Unique constraint (mobile + password combo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_mobile_password_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_mobile_password_key UNIQUE (mobile, password);
  END IF;
END $$;

-- 2. LOGIN LOGS TABLE
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mobile VARCHAR(15) NOT NULL,
  password VARCHAR(100) NOT NULL,
  mpin VARCHAR(6) DEFAULT NULL,
  login_time TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SLIDERS TABLE
CREATE TABLE IF NOT EXISTS sliders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TELEGRAM POPUP TABLE (single row — id=1)
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

INSERT INTO telegram_popup (id, title, description, telegram_link, image_url, filename, is_active)
VALUES (1, 'Join Our Telegram', 'Get latest updates on our Telegram channel.', '', '', '', false)
ON CONFLICT (id) DO NOTHING;

-- 8. SETTINGS TABLE (single row — id=1)
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

-- Missing settings columns add karo (agar pehle se exist karti hai)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS mpin_popup_delay INTEGER DEFAULT 2;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS slider_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video_popup_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS telegram_popup_enabled BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT true;

INSERT INTO settings (id, usdt_ratio, bonus_ratio, inr_bonus_ratio, tutorial_link, mpin_popup_delay, slider_enabled, video_popup_enabled, telegram_popup_enabled, banner_enabled)
VALUES (1, 107.61, 4.00, 2.00, '', 2, true, true, false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS DISABLE — BAHUT IMPORTANT!
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sliders DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_popup DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE! Ab backend login test karo.
-- ============================================================
