-- ═══════════════════════════════════════════════════════
-- SUPABASE SQL EDITOR এ এই সম্পূর্ণ কোডটি রান করুন
-- ═══════════════════════════════════════════════════════

-- 1. Table তৈরি করুন
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS চালু করুন
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. পুরনো policy মুছুন (থাকলে)
DROP POLICY IF EXISTS "Anyone can insert contact message" ON contact_messages;
DROP POLICY IF EXISTS "Admin can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can update contact messages" ON contact_messages;

-- 4. নতুন policy তৈরি করুন
-- যেকেউ message পাঠাতে পারবে
CREATE POLICY "Anyone can insert contact message"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Admin পড়তে পারবে
CREATE POLICY "Admin can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

-- Admin update করতে পারবে
CREATE POLICY "Admin can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true);
