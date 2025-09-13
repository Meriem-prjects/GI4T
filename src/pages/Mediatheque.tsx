import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, Play, Video, Headphones, FileText, Eye, Clock, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";

const Mediatheque = () => {
  const mediaContent = [
    {
      title: "Vos droits en cas de discrimination au travail",
      type: "Vidéo",
      duration: "8:45",
      views: 15420,
      likes: 234,
      category: "Travail",
      description: "Comprendre et réagir face aux discriminations professionnelles",
      thumbnail: "/api/placeholder/300/200"
    },
    {
      title: "Comment contester un refus de logement social",
      type: "Vidéo",
      duration: "12:30",
      views: 8976,
      likes: 167,
      category: "Logement",
      description: "Guide complet des recours possibles en matière de logement",
      thumbnail: "/api/placeholder/300/200"
    },
    {
      title: "Témoignage: Mon combat pour l'éducation inclusive",
      type: "Audio",
      duration: "15:22",
      views: 3421,
      likes: 89,
      category: "Éducation",
      description: "Le parcours d'une mère pour la scolarisation de son enfant handicapé",
      thumbnail: "/api/placeholder/300/200"
    },
    {
      title: "Droit à la santé : accès aux soins d'urgence",
      type: "Vidéo",
      duration: "6:15",
      views: 12543,
      likes: 198,
      category: "Santé",
      description: "Vos droits face aux refus de soins et situations d'urgence",
      thumbnail: "/api/placeholder/300/200"
    },
    {
      title: "Liberté d'expression : limites et protections",
      type: "Podcast",
      duration: "22:10",
      views: 5432,
      likes: 112,
      category: "Libertés",
      description: "Débat avec des experts sur les contours de la liberté d'expression",
      thumbnail: "/api/placeholder/300/200"
    },
    {
      title: "Guide pratique : Recours administratif étape par étape",
      type: "Vidéo",
      duration: "18:45",
      views: 9876,
      likes: 156,
      category: "Administration",
      description: "Tutoriel complet pour contester une décision administrative",
      thumbnail: "/api/placeholder/300/200"
    }
  ];

  const categories = ["Tous", "Travail", "Logement", "Éducation", "Santé", "Libertés", "Administration"];
  const types = ["Tous", "Vidéo", "Audio", "Podcast"];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Vidéo":
        return <Video className="h-4 w-4" />;
      case "Audio":
      case "Podcast":
        return <Headphones className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/acces-aux-droits" className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Accès aux Droits</h1>
                <p className="text-sm text-muted-foreground">Médiathèque</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="ghost" size="sm">Observatoire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AccesAuxDroitsNav />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/acces-aux-droits">Accès aux Droits</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Médiathèque</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Play className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Médiathèque</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Vidéos explicatives, témoignages et contenus audio pour mieux comprendre vos droits
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un contenu..." className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Catégorie:</span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "Tous" ? "default" : "outline"}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Type:</span>
              {types.map((type) => (
                <Button
                  key={type}
                  variant={type === "Tous" ? "default" : "outline"}
                  size="sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Contenu en vedette</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">Nouveau</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Vidéo
                  </Badge>
                </div>
                <CardTitle>Série: Vos droits au quotidien</CardTitle>
                <CardDescription>
                  5 épisodes pour comprendre vos droits fondamentaux dans la vie de tous les jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>5 vidéos • 45 min total</div>
                    <div>12,543 vues</div>
                  </div>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Regarder la série
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Populaire</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Headphones className="h-3 w-3" />
                    Podcast
                  </Badge>
                </div>
                <CardTitle>Débats ODF: Les droits en question</CardTitle>
                <CardDescription>
                  Podcast mensuel avec experts et témoins sur les enjeux des droits fondamentaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>8 épisodes • Mensuel</div>
                    <div>8,976 écoutes</div>
                  </div>
                  <Button variant="secondary">
                    <Play className="h-4 w-4 mr-2" />
                    Écouter le podcast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mediaContent.map((media, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow group">
              <div className="relative">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <Play className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {media.duration}
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getTypeIcon(media.type)}
                    {media.type}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{media.category}</Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{media.title}</CardTitle>
                <CardDescription>{media.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {media.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {media.likes}
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {media.type === "Vidéo" ? "Regarder" : "Écouter"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8">
            <h3 className="text-xl font-semibold mb-2">Vous avez une histoire à partager ?</h3>
            <p className="text-muted-foreground mb-4">
              Contribuez à la médiathèque avec votre témoignage
            </p>
            <Link to="/contact">
              <Button>Partager votre expérience</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Mediatheque;