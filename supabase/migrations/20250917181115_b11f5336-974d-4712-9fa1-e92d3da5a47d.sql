-- Remove all authentication requirements for document operations

-- Drop all existing RLS policies that require authentication
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

-- Create public policies for documents table
CREATE POLICY "Documents can be viewed publicly"
ON documents FOR SELECT
USING (true);

CREATE POLICY "Documents can be created publicly"
ON documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Documents can be updated publicly"
ON documents FOR UPDATE
USING (true);

CREATE POLICY "Documents can be deleted publicly"
ON documents FOR DELETE
USING (true);

-- Remove authentication restrictions from storage buckets
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create public storage policies
CREATE POLICY "Anyone can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents');