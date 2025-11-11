import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const AnalysesJuridiques = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  
  // Fetch both "Analyses juridiques" and "Fiche d'analyse juridique" types with tolerance
  const { data: documents, isLoading } = useQuery({
    queryKey: ['analyses-juridiques-all-v2'],
    queryFn: async () => {
      try {
        // 1. Get all document types with normalization
        const { data: types, error: typesError } = await supabase
          .from('document_types')
          .select('id, name');
        
        if (typesError) {
          console.error('Error fetching document types:', typesError);
          throw typesError;
        }

        // Normalize function: lowercase, replace curly apostrophes, trim
        const normalize = (s?: string) =>
          (s ?? '').toLowerCase().replace(/[']/g, "'").replace(/\s+/g, ' ').trim();

        // Target names to match
        const targets = ["analyses juridiques", "fiche d'analyse juridique"];

        // Find matching types
        const matchingTypes = (types ?? []).filter(t => {
          const n = normalize(t.name);
          return targets.some(tt => n === tt || n.includes(tt));
        });

        const typeIds = matchingTypes.map(t => t.id);

        // 2A. Fetch documents by document_type_id
        let byId: any[] = [];
        if (typeIds.length > 0) {
          const { data, error } = await supabase
            .from('documents')
            .select('id, title, title_ar, summary, summary_ar, author, author_ar, created_at, keywords, keywords_ar, document_type_id, document_type')
            .in('document_type_id', typeIds)
            .eq('published', true)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error fetching documents by type ID:', error);
          } else {
            byId = data ?? [];
          }
        }

        // 2B. Fallback: fetch by textual document_type field
        const textNames = [
          'Analyses juridiques',
          "Fiche d'analyse juridique",
          "Fiche d'analyse juridique",
        ];
        
        const { data: byText, error: byTextError } = await supabase
          .from('documents')
          .select('id, title, title_ar, summary, summary_ar, author, author_ar, created_at, keywords, keywords_ar, document_type_id, document_type')
          .in('document_type', textNames)
          .eq('published', true);
        
        if (byTextError) {
          console.error('Error fetching documents by document_type text:', byTextError);
        }

        // 3. Merge and deduplicate
        const map = new Map<string, any>();
        [...byId, ...(byText ?? [])].forEach(d => map.set(d.id, d));
        
        const merged = Array.from(map.values())
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 20);

        return merged;
      } catch (error) {
        console.error('Error in analyses juridiques query:', error);
        throw error;
      }
    }
  });

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
              <BreadcrumbLink asChild>
                <Link to="/observatoire/analyses-opinions">{t('analysesOpinions')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('deepAnalyses')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero Section */}
      <section className={`mb-8 sm:mb-12 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <FileText className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('deepAnalyses')}</h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-2">
              {t('deepAnalysesDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section>
        {isLoading ? (
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
              
              return (
                <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Calendar className="w-4 h-4" />
                              {format(new Date(article.created_at), 'dd MMMM yyyy', { locale: language === 'ar' ? ar : fr })}
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
                          <CardDescription className="text-base mb-4">
                            {summary.length > 200 ? `${summary.substring(0, 200)}...` : summary}
                          </CardDescription>
                        )}
                        
                        {keywords && keywords.length > 0 && (
                          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {keywords.slice(0, 5).map((tag) => (
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
    </div>
  );
};

export default AnalysesJuridiques;
