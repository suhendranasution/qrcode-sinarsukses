-- Check certificates table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'certificates'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we need to add user_id column to certificates table
-- Based on the error, it seems like user_id might be UUID type or have constraints