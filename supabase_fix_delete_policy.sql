-- ══════════════════════════════════════════════════════════
-- শিল্পশপ — Artwork DELETE Policy Fix
-- এই SQL টি Supabase Dashboard > SQL Editor এ রান করুন
-- ══════════════════════════════════════════════════════════

-- আর্টওয়ার্ক ডিলিট পলিসি যোগ করুন (শিল্পী নিজের আর্টওয়ার্ক মুছতে পারবেন)
DROP POLICY IF EXISTS "artworks_delete" ON artworks;

CREATE POLICY "artworks_delete" ON artworks
  FOR DELETE
  USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════
-- টাইপোগ্রাফি আর্ট category সাপোর্টের জন্য কোনো DB পরিবর্তন নেই
-- category TEXT field এ যেকোনো মান যাবে
-- ══════════════════════════════════════════════════════════

-- Verify policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'artworks'
ORDER BY policyname;
