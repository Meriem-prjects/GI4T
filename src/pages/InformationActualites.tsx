import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

const InformationActualites = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const actualites = [
    {
      id: 1,
      title: "Nouvelle réforme du Code du travail tunisien",
      excerpt: "Les dernières modifications apportées au Code du travail et leur impact sur les droits des salariés.",
      date: "15 Mars 2024",
      readTime: "5 min",
      views: 1234,
      category: t('laborLaw'),
      image: "/Feelinx_upload/justclic-logo.png",
      featured: true
    },
    {
      id: 2,
      title: "Guide pratique : Obtenir un acte de naissance",
      excerpt: "Procédure simplifiée pour obtenir un acte de naissance en ligne ou dans les bureaux d'état civil.",
      date: "12 Mars 2024",
      readTime: "3 min",
      views: 892,
      category: t('civilStatus'),
      image: "/Feelinx_upload/justclic-logo.png"
    },
    {
      id: 3,
      title: "Droits des locataires : ce qui change en 2024",
      excerpt: "Nouvelles protections pour les locataires et évolutions de la législation sur le logement.",
      date: "10 Mars 2024",
      readTime: "6 min",
      views: 756,
      category: t('housingRights'),
      image: "/Feelinx_upload/justclic-logo.png"
    },
    {
      id: 4,
      title: "Procédures de divorce simplifiées",
      excerpt: "Les nouvelles procédures de divorce consensuel et leur impact sur les familles tunisiennes.",
      date: "8 Mars 2024",
      readTime: "4 min",
      views: 634,
      category: t('familyLaw'),
      image: "/Feelinx_upload/justclic-logo.png"
    }
  ];

  const categories = [
    { name: t('laborLaw'), count: 23 },
    { name: t('civilStatus'), count: 18 },
    { name: t('housingRights'), count: 15 },
    { name: t('familyLaw'), count: 12 },
    { name: t('socialRights'), count: 9 }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-muted-foreground`}>
            <Link to="/" className="hover:text-primary">{t('home')}</Link>
            <span>›</span>
            <Link to="/information/actualites" className="hover:text-primary">{t('information')}</Link>
            <span>›</span>
            <span className="text-foreground">{t('legalNews')}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className={`container mx-auto px-4 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('legalNews')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('legalNewsSubtitle')}
          </p>
          
          {/* Newsletter Subscription */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto ${isRTL ? 'text-right' : ''}`}>
            <h3 className="font-semibold mb-3">{t('newsletter')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('receiveNewsByEmail')}</p>
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input 
                type="email" 
                placeholder={t('yourEmail')}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button size="sm">{t('subscribe')}</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader className={isRTL ? 'text-right' : ''}>
                <CardTitle className="text-lg">{t('categories')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={index} className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Featured Article */}
            <div className="mb-12">
              <h2 className={`text-xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('featuredArticle')}</h2>
              <Card className="overflow-hidden border-primary/20 bg-primary/5">
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isRTL ? 'md:grid-flow-dense' : ''}`}>
                  <div className={`aspect-video md:aspect-square bg-muted/50 flex items-center justify-center ${isRTL ? 'md:col-start-2' : ''}`}>
                    <img 
                      src={actualites[0].image} 
                      alt={actualites[0].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`p-6 ${isRTL ? 'text-right md:col-start-1' : ''}`}>
                    <Badge className="mb-3">{actualites[0].category}</Badge>
                    <CardTitle className="text-xl mb-3">{actualites[0].title}</CardTitle>
                    <CardDescription className="mb-4 leading-relaxed">
                      {actualites[0].excerpt}
                    </CardDescription>
                    <div className={`flex items-center gap-4 text-sm text-muted-foreground mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="h-4 w-4" />
                        {actualites[0].date}
                      </div>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="h-4 w-4" />
                        {actualites[0].readTime}
                      </div>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Eye className="h-4 w-4" />
                        {actualites[0].views}
                      </div>
                    </div>
                    <Button className="group">
                      {t('readArticle')}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Regular Articles */}
            <div>
              <h2 className={`text-xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('latestNews')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {actualites.slice(1).map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-muted/50 overflow-hidden rounded-t-lg">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader className={isRTL ? 'text-right' : ''}>
                      <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className={`flex items-center gap-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </div>
                          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className={isRTL ? 'text-right' : ''}>
                      <CardDescription className="mb-4">{article.excerpt}</CardDescription>
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-1 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="h-4 w-4" />
                          {article.date}
                        </div>
                        <Button variant="ghost" size="sm" className="group">
                          {t('readMore')}
                          <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className={isRTL ? 'text-right' : 'text-center'}>
                <Button variant="outline" size="lg">
                  {t('loadMoreArticles')}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default InformationActualites;