-- Migrer les 4 documents de "Fiche d'analyse juridique" vers "Analyses juridiques"
UPDATE documents
SET document_type_id = 'e9fc79ba-d10d-4e58-b4d8-a09dd2f0dae1'
WHERE document_type_id = '470fa92d-4073-4d0c-8539-d69cad58f2aa';

-- Supprimer le type "Fiche d'analyse juridique" devenu obsolète
DELETE FROM document_types
WHERE id = '470fa92d-4073-4d0c-8539-d69cad58f2aa';