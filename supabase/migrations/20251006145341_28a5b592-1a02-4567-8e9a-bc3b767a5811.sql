-- Create FAQ items table for managing FAQ content
CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  question_ar TEXT,
  answer TEXT NOT NULL,
  answer_ar TEXT,
  category TEXT NOT NULL,
  category_ar TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Public can read active FAQ items
CREATE POLICY "Public can read active FAQ items"
  ON public.faq_items
  FOR SELECT
  USING (is_active = true);

-- Acces droits admins can manage FAQ items
CREATE POLICY "Acces droits admins can manage FAQ items"
  ON public.faq_items
  FOR ALL
  USING (has_acces_droits_role(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default FAQ items
INSERT INTO public.faq_items (question, question_ar, answer, answer_ar, category, category_ar, display_order) VALUES
('Comment démissionner légalement ?', 'كيف أستقيل قانونياً؟', 'Pour démissionner légalement en Tunisie, vous devez respecter le préavis prévu dans votre contrat de travail ou la convention collective. Remettez une lettre de démission écrite à votre employeur mentionnant la date de fin de votre contrat.', 'للاستقالة قانونياً في تونس، يجب عليك احترام فترة الإشعار المنصوص عليها في عقد عملك أو الاتفاقية الجماعية. قدم خطاب استقالة مكتوب لصاحب العمل يذكر تاريخ انتهاء عقدك.', 'Droit du travail', 'قانون العمل', 1),
('Quels sont mes droits en cas de licenciement ?', 'ما هي حقوقي في حالة الفصل؟', 'En cas de licenciement, vous avez droit à un préavis, une indemnité de licenciement selon votre ancienneté, le solde de tout compte, et éventuellement une indemnité compensatrice de congés payés non pris.', 'في حالة الفصل، لديك الحق في فترة إشعار، وتعويض الفصل حسب أقدميتك، وتسوية جميع الحسابات، وربما تعويض عن الإجازات المدفوعة غير المستخدمة.', 'Droit du travail', 'قانون العمل', 2),
('Comment obtenir un acte de naissance ?', 'كيف أحصل على شهادة ميلاد؟', 'Vous pouvez obtenir un acte de naissance en vous rendant à l''état civil de votre commune de naissance, en ligne via le portail e-gouvernement, ou en mandatant une personne avec procuration.', 'يمكنك الحصول على شهادة ميلاد بالذهاب إلى مكتب الحالة المدنية في بلديتك، عبر الإنترنت من خلال بوابة الحكومة الإلكترونية، أو بتوكيل شخص بتوكيل رسمي.', 'État civil', 'الحالة المدنية', 3),
('Comment contester une expulsion ?', 'كيف أطعن في إخلاء؟', 'Pour contester une expulsion, vous devez saisir le tribunal compétent dans les délais légaux avec l''assistance d''un avocat. Vous pouvez également demander des délais de grâce si votre situation le justifie.', 'للطعن في الإخلاء، يجب عليك رفع دعوى أمام المحكمة المختصة في المواعيد القانونية بمساعدة محامٍ. يمكنك أيضاً طلب مهلة إذا كانت حالتك تبرر ذلك.', 'Droit au logement', 'الحق في السكن', 4);