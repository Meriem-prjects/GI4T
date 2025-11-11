-- Corriger le statut de publication du document visible dans l'admin
UPDATE documents
SET published = true
WHERE id = '17b949ca-9f52-4abf-a557-d026dae8e2ff';