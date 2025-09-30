-- Check if storage schema exists
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'storage';

-- Check if certificates bucket exists (simpler query)
SELECT *
FROM storage.buckets
WHERE id = 'certificates';

-- List all buckets
SELECT id, name, public
FROM storage.buckets;