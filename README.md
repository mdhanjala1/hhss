-- Run this in Supabase SQL Editor to add NID verification columns
ALTER TABLE artists 
  ADD COLUMN IF NOT EXISTS nid_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS nid_number TEXT,
  ADD COLUMN IF NOT EXISTS nid_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- Update existing verified artists
UPDATE artists SET verification_status = 'verified' WHERE is_verified = true;
UPDATE artists SET verification_status = 'unverified' WHERE is_verified = false AND verification_status IS NULL;
