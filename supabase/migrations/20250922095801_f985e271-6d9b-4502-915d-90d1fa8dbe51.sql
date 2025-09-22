-- Add pending_validation status to documents table
-- Update the status field to include the new validation status
COMMENT ON COLUMN public.documents.status IS 'Document status: draft, processed, pending_validation, archived';

-- Create trigger to log status changes for validation workflow
CREATE OR REPLACE FUNCTION public.log_document_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes in activity logs
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activity_logs (
      entity_type,
      entity_id,
      action,
      details,
      created_at
    ) VALUES (
      'document',
      NEW.id,
      'status_change',
      jsonb_build_object(
        'old_status', COALESCE(OLD.status, 'null'),
        'new_status', NEW.status,
        'changed_at', now()
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

-- Create trigger for status changes
DROP TRIGGER IF EXISTS trigger_log_document_status_change ON public.documents;
CREATE TRIGGER trigger_log_document_status_change
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_document_status_change();