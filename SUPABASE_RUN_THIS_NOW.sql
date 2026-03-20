-- ══════════════════════════════════════════════════════════════════
-- শিল্পশপ — COMPLETE FIX SQL
-- Supabase Dashboard > SQL Editor এ এই পুরো file রান করুন
-- ══════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────┐
-- │  PART 1: MODERATORS TABLE — INSERT POLICY FIX           │
-- └─────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- SELECT policy (যেকেউ পড়তে পারবে — login check এর জন্য)
DROP POLICY IF EXISTS "moderators_select" ON moderators;
CREATE POLICY "moderators_select" ON moderators FOR SELECT USING (true);

-- INSERT policy (যেকেউ insert করতে পারবে — admin frontend থেকে)
DROP POLICY IF EXISTS "moderators_insert" ON moderators;
CREATE POLICY "moderators_insert" ON moderators FOR INSERT WITH CHECK (true);

-- UPDATE policy
DROP POLICY IF EXISTS "moderators_update" ON moderators;
CREATE POLICY "moderators_update" ON moderators FOR UPDATE USING (true);

-- DELETE policy
DROP POLICY IF EXISTS "moderators_delete" ON moderators;
CREATE POLICY "moderators_delete" ON moderators FOR DELETE USING (true);

-- প্রথম মডারেটর যোগ করুন
INSERT INTO moderators (email, name, is_active)
VALUES ('marufhasan1624716@gmail.com', 'Maruf Hasan', true)
ON CONFLICT (email) DO UPDATE SET is_active = true, name = 'Maruf Hasan';

-- ┌─────────────────────────────────────────────────────────┐
-- │  PART 2: ARTWORK DELETE — সব FK CONSTRAINT FIX          │
-- └─────────────────────────────────────────────────────────┘

-- orders.artwork_id → ON DELETE SET NULL
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_artwork_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_artwork_id_fkey
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL;

-- reviews.artwork_id → ON DELETE SET NULL
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_artwork_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_artwork_id_fkey
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL;

-- notifications.related_artwork_id → ON DELETE SET NULL
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_artwork_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_related_artwork_id_fkey
  FOREIGN KEY (related_artwork_id) REFERENCES artworks(id) ON DELETE SET NULL;

-- artworks DELETE policy (artist নিজের artwork মুছতে পারবে)
DROP POLICY IF EXISTS "artworks_delete" ON artworks;
CREATE POLICY "artworks_delete" ON artworks
  FOR DELETE USING (
    artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid())
  );

-- ┌─────────────────────────────────────────────────────────┐
-- │  VERIFY                                                  │
-- └─────────────────────────────────────────────────────────┘
SELECT 'SUCCESS: All fixes applied' as result;
SELECT email, name, is_active FROM moderators ORDER BY created_at;
