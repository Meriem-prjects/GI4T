-- Add new document type for "Fiche d'analyse"
INSERT INTO document_types (name, name_ar, description, description_ar)
VALUES (
  'Fiche d''analyse', 
  'جذاذة تحليل', 
  'Analyses juridiques approfondies et études thématiques',
  'تحليلات قانونية معمقة ودراسات موضوعية'
)
ON CONFLICT DO NOTHING;

-- Add new columns for analysis documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS validation_date date,
ADD COLUMN IF NOT EXISTS legal_references text[],
ADD COLUMN IF NOT EXISTS legal_references_ar text[],
ADD COLUMN IF NOT EXISTS bibliography text,
ADD COLUMN IF NOT EXISTS bibliography_ar text;