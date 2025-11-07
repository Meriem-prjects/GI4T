-- Insérer les 3 nouveaux types de documents pour Analyses & Opinions
INSERT INTO public.document_types (name, name_ar, description, description_ar) VALUES
('Analyses juridiques', 'التحليلات القانونية', 'Analyses juridiques approfondies et études de cas', 'تحليلات قانونية متعمقة ودراسات حالة'),
('Commentaires', 'التعليقات', 'Articles de commentaire et opinions d''experts', 'مقالات تعليقية وآراء الخبراء'),
('Blogs', 'المدونات', 'Articles de blog et notes d''information', 'مقالات المدونة والملاحظات الإعلامية');