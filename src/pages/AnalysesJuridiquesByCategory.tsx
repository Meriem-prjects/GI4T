import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Download, ExternalLink, Heart, ShieldCheck, GraduationCap, BookOpen, Scale, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createCategorySlug, createDocumentSlug } from "@/lib/urlUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface Category {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  color: string;
}

interface Document {
  id: string;
  title: string;
  title_ar: string;
  summary: string;
  summary_ar: string;
  created_at: string;
  status: string;
  file_url: string;
  pdf_url: string;
  page_count: number;
  keywords: string[];
  keywords_ar: string[];
  author: string;
  author_ar: string;
}

const AnalysesJuridiquesByCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndDocuments = async () => {
      if (!categorySlug) return;
      
      try {
        // Find category by slug
        const { data: allCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        
        const categoryData = allCategories?.find(cat => {
          const slugName = createCategorySlug(cat.name || '');
          const slugNameAr = createCategorySlug(cat.name_ar || '');
          return slugName === categorySlug || slugNameAr === categorySlug || cat.id === categorySlug;
        });
        
        if (!categoryData) {
          throw new Error('Category not found');
        }
        
        setCategory(categoryData);

        // Get document type ID for "Analyses juridiques"
        const { data: typeData, error: typeError } = await supabase
          .from('document_types')
          .select('id')
          .eq('name', 'Analyses juridiques')
          .single();
        
        if (typeError) throw typeError;

        // Fetch documents for this category AND this document type
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select(`
            *,
            document_categories!inner(category_id)
          `)
          .eq('document_categories.category_id', categoryData.id)
          .eq('document_type_id', typeData.id)
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (documentsError) throw documentsError;
        setDocuments(documentsData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndDocuments();
  }, [categorySlug]);

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('santé') || name.includes('health')) return Heart;
    if (name.includes('justice') || name.includes('legal')) return Scale;
    if (name.includes('enseignement') || name.includes('éducation') || name.includes('education')) return GraduationCap;
    if (name.includes('protection') || name.includes('sécurité')) return ShieldCheck;
    if (name.includes('civils') || name.includes('politiques')) return Users;
    return BookOpen;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-TN' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-6 w-96 mb-6" />
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">
            {isRTL ? 'الفئة غير موجودة' : 'Catégorie introuvable'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isRTL ? 'الفئة التي تبحث عنها غير موجودة أو تم حذفها.' : 'La catégorie que vous recherchez n\'existe pas ou a été supprimée.'}
          </p>
          <Link to="/observatoire/analyses-juridiques">
            <Button>{isRTL ? 'العودة إلى التحليلات' : 'Retour aux analyses'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getIconForCategory(category.name);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`}>
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
              <BreadcrumbLink asChild>
                <Link to="/observatoire/analyses-juridiques">{t('deepAnalyses')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isRTL ? category.name_ar || category.name : category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Category Header */}
      <section className="mb-12">
        <div 
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-background/60 rounded-lg"></div>
          <div className="relative z-10">
            <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color + '20' }}
              >
                <Icon className="w-6 h-6" style={{ color: category.color }} />
              </div>
            </div>
            
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? category.name_ar || category.name : category.name}
            </h1>
            <p className={`text-lg text-muted-foreground mb-6 max-w-3xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? category.description_ar || category.description : category.description}
            </p>
            
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Badge variant="secondary" className="px-4 py-2">
                {documents.length} {documents.length > 1 ? (isRTL ? 'تحليلات' : 'analyses') : (isRTL ? 'تحليل' : 'analyse')}
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                {t('deepAnalyses')}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section>
        <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'التحليلات المتاحة' : 'Analyses disponibles'}
        </h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('noDocumentAvailable')}</h3>
            <p className="text-muted-foreground">
              {t('noDocumentText')}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {documents.map((document) => {
              const title = language === 'ar' && document.title_ar ? document.title_ar : document.title;
              const summary = language === 'ar' && document.summary_ar ? document.summary_ar : document.summary;
              const author = language === 'ar' && document.author_ar ? document.author_ar : document.author;
              const keywords = language === 'ar' && document.keywords_ar ? document.keywords_ar : document.keywords;

              return (
                <Card key={document.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <FileText className="w-5 h-5 text-primary" />
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {isRTL ? category.name_ar || category.name : category.name}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{title}</CardTitle>
                        {summary && (
                          <CardDescription className="text-base mb-3">
                            {summary}
                          </CardDescription>
                        )}
                        <div className={`flex items-center gap-4 text-sm text-muted-foreground mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span>{isRTL ? 'نشر في' : 'Publié le'} {formatDate(document.created_at)}</span>
                          {author && <span>• {author}</span>}
                          {document.page_count && (
                            <span>• {document.page_count} {isRTL ? 'صفحة' : 'page'}{document.page_count > 1 && !isRTL ? 's' : ''}</span>
                          )}
                        </div>
                        {keywords && keywords.length > 0 && (
                          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {keywords.slice(0, 5).map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`flex flex-col gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                        <Button size="sm" asChild>
                          <Link to={`/observatoire/document/${document.id}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('consult')}
                          </Link>
                        </Button>
                        {document.pdf_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={document.pdf_url} download>
                              <Download className="w-4 h-4 mr-2" />
                              {t('download')}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalysesJuridiquesByCategory;
