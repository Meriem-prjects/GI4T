-- Add type column to court_types table and populate with initial data
ALTER TABLE public.court_types ADD COLUMN type text CHECK (type IN ('civil', 'administratif'));

-- Add initial court types data
INSERT INTO public.court_types (name, name_ar, description, description_ar, type) VALUES 
('Civil', 'مدني', 'Tribunaux civils', 'المحاكم المدنية', 'civil'),
('Administratif', 'إداري', 'Tribunaux administratifs', 'المحاكم الإدارية', 'administratif');

-- Add type column to jurisdiction_levels table and populate with initial data
ALTER TABLE public.jurisdiction_levels ADD COLUMN type text CHECK (type IN ('civil', 'administratif'));

-- Add initial jurisdiction levels data for both civil and administrative
INSERT INTO public.jurisdiction_levels (name, name_ar, description, description_ar, level_order, type) VALUES 
-- Civil jurisdiction levels
('Tribunal de première instance', 'المحكمة الابتدائية', 'Premier niveau de juridiction civile', 'المستوى الأول للقضاء المدني', 1, 'civil'),
('Cour d''appel', 'محكمة الاستئناف', 'Deuxième niveau de juridiction civile', 'المستوى الثاني للقضاء المدني', 2, 'civil'),
('Cour de cassation', 'محكمة التعقيب', 'Niveau suprême de juridiction civile', 'المستوى الأعلى للقضاء المدني', 3, 'civil'),
-- Administrative jurisdiction levels
('Tribunal de première instance', 'المحكمة الابتدائية', 'Premier niveau de juridiction administrative', 'المستوى الأول للقضاء الإداري', 1, 'administratif'),
('Cour d''appel', 'محكمة الاستئناف', 'Deuxième niveau de juridiction administrative', 'المستوى الثاني للقضاء الإداري', 2, 'administratif'),
('Cour de cassation', 'محكمة التعقيب', 'Niveau suprême de juridiction administrative', 'المستوى الأعلى للقضاء الإداري', 3, 'administratif');

-- Add value column to jurisdiction_levels for mapping with editor
ALTER TABLE public.jurisdiction_levels ADD COLUMN value text;

-- Update the value column with corresponding values
UPDATE public.jurisdiction_levels SET value = 'premiere_instance' WHERE name = 'Tribunal de première instance';
UPDATE public.jurisdiction_levels SET value = 'appel' WHERE name = 'Cour d''appel';
UPDATE public.jurisdiction_levels SET value = 'cassation' WHERE name = 'Cour de cassation';