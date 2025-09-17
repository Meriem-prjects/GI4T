import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Pen, TrendingUp, Eye, Calendar, User } from "lucide-react";

const AnalysesOpinions = () => {
  const analyses = [
    {
      id: 1,
      title: "L'évolution du droit à la vie privée à l'ère numérique",
      excerpt: "Une analyse approfondie des enjeux contemporains de la protection des données personnelles en Tunisie...",
      author: "Dr. Ahmed Ben Salem",
      date: "15 novembre 2024",
      readTime: "12 min",
      views: 1247,
      category: "Analyse approfondie",
      tags: ["Vie privée", "RGPD", "Numérique"]
    },
    {
      id: 2,
      title: "Les défis de la liberté d'expression face aux réseaux sociaux",
      excerpt: "Comment concilier liberté d'expression et lutte contre la désinformation sur les plateformes numériques...",
      author: "Prof. Fatma Kallel", 
      date: "10 novembre 2024",
      readTime: "8 min",
      views: 892,
      category: "Opinion",
      tags: ["Expression", "Réseaux sociaux", "Désinformation"]
    },
    {
      id: 3,
      title: "Policy Brief: Renforcer l'accès à la justice",
      excerpt: "Recommandations pour améliorer l'accessibilité et l'efficacité du système judiciaire tunisien...",
      author: "Équipe ODF",
      date: "5 novembre 2024", 
      readTime: "15 min",
      views: 654,
      category: "Policy Brief",
      tags: ["Justice", "Accès", "Réforme"]
    }
  ];

  const categories = [
    {
      title: "Analyses approfondies",
      count: 24,
      description: "Études détaillées sur les évolutions jurisprudentielles",
      icon: FileText,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Articles d'opinion",
      count: 18,
      description: "Points de vue d'experts sur les questions juridiques actuelles", 
      icon: Pen,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Policy Briefs",
      count: 12,
      description: "Recommandations pour les décideurs politiques",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
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
              <BreadcrumbLink asChild>
                <Link to="/observatoire">Observatoire</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Analyses & Opinions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Analyses & Opinions</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            Analyses approfondies, articles d'opinion et recommandations d'experts sur les évolutions 
            du droit et des libertés fondamentales en Tunisie.
          </p>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Types de contenus</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-8 h-8 text-primary" />
                      <Badge className={category.color}>{category.count}</Badge>
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Consulter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Articles récents */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Publications Récentes</h2>
            <Button variant="outline">
              Voir toutes les publications
            </Button>
          </div>
          
          <div className="space-y-6">
            {analyses.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline">{article.category}</Badge>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {article.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views} vues
                          </div>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl mb-3">{article.title}</CardTitle>
                      <CardDescription className="text-base mb-4">
                        {article.excerpt}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{article.readTime} de lecture</span>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button>
                        Lire l'article
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-muted rounded-xl p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Contribuer à la réflexion</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Vous êtes expert en droit ou chercheur ? Partagez vos analyses et contribuez 
            au débat sur les droits fondamentaux en Tunisie.
          </p>
          <Button size="lg">
            Proposer un article
          </Button>
        </section>
      </div>
  );
};

export default AnalysesOpinions;