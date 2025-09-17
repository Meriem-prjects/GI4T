import { useState, useEffect } from "react";
import { Search, Filter, Calendar, FileText, Scale, Users, Database, Mic, Briefcase, Heart, Menu, X, Grid3X3, List, ChevronDown } from "lucide-react";
import { useNavigate, Link, Routes, Route, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ObservatoireNav from "@/components/ObservatoireNav";
import Footer from "@/components/Footer";
import TextesFondamentaux from "@/pages/TextesFondamentaux";
import AnalysesOpinions from "@/pages/AnalysesOpinions";
import Actualites from "@/pages/Actualites";

const Observatoire = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedTribunal, setSelectedTribunal] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");

  // Check for search query in URL params
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(decodeURIComponent(queryFromUrl));
      setShowSearchResults(true);
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ q: encodeURIComponent(searchQuery) });
      setShowSearchResults(true);
    }
  };

  const popularTags = ["RGPD", "Liberté d'expression", "Droit du travail", "Égalité"];

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
  
  const thematicCards = [
    {
      title: "Protection des données",
      description: "RGPD, Vie privée, Données personnelles",
      count: "47 décisions",
      icon: Database,
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Liberté d'expression",
      description: "Médias, Presse, Expression publique",
      count: "32 décisions",
      icon: Mic,
      color: "bg-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Droit du travail",
      description: "Emploi, Conditions de travail, Syndicats",
      count: "28 décisions",
      icon: Briefcase,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Égalité & Non-discrimination",
      description: "Égalité, Inclusion, Diversité",
      count: "41 décisions",
      icon: Heart,
      color: "bg-pink-500",
      bgColor: "bg-pink-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 sm:h-12" />
              <div>
                <h1 className="text-base sm:text-2xl font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Surveillance et protection des droits citoyens</p>
              </div>
            </div>
            <div className="flex items-center ml-auto">
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
                <Link to="/acces-aux-droits">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Accès aux Droits</Button>
                </Link>
              </div>
              
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden p-2 absolute right-4 top-3">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 p-4 border-b">
                      <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto" />
                      <h2 className="font-bold text-primary">ODF</h2>
                    </div>
                    <nav className="flex flex-col space-y-2 mt-4 px-4">
                      <Link to="/" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Accueil</Link>
                      <a href="#" className="text-base text-primary p-2 rounded-lg bg-muted font-medium">Observatoire</a>
                      <Link to="/qui-sommes-nous" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Qui sommes-nous</Link>
                      <Link to="/observatoire/analyses-opinions" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Analyses & Opinions</Link>
                      <Link to="/observatoire/actualites" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Actualités</Link>
                      <Link to="/methodologie" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Méthodologie</Link>
                      <div className="border-t pt-4 mt-4">
                        <Link to="/acces-aux-droits" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted flex items-center">
                          <span>→ Accès aux Droits</span>
                        </Link>
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <ObservatoireNav />

      {/* Route Content */}
      <Routes>
        <Route path="textes-fondamentaux" element={<TextesFondamentaux />} />
        <Route path="analyses-opinions" element={<AnalysesOpinions />} />
        <Route path="actualites" element={<Actualites />} />
        <Route path="/" element={
          <>
            {showSearchResults ? (
              /* Search Results Content */
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
                          handleSearch();
                        }
                      }}
                      className="pl-12 pr-32 py-4 text-base bg-background rounded-lg border"
                    />
                    <Button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                      onClick={handleSearch}
                    >
                      Rechercher
                    </Button>
                  </div>
                </div>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {activeFilters.map((filter) => (
                    <Badge 
                      key={filter} 
                      variant="secondary" 
                      className="px-3 py-1"
                    >
                      {filter}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Sidebar - Filters */}
                  <div className="w-full lg:w-80 space-y-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Filter className="w-5 h-5" />
                          Filtres Avancés
                        </CardTitle>
                        <Button variant="outline" size="sm" className="text-primary hover:bg-primary hover:text-primary-foreground">
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
                    <div className="flex items-center justify-between mb-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {searchResults.map((result) => (
                        <Link key={result.id} to={`/decision/${result.id}`} className="block">
                          <Card className="hover:shadow-lg cursor-pointer">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">
                                  {result.court} • {result.date}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${result.importanceColor}`}>
                                  {result.importance}
                                </span>
                              </div>
                              <CardTitle className="text-lg hover:text-primary">
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
                                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
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
            ) : (
              <>
            {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground py-4 sm:py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto opacity-90 px-2 sm:px-4 leading-relaxed">
            Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques 
            pour comprendre et défendre vos droits fondamentaux.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-6 md:mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Recherchez des décisions, analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-16 sm:pr-32 py-4 text-base bg-background text-foreground rounded-lg border transition-all duration-300 hover:shadow-lg focus:shadow-lg placeholder:text-muted-foreground"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-6 py-2 transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mb-6 md:mb-8">
            <p className="text-sm mb-3 md:mb-4 opacity-80">Recherches populaires :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="bg-background/20 text-primary-foreground hover:bg-background/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto rounded-full"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                <SelectValue placeholder="Toutes juridictions" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">Toutes juridictions</SelectItem>
                <SelectItem value="cedh">CEDH</SelectItem>
                <SelectItem value="conseil-etat">Conseil d'État</SelectItem>
                <SelectItem value="cour-cassation">Cour de cassation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedContentType} onValueChange={setSelectedContentType}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                <SelectValue placeholder="Type de contenu" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">Tous contenus</SelectItem>
                <SelectItem value="decisions">Décisions</SelectItem>
                <SelectItem value="fiches">Fiches pratiques</SelectItem>
                <SelectItem value="analyses">Analyses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base sm:col-span-2 md:col-span-1">
                <SelectValue placeholder="Toute période" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">Toute période</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Thematic Exploration */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Explorez par Thématiques</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {thematicCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${card.bgColor} hover:scale-105`}>
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-lg md:text-xl leading-tight">{card.title}</CardTitle>
                    <CardDescription className="text-sm">{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">{card.count}</p>
                    <Button variant="outline" size="sm" className="w-full md:w-auto">Explorer</Button>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Contenus à la Une</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">15 Nov 2024 • CEDH</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Décision</span>
                  </div>
                  <CardTitle className="text-base md:text-lg leading-tight">Arrêt important sur la protection des données</CardTitle>
                  <CardDescription className="text-sm">
                    Analyse de la décision rendue par la CEDH concernant le droit à l'oubli numérique...
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">1.2k vues</span>
                    <Button variant="outline" size="sm">Lire plus</Button>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Décisions Récentes</h2>
            <Button variant="outline" size="sm" className="text-sm">
              <span className="hidden sm:inline">S'abonner aux mises à jour</span>
              <span className="sm:hidden">S'abonner</span>
            </Button>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <span className="text-sm font-medium">Arrêt n° 2024-{i}23</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Conseil d'État</span>
                          <span>• 12 Nov 2024</span>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 text-base md:text-lg leading-tight">
                        Décision relative au droit à l'information en matière environnementale
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Le Conseil d'État précise les conditions d'accès aux documents administratifs...
                      </p>
                    </div>
                    <div className="flex gap-2 lg:ml-4 flex-wrap">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Voir</Button>
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">Sauvegarder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

            {/* Footer */}
            <Footer />
              </>
            )}
          </>
        } />
      </Routes>
    </div>
  );
};

export default Observatoire;