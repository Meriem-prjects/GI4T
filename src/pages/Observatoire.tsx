import { useState } from "react";
import { Search, Filter, Calendar, FileText, Scale, Users, Database, Mic, Briefcase, Heart, Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Footer from "@/components/Footer";

const Observatoire = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Header removed - now using ObservatoireLayout */}

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
    </div>
  );
};

export default Observatoire;