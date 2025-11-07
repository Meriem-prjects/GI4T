import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, Clock, Tag, TrendingUp, Bell, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const Actualites = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const news = [
    {
      id: 1,
      title: "Nouvelle jurisprudence sur la protection des données personnelles",
      excerpt: "La Cour Suprême vient de rendre un arrêt important qui précise les conditions de traitement des données personnelles par les administrations publiques...",
      date: "20 novembre 2024",
      category: "Jurisprudence",
      readTime: "5 min",
      views: 2341,
      featured: true,
      tags: ["RGPD", "Administration", "Données personnelles"]
    },
    {
      id: 2,
      title: "Lancement du nouveau portail numérique de l'ODF",
      excerpt: "L'Observatoire des Droits Fondamentaux annonce le lancement de sa nouvelle plateforme numérique offrant un accès facilité aux décisions de justice...",
      date: "18 novembre 2024",
      category: "ODF",
      readTime: "3 min", 
      views: 1876,
      featured: false,
      tags: ["Numérique", "Accès", "Innovation"]
    },
    {
      id: 3,
      title: "Conférence internationale sur les droits numériques",
      excerpt: "Tunis accueillera du 15 au 17 décembre 2024 une conférence internationale sur l'évolution des droits fondamentaux à l'ère numérique...",
      date: "15 novembre 2024",
      category: "Événement",
      readTime: "4 min",
      views: 1523,
      featured: false,
      tags: ["Conférence", "International", "Droits numériques"]
    },
    {
      id: 4,
      title: "Rapport annuel 2024 de l'ODF disponible",
      excerpt: "Le rapport annuel de l'Observatoire présente un bilan complet de l'évolution des droits fondamentaux en Tunisie durant l'année 2024...",
      date: "12 novembre 2024",
      category: "Publication",
      readTime: "8 min",
      views: 987,
      featured: false,
      tags: ["Rapport", "Bilan", "Droits fondamentaux"]
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
        <Breadcrumb className={`mb-6 w-full ${isRTL ? 'flex justify-end' : ''}`}>
          <BreadcrumbList className={isRTL ? 'justify-end' : ''}>
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
                    {featuredNews.category}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {t('featured')}
                  </Badge>
                  <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'mr-auto' : 'ml-auto'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      {featuredNews.date}
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
                
                <CardTitle className="text-2xl mb-3">{featuredNews.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {featuredNews.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {featuredNews.tags.map((tag) => (
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
                    <Badge variant="outline">{article.category}</Badge>
                    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight mb-3">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm flex-1">
                    {article.excerpt}
                  </CardDescription>
                  
                  <div className={`flex items-center gap-3 text-xs text-muted-foreground mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </div>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className={`flex flex-wrap gap-1 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {article.tags.map((tag) => (
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