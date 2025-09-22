-- Disable RLS on all tables temporarily
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Public documents access - SELECT" ON public.documents;
DROP POLICY IF EXISTS "Public documents access - INSERT" ON public.documents;
DROP POLICY IF EXISTS "Public documents access - UPDATE" ON public.documents;
DROP POLICY IF EXISTS "Public documents access - DELETE" ON public.documents;

DROP POLICY IF EXISTS "Categories are publicly viewable" ON public.categories;
DROP POLICY IF EXISTS "Categories can be created publicly" ON public.categories;
DROP POLICY IF EXISTS "Categories can be updated by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Categories can be deleted by authenticated users" ON public.categories;

DROP POLICY IF EXISTS "Document types are publicly viewable" ON public.document_types;
DROP POLICY IF EXISTS "Document types can be created publicly" ON public.document_types;
DROP POLICY IF EXISTS "Document types can be updated by authenticated users" ON public.document_types;
DROP POLICY IF EXISTS "Document types can be deleted by authenticated users" ON public.document_types;

DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON public.activity_logs;
DROP POLICY IF EXISTS "Activity logs can only be inserted by the system" ON public.activity_logs;

DROP POLICY IF EXISTS "Processing jobs are publicly viewable" ON public.processing_jobs;
DROP POLICY IF EXISTS "Processing jobs can be created publicly" ON public.processing_jobs;
DROP POLICY IF EXISTS "Processing jobs can be updated publicly" ON public.processing_jobs;

-- Drop existing check constraint if it exists and create a new one that includes pending_validation
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;

-- Add new check constraint that includes pending_validation
ALTER TABLE public.documents 
ADD CONSTRAINT documents_status_check 
CHECK (status IN ('draft', 'processing', 'processed', 'pending_validation', 'archived', 'error'));

-- Update comment to reflect the new status options
COMMENT ON COLUMN public.documents.status IS 'Document status: draft, processing, processed, pending_validation, archived, error';