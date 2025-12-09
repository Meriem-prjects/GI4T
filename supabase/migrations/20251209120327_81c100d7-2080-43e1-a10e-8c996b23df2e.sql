-- Corriger l'inversion des champs de langue dans les documents
-- Les champs de base (title, summary, etc.) contiennent du texte arabe
-- Les champs _ar contiennent du texte français
-- Cette migration permute les valeurs pour respecter la convention

-- Permuter title et title_ar
UPDATE documents
SET 
  title = title_ar,
  title_ar = title
WHERE title_ar IS NOT NULL 
  AND title IS NOT NULL
  AND title_ar != ''
  AND title != '';

-- Permuter summary et summary_ar
UPDATE documents
SET 
  summary = summary_ar,
  summary_ar = summary
WHERE summary_ar IS NOT NULL 
  AND summary IS NOT NULL
  AND summary_ar != ''
  AND summary != '';

-- Permuter keywords et keywords_ar
UPDATE documents
SET 
  keywords = keywords_ar,
  keywords_ar = keywords
WHERE keywords_ar IS NOT NULL 
  AND keywords IS NOT NULL
  AND array_length(keywords_ar, 1) > 0
  AND array_length(keywords, 1) > 0;

-- Permuter author et author_ar
UPDATE documents
SET 
  author = author_ar,
  author_ar = author
WHERE author_ar IS NOT NULL 
  AND author IS NOT NULL
  AND author_ar != ''
  AND author != '';