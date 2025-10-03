import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Grid3X3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useDocumentSearch } from "@/hooks/useDocumentSearch";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { createDocumentPath } from "@/lib/urlUtils";
import { format } from "date-fns";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtType, setSelectedCourtType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedJurisdictionLevel, setSelectedJurisdictionLevel] = useState("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState<"recent" | "relevance">("recent");
  const [currentPage, setCurrentPage] = useState(1);

  // Get search query from URL params on component mount
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(decodeURIComponent(queryFromUrl));
    }
  }, [searchParams]);

  // Fetch filter options
  const { categories, courtTypes, jurisdictionLevels, documentTypes, isLoading: filtersLoading } = useSearchFilters();

  // Fetch search results
  const { data: searchData, isLoading: searchLoading } = useDocumentSearch({
    query: searchQuery,
    courtType: selectedCourtType !== "all" ? selectedCourtType : undefined,
    dateFrom,
    dateTo,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    jurisdictionLevel: selectedJurisdictionLevel !== "all" ? selectedJurisdictionLevel : undefined,
    documentType: selectedDocumentType !== "all" ? selectedDocumentType : undefined,
    sortBy,
    page: currentPage,
    pageSize: 10,
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
    setSelectedCourtType("all");
    setDateFrom("");
    setDateTo("");
    setSelectedCategories([]);
    setSelectedJurisdictionLevel("all");
    setSelectedDocumentType("all");
    setCurrentPage(1);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters: string[] = [];
    if (selectedCourtType !== "all") {
      const court = courtTypes.find(c => c.id === selectedCourtType);
      if (court) filters.push(court.name);
    }
    if (dateFrom || dateTo) {
      filters.push("Période personnalisée");
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
            placeholder="Recherche intelligente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = `/observatoire/search-results?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="pl-12 pr-32 py-4 text-base bg-background rounded-lg border"
          />
          <Button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
            onClick={() => window.location.href = `/observatoire/search-results?q=${encodeURIComponent(searchQuery)}`}
          >
            Rechercher
          </Button>
        </div>
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
                      <SelectItem key={court.id} value={court.id}>
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
                  <Input 
                    type="date" 
                    className="text-sm" 
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <Input 
                    type="date" 
                    className="text-sm"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
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
                  <span className="text-sm text-muted-foreground">Recherche en cours...</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {totalResults} décision{totalResults !== 1 ? 's' : ''} trouvée{totalResults !== 1 ? 's' : ''}
                  {searchQuery && (
                    <span className="font-medium"> pour "{searchQuery}"</span>
                  )}
                </span>
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
                <Card key={result.id} className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">
                          {result.court || "Tribunal non spécifié"} {result.year && `• ${result.year}`}
                        </span>
                        {result.case_number && (
                          <Badge variant="outline" className="text-xs">
                            N° {result.case_number}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg hover:text-primary">
                        {result.title}
                      </CardTitle>
                      {result.summary && (
                        <CardDescription className="text-sm line-clamp-2">
                          {result.summary}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-2 flex-wrap">
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
                        {result.primaryCategory ? (
                          <Link
                            to={createDocumentPath(result.primaryCategory.name, result.title)}
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