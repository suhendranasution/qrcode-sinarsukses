-- Add column for storing file data as base64
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS file_data TEXT,
ADD COLUMN IF NOT EXISTS file_mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

-- Update existing records to have empty file data
UPDATE certificates
SET file_data = NULL,
    file_mime_type = NULL,
    file_name = NULL
WHERE file_data IS NULL;