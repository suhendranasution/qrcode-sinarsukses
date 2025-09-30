-- ============================================================================
-- DATABASE STATUS CHECK
-- ============================================================================

-- Run this script to check if your database is properly set up

-- Check if users table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'users';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check current users
SELECT id, email, name, role, created_at
FROM users
ORDER BY created_at;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'handle_users_updated_at'
AND event_object_table = 'users';

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_updated_at'
AND routine_schema = 'public';