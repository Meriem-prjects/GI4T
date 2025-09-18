-- Fix documents table RLS policies to remove authentication requirements

-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Users can create their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;

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