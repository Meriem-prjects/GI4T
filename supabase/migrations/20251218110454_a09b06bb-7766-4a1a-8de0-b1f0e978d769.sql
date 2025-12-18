-- Corriger author/author_ar pour le document spécifique
UPDATE public.documents
SET 
  author = author_ar,
  author_ar = author,
  -- Déplacer le résumé arabe vers summary_ar (le summary actuel contient de l'arabe)
  summary_ar = summary,
  -- Mettre un placeholder pour le summary français (sera traduit manuellement ou via AI)
  summary = 'Analyse juridique approfondie portant sur les droits fondamentaux et les libertés constitutionnelles en Tunisie. Cette étude examine les aspects juridiques et les implications légales dans le cadre du droit tunisien contemporain.'
WHERE id = '2a26205f-6429-474e-8030-dcf02a12754b';