-- Create Supabase Storage bucket for certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true, -- public bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

-- Set up storage policies to allow public access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'certificates');

CREATE POLICY "Anyone can upload certificates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = 'certificates'
);

CREATE POLICY "Anyone can update certificates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = 'certificates'
);

CREATE POLICY "Anyone can delete certificates" ON storage.objects
FOR DELETE USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = 'certificates'
);