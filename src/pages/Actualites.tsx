import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, Clock, Tag, TrendingUp, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { usePublishedNews, useFeaturedNews, useNewsCategoryCounts } from "@/hooks/useNews";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";

const Actualites = () => {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: allNews, isLoading } = usePublishedNews(selectedCategory);
  const { data: featuredNewsData } = useFeaturedNews();
  const { data: categoryCounts } = useNewsCategoryCounts();

  const featuredNews = featuredNewsData;
  const regularNews = allNews?.filter(n => n.id !== featuredNews?.id) || [];

  const categoryLabels: Record<string, { fr: string; ar: string }> = {
    all: { fr: 'Toutes', ar: 'الكل' },
    jurisprudence: { fr: 'Jurisprudence', ar: 'فقه قضائي' },
    acces_droits: { fr: 'Accès au droit', ar: 'الوصول للقانون' },
    odf: { fr: 'ODF', ar: 'مرصد الحقوق' },
    event: { fr: 'Événements', ar: 'فعاليات' },
    publication: { fr: 'Publications', ar: 'منشورات' }
  };

  const categories = [
    { key: 'all', name: language === 'ar' ? categoryLabels.all.ar : categoryLabels.all.fr },
    { key: 'jurisprudence', name: language === 'ar' ? categoryLabels.jurisprudence.ar : categoryLabels.jurisprudence.fr },
    { key: 'acces_droits', name: language === 'ar' ? categoryLabels.acces_droits.ar : categoryLabels.acces_droits.fr },
    { key: 'odf', name: language === 'ar' ? categoryLabels.odf.ar : categoryLabels.odf.fr },
    { key: 'event', name: language === 'ar' ? categoryLabels.event.ar : categoryLabels.event.fr },
    { key: 'publication', name: language === 'ar' ? categoryLabels.publication.ar : categoryLabels.publication.fr }
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'd MMMM yyyy', {
        locale: language === 'ar' ? ar : fr
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryLabel = (categoryKey: string) => {
    const label = categoryLabels[categoryKey];
    if (label) {
      return language === 'ar' ? label.ar : label.fr;
    }
    return categoryKey;
  };

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
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setSelectedCategory(category.key)}
            >
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {categoryCounts?.[category.key] || 0}
              </Badge>
            </Button>
          ))}
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No News State */}
      {!isLoading && allNews?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {language === 'ar' ? 'لا توجد أخبار متاحة حالياً' : 'Aucune actualité disponible pour le moment'}
          </p>
        </div>
      )}

      {/* Featured Article */}
      {!isLoading && featuredNews && selectedCategory === 'all' && (
        <section className="mb-12">
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">{t('featured')}</h2>
          </div>
          
          <Card className="border-2 border-primary/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Badge className="bg-primary text-primary-foreground">
                  {getCategoryLabel(featuredNews.category)}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {t('featured')}
                </Badge>
                <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'mr-auto' : 'ml-auto'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="w-4 h-4" />
                    {formatDate(featuredNews.published_at)}
                  </div>
                  {featuredNews.read_time && (
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-4 h-4" />
                      {featuredNews.read_time} {t('min')}
                    </div>
                  )}
                </div>
              </div>
              
              <CardTitle className="text-2xl mb-3">
                {language === 'ar' ? (featuredNews.title_ar || featuredNews.title) : featuredNews.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {language === 'ar' ? (featuredNews.excerpt_ar || featuredNews.excerpt) : featuredNews.excerpt}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(language === 'ar' ? (featuredNews.tags_ar || featuredNews.tags) : featuredNews.tags)?.map((tag) => (
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
      {!isLoading && regularNews.length > 0 && (
        <section>
          <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('latestNews')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <CardHeader className={`pb-4 flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight mb-3">
                    {language === 'ar' ? (article.title_ar || article.title) : article.title}
                  </CardTitle>
                  <CardDescription className="text-sm flex-1">
                    {language === 'ar' ? (article.excerpt_ar || article.excerpt) : article.excerpt}
                  </CardDescription>
                  
                  <div className={`flex items-center gap-3 text-xs text-muted-foreground mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </div>
                    {article.read_time && (
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="w-3 h-3" />
                        {article.read_time} {t('min')}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className={`flex flex-wrap gap-1 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {(language === 'ar' ? (article.tags_ar || article.tags) : article.tags)?.map((tag) => (
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
        </section>
      )}
    </div>
  );
};

export default Actualites;
