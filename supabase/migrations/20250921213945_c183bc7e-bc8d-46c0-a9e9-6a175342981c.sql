-- Phase 1: Supprimer tous les documents existants
DELETE FROM public.documents;

-- Phase 2: Supprimer toutes les catégories existantes
DELETE FROM public.categories;

-- Phase 3: Créer les 40 nouvelles catégories de droits fondamentaux avec traductions arabes
INSERT INTO public.categories (name, name_ar, description, description_ar, color) VALUES
('Caractère personnel de la peine', 'الطابع الشخصي للعقوبة', 'Principe selon lequel la peine ne doit frapper que l''auteur de l''infraction', 'مبدأ يقضي بأن العقوبة يجب أن تطال فقط مرتكب المخالفة', '#DC2626'),
('Droit à l''eau', 'الحق في الماء', 'Droit fondamental d''accès à l''eau potable et à l''assainissement', 'الحق الأساسي في الحصول على المياه الصالحة للشرب والصرف الصحي', '#0EA5E9'),
('Droit à l''égalité', 'الحق في المساواة', 'Principe d''égalité de tous devant la loi sans discrimination', 'مبدأ المساواة للجميع أمام القانون دون تمييز', '#7C3AED'),
('Droit à l''enseignement', 'الحق في التعليم', 'Droit fondamental à l''éducation et à l''instruction', 'الحق الأساسي في التربية والتعليم', '#059669'),
('Droit à l''inviolabilité de l''individu', 'الحق في حرمة الفرد', 'Protection de l''intégrité physique et morale de la personne', 'حماية السلامة الجسدية والمعنوية للشخص', '#D97706'),
('Droit à la défense', 'الحق في الدفاع', 'Droit de se défendre en justice et d''être assisté par un avocat', 'الحق في الدفاع أمام القضاء والاستعانة بمحام', '#BE185D'),
('Droit à la dignité', 'الحق في الكرامة', 'Respect de la dignité humaine en toutes circonstances', 'احترام الكرامة الإنسانية في جميع الظروف', '#9333EA'),
('Droit à la liberté', 'الحق في الحرية', 'Liberté fondamentale de la personne humaine', 'الحرية الأساسية للشخص الإنساني', '#0D9488'),
('Droit à la protection de l''intégrité physique', 'الحق في حماية السلامة الجسدية', 'Protection contre les atteintes corporelles et les violences', 'الحماية من الاعتداءات الجسدية والعنف', '#CA8A04'),
('Droit à la protection de l''inviolabilité du domicile', 'الحق في حماية حرمة المسكن', 'Protection du domicile contre les perquisitions et violations arbitraires', 'حماية المسكن من التفتيش والانتهاكات التعسفية', '#DC2626'),
('Droit à la protection de la vie privée', 'الحق في حماية الحياة الخاصة', 'Protection de la sphère privée et familiale', 'حماية المجال الخاص والعائلي', '#0EA5E9'),
('Droit à la protection des données personnelles', 'الحق في حماية البيانات الشخصية', 'Protection des informations personnelles et de leur usage', 'حماية المعلومات الشخصية واستخدامها', '#7C3AED'),
('Droit à la protection du secret des correspondances', 'الحق في حماية سرية المراسلات', 'Confidentialité des communications privées', 'سرية الاتصالات الخاصة', '#059669'),
('Droit à la santé', 'الحق في الصحة', 'Accès aux soins de santé et à la protection sanitaire', 'الوصول إلى الرعاية الصحية والحماية الصحية', '#D97706'),
('Droit à la sécurité', 'الحق في الأمن', 'Protection de la sécurité personnelle et publique', 'حماية الأمن الشخصي والعام', '#BE185D'),
('Droit à la sécurité juridique', 'الحق في الأمن القانوني', 'Prévisibilité et stabilité du droit et des décisions judiciaires', 'قابلية التنبؤ واستقرار القانون والقرارات القضائية', '#9333EA'),
('Droit à la sécurité sociale', 'الحق في الضمان الاجتماعي', 'Protection sociale en cas de maladie, chômage, vieillesse', 'الحماية الاجتماعية في حالة المرض والبطالة والشيخوخة', '#0D9488'),
('Droit à un procès équitable', 'الحق في محاكمة عادلة', 'Garanties procédurales devant les tribunaux', 'الضمانات الإجرائية أمام المحاكم', '#CA8A04'),
('Droit au logement', 'الحق في السكن', 'Accès à un logement décent et abordable', 'الوصول إلى سكن لائق وبأسعار معقولة', '#DC2626'),
('Droit au pluralisme', 'الحق في التعددية', 'Diversité d''opinions et d''expressions dans la société', 'تنوع الآراء والتعبيرات في المجتمع', '#0EA5E9'),
('Droit au travail', 'الحق في العمل', 'Accès à l''emploi et protection des travailleurs', 'الوصول إلى العمل وحماية العمال', '#7C3AED'),
('Droit d''asile politique', 'حق اللجوء السياسي', 'Protection accordée aux réfugiés politiques', 'الحماية الممنوحة للاجئين السياسيين', '#059669'),
('Droit de circulation', 'حق التنقل', 'Liberté de mouvement et de déplacement', 'حرية الحركة والتنقل', '#D97706'),
('Droit de l''enfant', 'حقوق الطفل', 'Protection spéciale des droits des mineurs', 'الحماية الخاصة لحقوق القاصرين', '#BE185D'),
('Droit de la propriété', 'حق الملكية', 'Protection du droit de propriété privée', 'حماية حق الملكية الخاصة', '#9333EA'),
('Droit de se porter candidat', 'حق الترشح', 'Participation aux élections en tant que candidat', 'المشاركة في الانتخابات كمرشح', '#0D9488'),
('Droit des personnes handicapées', 'حقوق الأشخاص ذوي الإعاقة', 'Protection et inclusion des personnes en situation de handicap', 'حماية وإدماج الأشخاص ذوي الإعاقة', '#CA8A04'),
('Droit du détenu à un traitement humain', 'حق المحتجز في معاملة إنسانية', 'Conditions de détention respectueuses de la dignité humaine', 'ظروف الاحتجاز التي تحترم الكرامة الإنسانية', '#DC2626'),
('Droit syndical', 'الحق النقابي', 'Liberté de constituer et d''adhérer à des syndicats', 'حرية تكوين النقابات والانضمام إليها', '#0EA5E9'),
('Liberté d''ester en justice', 'حرية اللجوء إلى القضاء', 'Accès libre et effectif aux tribunaux', 'الوصول الحر والفعال إلى المحاكم', '#7C3AED'),
('Liberté d''information et de publication', 'حرية الإعلام والنشر', 'Liberté d''expression et de diffusion de l''information', 'حرية التعبير ونشر المعلومات', '#059669'),
('Liberté d''obtenir un document administratif', 'حرية الحصول على وثيقة إدارية', 'Accès aux documents et informations administratives', 'الوصول إلى الوثائق والمعلومات الإدارية', '#D97706'),
('Liberté de choisir son lieu de résidence', 'حرية اختيار مكان الإقامة', 'Liberté de domicile et de résidence', 'حرية السكن والإقامة', '#BE185D'),
('Liberté de constituer des associations', 'حرية تكوين الجمعيات', 'Droit de créer et de participer à des associations', 'الحق في إنشاء الجمعيات والمشاركة فيها', '#9333EA'),
('Liberté de constituer des partis politiques', 'حرية تكوين الأحزاب السياسية', 'Pluralisme politique et liberté d''association politique', 'التعددية السياسية وحرية التجمع السياسي', '#0D9488'),
('Liberté de croyance', 'حرية المعتقد', 'Liberté de religion et de conscience', 'حرية الدين والضمير', '#CA8A04'),
('Liberté du commerce et de l''industrie', 'حرية التجارة والصناعة', 'Liberté d''entreprendre et d''exercer une activité économique', 'حرية المبادرة وممارسة النشاط الاقتصادي', '#DC2626'),
('Liberté personnelle', 'الحرية الشخصية', 'Autonomie individuelle et liberté de choix', 'الاستقلالية الفردية وحرية الاختيار', '#0EA5E9'),
('Présomption d''innocence', 'قرينة البراءة', 'Principe selon lequel tout accusé est présumé innocent', 'مبدأ يقضي بأن كل متهم يعتبر بريئا', '#7C3AED');