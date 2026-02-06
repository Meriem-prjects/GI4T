import { useState } from "react";
import { Scale, FileText, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useCategories } from "@/hooks/useCategories";
import { useCourtTypes } from "@/hooks/useCourtTypes";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const Observatoire = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourtType, setSelectedCourtType] = useState("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Fetch real data
  const { data: categories } = useCategories();
  const { data: courtTypes } = useCourtTypes();
  const { data: documentTypes } = useDocumentTypes();
  
  // Fetch available years from documents
  const { data: years } = useQuery({
    queryKey: ["document-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("year")
        .not("year", "is", null)
        .order("year", { ascending: false });
      
      if (error) throw error;
      
      // Get unique years
      const uniqueYears = [...new Set(data.map(d => d.year))].filter(Boolean);
      return uniqueYears as number[];
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCourtType !== 'all') params.append('court', selectedCourtType);
      if (selectedDocumentType !== 'all') params.append('type', selectedDocumentType);
      if (selectedYear !== 'all') params.append('year', selectedYear);
      
      navigate(`/observatoire/search-results?${params.toString()}`);
    }
  };

  const popularTags = isRTL 
    ? ["اللائحة العامة لحماية البيانات", "حرية التعبير", "قانون العمل", "المساواة"]
    : ["RGPD", "Liberté d'expression", "Droit du travail", "Égalité"];
  
  const navigationCards = [
    {
      title: t('observatoireNavFundamentalRights'),
      description: t('observatoireNavFundamentalRightsDesc'),
      icon: Scale,
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      link: "/observatoire/droits-fondamentaux"
    },
    {
      title: t('observatoireNavAnalyses'),
      description: t('observatoireNavAnalysesDesc'),
      icon: FileText,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/observatoire/analyses-opinions"
    },
    {
      title: t('observatoireNavNews'),
      description: t('observatoireNavNewsDesc'),
      icon: Newspaper,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      link: "/observatoire/actualites"
    }
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-almarai' : ''}>
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground py-4 sm:py-6 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-10 max-w-3xl mx-auto opacity-90 px-2 sm:px-4 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
            {t('observatoireHeroText')}
          </p>
          
          {/* Search Bar with Autocomplete */}
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8">
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder={t('observatoireSearchPlaceholder')}
              language={language}
            />
          </div>

          {/* Popular Tags - Horizontal scroll on mobile */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <p className={`text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 opacity-80 ${isRTL ? 'text-right' : ''}`}>{t('popularSearches')} :</p>
            <div className={`flex overflow-x-auto pb-2 sm:flex-wrap sm:justify-center gap-2 scrollbar-hide ${isRTL ? 'flex-row-reverse' : ''}`}>
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="bg-background/20 text-primary-foreground hover:bg-background/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto rounded-full whitespace-nowrap flex-shrink-0"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters - 2 columns on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-5xl mx-auto">
            {/* Categories Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={`bg-background text-foreground h-10 sm:h-12 text-sm md:text-base ${isRTL ? 'text-right' : ''}`}>
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {isRTL ? category.name_ar || category.name : category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Court Types Filter */}
            <Select value={selectedCourtType} onValueChange={setSelectedCourtType}>
              <SelectTrigger className={`bg-background text-foreground h-10 sm:h-12 text-sm md:text-base ${isRTL ? 'text-right' : ''}`}>
                <SelectValue placeholder={t('allCourts')} />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">{t('allCourts')}</SelectItem>
                {courtTypes?.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {isRTL ? court.name_ar || court.name : court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Document Types Filter */}
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger className={`bg-background text-foreground h-10 sm:h-12 text-sm md:text-base ${isRTL ? 'text-right' : ''}`}>
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                {documentTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {isRTL ? type.name_ar || type.name : type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className={`bg-background text-foreground h-10 sm:h-12 text-sm md:text-base ${isRTL ? 'text-right' : ''}`}>
                <SelectValue placeholder={t('allPeriods')} />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">{t('allPeriods')}</SelectItem>
                {years?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Navigation Sections */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${isRTL ? 'text-right' : ''}`}>
            {t('ourSections')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {navigationCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={card.title} 
                  className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${card.bgColor} hover:scale-105`}
                  onClick={() => navigate(card.link)}
                >
                  <CardHeader className="pb-4">
                    <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                    <CardTitle className={`text-lg md:text-xl leading-tight ${isRTL ? 'text-right' : ''}`}>{card.title}</CardTitle>
                    <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" size="sm" className="w-full md:w-auto">{t('explore')}</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-8 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 ${isRTL ? 'text-right' : ''}`}>
            {t('featuredContent')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className={`flex items-center justify-between mb-2 flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-muted-foreground">15 Nov 2024 • CEDH</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">{t('decisions')}</span>
                  </div>
                  <CardTitle className={`text-base md:text-lg leading-tight ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'قرار مهم بشأن حماية البيانات' : 'Arrêt important sur la protection des données'}
                  </CardTitle>
                  <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'تحليل القرار الصادر عن المحكمة الأوروبية لحقوق الإنسان بشأن الحق في النسيان الرقمي...' : 'Analyse de la décision rendue par la CEDH concernant le droit à l\'oubli numérique...'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-muted-foreground">1.2k {t('views')}</span>
                    <Button variant="outline" size="sm">{t('readMore')}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Decisions */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className={`text-2xl md:text-3xl font-bold ${isRTL ? 'text-right' : ''}`}>{t('recentDecisions')}</h2>
            <Button variant="outline" size="sm" className="text-sm">
              <span className="hidden sm:inline">{t('subscribeToUpdates')}</span>
              <span className="sm:hidden">{t('subscribe')}</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-4 md:p-5">
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {isRTL ? `قرار رقم 2024-${i}23` : `Arrêt n° 2024-${i}23`}
                      </span>
                      <span className="text-xs text-muted-foreground">12 Nov 2024</span>
                    </div>
                    
                    <div>
                      <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Scale className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{isRTL ? 'مجلس الدولة' : 'Conseil d\'État'}</span>
                      </div>
                      <h3 className={`font-semibold text-base leading-tight mb-2 hover:text-primary transition-colors ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'قرار يتعلق بالحق في المعلومات البيئية' : 'Décision relative au droit à l\'information en matière environnementale'}
                      </h3>
                      <p className={`text-sm text-muted-foreground line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'يوضح مجلس الدولة شروط الوصول إلى الوثائق الإدارية المتعلقة بالبيئة...' : 'Le Conseil d\'État précise les conditions d\'accès aux documents administratifs concernant l\'environnement...'}
                      </p>
                    </div>
                    
                    <div className={`flex items-center justify-between pt-2 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{isRTL ? 'البيئة' : 'Environnement'}</span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{isRTL ? 'المعلومات' : 'Information'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs px-3 hover:bg-primary hover:text-primary-foreground">
                          {t('see')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Observatoire;