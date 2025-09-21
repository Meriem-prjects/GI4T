-- Add translated_content column to documents table for storing AI-translated content
ALTER TABLE public.documents 
ADD COLUMN translated_content text;