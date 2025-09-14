import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Calendar, Eye, BookOpen, ChevronRight } from "lucide-react";

const PublicationsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const publications = [
    {
      id: 1,
      title: "Rapport annuel 2023 - État des droits en France",
      description: "Analyse complète de la situation des droits fondamentaux en France",
      category: "Rapport annuel",
      type: "Rapport",
      pages: 156,
      publishDate: "2024-01-15",
      downloads: 3200,
      size: "2.3 MB",
      featured: true,
      coverImage: "/api/placeholder/300/400"
    },
    {
      id: 2,
      title: "Guide pratique du droit au logement",
      description: "Manuel complet sur les droits et recours en matière de logement",
      category: "Guide pratique",
      type: "Guide",
      pages: 89,
      publishDate: "2023-12-10",
      downloads: 1890,
      size: "1.8 MB",
      featured: false
    },
    {
      id: 3,
      title: "Étude sur l'accès à l'emploi des personnes handicapées",
      description: "Recherche approfondie sur les obstacles et solutions pour l'inclusion professionnelle",
      category: "Étude",
      type: "Étude",
      pages: 67,
      publishDate: "2023-11-22",
      downloads: 1250,
      size: "1.4 MB",
      featured: true
    },
    {
      id: 4,
      title: "Fiche info - Vos droits face aux discriminations",
      description: "Synthèse pratique des recours en cas de discrimination",
      category: "Fiche info",
      type: "Fiche",
      pages: 12,
      publishDate: "2024-01-08",
      downloads: 5600,
      size: "340 KB",
      featured: false
    },
    {
      id: 5,
      title: "Analyse jurisprudentielle - Droit de la famille 2023",
      description: "Évolutions récentes de la jurisprudence en droit de la famille",
      category: "Analyse juridique",
      type: "Analyse",
      pages: 45,
      publishDate: "2023-12-15",
      downloads: 890,
      size: "950 KB",
      featured: false
    },
    {
      id: 6,
      title: "Manuel de formation - Médiation sociale",
      description: "Outils et méthodes pour la médiation dans le domaine social",
      category: "Manuel",
      type: "Manuel",
      pages: 123,
      publishDate: "2023-10-30",
      downloads: 1450,
      size: "2.1 MB",
      featured: false
    }
  ];

  const categories = ["Tous", "Rapport annuel", "Guide pratique", "Étude", "Fiche info", "Analyse juridique", "Manuel"];

  const filteredPublications = publications.filter(publication => {
    const matchesSearch = publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publication.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || publication.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPublications = publications.filter(pub => pub.featured);

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Accueil</span>
            <ChevronRight className="h-4 w-4" />
            <span>Accès aux droits</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Publications</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Publications</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consultez nos rapports, guides et études sur les droits fondamentaux et l'accès à la justice.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-fade-in">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une publication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Publications */}
        {selectedCategory === "Tous" && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6">Publications à la une</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPublications.map((publication) => (
                <Card key={publication.id} className="hover:shadow-lg transition-shadow duration-300 border-primary/20 hover-scale">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        À la une
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {publication.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{publication.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {publication.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {publication.pages} pages
                        </div>
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {publication.downloads}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(publication.publishDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <span>{publication.size}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Lire
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Publications */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6">
            {selectedCategory === "Tous" ? "Toutes les publications" : `Publications - ${selectedCategory}`}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPublications.map((publication) => (
              <Card key={publication.id} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-sm">{publication.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {publication.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {publication.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {publication.pages} pages
                          </div>
                          <div className="flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {publication.downloads}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(publication.publishDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <span>{publication.size}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      <Button size="sm" className="text-xs">
                        <BookOpen className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-muted/50 rounded-lg p-6 text-center animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">Recevez nos nouvelles publications</h3>
          <p className="text-muted-foreground mb-4">
            Abonnez-vous pour être notifié des nouveaux rapports et études.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder="Votre email..." className="flex-1" />
            <Button>
              S'abonner
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PublicationsContent;