import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, Eye, ArrowRight, ChevronRight } from "lucide-react";

const ActualitesAccesDroits = () => {
  const news = [
    {
      id: 1,
      title: "Nouvelle campagne nationale pour l'accès aux droits",
      excerpt: "Le gouvernement lance une grande campagne de sensibilisation aux droits fondamentaux dans toutes les régions.",
      date: "2024-03-15",
      category: "Campagnes",
      views: 3240,
      readTime: "5 min",
      featured: true
    },
    {
      id: 2,
      title: "Ouverture de 10 nouveaux centres de médiation sociale",
      excerpt: "Des centres de médiation ouvrent leurs portes pour faciliter l'accès à la justice et aux droits.",
      date: "2024-03-12",
      category: "Services",
      views: 2890,
      readTime: "3 min",
      featured: false
    },
    {
      id: 3,
      title: "Formation des médiateurs : nouvelle session prévue en avril",
      excerpt: "Une session de formation intensive pour les futurs médiateurs sociaux débutera le mois prochain.",
      date: "2024-03-10",
      category: "Formation",
      views: 1567,
      readTime: "4 min",
      featured: false
    }
  ];

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
            <span className="text-foreground">Actualités</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Actualités</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez les dernières nouvelles et événements liés à l'accès aux droits.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une actualité..."
              className="pl-10"
            />
          </div>
        </div>

        {/* News Grid */}
        <div className="space-y-6 animate-fade-in">
          {news.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    {item.featured && (
                      <Badge className="mb-2">À la une</Badge>
                    )}
                    <Badge variant="outline" className="mb-2">
                      {item.category}
                    </Badge>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.readTime}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {item.views}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button>
                      Lire plus
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8 animate-fade-in">
          <Button variant="outline">
            Voir plus d'actualités
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ActualitesAccesDroits;
