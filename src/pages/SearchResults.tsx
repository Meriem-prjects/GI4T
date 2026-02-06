import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Grid3X3, List, Loader2, Sparkles, ChevronDown, ChevronUp, Calendar, Scale, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { useDocumentSearch } from "@/hooks/useDocumentSearch";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { createDocumentPath } from "@/lib/urlUtils";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  
  // Fetch filter options first to get year range
  const { categories, courtTypes, jurisdictionLevels, documentTypes, yearRange, isLoading: filtersLoading } = useSearchFilters();

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtType, setSelectedCourtType] = useState("all");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedJurisdictionLevel, setSelectedJurisdictionLevel] = useState("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState<"recent" | "relevance">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [useAI, setUseAI] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [courtTypeOpen, setCourtTypeOpen] = useState(false);
  const [jurisdictionOpen, setJurisdictionOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Get search query from URL params on component mount
  useEffect(() => {
    const queryFromUrl = searchParams.get('query') || searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(decodeURIComponent(queryFromUrl));
    }
  }, [searchParams]);

  // Detect when main search bar is out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickySearch(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (searchBarRef.current) {
      observer.observe(searchBarRef.current);
    }

    return () => {
      if (searchBarRef.current) {
        observer.unobserve(searchBarRef.current);
      }
    };
  }, []);

  // Set default year range when yearRange is loaded
  useEffect(() => {
    if (yearRange && !yearFrom && !yearTo) {
      setYearFrom(yearRange.minYear.toString());
      setYearTo(yearRange.maxYear.toString());
    }
  }, [yearRange]);

  // Fetch search results
  const { data: searchData, isLoading: searchLoading } = useDocumentSearch({
    query: searchQuery,
    courtType: selectedCourtType !== "all" ? selectedCourtType : undefined,
    yearFrom,
    yearTo,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    jurisdictionLevel: selectedJurisdictionLevel !== "all" ? selectedJurisdictionLevel : undefined,
    documentType: selectedDocumentType !== "all" ? selectedDocumentType : undefined,
    sortBy,
    page: currentPage,
    pageSize: 10,
    useAI,
  });

  const searchResults = searchData?.results || [];
  const totalResults = searchData?.total || 0;
  const totalPages = searchData?.totalPages || 1;

  // Handle category checkbox toggle
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCourtType("all");
    setYearFrom("");
    setYearTo("");
    setSelectedCategories([]);
    setSelectedJurisdictionLevel("all");
    setSelectedDocumentType("all");
    setCurrentPage(1);
  };

  // Toggle summary expansion
  const toggleSummary = (docId: string) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCourtType !== "all") count++;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedJurisdictionLevel !== "all") count++;
    if (selectedDocumentType !== "all") count++;
    return count;
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters: string[] = [];
    if (selectedCourtType !== "all") {
      filters.push(selectedCourtType);
    }
    if (yearFrom || yearTo) {
      const yearText = yearFrom && yearTo ? `${yearFrom} - ${yearTo}` : yearFrom ? `À partir de ${yearFrom}` : `Jusqu'à ${yearTo}`;
      filters.push(yearText);
    }
    selectedCategories.forEach(catId => {
      const category = categories.find(c => c.id === catId);
      if (category) filters.push(category.name);
    });
    if (selectedJurisdictionLevel !== "all") {
      const level = jurisdictionLevels.find(l => l.id === selectedJurisdictionLevel);
      if (level) filters.push(level.name);
    }
    if (selectedDocumentType !== "all") {
      const type = documentTypes.find(t => t.id === selectedDocumentType);
      if (type) filters.push(type.name);
    }
    return filters;
  };

  const generateMatchExplanation = (doc: any, query: string, similarity: number) => {
    const queryLower = query.toLowerCase();
    const matchedElements: string[] = [];
    const scorePercent = Math.round(similarity * 100);
    
    // Analyze what matched in the document
    if (doc.title?.toLowerCase().includes(queryLower) || doc.title_ar?.includes(query)) {
      matchedElements.push(`le titre "${doc.title?.substring(0, 60)}..."`);
    }
    
    if (doc.summary?.toLowerCase().includes(queryLower) || doc.summary_ar?.includes(query)) {
      matchedElements.push("le résumé du document");
    }
    
    if (doc.keywords?.some((k: string) => k.toLowerCase().includes(queryLower)) || 
        doc.keywords_ar?.some((k: string) => k.includes(query))) {
      const matchingKeywords = doc.keywords?.filter((k: string) => 
        k.toLowerCase().includes(queryLower)
      ).slice(0, 2).join(", ");
      if (matchingKeywords) {
        matchedElements.push(`les mots-clés (${matchingKeywords})`);
      }
    }
    
    if (doc.categories?.length > 0) {
      const categoryNames = doc.categories.slice(0, 2).map((c: any) => c.name).join(", ");
      matchedElements.push(`les catégories (${categoryNames})`);
    }
    
    // Build contextual explanation
    let explanation = `Score de ${scorePercent}% : `;
    
    if (similarity >= 0.7) {
      explanation += `Excellente correspondance. L'IA a détecté une forte pertinence sémantique entre votre recherche "${query}" et ce document`;
    } else if (similarity >= 0.5) {
      explanation += `Bonne correspondance. Votre recherche "${query}" est bien liée à ce document`;
    } else if (similarity >= 0.3) {
      explanation += `Correspondance modérée. Votre recherche "${query}" partage des concepts avec ce document`;
    } else {
      explanation += `Correspondance partielle. Certains éléments de votre recherche "${query}" correspondent à ce document`;
    }
    
    if (matchedElements.length > 0) {
      explanation += `, notamment dans ${matchedElements.join(", ")}.`;
    } else {
      explanation += ` à travers l'analyse sémantique du contenu complet.`;
    }
    
    // Add context about the score
    if (similarity >= 0.7) {
      explanation += ` Ce score élevé indique que le document traite directement de votre sujet.`;
    } else if (similarity >= 0.5) {
      explanation += ` Ce score indique une pertinence solide pour votre recherche.`;
    } else if (similarity >= 0.3) {
      explanation += ` Ce score suggère une pertinence partielle qui peut nécessiter une vérification.`;
    }
    
    return explanation;
  };

  const activeFilters = getActiveFilters();
  const activeFilterCount = getActiveFilterCount();

  // Get score color based on similarity
  const getScoreColor = (similarity: number) => {
    if (similarity >= 0.7) return "text-emerald-600";
    if (similarity >= 0.5) return "text-blue-600";
    if (similarity >= 0.3) return "text-amber-600";
    return "text-muted-foreground";
  };

  const getScoreBgColor = (similarity: number) => {
    if (similarity >= 0.7) return "bg-emerald-100";
    if (similarity >= 0.5) return "bg-blue-100";
    if (similarity >= 0.3) return "bg-amber-100";
    return "bg-muted";
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${isRTL ? 'font-almarai' : ''}`}>
      {/* Hero Search Section */}
      <div ref={searchBarRef} className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-b">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList className={isRTL ? 'flex-row-reverse' : ''}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-muted-foreground hover:text-foreground">{t('home')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/observatoire" className="text-muted-foreground hover:text-foreground">{t('observatory')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{t('searchResults')}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-14 bg-primary/10 rounded-l-xl flex items-center justify-center`}>
                <Search className="text-primary" size={22} />
              </div>
              <Input
                placeholder={useAI ? t('aiSearchPlaceholder') : t('searchDocumentsPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                  }
                }}
                className={`${isRTL ? 'pr-16 pl-32' : 'pl-16 pr-32'} py-6 text-base bg-background rounded-xl border-2 border-transparent focus:border-primary/30 shadow-lg transition-all duration-300 group-hover:shadow-xl`}
              />
              <Button 
                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
                onClick={() => setCurrentPage(1)}
              >
                {t('search')}
              </Button>
            </div>
            
            {/* AI Toggle - Enhanced with Tooltip */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div 
                      className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                        useAI 
                          ? 'bg-primary/10 border-2 border-primary/30' 
                          : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                      }`}
                      onClick={() => {
                        setUseAI(!useAI);
                        setCurrentPage(1);
                      }}
                    >
                      <div className={`p-1.5 rounded-full transition-all duration-300 ${useAI ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'}`}>
                        <Sparkles className={`h-4 w-4 transition-all duration-300 ${useAI ? 'animate-pulse' : ''}`} />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${useAI ? 'text-primary' : 'text-muted-foreground'}`}>
                        {t('intelligentSearchAI')}
                      </span>
                      <Switch
                        checked={useAI}
                        onCheckedChange={(checked) => {
                          setUseAI(checked);
                          setCurrentPage(1);
                        }}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-popover border shadow-lg">
                    <p className="text-sm text-popover-foreground">
                      💡 {t('aiModeDescription')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Year Range Badge */}
          {yearRange && (
            <div className="flex justify-center mt-6">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-background/80 backdrop-blur-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {yearFrom || yearRange.minYear} - {yearTo || yearRange.maxYear}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-80 space-y-4">
            <Card className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-thin shadow-lg border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Filter className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('advancedFilters')}</CardTitle>
                      {activeFilterCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activeFilterCount} {activeFilterCount === 1 ? 'filtre actif' : 'filtres actifs'}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:bg-primary/10 gap-2"
                    onClick={resetFilters}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('reset')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Sticky Search Bar */}
                {showStickySearch && (
                  <div className="pb-4 border-b">
                    <Label className="text-sm font-medium mb-2 block">{t('search')}</Label>
                    <div className="relative">
                      <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`} size={16} />
                      <Input
                        placeholder={t('searchDocumentsPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentPage(1);
                          }
                        }}
                        className={`${isRTL ? 'pr-9' : 'pl-9'} text-sm`}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        id="ai-search-sticky"
                        checked={useAI}
                        onCheckedChange={(checked) => {
                          setUseAI(checked);
                          setCurrentPage(1);
                        }}
                        className="scale-75"
                      />
                      <Label htmlFor="ai-search-sticky" className="text-xs cursor-pointer flex items-center gap-1">
                        <Sparkles className={`h-3 w-3 ${useAI ? 'text-primary' : 'text-muted-foreground'}`} />
                        IA
                      </Label>
                    </div>
                  </div>
                )}

                {/* Tribunal */}
                <Collapsible open={courtTypeOpen} onOpenChange={setCourtTypeOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-3 rounded-lg transition-colors border border-transparent hover:border-muted">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium cursor-pointer">{t('courtType')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCourtType !== "all" && (
                        <Badge variant="secondary" className="text-xs">1</Badge>
                      )}
                      {courtTypeOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 pl-6">
                    <RadioGroup value={selectedCourtType} onValueChange={(value) => {
                      setSelectedCourtType(value);
                      setCurrentPage(1);
                    }}>
                      <div className={`space-y-2 max-h-48 overflow-y-auto scrollbar-thin ${isRTL ? 'space-x-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                          <RadioGroupItem value="all" id="court-all" />
                          <Label htmlFor="court-all" className="text-sm cursor-pointer">{t('allCourts')}</Label>
                        </div>
                        {courtTypes.map((court) => (
                          <div key={court.id} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            <RadioGroupItem value={court.name} id={`court-${court.id}`} />
                            <Label htmlFor={`court-${court.id}`} className="text-sm cursor-pointer">
                              {language === 'ar' ? court.name_ar || court.name : court.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CollapsibleContent>
                </Collapsible>

                {/* Période */}
                <div className="p-3 rounded-lg border border-transparent hover:border-muted transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">{t('period')}</Label>
                  </div>
                  <div className="flex gap-2 pl-6">
                    <Select 
                      value={yearFrom} 
                      onValueChange={(value) => {
                        setYearFrom(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder={t('from')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: yearRange.maxYear - yearRange.minYear + 1 },
                          (_, i) => yearRange.minYear + i
                        ).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={yearTo} 
                      onValueChange={(value) => {
                        setYearTo(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder={t('to')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: yearRange.maxYear - yearRange.minYear + 1 },
                          (_, i) => yearRange.minYear + i
                        ).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Droits Fondamentaux */}
                <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-3 rounded-lg transition-colors border border-transparent hover:border-muted">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium cursor-pointer">{t('fundamentalRights')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="text-xs">{selectedCategories.length}</Badge>
                      )}
                      {categoriesOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 pl-6">
                    <div className={`space-y-2 max-h-48 overflow-y-auto scrollbar-thin ${isRTL ? 'space-x-reverse' : ''}`}>
                      {categories.map((category) => (
                        <div key={category.id} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                          <Checkbox 
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Label htmlFor={category.id} className="text-sm cursor-pointer">
                            {language === 'ar' ? category.name_ar || category.name : category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Niveau de Juridiction */}
                <Collapsible open={jurisdictionOpen} onOpenChange={setJurisdictionOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 p-3 rounded-lg transition-colors border border-transparent hover:border-muted">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium cursor-pointer">{t('jurisdictionLevel')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedJurisdictionLevel !== "all" && (
                        <Badge variant="secondary" className="text-xs">1</Badge>
                      )}
                      {jurisdictionOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 pl-6">
                    <RadioGroup value={selectedJurisdictionLevel} onValueChange={(value) => {
                      setSelectedJurisdictionLevel(value);
                      setCurrentPage(1);
                    }}>
                      <div className={`space-y-2 max-h-48 overflow-y-auto scrollbar-thin ${isRTL ? 'space-x-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                          <RadioGroupItem value="all" id="jurisdiction-all" />
                          <Label htmlFor="jurisdiction-all" className="text-sm cursor-pointer">{t('allLevels')}</Label>
                        </div>
                        {jurisdictionLevels.map((level) => (
                          <div key={level.id} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            <RadioGroupItem value={level.id} id={`jurisdiction-${level.id}`} />
                            <Label htmlFor={`jurisdiction-${level.id}`} className="text-sm cursor-pointer">
                              {language === 'ar' ? level.name_ar || level.name : level.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CollapsibleContent>
                </Collapsible>

                {/* Type de Document */}
                <div className="p-3 rounded-lg border border-transparent hover:border-muted transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">{t('documentType')}</Label>
                    {selectedDocumentType !== "all" && (
                      <Badge variant="secondary" className="text-xs ml-auto">1</Badge>
                    )}
                  </div>
                  <RadioGroup 
                    value={selectedDocumentType} 
                    onValueChange={(value) => {
                      setSelectedDocumentType(value);
                      setCurrentPage(1);
                    }}
                    className="pl-6"
                  >
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <RadioGroupItem value="all" id="doc-all" />
                      <Label htmlFor="doc-all" className="text-sm cursor-pointer">{t('all')}</Label>
                    </div>
                    {documentTypes.map((type) => (
                      <div key={type.id} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <RadioGroupItem value={type.id} id={`doc-${type.id}`} />
                        <Label htmlFor={`doc-${type.id}`} className="text-sm cursor-pointer">
                          {language === 'ar' ? type.name_ar || type.name : type.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-4">
                {searchLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      {useAI ? t('aiSearchInProgress') : t('searchInProgress')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{totalResults}</span>
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? (
                          <>
                            {totalResults === 1 ? t('decisionSingular') : t('decisionPlural')} {t('foundPlural')}
                          </>
                        ) : (
                          <>
                            {t(totalResults === 1 ? 'decisionSingular' : 'decisionPlural')} {t(totalResults === 1 ? 'foundSingular' : 'foundPlural')}
                          </>
                        )}
                      </span>
                    </div>
                    {useAI && searchData?.aiPowered && (
                      <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-background rounded-lg p-1 border">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "recent" | "relevance")}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">{t('recent')}</SelectItem>
                    <SelectItem value="relevance">{t('relevance')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeFilters.map((filter, index) => (
                  <Badge 
                    key={`${filter}-${index}`} 
                    variant="outline" 
                    className="px-3 py-1 bg-primary/5 border-primary/20 text-primary"
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            )}

            {/* Search Results */}
            {searchLoading ? (
              <div className="flex flex-col justify-center items-center py-16 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground">{useAI ? t('aiSearchInProgress') : t('searchInProgress')}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 bg-muted/20 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">{t('noResultsFound')}</p>
                <p className="text-sm text-muted-foreground">{t('tryDifferentFilters')}</p>
              </div>
            ) : (
              <TooltipProvider>
                <div className={`grid gap-4 mb-8 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                  {searchResults.map((result, index) => {
                    const similarity = (result as any).similarity;
                    const primaryColor = result.categories[0]?.color || '#3b82f6';
                    
                    return (
                      <Card 
                        key={result.id} 
                        className="group hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden animate-fade-in border-0 shadow-md"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          borderLeft: `4px solid ${primaryColor}`
                        }}
                      >
                        <CardHeader className="pb-3 space-y-3">
                          {/* Top Row: Court + Year */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Scale className="w-4 h-4 shrink-0" />
                              <span className="line-clamp-1">
                                {result.court || t('tribunalNotSpecified')} 
                                {result.court_level && <span className="text-muted-foreground/60"> • {result.court_level}</span>}
                              </span>
                            </div>
                            {result.year && (
                              <Badge variant="secondary" className="text-xs shrink-0 font-semibold">
                                {result.year}
                              </Badge>
                            )}
                          </div>

                          {/* AI Score - Enhanced */}
                          {useAI && similarity && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <div className={`flex items-center gap-3 p-2 rounded-lg cursor-help ${getScoreBgColor(similarity)}`}>
                                  <div className="flex items-center gap-2">
                                    <Sparkles className={`h-4 w-4 ${getScoreColor(similarity)}`} />
                                    <span className={`text-sm font-semibold ${getScoreColor(similarity)}`}>
                                      {Math.round(similarity * 100)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={similarity * 100} 
                                    className="flex-1 h-2" 
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm p-4 bg-popover">
                                <p className="text-sm leading-relaxed text-popover-foreground">
                                  {generateMatchExplanation(result, searchQuery, similarity)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Title */}
                          {result.primaryCategory ? (
                            <Link
                              to={createDocumentPath(result.primaryCategory.name, result.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <CardTitle className={`text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 ${language === 'ar' ? 'arabic-text font-arabic' : ''}`}>
                                {language === 'ar' ? result.title_ar || result.title : result.title}
                              </CardTitle>
                            </Link>
                          ) : (
                            <CardTitle className={`text-lg leading-snug line-clamp-2 ${language === 'ar' ? 'arabic-text font-arabic' : ''}`}>
                              {language === 'ar' ? result.title_ar || result.title : result.title}
                            </CardTitle>
                          )}
                        </CardHeader>

                        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                          {/* Summary */}
                          {result.summary && (
                            <div className="mb-4">
                              <p className={`text-sm text-muted-foreground leading-relaxed ${
                                expandedSummaries.has(result.id) ? '' : 'line-clamp-2'
                              } ${language === 'ar' ? 'arabic-text font-arabic text-right' : ''}`}>
                                {language === 'ar' ? result.summary_ar || result.summary : result.summary}
                              </p>
                              {(result.summary?.length > 150 || result.summary_ar?.length > 150) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSummary(result.id)}
                                  className={`mt-1 h-auto py-1 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 ${isRTL ? 'flex-row-reverse' : ''}`}
                                >
                                  {expandedSummaries.has(result.id) ? (
                                    <>
                                      {t('seeLess')} <ChevronUp className={`${isRTL ? 'mr-1' : 'ml-1'} h-3 w-3`} />
                                    </>
                                  ) : (
                                    <>
                                      {t('seeMore')} <ChevronDown className={`${isRTL ? 'mr-1' : 'ml-1'} h-3 w-3`} />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Categories & Action */}
                          <div className="space-y-3">
                            <div className={`flex gap-2 flex-wrap ${isRTL ? 'justify-end' : ''}`}>
                              {result.categories.slice(0, 2).map((category) => (
                                <Badge 
                                  key={category.id} 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: category.color || undefined,
                                    color: category.color || undefined,
                                    backgroundColor: category.color ? `${category.color}10` : undefined
                                  }}
                                >
                                  {language === 'ar' ? category.name_ar || category.name : category.name}
                                </Badge>
                              ))}
                              {result.categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{result.categories.length - 2}
                                </Badge>
                              )}
                            </div>

                            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                              {result.primaryCategory ? (
                                <Link
                                  to={createDocumentPath(result.primaryCategory.name, result.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button 
                                    size="sm" 
                                    className="gap-2 shadow-md hover:shadow-lg transition-all"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    {t('consult')}
                                  </Button>
                                </Link>
                              ) : (
                                <Button variant="outline" size="sm" disabled>
                                  {t('consult')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TooltipProvider>
            )}

            {/* Pagination */}
            {!searchLoading && searchResults.length > 0 && totalPages > 1 && (
              <div className={`flex justify-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="shadow-sm"
                >
                  {t('previous')}
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="shadow-sm"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="shadow-sm"
                >
                  {t('next')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;