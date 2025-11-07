import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Pen, TrendingUp, Eye, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const AnalysesOpinions = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const analyses = [
    {
      id: 1,
      title: "L'évolution du droit à la vie privée à l'ère numérique",
      excerpt: "Une analyse approfondie des enjeux contemporains de la protection des données personnelles en Tunisie...",
      author: "Dr. Ahmed Ben Salem",
      date: "15 novembre 2024",
      readTime: "12 min",
      views: 1247,
      category: "Analyses juridiques",
      tags: ["Vie privée", "RGPD", "Numérique"]
    },
    {
      id: 2,
      title: "Les défis de la liberté d'expression face aux réseaux sociaux",
      excerpt: "Comment concilier liberté d'expression et lutte contre la désinformation sur les plateformes numériques...",
      author: "Prof. Fatma Kallel", 
      date: "10 novembre 2024",
      readTime: "8 min",
      views: 892,
      category: "Commentaires",
      tags: ["Expression", "Réseaux sociaux", "Désinformation"]
    },
    {
      id: 3,
      title: "Policy Brief: Renforcer l'accès à la justice",
      excerpt: "Recommandations pour améliorer l'accessibilité et l'efficacité du système judiciaire tunisien...",
      author: "Équipe ODF",
      date: "5 novembre 2024", 
      readTime: "15 min",
      views: 654,
      category: "Blogs",
      tags: ["Justice", "Accès", "Réforme"]
    }
  ];

  const categories = [
    {
      title: "Analyses approfondies",
      count: 24,
      description: "Études détaillées sur les évolutions jurisprudentielles",
      icon: FileText,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Articles d'opinion",
      count: 18,
      description: "Points de vue d'experts sur les questions juridiques actuelles", 
      icon: Pen,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Policy Briefs",
      count: 12,
      description: "Recommandations pour les décideurs politiques",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-800"
    }
  ];

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
              <BreadcrumbPage>{t('analysesOpinions')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className={`mb-8 sm:mb-12 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t('analysesOpinions')}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            {t('analysesOpinionsDesc')}
          </p>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('contentTypes')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t('deepAnalyses'), count: 24, description: t('deepAnalysesDesc'), icon: FileText, color: "bg-blue-100 text-blue-800" },
              { title: t('opinionArticles'), count: 18, description: t('opinionArticlesDesc'), icon: Pen, color: "bg-green-100 text-green-800" },
              { title: t('policyBriefs'), count: 12, description: t('policyBriefsDesc'), icon: TrendingUp, color: "bg-purple-100 text-purple-800" }
            ].map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader className={isRTL ? 'text-right' : ''}>
                    <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Icon className="w-8 h-8 text-primary" />
                      <Badge className={category.color}>{category.count}</Badge>
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      {t('consult')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Articles récents */}
        <section>
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl font-bold">{t('recentPublications')}</h2>
            <Button variant="outline">
              {t('seeAllPublications')}
            </Button>
          </div>
          
          <div className="space-y-6">
            {analyses.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Badge variant="outline">{article.category}</Badge>
                        <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Calendar className="w-4 h-4" />
                            {article.date}
                          </div>
                          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <User className="w-4 h-4" />
                            {article.author}
                          </div>
                          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Eye className="w-4 h-4" />
                            {article.views} {t('views')}
                          </div>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl mb-3">{article.title}</CardTitle>
                      <CardDescription className="text-base mb-4">
                        {article.excerpt}
                      </CardDescription>
                      
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{article.readTime} {t('readTime')}</span>
                      </div>
                    </div>
                    
                    <div className={isRTL ? 'mr-6' : 'ml-6'}>
                      <Button>
                        {t('readArticle')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className={`bg-muted rounded-xl p-8 mt-12 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h3 className="text-2xl font-bold mb-4">{t('contributeToReflection')}</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('contributeText')}
          </p>
          <Button size="lg">
            {t('proposeArticle')}
          </Button>
        </section>
      </div>
  );
};

export default AnalysesOpinions;