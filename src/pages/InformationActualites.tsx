import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const InformationActualites = () => {
  const actualites = [
    {
      id: 1,
      title: "Nouvelle réforme du Code du travail tunisien",
      excerpt: "Les dernières modifications apportées au Code du travail et leur impact sur les droits des salariés.",
      date: "15 Mars 2024",
      readTime: "5 min",
      views: 1234,
      category: "Droit du travail",
      image: "/Feelinx_upload/justclic-logo.png",
      featured: true
    },
    {
      id: 2,
      title: "Guide pratique : Obtenir un acte de naissance",
      excerpt: "Procédure simplifiée pour obtenir un acte de naissance en ligne ou dans les bureaux d'état civil.",
      date: "12 Mars 2024",
      readTime: "3 min",
      views: 892,
      category: "État civil",
      image: "/Feelinx_upload/justclic-logo.png"
    },
    {
      id: 3,
      title: "Droits des locataires : ce qui change en 2024",
      excerpt: "Nouvelles protections pour les locataires et évolutions de la législation sur le logement.",
      date: "10 Mars 2024",
      readTime: "6 min",
      views: 756,
      category: "Droit au logement",
      image: "/Feelinx_upload/justclic-logo.png"
    },
    {
      id: 4,
      title: "Procédures de divorce simplifiées",
      excerpt: "Les nouvelles procédures de divorce consensuel et leur impact sur les familles tunisiennes.",
      date: "8 Mars 2024",
      readTime: "4 min",
      views: 634,
      category: "Droit de la famille",
      image: "/Feelinx_upload/justclic-logo.png"
    }
  ];

  const categories = [
    { name: "Droit du travail", count: 23 },
    { name: "État civil", count: 18 },
    { name: "Droit au logement", count: 15 },
    { name: "Droit de la famille", count: 12 },
    { name: "Droits sociaux", count: 9 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            <span>›</span>
            <Link to="/information/actualites" className="hover:text-primary">Information</Link>
            <span>›</span>
            <span className="text-foreground">Actualités</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Actualités Juridiques
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Restez informé des dernières évolutions juridiques, nouvelles procédures et réformes qui impactent vos droits en Tunisie.
          </p>
          
          {/* Newsletter Subscription */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold mb-3">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Recevez nos actualités par email</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Votre email"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button size="sm">S'abonner</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Featured Article */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6">Article à la Une</h2>
              <Card className="overflow-hidden border-primary/20 bg-primary/5">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-video md:aspect-square bg-muted/50 flex items-center justify-center">
                    <img 
                      src={actualites[0].image} 
                      alt={actualites[0].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3">{actualites[0].category}</Badge>
                    <CardTitle className="text-xl mb-3">{actualites[0].title}</CardTitle>
                    <CardDescription className="mb-4 leading-relaxed">
                      {actualites[0].excerpt}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {actualites[0].date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {actualites[0].readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {actualites[0].views}
                      </div>
                    </div>
                    <Button className="group">
                      Lire l'article
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Regular Articles */}
            <div>
              <h2 className="text-xl font-bold mb-6">Dernières Actualités</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {actualites.slice(1).map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-muted/50 overflow-hidden rounded-t-lg">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{article.excerpt}</CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {article.date}
                        </div>
                        <Button variant="ghost" size="sm" className="group">
                          Lire plus
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <Button variant="outline" size="lg">
                  Charger plus d'articles
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default InformationActualites;