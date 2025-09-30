-- ============================================================================
-- SAFE DATABASE SETUP FOR USER MANAGEMENT SYSTEM
-- ============================================================================

-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Open the SQL editor
-- 3. Copy and paste this entire script
-- 4. Run the script to create/update the users table
-- 5. This script is safe to run multiple times

-- ============================================================================
-- STEP 1: Create users table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create trigger function (if not exists)
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Drop trigger if exists and recreate it
-- ============================================================================
DROP TRIGGER IF EXISTS handle_users_updated_at ON users;

CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- STEP 4: Insert default users (if not exists)
-- ============================================================================
-- Super Admin (password: admin123)
INSERT INTO users (id, email, name, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'superadmin@example.com',
    'Super Admin',
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', -- SHA-256 hash of 'admin123'
    'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- Regular Admin (password: admin123)
INSERT INTO users (id, email, name, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'admin@example.com',
    'Admin',
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', -- SHA-256 hash of 'admin123'
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 5: Verify setup
-- ============================================================================
-- This query should return the default users
SELECT id, email, name, role, created_at FROM users ORDER BY created_at;

-- ============================================================================
-- STEP 6: Test data insertion (optional)
-- ============================================================================
-- Uncomment the line below to test if you can insert data
-- INSERT INTO users (email, name, password_hash, role) VALUES ('test@example.com', 'Test User', 'test123', 'viewer');

-- ============================================================================
-- SUCCESS CHECK:
-- ============================================================================
-- Run this query to verify everything is working:
-- SELECT * FROM users;
-- You should see at least 2 default users (superadmin and admin)

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. This script is safe to run multiple times
-- 2. It uses IF NOT EXISTS and ON CONFLICT clauses
-- 3. Default credentials:
--    - superadmin@example.com / admin123 (Super Admin)
--    - admin@example.com / admin123 (Admin)
-- 4. New users created through the UI will be stored in this table
-- 5. The password_hash field contains hashed passwords, not plain text
-- ============================================================================