import { useState, useEffect } from "react";
import { Search, Filter, Calendar, FileText, Scale, Users, Database, Mic, Briefcase, Heart, Menu, X, BookOpen, History, Star, TrendingUp, ChevronRight, Clock, Globe, Bookmark } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Observatoire = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");

  // Mock search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const mockSuggestions = [
        "Protection des données personnelles",
        "Droit à l'oubli numérique",
        "RGPD sanctions",
        "Liberté d'expression médias",
        "Discrimination au travail"
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchSuggestions(mockSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularTags = ["RGPD", "Liberté d'expression", "Droit du travail", "Égalité"];
  
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
      {/* Enhanced Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 sm:h-12" />
              <div>
                <h1 className="text-base sm:text-2xl font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Surveillance et protection des droits citoyens</p>
              </div>
            </div>
            
            {/* Desktop Quick Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>2,847 décisions</span>
              </div>
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Favoris
              </Button>
            </div>

            <div className="flex items-center ml-auto">
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Globe className="h-4 w-4 mr-2" />
                  العربية
                </Button>
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
                      <Link to="/analyses-opinions" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Analyses & Opinions</Link>
                      <Link to="/actualites" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Actualités</Link>
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
        
        {/* Breadcrumb Navigation */}
        <div className="hidden md:block border-t bg-muted/30">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Accueil</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Observatoire des Droits Fondamentaux</span>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Advanced Search */}
      <section className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground py-4 sm:py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto opacity-90 px-2 sm:px-4 leading-relaxed">
            Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques 
            pour comprendre et défendre vos droits fondamentaux.
          </p>
          
          {/* Enhanced Search Bar with Suggestions */}
          <div className="max-w-4xl mx-auto mb-6 md:mb-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" size={20} />
              <Input
                placeholder="Recherchez des décisions, analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-12 pr-16 sm:pr-32 py-4 text-base bg-background text-foreground rounded-lg border transition-all duration-300 hover:shadow-lg focus:shadow-lg placeholder:text-muted-foreground"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-6 py-2 transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
              
              {/* Advanced Filter Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-20 sm:right-36 top-1/2 transform -translate-y-1/2 hidden md:flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-muted cursor-pointer text-left text-foreground border-b last:border-0 transition-colors"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setIsSearchFocused(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Searches for Empty Query */}
            {isSearchFocused && searchQuery === "" && (
              <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50">
                <div className="px-4 py-2 border-b bg-muted">
                  <span className="text-sm font-medium text-muted-foreground">Recherches récentes</span>
                </div>
                {["RGPD", "Droit du travail", "Liberté d'expression"].map((recent, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-muted cursor-pointer text-left text-foreground border-b last:border-0 transition-colors"
                    onClick={() => {
                      setSearchQuery(recent);
                      setIsSearchFocused(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{recent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Tags with Trending Indicator */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <TrendingUp className="h-4 w-4 opacity-80" />
              <p className="text-sm opacity-80">Recherches populaires :</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map((tag, index) => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="bg-background/20 text-primary-foreground hover:bg-background/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto rounded-full transition-all hover:scale-105"
                  onClick={() => setSearchQuery(tag)}
                >
                  {index === 0 && <span className="text-yellow-400 mr-1">🔥</span>}
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Advanced Filters */}
          <div className={`transition-all duration-300 overflow-hidden ${isFiltersExpanded ? 'max-h-96 opacity-100' : 'max-h-20 md:max-h-full opacity-100'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
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
                <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                  <SelectValue placeholder="Toute période" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">Toute période</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="bg-background text-foreground h-10 sm:h-12 border-2 hover:bg-muted transition-all"
                onClick={() => {
                  setSelectedJurisdiction("all");
                  setSelectedContentType("all");
                  setSelectedPeriod("all");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Thematic Exploration with Statistics */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Explorez par Thématiques</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos contenus organisés par domaines juridiques avec des statistiques en temps réel
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {thematicCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={card.title} 
                  className={`group hover:shadow-xl transition-all duration-500 cursor-pointer border-0 ${card.bgColor} hover:scale-105 hover:-translate-y-1 relative overflow-hidden`}
                >
                  {/* Hover Animation Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg md:text-xl leading-tight group-hover:text-primary transition-colors">
                        {card.title}
                      </CardTitle>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <CardDescription className="text-sm mb-3">{card.description}</CardDescription>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{card.count}</span>
                      <span className="text-green-600 text-xs">+{Math.floor(Math.random() * 10)} cette semaine</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 relative z-10">
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Explorer <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">2,847</div>
              <div className="text-sm text-muted-foreground">Décisions analysées</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">156</div>
              <div className="text-sm text-muted-foreground">Guides pratiques</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">89</div>
              <div className="text-sm text-muted-foreground">Analyses d'experts</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Veille juridique</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Content with Tabs */}
      <section className="py-8 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Contenus à la Une</h2>
            <p className="text-muted-foreground">Découvrez les contenus les plus consultés et les dernières analyses</p>
          </div>

          {/* Content Tabs */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-background rounded-lg p-1 border">
              {[
                { id: "recent", label: "Récents", icon: Clock },
                { id: "popular", label: "Populaires", icon: TrendingUp },
                { id: "featured", label: "À la Une", icon: Star }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-background">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>15 Nov 2024</span>
                      <span>•</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">CEDH</span>
                    </div>
                    <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium">
                      Décision
                    </span>
                  </div>
                  <CardTitle className="text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
                    Arrêt important sur la protection des données personnelles
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    Analyse de la décision rendue par la CEDH concernant le droit à l'oubli numérique et ses implications...
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>1.2k vues</span>
                      <span>•</span>
                      <span>5 min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1">
                      Lire plus
                    </Button>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="px-8">
              Voir tous les contenus
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Recent Decisions with Advanced Layout */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Décisions Récentes</h2>
              <p className="text-muted-foreground">Suivez les dernières décisions de justice analysées par nos experts</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="text-sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm" className="text-sm">
                <span className="hidden sm:inline">S'abonner aux mises à jour</span>
                <span className="sm:hidden">S'abonner</span>
              </Button>
            </div>
          </div>
          
          {/* Enhanced Decision Cards */}
          <div className="space-y-3 md:space-y-4">
            {[
              { 
                id: "2024-123", 
                court: "Conseil d'État", 
                date: "12 Nov 2024",
                title: "Décision relative au droit à l'information en matière environnementale",
                summary: "Le Conseil d'État précise les conditions d'accès aux documents administratifs en matière d'environnement et établit de nouveaux critères...",
                category: "Environnement",
                importance: "high"
              },
              { 
                id: "2024-124", 
                court: "CEDH", 
                date: "10 Nov 2024",
                title: "Arrêt sur la liberté d'expression des journalistes",
                summary: "La Cour européenne des droits de l'homme renforce la protection des sources journalistiques dans un contexte numérique...",
                category: "Liberté d'expression",
                importance: "medium"
              },
              { 
                id: "2024-125", 
                court: "Cour de cassation", 
                date: "8 Nov 2024",
                title: "Jurisprudence en matière de protection des données au travail",
                summary: "Nouvelle interprétation des règles RGPD dans le contexte du télétravail et de la surveillance des employés...",
                category: "Protection des données",
                importance: "high"
              },
              { 
                id: "2024-126", 
                court: "Tribunal administratif", 
                date: "5 Nov 2024",
                title: "Décision sur l'égalité de traitement dans l'accès aux services publics",
                summary: "Le tribunal établit de nouveaux principes pour garantir l'égalité d'accès aux services publics numériques...",
                category: "Égalité",
                importance: "low"
              }
            ].map((decision, i) => (
              <Card key={decision.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 hover:border-l-primary">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">Arrêt n° {decision.id}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            decision.importance === 'high' ? 'bg-red-100 text-red-700' :
                            decision.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {decision.importance === 'high' ? 'Important' : 
                             decision.importance === 'medium' ? 'Modéré' : 'Standard'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Scale className="h-4 w-4" />
                          <span className="font-medium">{decision.court}</span>
                          <span>•</span>
                          <Calendar className="h-4 w-4" />
                          <span>{decision.date}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold mb-2 text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
                        {decision.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {decision.summary}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {decision.category}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 500 + 100)} vues
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 10 + 3)} min read
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 lg:ml-6 flex-wrap lg:flex-col">
                      <Button variant="default" size="sm" className="flex-1 lg:flex-none">
                        <FileText className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Section */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="px-8">
              Charger plus de décisions
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-base md:text-lg">Institutionnel</h3>
              <div className="space-y-3 text-sm">
                <a href="#" className="block hover:text-primary transition-colors py-1">À propos</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Mission</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Équipe</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-base md:text-lg">Contenus</h3>
              <div className="space-y-3 text-sm">
                <a href="#" className="block hover:text-primary transition-colors py-1">Décisions de justice</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Fiches pratiques</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Analyses juridiques</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Thématiques</a>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-4 text-base md:text-lg">Informations légales</h3>
              <div className="space-y-3 text-sm">
                <a href="#" className="block hover:text-primary transition-colors py-1">Mentions légales</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Politique de confidentialité</a>
                <a href="#" className="block hover:text-primary transition-colors py-1">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-6 md:mt-8 pt-6 md:pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Observatoire des Droits Fondamentaux. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Observatoire;