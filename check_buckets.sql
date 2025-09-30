-- Check if certificates bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'certificates';

-- Check existing storage policies
SELECT *
FROM storage.policies
WHERE bucket_id = 'certificates';

-- Check RLS status on buckets table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'buckets' AND relnamespace = 'storage'::regnamespace;