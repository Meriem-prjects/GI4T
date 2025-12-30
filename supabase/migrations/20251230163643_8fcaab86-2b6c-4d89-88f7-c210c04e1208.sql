-- Ajouter la colonne user_id à activity_logs pour tracer qui fait chaque action
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Mettre à jour le trigger pour capturer l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.log_document_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Log status changes in activity logs
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activity_logs (
      entity_type,
      entity_id,
      action,
      details,
      user_id,
      created_at
    ) VALUES (
      'document',
      NEW.id,
      'status_change',
      jsonb_build_object(
        'old_status', COALESCE(OLD.status, 'null'),
        'new_status', NEW.status,
        'changed_at', now()
      ),
      auth.uid(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;