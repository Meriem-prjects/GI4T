import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, Clock, Tag, TrendingUp, Bell, Eye } from "lucide-react";

const Actualites = () => {
  const news = [
    {
      id: 1,
      title: "Nouvelle jurisprudence sur la protection des données personnelles",
      excerpt: "La Cour Suprême vient de rendre un arrêt important qui précise les conditions de traitement des données personnelles par les administrations publiques...",
      date: "20 novembre 2024",
      category: "Jurisprudence",
      readTime: "5 min",
      views: 2341,
      featured: true,
      tags: ["RGPD", "Administration", "Données personnelles"]
    },
    {
      id: 2,
      title: "Lancement du nouveau portail numérique de l'ODF",
      excerpt: "L'Observatoire des Droits Fondamentaux annonce le lancement de sa nouvelle plateforme numérique offrant un accès facilité aux décisions de justice...",
      date: "18 novembre 2024",
      category: "ODF",
      readTime: "3 min", 
      views: 1876,
      featured: false,
      tags: ["Numérique", "Accès", "Innovation"]
    },
    {
      id: 3,
      title: "Conférence internationale sur les droits numériques",
      excerpt: "Tunis accueillera du 15 au 17 décembre 2024 une conférence internationale sur l'évolution des droits fondamentaux à l'ère numérique...",
      date: "15 novembre 2024",
      category: "Événement",
      readTime: "4 min",
      views: 1523,
      featured: false,
      tags: ["Conférence", "International", "Droits numériques"]
    },
    {
      id: 4,
      title: "Rapport annuel 2024 de l'ODF disponible",
      excerpt: "Le rapport annuel de l'Observatoire présente un bilan complet de l'évolution des droits fondamentaux en Tunisie durant l'année 2024...",
      date: "12 novembre 2024",
      category: "Publication",
      readTime: "8 min",
      views: 987,
      featured: false,
      tags: ["Rapport", "Bilan", "Droits fondamentaux"]
    }
  ];

  const categories = [
    { name: "Toutes", count: 156, active: true },
    { name: "Jurisprudence", count: 67, active: false },
    { name: "ODF", count: 34, active: false },
    { name: "Événement", count: 28, active: false },
    { name: "Publication", count: 27, active: false }
  ];

  const featuredNews = news.find(article => article.featured);
  const regularNews = news.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto" />
              <h1 className="text-lg md:text-xl font-bold text-primary hidden sm:block">Observatoire des Droits Fondamentaux</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-sm hover:text-primary transition-colors">Accueil</Link>
                <Link to="/observatoire" className="text-sm hover:text-primary transition-colors">Observatoire</Link>
                <Link to="/textes-fondamentaux" className="text-sm hover:text-primary transition-colors">Textes fondamentaux</Link>
                <Link to="/analyses-opinions" className="text-sm hover:text-primary transition-colors">Analyses & Opinions</Link>
                <a href="#" className="text-sm text-primary font-medium">Actualités</a>
              </nav>
              
              <div className="flex items-center bg-muted rounded-full p-1">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-1 text-sm font-medium">
                  FR
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-transparent rounded-full px-4 py-1 text-sm">
                  AR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

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
              <BreadcrumbPage>Actualités</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Actualités</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Suivez les dernières évolutions en matière de droits fondamentaux, jurisprudence 
            et activités de l'Observatoire des Droits Fondamentaux.
          </p>
          
          {/* Newsletter Subscription */}
          <div className="bg-primary/5 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Restez informé</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Recevez les dernières actualités directement dans votre boîte mail
            </p>
            <Button>
              S'abonner à la newsletter
            </Button>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.active ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Article */}
        {featuredNews && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">À la Une</h2>
            </div>
            
            <Card className="border-2 border-primary/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-primary text-primary-foreground">
                    {featuredNews.category}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    À la Une
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredNews.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredNews.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {featuredNews.views} vues
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-3">{featuredNews.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {featuredNews.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {featuredNews.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button size="lg">
                    Lire l'article
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Regular Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Dernières actualités</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-4 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{article.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight mb-3">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm flex-1">
                    {article.excerpt}
                  </CardDescription>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" size="sm">
                    Lire la suite
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Charger plus d'articles
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto mb-4" />
              <h3 className="font-semibold mb-2">Observatoire des Droits Fondamentaux</h3>
              <p className="text-sm text-muted-foreground">
                Facilitant l'accès à la justice et aux droits fondamentaux pour tous
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-primary transition-colors">Accueil</Link>
                <Link to="/observatoire" className="block hover:text-primary transition-colors">Observatoire</Link>
                <Link to="/search-results" className="block hover:text-primary transition-colors">Recherche</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contenus</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Décisions de justice</a>
                <Link to="/textes-fondamentaux" className="block hover:text-primary transition-colors">Textes fondamentaux</Link>
                <Link to="/analyses-opinions" className="block hover:text-primary transition-colors">Analyses & Opinions</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informations</h3>
              <div className="space-y-2 text-sm">
                <Link to="/odf-partenaires" className="block hover:text-primary transition-colors">À propos</Link>
                <Link to="/contact" className="block hover:text-primary transition-colors">Contact</Link>
                <a href="#" className="block hover:text-primary transition-colors">Mentions légales</a>
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

export default Actualites;