-- Corriger TOUS les documents où title contient de l'arabe et title_ar contient du français
UPDATE public.documents
SET 
  title = title_ar,
  title_ar = title,
  summary = summary_ar,
  summary_ar = summary,
  keywords = keywords_ar,
  keywords_ar = keywords,
  author = author_ar,
  author_ar = author
WHERE title ~ '[\u0600-\u06FF]' 
  AND title_ar IS NOT NULL 
  AND title_ar !~ '[\u0600-\u06FF]';