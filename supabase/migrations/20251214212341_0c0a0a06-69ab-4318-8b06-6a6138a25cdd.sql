-- Corriger les données inversées pour le document 2a26205f-6429-474e-8030-dcf02a12754b
-- Échanger title/title_ar, summary/summary_ar, keywords/keywords_ar

UPDATE documents
SET 
  -- Swap titles
  title = title_ar,
  title_ar = title,
  -- Swap summaries  
  summary = summary_ar,
  summary_ar = summary,
  -- Swap keywords
  keywords = keywords_ar,
  keywords_ar = keywords
WHERE id = '2a26205f-6429-474e-8030-dcf02a12754b';