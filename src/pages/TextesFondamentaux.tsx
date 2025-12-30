import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookOpen, Scale, Users, Heart, ShieldCheck, GraduationCap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const TextesFondamentaux = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 9;

  useEffect(() => {
    const fetchJurisprudenceCategories = async () => {
      try {
        // D'abord, récupérer l'ID du type "Fiche de jurisprudence"
        const { data: docTypeData, error: docTypeError } = await supabase
          .from('document_types')
          .select('id')
          .eq('name', 'Fiche de jurisprudence')
          .maybeSingle();
        
        if (docTypeError) throw docTypeError;
        
        if (!docTypeData) {
          console.log('No "Fiche de jurisprudence" document type found');
          setCategories([]);
          setLoading(false);
          return;
        }
        
        // Récupérer les IDs des catégories liées aux fiches de jurisprudence publiées
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('id, document_categories(category_id)')
          .eq('document_type_id', docTypeData.id)
          .eq('published', true)
          .in('status', ['processed', 'published']);
        
        if (docsError) throw docsError;
        
        // Extraire les IDs uniques des catégories
        const categoryIds = [...new Set(
          docsData?.flatMap(d => 
            d.document_categories?.map((dc: { category_id: string }) => dc.category_id) || []
          ) || []
        )];
        
        if (categoryIds.length === 0) {
          setCategories([]);
          setLoading(false);
          return;
        }
        
        // Récupérer les détails des catégories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .in('id', categoryIds)
          .order('name');
        
        if (catError) throw catError;
        
        // Trier avec "Droit à la santé" en premier si présent
        const sortedCategories = categoriesData?.sort((a, b) => {
          if (a.name === "Droit à la santé") return -1;
          if (b.name === "Droit à la santé") return 1;
          return a.name.localeCompare(b.name);
        }) || [];
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching jurisprudence categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJurisprudenceCategories();
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
    navigate(`/observatoire/droits-fondamentaux/${categorySlug}`);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (category.name_ar && category.name_ar.includes(searchTerm)) || 
    (category.description_ar && category.description_ar.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const startIndex = (currentPage - 1) * categoriesPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + categoriesPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
              <BreadcrumbPage>{isRTL ? 'النصوص الأساسية' : 'Textes fondamentaux'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : paginatedCategories.length > 0 ? (
          <>
            {/* Grid of categories - 3 columns desktop, 2 tablet, 1 mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCategories.map(category => {
                const Icon = getIconForCategory(category.name);
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer h-[280px] flex flex-col">
                    <CardHeader className="flex-1">
                      <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <Icon className="w-5 h-5" style={{ color: category.color }} />
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
                        <BookOpen className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('explore')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Numeric pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent className={isRTL ? 'flex-row-reverse' : ''}>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className={`text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {searchTerm 
              ? `${t('noCategoryFound')} "${searchTerm}"`
              : (isRTL ? 'لا توجد فئات متاحة حالياً' : 'Aucune catégorie disponible pour le moment')
            }
          </div>
        )}
      </section>
    </div>
  );
};

export default TextesFondamentaux;
