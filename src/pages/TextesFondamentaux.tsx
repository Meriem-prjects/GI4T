import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, BookOpen, Scale, Users, Download, ExternalLink } from "lucide-react";

const TextesFondamentaux = () => {
  const fundamentalTexts = [
    {
      id: 1,
      title: "Constitution de la République Tunisienne",
      description: "Texte constitutionnel adopté le 27 janvier 2014, garantissant les droits et libertés fondamentaux",
      category: "Constitution",
      date: "27 janvier 2014",
      status: "En vigueur",
      articles: 149,
      tags: ["Droits fondamentaux", "Constitution", "République"]
    },
    {
      id: 2,
      title: "Code des Droits de l'Homme",
      description: "Ensemble des dispositions relatives à la protection des droits de l'homme en Tunisie",
      category: "Code",
      date: "15 mars 2022", 
      status: "En vigueur",
      articles: 245,
      tags: ["Droits de l'homme", "Protection", "Libertés"]
    },
    {
      id: 3,
      title: "Loi Organique sur l'Accès à l'Information",
      description: "Loi garantissant le droit d'accès à l'information publique pour tous les citoyens",
      category: "Loi Organique",
      date: "24 mars 2016",
      status: "En vigueur", 
      articles: 89,
      tags: ["Information", "Transparence", "Accès public"]
    }
  ];

  const rightsByCategory = [
    {
      title: "Droits civils et politiques",
      count: 12,
      description: "Liberté d'expression, droit de vote, liberté de mouvement",
      icon: Users
    },
    {
      title: "Droits économiques et sociaux", 
      count: 8,
      description: "Droit au travail, à l'éducation, à la santé",
      icon: BookOpen
    },
    {
      title: "Droits de la justice",
      count: 15,
      description: "Droit à un procès équitable, présomption d'innocence",
      icon: Scale
    }
  ];

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
                <a href="#" className="text-sm text-primary font-medium">Textes fondamentaux</a>
                <Link to="/analyses-opinions" className="text-sm hover:text-primary transition-colors">Analyses & Opinions</Link>
                <Link to="/actualites" className="text-sm hover:text-primary transition-colors">Actualités</Link>
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
              <BreadcrumbPage>Textes fondamentaux</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Textes Fondamentaux</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez les textes juridiques fondamentaux qui garantissent vos droits et libertés en Tunisie. 
            Constitution, lois organiques et codes essentiels expliqués et analysés.
          </p>
        </section>

        {/* Droits par catégorie */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Droits par Catégorie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rightsByCategory.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-8 h-8 text-primary" />
                      <Badge variant="secondary">{category.count} droits</Badge>
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explorer
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Textes fondamentaux */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Textes de Référence</h2>
          <div className="space-y-6">
            {fundamentalTexts.map((text) => (
              <Card key={text.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <Badge variant="outline">{text.category}</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {text.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{text.title}</CardTitle>
                      <CardDescription className="text-base mb-3">
                        {text.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>Adopté le {text.date}</span>
                        <span>• {text.articles} articles</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {text.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Consulter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
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

export default TextesFondamentaux;