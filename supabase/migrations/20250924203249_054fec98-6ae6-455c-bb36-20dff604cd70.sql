-- Create court_types table for tribunal types
CREATE TABLE public.court_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jurisdiction_levels table for jurisdiction hierarchy
CREATE TABLE public.jurisdiction_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  level_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create languages table for supported languages
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_native TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles enum and table
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'validator');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.court_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurisdiction_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage court types" ON public.court_types FOR ALL USING (true);
CREATE POLICY "Admin can manage jurisdiction levels" ON public.jurisdiction_levels FOR ALL USING (true);
CREATE POLICY "Admin can manage languages" ON public.languages FOR ALL USING (true);
CREATE POLICY "Admin can manage user roles" ON public.user_roles FOR ALL USING (true);
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (true);

-- Add update triggers
CREATE TRIGGER update_court_types_updated_at
  BEFORE UPDATE ON public.court_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jurisdiction_levels_updated_at
  BEFORE UPDATE ON public.jurisdiction_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default languages
INSERT INTO public.languages (code, name, name_native, is_default, is_active) VALUES
('fr', 'Français', 'Français', true, true),
('ar', 'Arabe', 'العربية', false, true),
('en', 'Anglais', 'English', false, false);

-- Insert default jurisdiction levels
INSERT INTO public.jurisdiction_levels (name, name_ar, level_order) VALUES
('Tribunal de première instance', 'محكمة الدرجة الأولى', 1),
('Cour d''appel', 'محكمة الاستئناف', 2),
('Cour de cassation', 'محكمة التعقيب', 3);

-- Insert default court types
INSERT INTO public.court_types (name, name_ar, description, description_ar) VALUES
('Tribunal civil', 'المحكمة المدنية', 'Tribunal compétent pour les affaires civiles', 'محكمة مختصة في القضايا المدنية'),
('Tribunal pénal', 'المحكمة الجزائية', 'Tribunal compétent pour les affaires pénales', 'محكمة مختصة في القضايا الجزائية'),
('Tribunal administratif', 'المحكمة الإدارية', 'Tribunal compétent pour les affaires administratives', 'محكمة مختصة في القضايا الإدارية'),
('Tribunal commercial', 'المحكمة التجارية', 'Tribunal compétent pour les affaires commerciales', 'محكمة مختصة في القضايا التجارية');