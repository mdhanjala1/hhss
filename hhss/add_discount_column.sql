-- ══════════════════════════════════════════════════════════════
-- SUPABASE SQL EDITOR এ এটি রান করুন (একবার মাত্র)
-- discount_percent কলাম artworks টেবিলে যোগ করবে
-- ══════════════════════════════════════════════════════════════

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS discount_percent NUMERIC DEFAULT NULL;

-- ✅ এরপর ArtistDashboard থেকে আবার আপলোড করুন
