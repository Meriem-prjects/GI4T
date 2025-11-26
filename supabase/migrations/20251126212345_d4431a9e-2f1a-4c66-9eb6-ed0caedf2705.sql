-- Mettre à jour la traduction arabe de "Fiche de jurisprudence" de "بطاقة" à "جذاذة"
UPDATE document_types 
SET name_ar = 'جذاذة فقه القضاء'
WHERE name = 'Fiche de jurisprudence' AND name_ar = 'بطاقة فقه القضاء';