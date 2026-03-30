-- =====================================================
-- Run this AFTER you sign up to make yourself admin
-- Replace 'your-email@example.com' with your email
-- Run in Supabase Dashboard → SQL Editor
-- =====================================================

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
