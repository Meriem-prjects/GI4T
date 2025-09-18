-- Create processing_jobs table for real-time progress tracking
CREATE TABLE IF NOT EXISTS public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER NOT NULL DEFAULT 0, -- 0-100
  current_step TEXT, -- 'upload', 'pdf_conversion', 'ocr_page_1', 'ocr_page_2', etc.
  total_pages INTEGER DEFAULT 0,
  processed_pages INTEGER DEFAULT 0,
  error_message TEXT,
  result_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for processing_jobs
CREATE POLICY "Processing jobs are publicly viewable" 
ON public.processing_jobs 
FOR SELECT 
USING (true);

CREATE POLICY "Processing jobs can be created publicly" 
ON public.processing_jobs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Processing jobs can be updated publicly" 
ON public.processing_jobs 
FOR UPDATE 
USING (true);

-- Enable realtime for processing_jobs
ALTER TABLE public.processing_jobs REPLICA IDENTITY FULL;

-- Create trigger for updated_at
CREATE TRIGGER update_processing_jobs_updated_at
BEFORE UPDATE ON public.processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient queries
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at DESC);