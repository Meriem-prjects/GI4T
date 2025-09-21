-- Add court category and court level fields to documents table
ALTER TABLE public.documents 
ADD COLUMN court_category text,
ADD COLUMN court_category_ar text,
ADD COLUMN court_level text,
ADD COLUMN court_level_ar text;