-- Clean up and recreate documents table RLS policies to remove authentication requirements

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Documents can be viewed publicly" ON documents;
DROP POLICY IF EXISTS "Documents can be created publicly" ON documents;
DROP POLICY IF EXISTS "Documents can be updated publicly" ON documents;
DROP POLICY IF EXISTS "Documents can be deleted publicly" ON documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;

-- Create fresh public policies for documents table
CREATE POLICY "Public documents access - SELECT"
ON documents FOR SELECT
USING (true);

CREATE POLICY "Public documents access - INSERT"
ON documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public documents access - UPDATE"
ON documents FOR UPDATE
USING (true);

CREATE POLICY "Public documents access - DELETE"
ON documents FOR DELETE
USING (true);