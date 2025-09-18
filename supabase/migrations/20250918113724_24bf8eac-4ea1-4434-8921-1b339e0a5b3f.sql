-- Add page-by-page parsing columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS page_contents jsonb,
ADD COLUMN IF NOT EXISTS processed_pages integer,
ADD COLUMN IF NOT EXISTS total_pages integer;

-- Optional: comment for documentation
COMMENT ON COLUMN public.documents.page_contents IS 'Array of page objects: [{pageNumber:int, content:text, confidence:number}]';
COMMENT ON COLUMN public.documents.processed_pages IS 'Number of pages actually processed by OCR/AI';
COMMENT ON COLUMN public.documents.total_pages IS 'Total pages detected in the PDF';

-- Simple index to allow containment queries if needed later
CREATE INDEX IF NOT EXISTS documents_page_contents_gin ON public.documents USING GIN (page_contents);
