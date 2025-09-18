-- Ensure 'documents' bucket is public so public URLs work
UPDATE storage.buckets SET public = true WHERE id = 'documents';