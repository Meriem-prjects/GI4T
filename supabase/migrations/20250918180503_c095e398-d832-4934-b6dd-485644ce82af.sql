-- Add processing_job_id to documents for linking background jobs
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS processing_job_id UUID NULL;

-- Add foreign key to processing_jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'documents_processing_job_id_fkey'
  ) THEN
    ALTER TABLE public.documents
    ADD CONSTRAINT documents_processing_job_id_fkey
    FOREIGN KEY (processing_job_id)
    REFERENCES public.processing_jobs(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Index for quick lookup by job id
CREATE INDEX IF NOT EXISTS idx_documents_processing_job_id ON public.documents (processing_job_id);
