import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Users, Eye, Camera, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";

const AlbumsPhotos = () => {
  const albums = [
    {
      id: 1,
      title: "Campagne nationale 'Connaître ses droits' - Tunis",
      date: "15 Mars 2024",
      location: "Avenue Habib Bourguiba, Tunis",
      photos: 45,
      views: 1230,
      category: "Campagne",
      description: "Grande campagne de sensibilisation aux droits fondamentaux organisée dans la capitale.",
      thumbnail: "/api/placeholder/400/300",
      featured: true
    },
    {
      id: 2,
      title: "Journée portes ouvertes - Maison de Justice Sfax",
      date: "02 Mars 2024", 
      location: "Sfax Centre",
      photos: 28,
      views: 890,
      category: "Événement",
      description: "Présentation des services d'aide juridique gratuite aux citoyens.",
      thumbnail: "/api/placeholder/400/300"
    },
    {
      id: 3,
      title: "Formation des formateurs - Droits des femmes",
      date: "28 Février 2024",
      location: "Sousse",
      photos: 33,
      views: 670,
      category: "Formation",
      description: "Session de formation sur les droits des femmes et l'égalité des genres.",
      thumbnail: "/api/placeholder/400/300"
    },
    {
      id: 4,
      title: "Conférence nationale sur l'accès à la justice",
      date: "20 Février 2024",
      location: "Hôtel Africa, Tunis",
      photos: 67,
      views: 2100,
      category: "Conférence",
      description: "Rassemblement d'experts sur les défis de l'accès à la justice en Tunisie.",
      thumbnail: "/api/placeholder/400/300",
      featured: true
    },
    {
      id: 5,
      title: "Campagne mobile - Gouvernorat de Kairouan",
      date: "15 Février 2024",
      location: "Kairouan",
      photos: 52,
      views: 950,
      category: "Campagne",
      description: "Caravane d'information juridique dans les zones rurales.",
      thumbnail: "/api/placeholder/400/300"
    },
    {
      id: 6,
      title: "Atelier jeunes - Éducation aux droits civiques",
      date: "10 Février 2024",
      location: "Université de Manouba",
      photos: 41,
      views: 780,
      category: "Éducation",
      description: "Sensibilisation des étudiants aux droits civiques et participation citoyenne.",
      thumbnail: "/api/placeholder/400/300"
    }
  ];

  const categories = ["Tous", "Campagne", "Événement", "Formation", "Conférence", "Éducation"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Albums Photos</h1>
                <p className="text-sm text-muted-foreground">Galerie des événements et campagnes</p>
              </div>
            </div>
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
              <BreadcrumbLink asChild>
                <Link to="/acces-aux-droits">Accès aux Droits</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Albums Photos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Albums Photos</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Découvrez en images nos campagnes, événements et actions de sensibilisation aux droits fondamentaux en Tunisie.
          </p>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un album..." className="pl-10 w-80" />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span>316 photos au total</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                <span>6 albums</span>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "Tous" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Albums */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Albums en vedette</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {albums.filter(album => album.featured).map((album) => (
              <Card key={album.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={album.thumbnail} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3" variant="default">
                    {album.category}
                  </Badge>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {album.photos} photos
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{album.title}</CardTitle>
                  <CardDescription>{album.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {album.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {album.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {album.views} vues
                    </div>
                  </div>
                  <Button className="w-full">Voir l'album</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Albums Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Tous les albums</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={album.thumbnail} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    {album.category}
                  </Badge>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {album.photos} photos
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-tight">{album.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {album.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {album.views}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Restez informé de nos événements</CardTitle>
            <CardDescription>
              Recevez les invitations à nos campagnes et événements de sensibilisation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex max-w-md mx-auto gap-2">
              <Input placeholder="Votre email" type="email" />
              <Button>S'abonner</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlbumsPhotos;