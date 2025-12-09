-- Corriger le terme arabe pour "Analyses juridiques"
-- Changer "التحليلات القانونية" en "التحاليل القانونية"

UPDATE document_types
SET name_ar = 'التحاليل القانونية'
WHERE name = 'Analyses juridiques';