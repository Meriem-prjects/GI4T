-- Update RLS policies to allow public read access to categories and document types
-- Since this is reference data needed for the upload interface

DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories can be managed by authenticated users" ON categories;

DROP POLICY IF EXISTS "Document types are viewable by authenticated users" ON document_types;
DROP POLICY IF EXISTS "Document types can be managed by authenticated users" ON document_types;

-- Allow public read access to categories and document types
CREATE POLICY "Categories are publicly viewable" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "Document types are publicly viewable" 
ON document_types FOR SELECT 
USING (true);

-- For write operations, still require authentication
CREATE POLICY "Categories can be created by authenticated users" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Categories can be updated by authenticated users" 
ON categories FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Categories can be deleted by authenticated users" 
ON categories FOR DELETE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Document types can be created by authenticated users" 
ON document_types FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Document types can be updated by authenticated users" 
ON document_types FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Document types can be deleted by authenticated users" 
ON document_types FOR DELETE 
USING (auth.uid() IS NOT NULL);