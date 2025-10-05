-- Ajouter les nouveaux rôles à l'enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin_observatoire';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin_acces_droits';