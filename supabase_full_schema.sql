-- =====================================================
-- ShilpoShop Complete Database Schema
-- Run this in Supabase SQL Editor (one time setup)
-- =====================================================

-- ARTISTS TABLE
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  district TEXT NOT NULL,
  bio TEXT,
  art_types TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  profile_image_url TEXT DEFAULT '',
  nid_front_url TEXT,
  nid_back_url TEXT,
  nid_photo_url TEXT,
  nid_number TEXT,
  nid_name TEXT,
  verification_status TEXT DEFAULT 'unverified',
  facebook_url TEXT,
  instagram_url TEXT,
  total_sales INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  rating_avg NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARTWORKS TABLE
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  size_inches TEXT,
  medium TEXT,
  colors TEXT,
  year_created TEXT,
  image_url TEXT NOT NULL,
  image_public_id TEXT,
  thumbnail_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  admin_note TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE (with order_number auto-generated)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE DEFAULT 'ORD-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  artwork_id UUID REFERENCES artworks(id),
  artist_id UUID REFERENCES artists(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_district TEXT NOT NULL,
  customer_note TEXT,
  artwork_title TEXT NOT NULL,
  artwork_price NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'Cash on Delivery',
  status TEXT DEFAULT 'new',
  artist_note TEXT,
  confirmed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  artwork_id UUID REFERENCES artworks(id),
  artist_id UUID REFERENCES artists(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_order_id UUID REFERENCES orders(id),
  related_artwork_id UUID REFERENCES artworks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE_SETTINGS TABLE (for admin to control site)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'ShilpoShop'),
  ('maintenance_mode', 'false'),
  ('free_delivery', 'true'),
  ('commission_percent', '10')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Artists: anyone can read, authenticated can update own
CREATE POLICY "artists_select" ON artists FOR SELECT USING (true);
CREATE POLICY "artists_insert" ON artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "artists_update" ON artists FOR UPDATE USING (auth.uid() = user_id);

-- Artworks: anyone can read approved, artists manage own
CREATE POLICY "artworks_select" ON artworks FOR SELECT USING (status = 'approved' OR artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
CREATE POLICY "artworks_insert" ON artworks FOR INSERT WITH CHECK (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
CREATE POLICY "artworks_update" ON artworks FOR UPDATE USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

-- Orders: customers can insert, artists can read/update own orders
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

-- Reviews: public read, anyone can insert
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);

-- Notifications: only the artist can see their own
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

-- =====================================================
-- MIGRATION: Add missing columns to existing tables
-- (Safe to run even if already exists)
-- =====================================================
ALTER TABLE artists ADD COLUMN IF NOT EXISTS nid_photo_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS nid_number TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS nid_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS colors TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS year_created TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS medium TEXT;

-- Update existing verification statuses
UPDATE artists SET verification_status = 'verified' WHERE is_verified = true AND verification_status IS NULL;
UPDATE artists SET verification_status = 'unverified' WHERE is_verified = false AND verification_status IS NULL;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update artist stats when order delivered
CREATE OR REPLACE FUNCTION update_artist_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE artists SET
      total_sales = total_sales + 1,
      total_earnings = total_earnings + NEW.artwork_price
    WHERE id = NEW.artist_id;
    
    -- Update artwork order count
    UPDATE artworks SET order_count = order_count + 1 WHERE id = NEW.artwork_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_delivered ON orders;
CREATE TRIGGER on_order_delivered
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_artist_stats();

-- Auto-update artist rating when review added
CREATE OR REPLACE FUNCTION update_artist_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artists SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE artist_id = NEW.artist_id AND is_visible = true),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE artist_id = NEW.artist_id AND is_visible = true)
  WHERE id = NEW.artist_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_added ON reviews;
CREATE TRIGGER on_review_added
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_artist_rating();
