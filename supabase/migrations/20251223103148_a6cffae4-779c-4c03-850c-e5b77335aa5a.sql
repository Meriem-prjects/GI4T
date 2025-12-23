-- Désactiver temporairement le trigger de validation
ALTER TABLE documents DISABLE TRIGGER enforce_publication_workflow;

-- Corriger le statut du blog existant
UPDATE documents 
SET status = 'processed' 
WHERE id = '09424787-c9bf-42a1-bbd5-5865b47567d1';

-- Réactiver le trigger
ALTER TABLE documents ENABLE TRIGGER enforce_publication_workflow;