-- Remove restrictive CHECK constraints on court category type columns
-- These constraints were limiting the values to only specific hardcoded options
-- preventing the use of all court types defined in the court_types table

-- Drop the existing restrictive CHECK constraints
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_court_category_type_check;

ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_court_category_type_ar_check;

-- Optional: Add more flexible constraints if needed in the future
-- For now, we'll rely on the court_types table for validation