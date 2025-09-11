import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown, Grid3X3, List, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTribunal, setSelectedTribunal] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");

  // Get search query from URL params on component mount
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(decodeURIComponent(queryFromUrl));
    } else {
      setSearchQuery("décisions récentes sur la vie privée des 6 derniers mois");
    }
  }, [searchParams]);

  const activeFilters = ["Décisions majeures", "Constitutionnelles", "Récentes", "Vie privée", "Liberté d'expression"];

  const searchResults = [
    {
      id: 1,
      number: "2024/147",
      title: "Protection des données personnelles",
      court: "Cour Suprême",
      date: "15 janvier 2024",
      description: "Cette décision établit les principes fondamentaux du traitement des données personnelles démocratiques",
      tags: ["Vie privée", "RGPD"],
      importance: "Majeure",
      importanceColor: "bg-red-100 text-red-800"
    },
    {
      id: 2,
      number: "2024/089",
      title: "Liberté d'expression en ligne",
      court: "Cour d'Appel",
      date: "12 janvier 2024",
      description: "Analyse des limites de la liberté d'expression sur les plateformes numériques et les responsabilités des hébergeurs...",
      tags: ["Expression", "Numérique"],
      importance: "Important",
      importanceColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 3,
      number: "2024/134",
      title: "Égalité devant la justice",
      court: "Tribunal Administratif",
      date: "10 janvier 2024",
      description: "Principe d'égalité dans l'accès à la justice et les préalables pour tous les justiciables",
      tags: ["Égalité", "Procédure"],
      importance: "Standard",
      importanceColor: "bg-green-100 text-green-800"
    },
    {
      id: 4,
      number: "2024/012",
      title: "Droits des minorités",
      court: "Cour Constitutionnelle",
      date: "08 janvier 2024",
      description: "Protection constitutionnelle des droits des minorités et mesures de discrimination",
      tags: ["Minorités", "Constitution"],
      importance: "Consultatif",
      importanceColor: "bg-blue-100 text-blue-800"
    }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto" />
              <h1 className="text-lg md:text-xl font-bold text-primary hidden sm:block">Observatoire des Droits Fondamentaux</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-sm hover:text-primary transition-colors">Accueil</Link>
                <Link to="/observatoire" className="text-sm hover:text-primary transition-colors">Observatoire</Link>
                <a href="#" className="text-sm text-primary font-medium">Recherche</a>
                <a href="#" className="text-sm hover:text-primary transition-colors">Fiches pratiques</a>
                <a href="#" className="text-sm hover:text-primary transition-colors">Thématiques</a>
              </nav>
              
              {/* Language Switcher */}
              <div className="flex items-center bg-muted rounded-full p-1">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-1 text-sm font-medium">
                  FR
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-transparent rounded-full px-4 py-1 text-sm">
                  AR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6 animate-slide-in-right">
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
        <div className="max-w-4xl mx-auto mb-6 animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Recherche intelligente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/search-results?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="pl-12 pr-32 py-4 text-base bg-background rounded-lg border transition-all duration-300 hover:shadow-lg focus:shadow-lg"
            />
            <Button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = `/search-results?q=${encodeURIComponent(searchQuery)}`}
            >
              Rechercher
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center animate-fade-in" style={{animationDelay: '200ms'}}>
          {activeFilters.map((filter, index) => (
            <Badge 
              key={filter} 
              variant="secondary" 
              className="px-3 py-1 animate-fade-in" 
              style={{animationDelay: `${300 + index * 50}ms`}}
            >
              {filter}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-80 space-y-6 animate-slide-in-right">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres Avancés
                </CardTitle>
                <Button variant="outline" size="sm" className="text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  Réinitialiser
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tribunal */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tribunal</Label>
                  <Select value={selectedTribunal} onValueChange={setSelectedTribunal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les tribunaux" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les tribunaux</SelectItem>
                      <SelectItem value="supreme">Cour Suprême</SelectItem>
                      <SelectItem value="appel">Cour d'Appel</SelectItem>
                      <SelectItem value="administratif">Tribunal Administratif</SelectItem>
                      <SelectItem value="constitutionnelle">Cour Constitutionnelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Période */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Période</Label>
                  <div className="flex gap-2">
                    <Input type="date" className="text-sm" />
                    <Input type="date" className="text-sm" />
                  </div>
                </div>

                {/* Droits Fondamentaux */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Droits Fondamentaux</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy" />
                      <Label htmlFor="privacy" className="text-sm">Droit à la vie privée (45)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="expression" />
                      <Label htmlFor="expression" className="text-sm">Liberté d'expression (32)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="equality" />
                      <Label htmlFor="equality" className="text-sm">Égalité et non-discrimination (28)</Label>
                    </div>
                  </div>
                </div>

                {/* Type de Décision */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Type de Décision</Label>
                  <RadioGroup defaultValue="all">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="text-sm">Tous</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="arrets" id="arrets" />
                      <Label htmlFor="arrets" className="text-sm">Arrêts (89)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ordonnances" id="ordonnances" />
                      <Label htmlFor="ordonnances" className="text-sm">Ordonnances (67)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="avis" id="avis" />
                      <Label htmlFor="avis" className="text-sm">Avis consultatifs (23)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button className="w-full">
                  Appliquer les filtres
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 animate-fade-in" style={{animationDelay: '400ms'}}>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  1,247 décisions trouvées 
                  {searchQuery && (
                    <span className="font-medium"> pour "{searchQuery}"</span>
                  )}
                </span>
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
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récentes</SelectItem>
                  <SelectItem value="relevance">Pertinence</SelectItem>
                  <SelectItem value="court">Tribunal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
              {searchResults.map((result, index) => (
                <Link key={result.id} to={`/decision/${result.id}`} className="block">
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105" style={{animationDelay: `${index * 100}ms`}}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {result.court} • {result.date}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${result.importanceColor}`}>
                          {result.importance}
                        </span>
                      </div>
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        Arrêt n° {result.number} - {result.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {result.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                          Consulter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2">
              <Button variant="outline">Précédent</Button>
              <Button className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Suivant</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto mb-4" />
              <h3 className="font-semibold mb-2">Observatoire des Droits Fondamentaux</h3>
              <p className="text-sm text-muted-foreground">
                Facilitant l'accès à la justice et aux droits fondamentaux pour tous
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Institutionnel</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">À propos</a>
                <a href="#" className="block hover:text-primary transition-colors">Mission</a>
                <a href="#" className="block hover:text-primary transition-colors">Équipe</a>
                <a href="#" className="block hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contenus</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Décisions de justice</a>
                <a href="#" className="block hover:text-primary transition-colors">Fiches pratiques</a>
                <a href="#" className="block hover:text-primary transition-colors">Analyses juridiques</a>
                <a href="#" className="block hover:text-primary transition-colors">Thématiques</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informations légales</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Mentions légales</a>
                <a href="#" className="block hover:text-primary transition-colors">Politique de confidentialité</a>
                <a href="#" className="block hover:text-primary transition-colors">Cookies</a>
                <a href="#" className="block hover:text-primary transition-colors">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Observatoire des Droits Fondamentaux. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchResults;