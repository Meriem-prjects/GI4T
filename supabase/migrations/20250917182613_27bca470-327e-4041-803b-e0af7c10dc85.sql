-- Make documents.user_id nullable to allow uploads without authentication
ALTER TABLE documents ALTER COLUMN user_id DROP NOT NULL;