import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, BookOpen, Download, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const GuidesPratiques = () => {
  const guides = [
    {
      title: "Comment contester un refus de logement social",
      description: "Guide complet pour faire valoir vos droits en cas de refus de logement social",
      category: "Logement",
      duration: "15 min",
      difficulty: "Facile",
      downloads: 1247,
      tags: ["Logement", "Recours", "Social"]
    },
    {
      title: "Signaler une discrimination au travail",
      description: "Étapes pour identifier, documenter et signaler une discrimination professionnelle",
      category: "Travail",
      duration: "20 min",
      difficulty: "Moyen",
      downloads: 892,
      tags: ["Travail", "Discrimination", "Recours"]
    },
    {
      title: "Accéder aux soins sans couverture sociale",
      description: "Vos droits et démarches pour accéder aux soins d'urgence",
      category: "Santé",
      duration: "10 min",
      difficulty: "Facile",
      downloads: 1567,
      tags: ["Santé", "Urgence", "Social"]
    },
    {
      title: "Contester une décision administrative",
      description: "Procédures de recours contre les décisions de l'administration",
      category: "Administration",
      duration: "25 min",
      difficulty: "Difficile",
      downloads: 634,
      tags: ["Administration", "Recours", "Procédure"]
    },
    {
      title: "Défendre son droit à l'expression",
      description: "Limites et protections de la liberté d'expression",
      category: "Libertés",
      duration: "18 min",
      difficulty: "Moyen",
      downloads: 456,
      tags: ["Liberté", "Expression", "Droits"]
    },
    {
      title: "Scolarisation d'un enfant en situation de handicap",
      description: "Démarches pour l'inclusion scolaire et les aménagements",
      category: "Éducation",
      duration: "30 min",
      difficulty: "Moyen",
      downloads: 789,
      tags: ["Éducation", "Handicap", "Inclusion"]
    }
  ];

  const categories = ["Tous", "Logement", "Travail", "Santé", "Administration", "Libertés", "Éducation"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link to="/acces-aux-droits" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity duration-200">
              <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-4 sm:h-8" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Accès aux Droits</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Guides pratiques</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Observatoire</Button>
              </Link>
            </div>
          </div>
          
          {/* Return Navigation */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <Link 
              to="/acces-aux-droits" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              ← Retour à Accès aux Droits
            </Link>
          </div>
        </div>
      </header>

      <AccesAuxDroitsNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 sm:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/acces-aux-droits">Accès aux Droits</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Guides pratiques</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Guides pratiques</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Des guides step-by-step pour vous accompagner dans l'exercice de vos droits fondamentaux
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="relative max-w-sm sm:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un guide..." className="pl-10 text-sm sm:text-base" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "Tous" ? "default" : "outline"}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {guides.map((guide, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{guide.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {guide.downloads}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {guide.duration}
                    </div>
                    <Badge variant={guide.difficulty === "Facile" ? "default" : guide.difficulty === "Moyen" ? "secondary" : "destructive"}>
                      {guide.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Lire le guide
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8">
            <h3 className="text-xl font-semibold mb-2">Vous ne trouvez pas ce que vous cherchez ?</h3>
            <p className="text-muted-foreground mb-4">
              Contactez-nous pour suggérer un nouveau guide pratique
            </p>
            <Link to="/contact">
              <Button>Nous contacter</Button>
            </Link>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GuidesPratiques;