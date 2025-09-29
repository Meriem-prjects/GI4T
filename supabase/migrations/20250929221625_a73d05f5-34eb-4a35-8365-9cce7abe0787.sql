-- Fix publication workflow trigger to allow updates to processed documents
-- Only block illegal status transitions, not all updates

CREATE OR REPLACE FUNCTION public.validate_document_publication_workflow()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Empêcher la publication directe sans passer par pending_validation
  -- CORRECTION: Vérifier que le statut CHANGE réellement
  IF OLD.status IS DISTINCT FROM NEW.status 
     AND OLD.status != 'pending_validation' 
     AND NEW.status = 'processed' THEN
    RAISE EXCEPTION 'Les documents doivent passer par validation avant publication (statut pending_validation requis)';
  END IF;
  
  -- Permettre le passage de draft à pending_validation
  -- Permettre le passage de pending_validation à processed (publication)
  -- Permettre le passage de processed à draft (dépublication)
  -- Permettre le passage de pending_validation à draft (rejet)
  
  RETURN NEW;
END;
$function$;