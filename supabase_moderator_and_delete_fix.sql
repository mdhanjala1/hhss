-- ══════════════════════════════════════════════════════════════
-- শিল্পশপ — Moderator System (DB-based)
-- Supabase Dashboard > SQL Editor এ রান করুন
-- ══════════════════════════════════════════════════════════════

-- 1. Moderators টেবিল তৈরি করুন
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS চালু করুন
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- 3. যেকেউ নিজের email check করতে পারবে (login চেক এর জন্য)
DROP POLICY IF EXISTS "moderators_select" ON moderators;
CREATE POLICY "moderators_select" ON moderators
  FOR SELECT USING (true);

-- 4. মডারেটর যোগ করুন (প্রয়োজনমতো email পরিবর্তন করুন)
INSERT INTO moderators (email, name, is_active)
VALUES
  ('marufhasan1624716@gmail.com', 'Maruf Hasan', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- ══════════════════════════════════════════════════════════════
-- Artwork DELETE constraint fix
-- orders ও reviews এ artwork_id nullable করুন (ইতিমধ্যে nullable)
-- Extra safety: ON DELETE SET NULL constraint যোগ করুন
-- ══════════════════════════════════════════════════════════════

-- orders টেবিলে artwork_id FK constraint আপডেট
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_artwork_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_artwork_id_fkey
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL;

-- reviews টেবিলে artwork_id FK constraint আপডেট
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_artwork_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_artwork_id_fkey
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL;

-- notifications এ কোনো artwork_id নেই, তাই ঠিক আছে

-- Verify
SELECT 'moderators table created' as status;
SELECT email, name, is_active FROM moderators;
