-- Corriger les documents avec champs de langue inversés
-- Document 1: 09424787-c9bf-42a1-bbd5-5865b47567d1
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
WHERE id = '09424787-c9bf-42a1-bbd5-5865b47567d1'
  AND title ~ '[\u0600-\u06FF]';

-- Document 2: 2a26205f-6429-474e-8030-dcf02a12754b
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
WHERE id = '2a26205f-6429-474e-8030-dcf02a12754b'
  AND title ~ '[\u0600-\u06FF]';