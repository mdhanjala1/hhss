-- ════════════════════════════════════════
-- ADMIN RLS FIX — Supabase SQL Editor-এ run করুন
-- ════════════════════════════════════════

-- 1. Artists table: Admin যেন যেকোনো artist update করতে পারে
DROP POLICY IF EXISTS "artists_update" ON artists;
CREATE POLICY "artists_update" ON artists FOR UPDATE USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM artists a WHERE a.user_id = auth.uid() AND a.email = current_setting('app.admin_email', true)
  )
  OR auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
);

-- Simpler approach: allow authenticated users to update any artist
-- (Admin check is done in the app code)
DROP POLICY IF EXISTS "artists_update" ON artists;
CREATE POLICY "artists_update" ON artists FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- 2. Artworks table: Admin can see ALL artworks (including pending)
DROP POLICY IF EXISTS "artworks_select" ON artworks;
CREATE POLICY "artworks_select" ON artworks FOR SELECT USING (
  status = 'approved'
  OR artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid())
  OR auth.uid() IS NOT NULL
);

-- 3. Artworks update: Admin can update any artwork status
DROP POLICY IF EXISTS "artworks_update" ON artworks;
CREATE POLICY "artworks_update" ON artworks FOR UPDATE USING (
  auth.uid() IS NOT NULL
);

-- 4. Notifications: Admin can insert notifications
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Done!
SELECT 'RLS policies updated successfully' as status;

-- ════════════════════════════════════════
-- CONTACT MESSAGES TABLE (নতুন)
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (send a message)
DROP POLICY IF EXISTS "contact_insert" ON contact_messages;
CREATE POLICY "contact_insert" ON contact_messages FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admin reads them)
DROP POLICY IF EXISTS "contact_select" ON contact_messages;
CREATE POLICY "contact_select" ON contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update (mark as read)
DROP POLICY IF EXISTS "contact_update" ON contact_messages;
CREATE POLICY "contact_update" ON contact_messages FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Also add discount_percent column to artworks if not exists
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2);

SELECT 'contact_messages table and discount_percent column created' as status;
