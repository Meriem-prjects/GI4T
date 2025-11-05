import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, Eye, ArrowRight, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const ActualitesAccesDroits = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();

  const news = [
    {
      id: 1,
      title: "Nouvelle campagne nationale pour l'accès aux droits",
      excerpt:
        "Le gouvernement lance une grande campagne de sensibilisation aux droits fondamentaux dans toutes les régions.",
      date: "2024-03-15",
      category: "Campagnes",
      views: 3240,
      readTime: "5 min",
      featured: true,
    },
    {
      id: 2,
      title: "Ouverture de 10 nouveaux centres de médiation sociale",
      excerpt:
        "Des centres de médiation ouvrent leurs portes pour faciliter l'accès à la justice et aux droits.",
      date: "2024-03-12",
      category: "Services",
      views: 2890,
      readTime: "3 min",
      featured: false,
    },
    {
      id: 3,
      title: "Formation des médiateurs : nouvelle session prévue en avril",
      excerpt:
        "Une session de formation intensive pour les futurs médiateurs sociaux débutera le mois prochain.",
      date: "2024-03-10",
      category: "Formation",
      views: 1567,
      readTime: "4 min",
      featured: false,
    },
  ];

  return (
    <main className={`flex-1 ${isRTL ? 'font-almarai' : ''}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('actualites')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('actualites')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'تابع آخر الأخبار والفعاليات المتعلقة بالوصول إلى الحقوق.'
              : "Suivez les dernières nouvelles et événements liés à l'accès aux droits."}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input placeholder={t('searchDot')} className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`} />
          </div>
        </div>

        {/* News List */}
        <div className="space-y-6 animate-fade-in">
          {news.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className={`flex flex-col lg:flex-row gap-4 ${isRTL ? 'text-right' : ''}`}>
                  <div className="flex-1">
                    {item.featured && <Badge className="mb-2">{t('featured')}</Badge>}
                    <Badge variant="outline" className="mb-2">
                      {item.category}
                    </Badge>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                    <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR')}
                      </div>
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {item.readTime}
                      </div>
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Eye className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {item.views}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'justify-start' : ''}`}>
                    <Button>
                      {t('readMore')}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8 animate-fade-in">
          <Button variant="outline">
            {isRTL ? 'عرض المزيد من الأخبار' : "Voir plus d'actualités"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ActualitesAccesDroits;
