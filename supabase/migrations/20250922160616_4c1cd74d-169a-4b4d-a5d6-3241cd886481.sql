-- Add court category field to documents table if it doesn't exist
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS court_category_type text CHECK (court_category_type IN ('civil', 'administratif'));

-- Add Arabic version for court category type
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS court_category_type_ar text CHECK (court_category_type_ar IN ('مدني', 'إداري'));

-- Add comment to explain the field
COMMENT ON COLUMN public.documents.court_category_type IS 'Type de catégorie de tribunal: civil ou administratif';
COMMENT ON COLUMN public.documents.court_category_type_ar IS 'نوع فئة المحكمة: مدني أو إداري';