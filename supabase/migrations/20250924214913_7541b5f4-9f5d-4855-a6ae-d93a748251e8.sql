-- Update existing document types to match user requirements
-- Change "Document d'analyse juridique" to "Fiche d'analyse juridique"
UPDATE public.document_types 
SET 
  name = 'Fiche d''analyse juridique',
  name_ar = 'بطاقة تحليل قانوني',
  description = 'Analyse approfondie des aspects juridiques et implications légales',
  description_ar = 'تحليل معمق للجوانب القانونية والآثار القانونية'
WHERE name = 'Document d''analyse juridique';

-- Update the jurisprudence type description to be more clear
UPDATE public.document_types 
SET 
  description = 'Documentation et analyse des décisions judiciaires et précédents',
  description_ar = 'توثيق وتحليل القرارات القضائية والسوابق القضائية'
WHERE name = 'Fiche de jurisprudence';