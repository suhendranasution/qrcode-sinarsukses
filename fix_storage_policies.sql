-- Fix storage policies for certificates bucket
-- Drop existing policies first
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete certificates" ON storage.objects;

-- Create new policies that allow all access to certificates bucket
CREATE POLICY "Public certificate access" ON storage.objects
FOR SELECT USING (bucket_id = 'certificates');

CREATE POLICY "Anyone can upload to certificates" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Anyone can update certificates" ON storage.objects
FOR UPDATE USING (bucket_id = 'certificates');

CREATE POLICY "Anyone can delete certificates" ON storage.objects
FOR DELETE USING (bucket_id = 'certificates');

-- Also ensure RLS is enabled on the bucket
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;