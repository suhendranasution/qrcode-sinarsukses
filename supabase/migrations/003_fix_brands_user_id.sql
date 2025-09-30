-- Add user_id column to brands table
-- This fixes the missing user_id column issue

-- Add user_id column to brands table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'user_id') THEN
        ALTER TABLE public.brands ADD COLUMN user_id TEXT NOT NULL DEFAULT 'admin';
    END IF;
END
$$;

-- Add index for user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_brands_user_id') THEN
        CREATE INDEX idx_brands_user_id ON public.brands(user_id);
    END IF;
END
$$;

-- Update RLS policies for brands table to work with user_id
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can insert brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can update brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can delete brands" ON public.brands;

-- Create new policies
CREATE POLICY "Anyone can read brands" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Users can insert brands" ON public.brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

CREATE POLICY "Users can update brands" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated' OR true);

CREATE POLICY "Users can delete brands" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated' OR true);