-- Add subtitle fields to documents table
ALTER TABLE public.documents 
ADD COLUMN subtitle text,
ADD COLUMN subtitle_ar text;