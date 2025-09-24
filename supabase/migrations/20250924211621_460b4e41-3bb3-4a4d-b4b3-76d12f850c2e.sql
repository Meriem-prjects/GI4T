-- Simplify court_types table by removing the 'type' column
ALTER TABLE public.court_types DROP COLUMN IF EXISTS type;

-- Simplify jurisdiction_levels table by removing 'type' and 'value' columns  
ALTER TABLE public.jurisdiction_levels DROP COLUMN IF EXISTS type;
ALTER TABLE public.jurisdiction_levels DROP COLUMN IF EXISTS value;

-- Clean up existing data and add simple court types
DELETE FROM public.court_types;
INSERT INTO public.court_types (name, name_ar, description, description_ar) VALUES
('Civil', 'مدني', 'Tribunaux civils', 'المحاكم المدنية'),
('Administratif', 'إداري', 'Tribunaux administratifs', 'المحاكم الإدارية');

-- Clean up existing data and add simple jurisdiction levels  
DELETE FROM public.jurisdiction_levels;
INSERT INTO public.jurisdiction_levels (name, name_ar, description, description_ar, level_order) VALUES
('Tribunal de première instance', 'محكمة الدرجة الأولى', 'Premier degré de juridiction', 'الدرجة الأولى من القضاء', 1),
('Cour d''appel', 'محكمة الاستئناف', 'Deuxième degré de juridiction', 'الدرجة الثانية من القضاء', 2),
('Cour de cassation', 'محكمة التعقيب', 'Troisième degré de juridiction', 'الدرجة الثالثة من القضاء', 3);