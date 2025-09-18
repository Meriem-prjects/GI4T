-- Relax INSERT RLS for public creation of categories and document types

-- Drop previous INSERT policies that required authentication
DROP POLICY IF EXISTS "Categories can be created by authenticated users" ON categories;
DROP POLICY IF EXISTS "Document types can be created by authenticated users" ON document_types;

-- Allow anyone (even unauthenticated) to insert new rows
CREATE POLICY "Categories can be created publicly"
ON categories FOR INSERT
WITH CHECK (true);

CREATE POLICY "Document types can be created publicly"
ON document_types FOR INSERT
WITH CHECK (true);