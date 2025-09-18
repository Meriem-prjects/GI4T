-- Update document types to match specific requirements
UPDATE document_types SET name = 'Fiche de jurisprudence', name_ar = 'بطاقة فقه القضاء' WHERE name = 'Décision de justice';
UPDATE document_types SET name = 'Document d''analyse juridique', name_ar = 'وثيقة تحليل قانوني' WHERE name = 'Analyse juridique';

-- Delete any other document types that don't match our requirements
DELETE FROM document_types WHERE name NOT IN ('Fiche de jurisprudence', 'Document d''analyse juridique');

-- Update categories to be more specific for legal domains
DELETE FROM categories WHERE name NOT LIKE '%droit%';

-- Insert specific legal categories
INSERT INTO categories (name, name_ar, color, description, description_ar) VALUES
('Droit constitutionnel', 'القانون الدستوري', '#8B5CF6', 'Catégorie pour les documents relatifs au droit constitutionnel', 'فئة للوثائق المتعلقة بالقانون الدستوري'),
('Droit administratif', 'القانون الإداري', '#06B6D4', 'Catégorie pour les documents relatifs au droit administratif', 'فئة للوثائق المتعلقة بالقانون الإداري'),
('Droit civil', 'القانون المدني', '#10B981', 'Catégorie pour les documents relatifs au droit civil', 'فئة للوثائق المتعلقة بالقانون المدني'),
('Droit pénal', 'القانون الجنائي', '#F59E0B', 'Catégorie pour les documents relatifs au droit pénal', 'فئة للوثائق المتعلقة بالقانون الجنائي'),
('Droit commercial', 'القانون التجاري', '#3B82F6', 'Catégorie pour les documents relatifs au droit commercial', 'فئة للوثائق المتعلقة بالقانون التجاري'),
('Droit du travail', 'قانون العمل', '#EF4444', 'Catégorie pour les documents relatifs au droit du travail', 'فئة للوثائق المتعلقة بقانون العمل'),
('Droit de la famille', 'قانون الأسرة', '#EC4899', 'Catégorie pour les documents relatifs au droit de la famille', 'فئة للوثائق المتعلقة بقانون الأسرة'),
('Droit international', 'القانون الدولي', '#6366F1', 'Catégorie pour les documents relatifs au droit international', 'فئة للوثائق المتعلقة بالقانون الدولي')
ON CONFLICT (name) DO NOTHING;