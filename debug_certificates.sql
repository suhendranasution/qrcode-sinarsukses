-- Debug and Fix Certificates Table Access
-- Run this in Supabase SQL Editor

-- First, let's check if certificates table exists and has the right structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'certificates'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('certificates', 'brands');

-- Check existing policies on certificates
SELECT policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'certificates';

-- Drop any existing certificate policies
DROP POLICY IF EXISTS "Anyone can read certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;
DROP POLICY IF EXISTS "Enable all access for certificates" ON public.certificates;

-- Create new policy that allows all operations
CREATE POLICY "Enable all access for certificates" ON public.certificates
  FOR ALL USING (true) WITH CHECK (true);

-- Test if we can access the table
-- This should show the count or return empty
SELECT COUNT(*) FROM certificates;

-- If you get any errors above, try disabling RLS temporarily
-- ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;