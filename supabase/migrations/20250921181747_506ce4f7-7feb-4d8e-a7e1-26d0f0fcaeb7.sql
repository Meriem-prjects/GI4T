-- Update the documents status constraint to include draft and published statuses
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_status_check;

-- Add the updated constraint with all valid status values
ALTER TABLE public.documents 
ADD CONSTRAINT documents_status_check 
CHECK (status IN ('processing', 'processed', 'error', 'draft', 'published'));