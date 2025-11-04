import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const ActualitesHomeSection = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const articles = [
    {
      id: 1,
      category: t('observatory'),
      categoryColor: "bg-[#4164D7] text-white",
      title: isRTL ? "آخر التحديثات في قاعدة البيانات" : "Dernières mises à jour de la base de données",
      excerpt: isRTL ? "مرصد الحقوق الأساسية (ODF) هو منصة مستقلة تقوم بتجميع وتحليل وإتاحة..." : "L'Observatoire des Droits Fondamentaux (ODF) est une plateforme indépendante qui centralise, analyse et rend accessibles...",
      date: isRTL ? "8 أكتوبر 2025" : "8 octobre 2025",
      source: "ODF",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&q=80"
    },
    {
      id: 2,
      category: t('awarenessСampaign'),
      categoryColor: "bg-[#F4D03F] text-gray-900",
      title: isRTL ? "باجة تستضيف قافلة الوصول إلى القانون" : "Béja accueille notre caravane d'accès au droit",
      excerpt: isRTL ? "فضاء الوصول إلى القانون الإداري يقدم محتويات تعليمية لمساعدة كل مواطن على الفهم..." : "espace Accès au droit administratif propose des contenus pédagogiques pour aider chaque citoyen à comprendre...",
      date: isRTL ? "4 أكتوبر 2025" : "4 octobre 2025",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80"
    },
    {
      id: 3,
      category: t('practicalGuide'),
      categoryColor: "bg-[#F4D03F] text-gray-900",
      title: isRTL ? "دليل عملي للعدالة الإدارية" : "Guide pratique de la justice administrative",
      excerpt: isRTL ? "فضاء الوصول إلى القانون الإداري يقدم محتويات..." : "espace Accès au droit administratif propose des contenus...",
      date: isRTL ? "11 سبتمبر 2025" : "11 septembre 2025",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80"
    }
  ];

  return (
    <section className={`py-16 bg-background ${isRTL ? 'rtl' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex items-center gap-4 mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-4xl sm:text-5xl font-bold text-foreground ${isRTL ? 'font-almarai' : ''}`}>
            {t('newsSection')}
          </h2>
          <img 
            src="/justclic-logo.png" 
            alt="JustClic" 
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
          {articles.map((article) => (
            <Link 
              key={article.id}
              to="/actualites-acces-droits"
              className="group"
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                {/* Badge */}
                <div className={`p-4 pb-0 ${isRTL ? 'text-right' : ''}`}>
                  <Badge 
                    className={`${article.categoryColor} font-semibold px-4 py-1 rounded-full ${isRTL ? 'font-almarai' : ''}`}
                  >
                    {article.category}
                  </Badge>
                </div>

                {/* Image */}
                <div className="overflow-hidden px-4 pt-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <CardContent className={`p-6 ${isRTL ? 'text-right' : ''}`}>
                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors ${isRTL ? 'font-almarai' : ''}`}>
                    {article.title}
                  </h3>

                  {/* Meta */}
                  <p className={`text-sm text-muted-foreground mb-3 ${isRTL ? 'font-almarai' : ''}`}>
                    {article.source && `${article.source} - `}{article.date}
                  </p>

                  {/* Excerpt */}
                  <p className={`text-muted-foreground mb-4 line-clamp-3 ${isRTL ? 'font-almarai' : ''}`}>
                    {article.excerpt}
                  </p>

                  {/* Read More Link */}
                  <span className={`text-primary font-semibold hover:underline ${isRTL ? 'font-almarai' : ''}`}>
                    {t('readMore')}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActualitesHomeSection;
