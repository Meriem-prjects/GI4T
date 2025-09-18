-- Add PDF/A specific columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS pdfa_compliance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pdfa_version TEXT,
ADD COLUMN IF NOT EXISTS pdfa_conformance_level TEXT,
ADD COLUMN IF NOT EXISTS archival_metadata JSONB,
ADD COLUMN IF NOT EXISTS archival_features JSONB;

-- Create index for PDF/A queries
CREATE INDEX IF NOT EXISTS idx_documents_pdfa_compliance ON public.documents(pdfa_compliance);
CREATE INDEX IF NOT EXISTS idx_documents_pdfa_version ON public.documents(pdfa_version);

-- Create function to validate PDF/A compliance
CREATE OR REPLACE FUNCTION public.validate_pdfa_document()
RETURNS TRIGGER AS $$
BEGIN
  -- If document is marked as PDF/A compliant, ensure required fields are present
  IF NEW.pdfa_compliance = TRUE THEN
    IF NEW.pdfa_version IS NULL THEN
      RAISE WARNING 'PDF/A document should have a version specified';
    END IF;
    
    -- Log PDF/A document creation for audit purposes
    INSERT INTO public.activity_logs (
      entity_type,
      entity_id, 
      action,
      details,
      created_at
    ) VALUES (
      'document',
      NEW.id,
      'pdfa_validation',
      jsonb_build_object(
        'pdfa_version', NEW.pdfa_version,
        'conformance_level', NEW.pdfa_conformance_level,
        'archival_features', NEW.archival_features
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create activity_logs table if it doesn't exist (for PDF/A audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger for PDF/A validation
DROP TRIGGER IF EXISTS validate_pdfa_trigger ON public.documents;
CREATE TRIGGER validate_pdfa_trigger
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_pdfa_document();

-- Create function to get PDF/A statistics
CREATE OR REPLACE FUNCTION public.get_pdfa_statistics()
RETURNS TABLE (
  total_documents BIGINT,
  pdfa_documents BIGINT,
  pdfa_percentage NUMERIC,
  pdfa_versions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE pdfa_compliance = TRUE) as pdfa_documents,
    ROUND(
      (COUNT(*) FILTER (WHERE pdfa_compliance = TRUE) * 100.0) / 
      NULLIF(COUNT(*), 0), 
      2
    ) as pdfa_percentage,
    jsonb_object_agg(
      COALESCE(pdfa_version, 'Non-PDF/A'), 
      COUNT(*)
    ) as pdfa_versions
  FROM public.documents
  WHERE file_url IS NOT NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;