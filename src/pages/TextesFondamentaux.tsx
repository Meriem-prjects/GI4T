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
import {
  BookOpen,
  Scale,
  Users,
  Heart,
  ShieldCheck,
  GraduationCap,
  Search,
  Droplet,
  Megaphone,
  Briefcase,
  Leaf,
  Home,
  Vote,
  Shield,
  Gavel,
  FileText,
  Download,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
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
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
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
        
        // Compter les documents par catégorie
        const counts: Record<string, number> = {};
        docsData?.forEach(doc => {
          doc.document_categories?.forEach((dc: { category_id: string }) => {
            counts[dc.category_id] = (counts[dc.category_id] || 0) + 1;
          });
        });
        setCategoryCounts(counts);
        
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
    if (name.includes('justice') || name.includes('procès') || name.includes('tribunal')) return Scale;
    if (name.includes('eau') || name.includes('water')) return Droplet;
    if (name.includes('expression') || name.includes('publication') || name.includes('presse') || name.includes('information')) return Megaphone;
    if (name.includes('travail') || name.includes('syndical') || name.includes('emploi')) return Briefcase;
    if (name.includes('environnement') || name.includes('écolog') || name.includes('nature')) return Leaf;
    if (name.includes('enseignement') || name.includes('éducation') || name.includes('education')) return GraduationCap;
    if (name.includes('logement') || name.includes('résidence') || name.includes('domicile')) return Home;
    if (name.includes('élire') || name.includes('vote') || name.includes('candidat') || name.includes('politique')) return Vote;
    if (name.includes('protection') || name.includes('sécurité') || name.includes('détenu')) return Shield;
    if (name.includes('défense') || name.includes('propriété') || name.includes('sécurité juridique')) return Gavel;
    if (name.includes('civils') || name.includes('égalité') || name.includes('enfant') || name.includes('handicapé')) return Users;
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

      {/* HERO — gradient banner with search */}
      <section
        className={`relative overflow-hidden rounded-2xl mb-12 py-14 px-6 md:px-10
          bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
          border border-border/50`}
      >
        {/* Dotted pattern background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Scale className="w-3.5 h-3.5" />
            {isRTL ? 'البوابة القانونية التونسية' : 'Portail juridique tunisien'}
          </div>

          <h1 className={`text-2xl md:text-4xl font-bold mb-4 leading-tight tracking-tight ${isRTL ? 'arabic-text font-arabic' : ''}`}>
            {t('fundamentalRightsTexts')}
          </h1>
          <p className={`text-sm md:text-base text-muted-foreground mb-8 ${isRTL ? 'arabic-text font-arabic' : ''}`}>
            {isRTL
              ? 'تصفحوا قاعدة بيانات شاملة تضم القرارات القضائية والتحاليل القانونية والنصوص المعيارية المتعلقة بحماية حقوق الإنسان.'
              : "Accédez à une base de données exhaustive regroupant les décisions de justice, les analyses juridiques et les textes normatifs relatifs à la protection des droits de l'homme."}
          </p>

          {/* Search bar */}
          <div className="w-full max-w-2xl">
            <div className="flex gap-2 p-2 bg-white rounded-xl shadow-sm border border-border/60">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'ابحث عن حق أو قانون أو قرار...' : 'Rechercher un droit, une loi ou une décision...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`border-0 shadow-none focus-visible:ring-0 ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">
                {isRTL ? 'بحث' : 'Rechercher'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* THÉMATIQUES PRINCIPALES */}
      <section className="mb-16">
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h2 className={`text-xl md:text-2xl font-bold ${isRTL ? 'arabic-text font-arabic' : ''}`}>
              {isRTL ? 'المحاور الأساسية' : 'Thématiques principales'}
            </h2>
          </div>
        </div>
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className={`text-sm text-muted-foreground ${isRTL ? 'arabic-text font-arabic text-right' : ''}`}>
            {isRTL
              ? 'استكشف الحقوق الأساسية حسب المحاور المواضيعية'
              : 'Explorez les droits fondamentaux par catégories thématiques'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : paginatedCategories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedCategories.map((category) => {
                const Icon = getIconForCategory(category.name);
                const count = categoryCounts[category.id] || 0;
                const categoryColor = category.color || '#6366f1';
                const isHovered = hoveredCard === category.id;

                return (
                  <Card
                    key={category.id}
                    className="group bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/60 rounded-xl overflow-hidden"
                    onClick={() => handleExploreCategory(category.name)}
                    onMouseEnter={() => setHoveredCard(category.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <CardContent className="p-6">
                      <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${categoryColor}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: categoryColor }} />
                        </div>
                        <Badge
                          variant="secondary"
                          className="rounded-full font-semibold px-3 py-1 text-xs"
                          style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                        >
                          {count.toString().padStart(2, '0')} {isRTL ? 'وثيقة' : count <= 1 ? 'Fiche' : 'Fiches'}
                        </Badge>
                      </div>

                      <CardTitle
                        className={`text-lg font-semibold mb-2 ${isRTL ? 'text-right arabic-text font-arabic' : ''}`}
                        style={{ color: isHovered ? categoryColor : undefined }}
                      >
                        {isRTL ? category.name_ar || category.name : category.name}
                      </CardTitle>

                      <CardDescription className={`text-sm line-clamp-3 mb-5 ${isRTL ? 'text-right arabic-text font-arabic' : ''}`}>
                        {isRTL ? category.description_ar || category.description : category.description}
                      </CardDescription>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-between px-0 font-semibold hover:bg-transparent ${isRTL ? 'flex-row-reverse' : ''}`}
                        style={{ color: categoryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExploreCategory(category.name);
                        }}
                      >
                        <span>{isRTL ? 'استشارة' : 'Consulter'}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent className={isRTL ? 'flex-row-reverse' : ''}>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className={`text-center py-12 text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {searchTerm
              ? `${t('noCategoryFound')} "${searchTerm}"`
              : isRTL
              ? 'لا توجد فئات متاحة حالياً'
              : 'Aucune catégorie disponible pour le moment'}
          </div>
        )}
      </section>

      {/* STATS / REPORTS SECTION */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Report card */}
          <Card className="lg:col-span-2 bg-white border border-border/60 rounded-xl">
            <CardContent className="p-6 md:p-8">
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${isRTL ? 'arabic-text font-arabic' : ''}`}>
                    {isRTL ? 'التقارير والتحاليل السنوية' : 'Rapports & Analyses Annuelles'}
                  </h3>
                  <p className={`text-sm text-muted-foreground mb-4 ${isRTL ? 'arabic-text font-arabic' : ''}`}>
                    {isRTL
                      ? 'اطلعوا على أحدث التقارير المفصلة حول وضع الحقوق الأساسية في تونس، تحليل دقيق يستند إلى البيانات المجمعة على مدار السنة.'
                      : "Consultez nos derniers rapports détaillés sur l'état des droits fondamentaux en Tunisie. Une analyse rigoureuse basée sur les données collectées tout au long de l'année."}
                  </p>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'تحميل تقرير 2023' : 'Télécharger le Rapport 2023'}
                    </Button>
                    <Button variant="outline">
                      {isRTL ? 'الأرشيف' : 'Archives'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            <Card className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
              <CardContent className={`p-6 ${isRTL ? 'text-right' : ''}`}>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {categories.length > 0
                    ? `${Object.values(categoryCounts).reduce((a, b) => a + b, 0).toLocaleString()}+`
                    : '—'}
                </div>
                <div className={`text-xs font-semibold uppercase tracking-wider opacity-90 ${isRTL ? 'arabic-text font-arabic' : ''}`}>
                  {isRTL ? 'قرارات مصنفة' : 'Décisions répertoriées'}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0">
              <CardContent className={`p-6 ${isRTL ? 'text-right' : ''}`}>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {categories.length}+
                </div>
                <div className={`text-xs font-semibold uppercase tracking-wider opacity-95 ${isRTL ? 'arabic-text font-arabic' : ''}`}>
                  {isRTL ? 'فئات الحقوق' : 'Catégories de droits'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TextesFondamentaux;
