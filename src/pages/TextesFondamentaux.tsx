import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { FileText, BookOpen, Scale, Users, Download, ExternalLink, Heart, ShieldCheck, GraduationCap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { createCategorySlug } from "@/lib/urlUtils";
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
  document_type: string;
  year: number;
}
const TextesFondamentaux = () => {
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
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;

        // Put "Droit à la santé" first, then sort the rest
        const sortedCategories = data?.sort((a, b) => {
          if (a.name === "Droit à la santé") return -1;
          if (b.name === "Droit à la santé") return 1;
          return a.name.localeCompare(b.name);
        }) || [];
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('documents').select('*').in('status', ['published', 'processed']).order('created_at', {
          ascending: false
        });
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
  const getEmojiForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('santé') || name.includes('health')) return '🏥';
    if (name.includes('justice') || name.includes('legal')) return '⚖️';
    if (name.includes('enseignement') || name.includes('éducation') || name.includes('education')) return '🎓';
    if (name.includes('protection') || name.includes('sécurité')) return '🛡️';
    if (name.includes('civils') || name.includes('politiques')) return '👥';
    return '📚';
  };
  const handleExploreCategory = (categoryName: string) => {
    const categorySlug = createCategorySlug(categoryName);
    navigate(`/observatoire/droits-fondamentaux/${categorySlug}`);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const filteredCategories = categories.filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()) || category.description.toLowerCase().includes(searchTerm.toLowerCase()) || category.name_ar && category.name_ar.includes(searchTerm) || category.description_ar && category.description_ar.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination logic
  const totalPages = Math.ceil(documents.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const endIndex = startIndex + documentsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of documents section
    document.getElementById('textes-reference')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div dir={isRTL ? 'rtl' : 'ltr'} className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`}>
        {/* Breadcrumb */}
        <Breadcrumb className={`mb-6 ${isRTL ? 'flex justify-end' : ''}`}>
          <BreadcrumbList>
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
              <BreadcrumbPage>{isRTL ? 'النصوص الأساسية' : 'Textes fondamentaux'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className={`text-center mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('fundamentalRightsTexts')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('fundamentalRightsDesc')}</p>
        </section>

        {/* Droits par catégorie */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('rightsByCategory')}</h2>
          
          {/* Barre de recherche */}
          <div className={`relative mb-8 max-w-md ${isRTL ? 'mr-0 ml-auto' : ''}`}>
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input 
              placeholder={t('searchCategory')} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>

          {loading ? <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div> : <Carousel opts={{
        align: "start",
        slidesToScroll: 3
      }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredCategories.map(category => {
            const Icon = getIconForCategory(category.name);
            const emoji = getEmojiForCategory(category.name);
            return <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/3">
                       <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-[280px] flex flex-col">
                         <CardHeader className="flex-1">
                           <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                      backgroundColor: category.color + '20'
                    }}>
                               <Icon className="w-5 h-5" style={{
                        color: category.color
                      }} />
                             </div>
                             <Badge variant="secondary">{t('fundamentalRight')}</Badge>
                           </div>
                           <CardTitle className={`text-lg mb-2 ${isRTL ? 'text-right' : ''}`}>
                             {isRTL ? category.name_ar || category.name : category.name}
                           </CardTitle>
                           <CardDescription className={`line-clamp-2 text-sm leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                             {isRTL ? category.description_ar || category.description : category.description}
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="pt-0">
                           <Button variant="outline" className="w-full" onClick={() => handleExploreCategory(category.name)}>
                             <BookOpen className="w-4 h-4 mr-2" />
                             {t('explore')}
                           </Button>
                         </CardContent>
                       </Card>
                     </CarouselItem>;
          })}
              </CarouselContent>
              {filteredCategories.length > 3 && <>
                  <CarouselPrevious className="hidden md:flex -left-12" />
                  <CarouselNext className="hidden md:flex -right-12" />
                </>}
            </Carousel>}
          
          {!loading && filteredCategories.length === 0 && searchTerm && <div className={`text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
              {t('noCategoryFound')} "{searchTerm}"
            </div>}
        </section>

        {/* Textes de référence */}
        <section id="textes-reference">
          <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('referenceTexts')}</h2>
          
          {documentsLoading ? <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-40 w-full" />)}
            </div> : documents.length === 0 ? <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('noDocumentAvailable')}</h3>
              <p className="text-muted-foreground">
                {t('noDocumentText')}
              </p>
            </div> : <>
              <div className="space-y-6 mb-8">
                {currentDocuments.map(document => <Card key={document.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-1">
                          <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <FileText className="w-5 h-5 text-primary" />
                            {document.document_type && <Badge variant="outline">{document.document_type}</Badge>}
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {t('published')}
                            </Badge>
                            {document.year && <Badge variant="outline">{document.year}</Badge>}
                          </div>
                          <CardTitle className={`text-xl mb-2 ${isRTL ? 'text-right' : ''}`}>
                            {isRTL ? document.title_ar || document.title : document.title}
                          </CardTitle>
                          {document.summary && <CardDescription className={`text-base mb-3 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                              {isRTL ? document.summary_ar || document.summary : document.summary}
                            </CardDescription>}
                          <div className={`flex items-center gap-4 text-sm text-muted-foreground mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span>{t('publishedOn')} {formatDate(document.created_at)}</span>
                            {document.page_count && <span>• {document.page_count} {t(document.page_count > 1 ? 'pages' : 'page')}</span>}
                          </div>
                          {document.keywords && document.keywords.length > 0 && <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {document.keywords.slice(0, 5).map(keyword => <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>)}
                            </div>}
                        </div>
                        <div className={`flex flex-col gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                          {document.file_url && <Button size="sm" asChild>
                              <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t('consult')}
                              </a>
                            </Button>}
                          {document.pdf_url && <Button variant="outline" size="sm" asChild>
                              <a href={document.pdf_url} download>
                                <Download className="w-4 h-4 mr-2" />
                                {t('download')}
                              </a>
                            </Button>}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && <Pagination className="justify-center">
                  <PaginationContent>
                    {currentPage > 1 && <PaginationItem>
                        <PaginationPrevious href="#" onClick={e => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }} />
                      </PaginationItem>}
                    
                    {Array.from({
              length: totalPages
            }, (_, i) => i + 1).map(page => <PaginationItem key={page}>
                        <PaginationLink href="#" onClick={e => {
                e.preventDefault();
                handlePageChange(page);
              }} isActive={currentPage === page}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>)}

                    {currentPage < totalPages && <PaginationItem>
                        <PaginationNext href="#" onClick={e => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }} />
                      </PaginationItem>}
                  </PaginationContent>
                </Pagination>}
            </>}
        </section>
      </div>;
};
export default TextesFondamentaux;