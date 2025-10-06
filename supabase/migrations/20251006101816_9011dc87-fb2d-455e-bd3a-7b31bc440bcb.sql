-- Create useful_addresses table for Accès aux Droits section
CREATE TABLE public.useful_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  address TEXT NOT NULL,
  address_ar TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Chambre des Avocats',
  category_ar TEXT NOT NULL DEFAULT 'الدائرة الإبتدائية',
  governorate_id UUID REFERENCES public.governorates(id) ON DELETE SET NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  email TEXT,
  hours TEXT,
  hours_ar TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.useful_addresses ENABLE ROW LEVEL SECURITY;

-- Public can read published addresses
CREATE POLICY "Public can read published addresses"
ON public.useful_addresses
FOR SELECT
USING (is_published = true);

-- Admins with acces_droits role can manage all addresses
CREATE POLICY "Acces droits admins can manage addresses"
ON public.useful_addresses
FOR ALL
USING (public.has_acces_droits_role(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_useful_addresses_updated_at
BEFORE UPDATE ON public.useful_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data (12 chambres d'avocats)
INSERT INTO public.useful_addresses (name, name_ar, address, address_ar, phone, category, category_ar, governorate_id)
SELECT 
  'Chambre des Avocats de Nabeul',
  'الدائرة الإبتدائية بنابل',
  'Avenue Habib Bourguiba, Siège du Gouvernorat de Nabeul',
  'شارع الحبيب بورقيبة، مقر ولاية نابل',
  '70 028 713',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Nabeul'

UNION ALL

SELECT 
  'Chambre des Avocats de Bizerte',
  'الدائرة الإبتدائية ببنزرت',
  'Rue Nadour, Borj Ghmaz, Résidence Ben Ammar, Bizerte',
  'نهج الناظور، برج غماز، إقامة بن عمار، بنزرت',
  '70 028 714',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Bizerte'

UNION ALL

SELECT 
  'Chambre des Avocats du Kef',
  'الدائرة الإبتدائية بالكاف',
  'Rue Hedi Chaker n°5, Quartier Diar, Le Kef',
  'نهج الهادي شاكر عدد 5, حي الدير، الكاف',
  '70 028 721',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Le Kef'

UNION ALL

SELECT 
  'Chambre des Avocats de Sousse',
  'الدائرة الإبتدائية بسوسة',
  'Angle Rue Mohamed Jerbi et Rue 3 Bachir Salem, Kheiriya Sahloul Sousse',
  'زاوية نهج محمد الجربي ونهج 3 البشير سالم بالخيرية سهلول سوسة 1',
  '70 028 753',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Sousse'

UNION ALL

SELECT 
  'Chambre des Avocats de Monastir',
  'الدائرة الإبتدائية بالمنستير',
  'Avenue Habib Bourguiba, Route Jamel, Carrefour Fawz',
  'شارع الحبيب بورقيبة، طريق جمال، مفترق الفوز',
  '70 028 723',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Monastir'

UNION ALL

SELECT 
  'Chambre des Avocats de Sfax',
  'الدائرة الإبتدائية بصفاقس',
  'Rue Raid Bejaaoui, Partie du siège SNIT, Centre-ville Sfax',
  'نهج الرائد البجاوي، جزء من مقر SNIT وسط مدينة صفاقس',
  '70 028 724',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Sfax'

UNION ALL

SELECT 
  'Chambre des Avocats de Gafsa',
  'الدائرة الإبتدائية بقفصة',
  'Centre-ville Gafsa, Adjacent au siège CPG',
  'وسط مدينة قفصة، ملاصق لمقر شركة فسفاط قفصة',
  '70 028 727',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Gafsa'

UNION ALL

SELECT 
  'Chambre des Avocats de Gabès',
  'الدائرة الإبتدائية بقابس',
  'Avenue Habib Bourguiba n°360, Gabès, À côté de la mosquée',
  'شارع الحبيب بورقيبة عدد 360 ،قابس، بجانب جامع (جارة)',
  '70 028 736',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Gabès'

UNION ALL

SELECT 
  'Chambre des Avocats de Médenine',
  'الدائرة الإبتدائية بمدنين',
  'Rue Japon, Adjacent à l''Administration Régionale de la Justice, Médenine',
  'نهج اليابان، ملاصق للإدارة الجهوية للعدل،مدنين',
  '70 028 754',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Médenine'

UNION ALL

SELECT 
  'Chambre des Avocats de Kasserine',
  'الدائرة الإبتدائية بالقصرين',
  'Avenue Habib Bourguiba, Quartier Olympique, Kasserine',
  'شارع الحبيب بورقيبة، الحي الأولمبي بالقصرين',
  '70 028 750',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Kasserine'

UNION ALL

SELECT 
  'Chambre des Avocats de Sidi Bouzid',
  'الدائرة الإبتدائية بسيدي بوزيد',
  'Avenue de la République, Sidi Bouzid, Ancien siège ARFPE',
  'شارع الجمهورية، سيدي بوزيد، المقر السابق للإدارة الجهوية للتكوين المهني والتشغيل بجانب مقر الولاية',
  '70 028 751',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Sidi Bouzid'

UNION ALL

SELECT 
  'Chambre des Avocats de Kairouan',
  'الدائرة الإبتدائية بالقيروان',
  'Rue Docteur Hamda Awani, Quartier Commercial, Kairouan',
  'نهج الدكتور حمدة العواني، الحي التجاري بالقيروان',
  '70 028 752',
  'Chambre des Avocats',
  'الدائرة الإبتدائية',
  g.id
FROM public.governorates g WHERE g.name = 'Kairouan';