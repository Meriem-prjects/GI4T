-- Créer une fonction de sécurité pour vérifier les rôles Observatoire
CREATE OR REPLACE FUNCTION public.has_observatoire_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'admin_observatoire')
  )
$$;

-- Créer une fonction de sécurité pour vérifier les rôles Accès aux Droits
CREATE OR REPLACE FUNCTION public.has_acces_droits_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'admin_acces_droits')
  )
$$;