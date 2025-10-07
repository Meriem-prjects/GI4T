import { useState } from "react";
import { Database, Mic, Briefcase, Heart, Scale } from "lucide-react";
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

const Observatoire = () => {
  const navigate = useNavigate();
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
    <>
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground py-4 sm:py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto opacity-90 px-2 sm:px-4 leading-relaxed">
            Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques 
            pour comprendre et défendre vos droits fondamentaux.
          </p>
          
          {/* Search Bar with Autocomplete */}
          <div className="max-w-4xl mx-auto mb-6 md:mb-8">
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Recherchez des décisions, analyses..."
              language="fr"
            />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
            {/* Categories Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Court Types Filter */}
            <Select value={selectedCourtType} onValueChange={setSelectedCourtType}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                <SelectValue placeholder="Tous tribunaux" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">Tous tribunaux</SelectItem>
                {courtTypes?.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Document Types Filter */}
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                <SelectValue placeholder="Tous types" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">Tous types</SelectItem>
                {documentTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-background text-foreground h-10 sm:h-12 text-sm md:text-base">
                <SelectValue placeholder="Toute période" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
                <SelectItem value="all">Toute période</SelectItem>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-4 md:p-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Arrêt n° 2024-{i}23
                      </span>
                      <span className="text-xs text-muted-foreground">12 Nov 2024</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Conseil d'État</span>
                      </div>
                      <h3 className="font-semibold text-base leading-tight mb-2 hover:text-primary transition-colors">
                        Décision relative au droit à l'information en matière environnementale
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Le Conseil d'État précise les conditions d'accès aux documents administratifs concernant l'environnement...
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex gap-1">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Environnement</span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Information</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs px-3 hover:bg-primary hover:text-primary-foreground">
                          Voir
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
    </>
  );
};

export default Observatoire;