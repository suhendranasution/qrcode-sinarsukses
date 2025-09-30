-- Certificate Management Database Schema
-- Creates brands and certificates tables with proper RLS policies

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  certificate_url TEXT,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- This will store the Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brands table
-- All users can read brands (for public access)
CREATE POLICY "Anyone can read brands" ON public.brands
  FOR SELECT USING (true);

-- Admin users can insert brands
CREATE POLICY "Admins can insert brands" ON public.brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin users can update brands
CREATE POLICY "Admins can update brands" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin users can delete brands
CREATE POLICY "Admins can delete brands" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for certificates table
-- Users can read all certificates (public access for verification)
CREATE POLICY "Anyone can read certificates" ON public.certificates
  FOR SELECT USING (true);

-- Admin users can insert certificates
CREATE POLICY "Admins can insert certificates" ON public.certificates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin users can update certificates
CREATE POLICY "Admins can update certificates" ON public.certificates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin users can delete certificates
CREATE POLICY "Admins can delete certificates" ON public.certificates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create unique constraint for brand_id + product_slug combination
-- This ensures each certificate URL is unique
ALTER TABLE public.certificates
ADD CONSTRAINT unique_brand_product_slug UNIQUE (brand_id, product_slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_certificates_brand_id ON public.certificates(brand_id);
CREATE INDEX IF NOT EXISTS idx_certificates_product_slug ON public.certificates(product_slug);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON public.certificates(created_at DESC);

-- Create composite index for fast certificate lookups by brand and product
CREATE INDEX IF NOT EXISTS idx_certificates_brand_product ON public.certificates(brand_id, product_slug);

-- Create a function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  RETURN lower(regexp_replace(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ language 'plpgsql';

-- Create a function to ensure slug uniqueness
CREATE OR REPLACE FUNCTION ensure_unique_slug(table_name TEXT, slug_column TEXT, base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  counter INTEGER := 1;
  new_slug TEXT := base_slug;
  exists BOOLEAN;
BEGIN
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = %L)', table_name, slug_column, new_slug)
    INTO exists;

    IF NOT exists THEN
      RETURN new_slug;
    END IF;

    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
END;
$$ language 'plpgsql';