-- D'abord passer le document en pending_validation
UPDATE documents 
SET status = 'pending_validation',
    updated_at = NOW()
WHERE id = '262cc68d-b3db-4658-9602-2e19b2d77de2';

-- Ensuite le publier (cette transition est autorisée)
UPDATE documents 
SET status = 'processed', 
    published = true,
    updated_at = NOW()
WHERE id = '262cc68d-b3db-4658-9602-2e19b2d77de2';