-- ═══════════════════════════════════════════════════════════════
-- RUN THIS IN SUPABASE SQL EDITOR to enable Contact form messages
-- ═══════════════════════════════════════════════════════════════

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

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Anyone can insert contact message"
  ON contact_messages FOR INSERT WITH CHECK (true);

-- Only the admin user can read messages  
CREATE POLICY "Admin can read contact messages"
  ON contact_messages FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'blog.alfamito@gmail.com'
  ));

-- Admin can update (mark as read)
CREATE POLICY "Admin can update contact messages"
  ON contact_messages FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'blog.alfamito@gmail.com'
  ));

