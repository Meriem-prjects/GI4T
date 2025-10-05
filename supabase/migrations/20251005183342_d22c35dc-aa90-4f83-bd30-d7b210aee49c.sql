-- Créer une table pour les permissions des éditeurs Accès aux Droits
CREATE TABLE IF NOT EXISTS public.acces_droits_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, section)
);

-- Enable RLS
ALTER TABLE public.acces_droits_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour acces_droits_permissions
CREATE POLICY "Admin can manage acces droits permissions"
ON public.acces_droits_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'admin_acces_droits')
  )
);

-- Fonction pour vérifier si un utilisateur a une permission spécifique
CREATE OR REPLACE FUNCTION public.has_acces_droits_permission(_user_id uuid, _section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.acces_droits_permissions
    WHERE user_id = _user_id
      AND section = _section
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'admin_acces_droits')
  )
$$;

-- Ajouter un rôle d'éditeur général pour Accès aux Droits
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor_acces_droits';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_acces_droits_permissions_updated_at
BEFORE UPDATE ON public.acces_droits_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();