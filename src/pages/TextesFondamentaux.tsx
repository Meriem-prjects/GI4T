import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
        ) : filteredCategories.length > 0 ? (
          <Carousel 
            opts={{
              align: "start",
              slidesToScroll: 3
            }} 
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredCategories.map(category => {
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
