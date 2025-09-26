-- Add textual_metadata field to documents table
ALTER TABLE public.documents 
ADD COLUMN textual_metadata text;