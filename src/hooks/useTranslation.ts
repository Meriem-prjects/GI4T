import { useLanguage } from '@/contexts/LanguageContext';

type TranslationKey = 
  | 'tagline'
  | 'whoWeAre'
  | 'news'
  | 'faqChatbot'
  | 'observatoryTitle'
  | 'observatoryDescription'
  | 'searchPlaceholder'
  | 'accessToAdminLaw'
  | 'accessDescription'
  | 'interactiveMap'
  | 'newsSection'
  | 'readMore'
  | 'stayInformed'
  | 'yourEmail'
  | 'newsletter'
  | 'allRightsReserved'
  | 'developedBy'
  | 'contact'
  | 'legal'
  | 'sitemap'
  | 'social'
  | 'terms'
  | 'observatory'
  | 'awarenessСampaign'
  | 'practicalGuide';

const translations: Record<'fr' | 'ar', Record<TranslationKey, string>> = {
  fr: {
    tagline: 'Plateforme citoyenne de la jurisprudence administrative et constitutionnelle',
    whoWeAre: 'Qui sommes-nous',
    news: 'Actualités',
    faqChatbot: 'FAQ/Chatbot',
    observatoryTitle: 'Observatoire des Droits Fondamentaux',
    observatoryDescription: 'Consultez, analysez et comprenez la jurisprudence tunisienne sur les droits fondamentaux',
    searchPlaceholder: 'Rechercher une décision, un mot-clé...',
    accessToAdminLaw: 'Accès au droit administratif',
    accessDescription: 'Comprendre ses droits, savoir comment agir : des outils concrets pour tous les citoyens',
    interactiveMap: 'Carte interactive',
    newsSection: 'Actualités',
    readMore: 'Lire la suite...',
    stayInformed: 'Restez informés',
    yourEmail: 'Votre email',
    newsletter: 'NEWSLETTER',
    allRightsReserved: 'Tous droits réservés',
    developedBy: 'Developed by Feelinx',
    contact: 'Contact',
    legal: 'Mentions légales',
    sitemap: 'Plan du site',
    social: 'Réseaux sociaux',
    terms: 'Conditions',
    observatory: 'Mرصد',
    awarenessСampaign: 'Campagne de sensibilisation',
    practicalGuide: 'Guide pratique',
  },
  ar: {
    tagline: 'منصة المواطن للفقه القضائي الإداري والدستوري',
    whoWeAre: 'من نحن',
    news: 'الأخبار',
    faqChatbot: 'الأسئلة الشائعة/روبوت المحادثة',
    observatoryTitle: 'مرصد الحقوق الأساسية',
    observatoryDescription: 'استشر، حلل وافهم الفقه القضائي التونسي بشأن الحقوق الأساسية',
    searchPlaceholder: 'ابحث عن قرار، كلمة مفتاحية...',
    accessToAdminLaw: 'الوصول إلى القانون الإداري',
    accessDescription: 'فهم حقوقك، ومعرفة كيفية التصرف: أدوات ملموسة لجميع المواطنين',
    interactiveMap: 'خريطة تفاعلية',
    newsSection: 'الأخبار',
    readMore: 'اقرأ المزيد...',
    stayInformed: 'ابق على اطلاع',
    yourEmail: 'بريدك الإلكتروني',
    newsletter: 'النشرة الإخبارية',
    allRightsReserved: 'جميع الحقوق محفوظة',
    developedBy: 'تم التطوير بواسطة Feelinx',
    contact: 'اتصل بنا',
    legal: 'الإشعارات القانونية',
    sitemap: 'خريطة الموقع',
    social: 'وسائل التواصل الاجتماعي',
    terms: 'الشروط',
    observatory: 'مرصد',
    awarenessСampaign: 'حملة توعية',
    practicalGuide: 'دليل عملي',
  },
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language };
};
