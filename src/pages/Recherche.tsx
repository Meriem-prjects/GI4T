import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Recherche = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularTags = ["RGPD", "Liberté d'expression", "Droit du travail", "Égalité"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Recherche Avancée</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques 
              pour comprendre et défendre vos droits fondamentaux.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Recherchez des décisions, analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-32 py-4 text-base bg-background text-foreground rounded-lg border transition-all duration-300 hover:shadow-lg focus:shadow-lg placeholder:text-muted-foreground"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 transition-all duration-300 hover:scale-105"
                onClick={handleSearch}
              >
                Rechercher
              </Button>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mb-8">
            <p className="text-sm mb-4 opacity-80 text-center">Recherches populaires :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="bg-background/20 text-primary-foreground hover:bg-background/30 text-sm px-3 py-2 h-auto rounded-full"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger className="bg-background text-foreground h-12">
                <SelectValue placeholder="Toutes juridictions" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">Toutes juridictions</SelectItem>
                <SelectItem value="cedh">CEDH</SelectItem>
                <SelectItem value="conseil-etat">Conseil d'État</SelectItem>
                <SelectItem value="cour-cassation">Cour de cassation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedContentType} onValueChange={setSelectedContentType}>
              <SelectTrigger className="bg-background text-foreground h-12">
                <SelectValue placeholder="Type de contenu" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">Tous contenus</SelectItem>
                <SelectItem value="decisions">Décisions</SelectItem>
                <SelectItem value="fiches">Fiches pratiques</SelectItem>
                <SelectItem value="analyses">Analyses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-background text-foreground h-12">
                <SelectValue placeholder="Toute période" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">Toute période</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Search Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Conseils de Recherche</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Recherche par mots-clés</CardTitle>
                <CardDescription>
                  Utilisez des termes spécifiques pour affiner vos résultats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Exemple : "protection des données personnelles" plutôt que "données"
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Filtres par juridiction</CardTitle>
                <CardDescription>
                  Ciblez vos recherches selon la juridiction compétente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  CEDH pour les droits européens, Conseil d'État pour l'administratif
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Recherche temporelle</CardTitle>
                <CardDescription>
                  Limitez par période pour la jurisprudence récente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Les décisions récentes reflètent l'évolution du droit
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recherche;