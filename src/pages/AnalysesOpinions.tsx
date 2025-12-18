import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Pen, TrendingUp, Eye, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAllAnalysesOpinions, useDocumentTypesCounts } from "@/hooks/useDocumentsByType";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const AnalysesOpinions = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  
  // Fetch real data from database
  const { data: documents, isLoading: documentsLoading } = useAllAnalysesOpinions();
  const { data: typeCounts, isLoading: countsLoading } = useDocumentTypesCounts();

  const getTypeCount = (typeName: string) => {
    const typeData = typeCounts?.find(tc => tc.name === typeName);
    return typeData?.count || 0;
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Breadcrumb */}
        <div className={`mb-6 w-full flex justify-start`}>
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
                <BreadcrumbPage>{t('analysesOpinions')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

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
            {countsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-8 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              [
                { 
                  title: t('deepAnalyses'), 
                  count: getTypeCount('Analyses juridiques'), 
                  description: t('deepAnalysesDesc'), 
                  icon: FileText, 
                  color: "bg-blue-100 text-blue-800",
                  type: "analyses-juridiques"
                },
                { 
                  title: t('opinionArticles'), 
                  count: getTypeCount('Commentaires'), 
                  description: t('opinionArticlesDesc'), 
                  icon: Pen, 
                  color: "bg-green-100 text-green-800",
                  type: "commentaires"
                },
                { 
                  title: t('policyBriefs'), 
                  count: getTypeCount('Blogs'), 
                  description: t('policyBriefsDesc'), 
                  icon: TrendingUp, 
                  color: "bg-purple-100 text-purple-800",
                  type: "blogs"
                }
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
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <Link to={`/observatoire/${category.type}`}>
                          {t('consult')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Articles récents */}
        <section>
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl font-bold">{t('recentPublications')}</h2>
            <Button variant="outline" asChild>
              <Link to="/observatoire/recherche">
                {t('seeAllPublications')}
              </Link>
            </Button>
          </div>
          
          {documentsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-6">
              {documents.map((article) => {
                const title = language === 'ar' && article.title_ar ? article.title_ar : article.title;
                const summary = language === 'ar' && article.summary_ar ? article.summary_ar : article.summary;
                const author = language === 'ar' && article.author_ar ? article.author_ar : article.author;
                const keywords = language === 'ar' && article.keywords_ar ? article.keywords_ar : article.keywords;
                const categoryName = language === 'ar' && article.document_types?.name_ar 
                  ? article.document_types.name_ar 
                  : article.document_types?.name;
                
                return (
                  <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Badge variant="outline">{categoryName}</Badge>
                            <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Calendar className="w-4 h-4" />
                                {format(new Date(article.created_at), 'dd MMMM yyyy', { locale: isRTL ? ar : fr })}
                              </div>
                              {author && (
                                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <User className="w-4 h-4" />
                                  {author}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <CardTitle className="text-xl mb-3">{title}</CardTitle>
                          {summary && (
                            <div 
                              className={`text-base mb-4 text-muted-foreground line-clamp-2 ${isRTL ? 'arabic-text font-arabic' : ''}`}
                              dir={isRTL ? 'rtl' : 'ltr'}
                              dangerouslySetInnerHTML={{ 
                                __html: summary.replace(/<\/?p>/gi, '').trim()
                              }}
                            />
                          )}
                          
                          {keywords && keywords.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {keywords.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className={isRTL ? 'mr-6' : 'ml-6'}>
                          <Button asChild>
                            <Link to={`/observatoire/document/${article.id}`}>
                              {t('readArticle')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardDescription className={isRTL ? 'text-right' : 'text-center'}>
                  {t('noResults')}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
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