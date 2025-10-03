import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Grid3X3, List, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useDocumentSearch } from "@/hooks/useDocumentSearch";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { createDocumentPath } from "@/lib/urlUtils";
import { format } from "date-fns";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  // Get search query from URL params on component mount
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(decodeURIComponent(queryFromUrl));
    }
  }, [searchParams]);

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
    const matchedFields = [];
    const queryLower = query.toLowerCase();
    
    // Check what fields matched
    if (doc.title?.toLowerCase().includes(queryLower) || doc.title_ar?.includes(query)) {
      matchedFields.push("le titre");
    }
    if (doc.summary?.toLowerCase().includes(queryLower) || doc.summary_ar?.includes(query)) {
      matchedFields.push("le résumé");
    }
    if (doc.keywords?.some((k: string) => k.toLowerCase().includes(queryLower)) || 
        doc.keywords_ar?.some((k: string) => k.includes(query))) {
      matchedFields.push("les mots-clés");
    }
    
    // Generate explanation based on similarity score
    let explanation = "";
    if (similarity >= 0.7) {
      explanation = "Très forte correspondance sémantique";
    } else if (similarity >= 0.5) {
      explanation = "Bonne correspondance sémantique";
    } else if (similarity >= 0.3) {
      explanation = "Correspondance sémantique modérée";
    } else {
      explanation = "Correspondance sémantique faible";
    }
    
    if (matchedFields.length > 0) {
      explanation += ` basée sur ${matchedFields.join(", ")}`;
    }
    
    explanation += ". L'IA a analysé le contexte et le sens de votre requête pour trouver ce document pertinent.";
    
    return explanation;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/observatoire">Observatoire</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Résultats de recherche</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder={useAI ? "Recherche intelligente avec IA... Posez votre question en langage naturel" : "Rechercher des documents..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCurrentPage(1);
              }
            }}
            className="pl-12 pr-32 py-4 text-base bg-background rounded-lg border"
          />
          <Button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
            onClick={() => setCurrentPage(1)}
          >
            Rechercher
          </Button>
        </div>
        
        {/* AI Toggle */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <Label htmlFor="ai-search" className="flex items-center gap-2 cursor-pointer">
            <Sparkles className={`h-4 w-4 ${useAI ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">Recherche intelligente IA</span>
          </Label>
          <Switch
            id="ai-search"
            checked={useAI}
            onCheckedChange={(checked) => {
              setUseAI(checked);
              setCurrentPage(1);
            }}
          />
        </div>

        {useAI && (
          <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Mode IA activé :</strong> Posez vos questions en langage naturel. 
              L'IA comprendra le contexte et trouvera les documents pertinents même sans mots-clés exacts.
            </p>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {activeFilters.map((filter, index) => (
            <Badge 
              key={`${filter}-${index}`} 
              variant="secondary" 
              className="px-3 py-1"
            >
              {filter}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-full lg:w-80 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres Avancés
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tribunal */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Type de Tribunal</Label>
                <Select value={selectedCourtType} onValueChange={(value) => {
                  setSelectedCourtType(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les tribunaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les tribunaux</SelectItem>
                    {courtTypes.map((court) => (
                      <SelectItem key={court.id} value={court.name}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Période */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Période</Label>
                <div className="flex gap-2">
                  <Select 
                    value={yearFrom} 
                    onValueChange={(value) => {
                      setYearFrom(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="De" />
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
                      <SelectValue placeholder="À" />
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
              <div>
                <Label className="text-sm font-medium mb-3 block">Droits Fondamentaux</Label>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={category.id} className="text-sm cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Niveau de Juridiction */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Niveau de Juridiction</Label>
                <Select value={selectedJurisdictionLevel} onValueChange={(value) => {
                  setSelectedJurisdictionLevel(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    {jurisdictionLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type de Document */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Type de Document</Label>
                <RadioGroup value={selectedDocumentType} onValueChange={(value) => {
                  setSelectedDocumentType(value);
                  setCurrentPage(1);
                }}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="doc-all" />
                    <Label htmlFor="doc-all" className="text-sm cursor-pointer">Tous</Label>
                  </div>
                  {documentTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={`doc-${type.id}`} />
                      <Label htmlFor={`doc-${type.id}`} className="text-sm cursor-pointer">
                        {type.name}
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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {searchLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {useAI ? "Analyse IA en cours..." : "Recherche en cours..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {totalResults} décision{totalResults !== 1 ? 's' : ''} trouvée{totalResults !== 1 ? 's' : ''}
                    {searchQuery && (
                      <span className="font-medium"> pour "{searchQuery}"</span>
                    )}
                  </span>
                  {useAI && searchData?.aiPowered && (
                    <Badge variant="default" className="ml-2 gap-1">
                      <Sparkles className="h-3 w-3" />
                      IA
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "recent" | "relevance")}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récentes</SelectItem>
                <SelectItem value="relevance">Pertinence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Results */}
          {searchLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Aucune décision trouvée</p>
              <p className="text-sm text-muted-foreground mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow flex flex-col h-[320px]">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">
                          {result.court || "Tribunal non spécifié"} {result.court_level && `• ${result.court_level}`}
                        </span>
                        <div className="flex items-center gap-2">
                          {useAI && (result as any).similarity && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="default" className="text-xs gap-1 cursor-help">
                                    <Sparkles className="h-3 w-3" />
                                    {Math.round((result as any).similarity * 100)}%
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm">{generateMatchExplanation(result, searchQuery, (result as any).similarity)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {result.year && (
                            <Badge variant="outline" className="text-xs">
                              {result.year}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg hover:text-primary line-clamp-2">
                        {result.title}
                      </CardTitle>
                      {result.summary && (
                        <CardDescription className="text-sm line-clamp-2">
                          {result.summary}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                      <div className="flex gap-2 flex-wrap mb-4">
                        {result.categories.slice(0, 3).map((category) => (
                          <Badge 
                            key={category.id} 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: category.color || undefined,
                              color: category.color || undefined
                            }}
                          >
                            {category.name}
                          </Badge>
                        ))}
                        {result.categories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.categories.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end">
                        {result.primaryCategory ? (
                          <Link
                            to={createDocumentPath(result.primaryCategory.name, result.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                              Consulter
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Consulter
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!searchLoading && searchResults.length > 0 && totalPages > 1 && (
            <div className="flex justify-center gap-2 flex-wrap">
              <Button 
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
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
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;