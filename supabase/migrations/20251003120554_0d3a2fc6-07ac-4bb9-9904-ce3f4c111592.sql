-- Ajouter un champ published pour distinguer les documents publics des documents traités
ALTER TABLE documents ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(published) WHERE published = true;

-- Mettre à jour les documents existants avec status='processed' pour les marquer comme publiés
UPDATE documents SET published = true WHERE status = 'processed';

-- Ajouter un commentaire pour clarifier
COMMENT ON COLUMN documents.published IS 'Indique si le document est publié et visible publiquement (distinct de status qui gère le workflow de traitement)';
