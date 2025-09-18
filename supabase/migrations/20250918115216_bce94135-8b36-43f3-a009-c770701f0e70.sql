-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for documents bucket
CREATE POLICY "Documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can update documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can delete documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents');