-- Create document_categories junction table for many-to-many relationship
CREATE TABLE public.document_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique combination of document and category
  UNIQUE(document_id, category_id)
);

-- Enable RLS
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX idx_document_categories_document_id ON public.document_categories(document_id);
CREATE INDEX idx_document_categories_category_id ON public.document_categories(category_id);

-- Migrate existing data from documents.category_id to the new junction table
INSERT INTO public.document_categories (document_id, category_id)
SELECT id, category_id 
FROM public.documents 
WHERE category_id IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_document_categories_updated_at
  BEFORE UPDATE ON public.document_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();