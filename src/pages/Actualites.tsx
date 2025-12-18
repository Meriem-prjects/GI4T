import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, Clock, Tag, TrendingUp, Bell, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const Actualites = () => {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  const news = [
    {
      id: 1,
      title: "Nouvelle jurisprudence sur la protection des données personnelles",
      title_ar: "فقه قضائي جديد حول حماية البيانات الشخصية",
      excerpt: "La Cour Suprême vient de rendre un arrêt important qui précise les conditions de traitement des données personnelles par les administrations publiques...",
      excerpt_ar: "أصدرت المحكمة العليا قراراً هاماً يحدد شروط معالجة البيانات الشخصية من قبل الإدارات العامة...",
      date: "20 novembre 2024",
      date_ar: "20 نوفمبر 2024",
      category: "jurisprudence" as const,
      readTime: 5,
      views: 2341,
      featured: true,
      tags: ["RGPD", "Administration", "Données personnelles"],
      tags_ar: ["حماية البيانات", "الإدارة", "البيانات الشخصية"]
    },
    {
      id: 2,
      title: "Lancement du nouveau portail numérique de l'ODF",
      title_ar: "إطلاق البوابة الرقمية الجديدة لمرصد الحقوق الأساسية",
      excerpt: "L'Observatoire des Droits Fondamentaux annonce le lancement de sa nouvelle plateforme numérique offrant un accès facilité aux décisions de justice...",
      excerpt_ar: "يعلن مرصد الحقوق الأساسية عن إطلاق منصته الرقمية الجديدة التي توفر وصولاً ميسراً إلى القرارات القضائية...",
      date: "18 novembre 2024",
      date_ar: "18 نوفمبر 2024",
      category: "odf" as const,
      readTime: 3,
      views: 1876,
      featured: false,
      tags: ["Numérique", "Accès", "Innovation"],
      tags_ar: ["رقمي", "الوصول", "ابتكار"]
    },
    {
      id: 3,
      title: "Conférence internationale sur les droits numériques",
      title_ar: "مؤتمر دولي حول الحقوق الرقمية",
      excerpt: "Tunis accueillera du 15 au 17 décembre 2024 une conférence internationale sur l'évolution des droits fondamentaux à l'ère numérique...",
      excerpt_ar: "تستضيف تونس من 15 إلى 17 ديسمبر 2024 مؤتمراً دولياً حول تطور الحقوق الأساسية في العصر الرقمي...",
      date: "15 novembre 2024",
      date_ar: "15 نوفمبر 2024",
      category: "event" as const,
      readTime: 4,
      views: 1523,
      featured: false,
      tags: ["Conférence", "International", "Droits numériques"],
      tags_ar: ["مؤتمر", "دولي", "الحقوق الرقمية"]
    },
    {
      id: 4,
      title: "Rapport annuel 2024 de l'ODF disponible",
      title_ar: "التقرير السنوي 2024 لمرصد الحقوق الأساسية متاح",
      excerpt: "Le rapport annuel de l'Observatoire présente un bilan complet de l'évolution des droits fondamentaux en Tunisie durant l'année 2024...",
      excerpt_ar: "يقدم التقرير السنوي للمرصد حصيلة شاملة لتطور الحقوق الأساسية في تونس خلال عام 2024...",
      date: "12 novembre 2024",
      date_ar: "12 نوفمبر 2024",
      category: "publication" as const,
      readTime: 8,
      views: 987,
      featured: false,
      tags: ["Rapport", "Bilan", "Droits fondamentaux"],
      tags_ar: ["تقرير", "حصيلة", "الحقوق الأساسية"]
    }
  ];

  const categories = [
    { name: t('allNews'), count: 156, active: true },
    { name: t('jurisprudence'), count: 67, active: false },
    { name: t('accessToRights'), count: 23, active: false },
    { name: t('odf'), count: 34, active: false },
    { name: t('event'), count: 28, active: false },
    { name: t('publication'), count: 27, active: false }
  ];

  const featuredNews = news.find(article => article.featured);
  const regularNews = news.filter(article => !article.featured);

  return (
    <div className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Breadcrumb */}
        <div className="mb-6 w-full flex justify-start">
          <Breadcrumb>
            <BreadcrumbList className={isRTL ? 'flex-row-reverse' : ''}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/observatoire">{t('observatory')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('actualitesTitle')}</BreadcrumbPage>
            </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <section className={`mb-8 sm:mb-12 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t('actualitesTitle')}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 px-2">
            {t('actualitesDesc')}
          </p>
          
          {/* Newsletter Subscription */}
          <div className={`bg-primary/5 rounded-xl p-6 mb-8 max-w-2xl mx-auto ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'justify-end' : 'justify-center'}`}>
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t('stayInformed')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('stayInformedText')}
            </p>
            <Button>
              {t('subscribeNewsletter')}
            </Button>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.active ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Article */}
        {featuredNews && (
          <section className="mb-12">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">{t('featured')}</h2>
            </div>
            
            <Card className="border-2 border-primary/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge className="bg-primary text-primary-foreground">
                    {t(featuredNews.category)}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {t('featured')}
                  </Badge>
                  <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'mr-auto' : 'ml-auto'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      {language === 'ar' ? featuredNews.date_ar : featuredNews.date}
                    </div>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-4 h-4" />
                      {featuredNews.readTime} {t('min')}
                    </div>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Eye className="w-4 h-4" />
                      {featuredNews.views} {t('views')}
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-3">{language === 'ar' ? featuredNews.title_ar : featuredNews.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {language === 'ar' ? featuredNews.excerpt_ar : featuredNews.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {(language === 'ar' ? featuredNews.tags_ar : featuredNews.tags).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button size="lg">
                    {t('readMore')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Regular Articles */}
        <section>
          <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('latestNews')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <CardHeader className={`pb-4 flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Badge variant="outline">{t(article.category)}</Badge>
                    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight mb-3">
                    {language === 'ar' ? article.title_ar : article.title}
                  </CardTitle>
                  <CardDescription className="text-sm flex-1">
                    {language === 'ar' ? article.excerpt_ar : article.excerpt}
                  </CardDescription>
                  
                  <div className={`flex items-center gap-3 text-xs text-muted-foreground mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      {language === 'ar' ? article.date_ar : article.date}
                    </div>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-3 h-3" />
                      {article.readTime} {t('min')}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className={`flex flex-wrap gap-1 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {(language === 'ar' ? article.tags_ar : article.tags).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" size="sm">
                    {t('readMore')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              {t('loadMoreArticles')}
            </Button>
          </div>
        </section>
      </div>
  );
};

export default Actualites;