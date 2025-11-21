-- Publier tous les documents avec status = 'processed' qui ne sont pas encore publiés
UPDATE documents 
SET published = true, updated_at = NOW()
WHERE status = 'processed' AND published = false;