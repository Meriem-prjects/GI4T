import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { FileText, BookOpen, Calendar, User, Search, Heart, Scale, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { createCategorySlug } from "@/lib/urlUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";

interface Category {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  color: string;
  doc_count?: number;
}

interface Document {
  id: string;
  title: string;
  title_ar: string;
  summary: string;
  summary_ar: string;
  author: string;
  author_ar: string;
  created_at: string;
  keywords: string[];
  keywords_ar: string[];
}

const AnalysesJuridiques = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 5;

  // Fetch categories with document counts
  useEffect(() => {
    const fetchCategoriesWithCounts = async () => {
      try {
        // 1. Get the ID for "Analyses juridiques" document type
        const { data: typeData } = await supabase
          .from('document_types')
          .select('id')
          .eq('name', 'Analyses juridiques')
          .single();
        
        if (!typeData) {
          setLoading(false);
          return;
        }

        // 2. Get all categories
        const { data: allCategories } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (!allCategories) {
          setLoading(false);
          return;
        }

        // 3. For each category, count published documents of type "Analyses juridiques"
        const categoriesWithCounts = await Promise.all(
          allCategories.map(async (category) => {
            // Get document IDs that match this category and are published
            const { data: docCategoryLinks } = await supabase
              .from('document_categories')
              .select('document_id')
              .eq('category_id', category.id);

            if (!docCategoryLinks || docCategoryLinks.length === 0) {
              return { ...category, doc_count: 0 };
            }

            const documentIds = docCategoryLinks.map(link => link.document_id);

            // Count published documents of type "Analyses juridiques"
            const { count } = await supabase
              .from('documents')
              .select('id', { count: 'exact', head: true })
              .eq('document_type_id', typeData.id)
              .eq('published', true)
              .in('id', documentIds);

            return { ...category, doc_count: count || 0 };
          })
        );

        // 4. Filter categories with at least 1 document
        const validCategories = categoriesWithCounts.filter(c => c.doc_count! > 0);
        setCategories(validCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithCounts();
  }, []);

  // Fetch all published "Analyses juridiques" documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data: typeData } = await supabase
          .from('document_types')
          .select('id')
          .eq('name', 'Analyses juridiques')
          .single();

        if (!typeData) {
          setDocumentsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('document_type_id', typeData.id)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('santé') || name.includes('health')) return Heart;
    if (name.includes('justice') || name.includes('legal')) return Scale;
    if (name.includes('enseignement') || name.includes('éducation') || name.includes('education')) return GraduationCap;
    if (name.includes('protection') || name.includes('sécurité')) return ShieldCheck;
    if (name.includes('civils') || name.includes('politiques')) return Users;
    return BookOpen;
  };

  const handleExploreCategory = (categoryName: string) => {
    const categorySlug = createCategorySlug(categoryName);
    navigate(`/observatoire/analyses-juridiques/${categorySlug}`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.name_ar && category.name_ar.includes(searchTerm)) ||
    (category.description_ar && category.description_ar.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(documents.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const endIndex = startIndex + documentsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('analyses-list')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <section className={`text-center mb-12 ${isRTL ? 'text-right' : ''}`}>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('deepAnalyses')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('deepAnalysesDesc')}
        </p>
      </section>

      {/* Categories Carousel */}
      <section className="mb-12">
        <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'التحليلات حسب الفئة' : 'Analyses par catégorie'}
        </h2>

        {/* Search bar */}
        <div className={`relative mb-8 max-w-md ${isRTL ? 'mr-0 ml-auto' : ''}`}>
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={t('searchCategory')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Carousel opts={{ align: "start", slidesToScroll: 3 }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredCategories.map((category) => {
                const Icon = getIconForCategory(category.name);
                return (
                  <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/3">
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-[280px] flex flex-col">
                      <CardHeader className="flex-1">
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <Icon className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <Badge variant="secondary">
                            {category.doc_count} {isRTL ? 'وثيقة' : 'analyses'}
                          </Badge>
                        </div>
                        <CardTitle className={`text-lg mb-2 ${isRTL ? 'text-right' : ''}`}>
                          {isRTL ? category.name_ar || category.name : category.name}
                        </CardTitle>
                        <CardDescription className={`line-clamp-2 text-sm leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                          {isRTL ? category.description_ar || category.description : category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleExploreCategory(category.name)}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          {t('explore')}
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {filteredCategories.length > 3 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-12" />
                <CarouselNext className="hidden md:flex -right-12" />
              </>
            )}
          </Carousel>
        )}

        {!loading && filteredCategories.length === 0 && searchTerm && (
          <div className={`text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {t('noCategoryFound')} "{searchTerm}"
          </div>
        )}
      </section>

      {/* Documents List */}
      <section id="analyses-list">
        <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'جميع التحليلات' : 'Toutes les analyses'}
        </h2>

        {documentsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('noDocumentAvailable')}</h3>
            <p className="text-muted-foreground">{t('noDocumentText')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {currentDocuments.map((doc) => {
                const title = language === 'ar' && doc.title_ar ? doc.title_ar : doc.title;
                const summary = language === 'ar' && doc.summary_ar ? doc.summary_ar : doc.summary;
                const author = language === 'ar' && doc.author_ar ? doc.author_ar : doc.author;
                const keywords = language === 'ar' && doc.keywords_ar ? doc.keywords_ar : doc.keywords;

                return (
                  <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Calendar className="w-4 h-4" />
                                {format(new Date(doc.created_at), 'dd MMMM yyyy', {
                                  locale: language === 'ar' ? ar : fr,
                                })}
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
                            <Link to={`/observatoire/document/${doc.id}`}>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="justify-center">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AnalysesJuridiques;
