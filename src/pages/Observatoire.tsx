import { useState } from "react";
import { Search, Filter, Calendar, FileText, Scale, Users, Database, Mic, Briefcase, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Observatoire = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");

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
    <div className="min-h-screen bg-background max-w-7xl mx-auto">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/518e38e3-af2e-497e-84a3-e8944dcf10f5.png" alt="ODF Logo" className="h-8 w-auto" />
                <h1 className="text-xl font-bold text-primary">Observatoire des Droits Fondamentaux</h1>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-sm hover:text-primary">Accueil</a>
                <a href="#" className="text-sm text-primary">Observatoire</a>
                <a href="#" className="text-sm hover:text-primary">Décisions</a>
                <a href="#" className="text-sm hover:text-primary">Fiches pratiques</a>
                <a href="#" className="text-sm hover:text-primary">Thématiques</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">FR</Button>
                <Button variant="ghost" size="sm">AR</Button>
              </div>
              <Button size="sm">Se connecter</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explorez vos Droits Fondamentaux
          </h1>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques 
            pour comprendre et défendre vos droits fondamentaux.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Recherchez des décisions, analyses, guides pratiques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-background text-foreground"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Rechercher
              </Button>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mb-8">
            <p className="text-sm mb-4 opacity-80">Recherches populaires :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="bg-background/20 text-primary-foreground hover:bg-background/30"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Toutes juridictions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes juridictions</SelectItem>
                <SelectItem value="cedh">CEDH</SelectItem>
                <SelectItem value="conseil-etat">Conseil d'État</SelectItem>
                <SelectItem value="cour-cassation">Cour de cassation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedContentType} onValueChange={setSelectedContentType}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Type de contenu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous contenus</SelectItem>
                <SelectItem value="decisions">Décisions</SelectItem>
                <SelectItem value="fiches">Fiches pratiques</SelectItem>
                <SelectItem value="analyses">Analyses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Toute période" />
              </SelectTrigger>
              <SelectContent>
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Explorez par Thématiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {thematicCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className={`hover:shadow-lg transition-shadow cursor-pointer ${card.bgColor}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{card.count}</p>
                    <Button variant="outline" size="sm">Explorer</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contenus à la Une</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">15 Nov 2024 • CEDH</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Décision</span>
                  </div>
                  <CardTitle className="text-lg">Arrêt important sur la protection des données</CardTitle>
                  <CardDescription>
                    Analyse de la décision rendue par la CEDH concernant le droit à l'oubli numérique...
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Décisions Récentes</h2>
            <Button variant="outline">S'abonner aux mises à jour</Button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-medium">Arrêt n° 2024-{i}23</span>
                        <span className="text-sm text-muted-foreground">Conseil d'État</span>
                        <span className="text-sm text-muted-foreground">• 12 Nov 2024</span>
                      </div>
                      <h3 className="font-semibold mb-2">
                        Décision relative au droit à l'information en matière environnementale
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Le Conseil d'État précise les conditions d'accès aux documents administratifs...
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">Voir</Button>
                      <Button variant="ghost" size="sm">Sauvegarder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Institutionnel</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary">À propos</a>
                <a href="#" className="block hover:text-primary">Mission</a>
                <a href="#" className="block hover:text-primary">Équipe</a>
                <a href="#" className="block hover:text-primary">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contenus</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary">Décisions de justice</a>
                <a href="#" className="block hover:text-primary">Fiches pratiques</a>
                <a href="#" className="block hover:text-primary">Analyses juridiques</a>
                <a href="#" className="block hover:text-primary">Thématiques</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informations légales</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary">Mentions légales</a>
                <a href="#" className="block hover:text-primary">Politique de confidentialité</a>
                <a href="#" className="block hover:text-primary">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Observatoire des Droits Fondamentaux. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Observatoire;