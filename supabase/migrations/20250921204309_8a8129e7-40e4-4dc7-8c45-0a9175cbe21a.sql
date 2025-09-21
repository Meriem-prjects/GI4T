-- Add new metadata fields to documents table
ALTER TABLE public.documents 
ADD COLUMN author text,
ADD COLUMN author_ar text,
ADD COLUMN court text,
ADD COLUMN court_ar text,
ADD COLUMN case_number text,
ADD COLUMN year integer,
ADD COLUMN plaintiff text,
ADD COLUMN plaintiff_ar text,
ADD COLUMN defendant text,
ADD COLUMN defendant_ar text;