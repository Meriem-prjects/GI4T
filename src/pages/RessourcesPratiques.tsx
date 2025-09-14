import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, FileText, Download, Calendar, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const RessourcesPratiques = () => {
  const resources = [
    {
      title: "Modèle de lettre de recours gracieux",
      description: "Modèle type pour contester une décision administrative",
      type: "Modèle",
      format: "DOCX",
      size: "45 KB",
      downloads: 2341,
      category: "Administration",
      lastUpdate: "15/03/2024"
    },
    {
      title: "Formulaire de demande d'aide juridictionnelle",
      description: "Formulaire pré-rempli pour demander l'aide juridictionnelle",
      type: "Formulaire",
      format: "PDF",
      size: "234 KB",
      downloads: 1876,
      category: "Justice",
      lastUpdate: "10/03/2024"
    },
    {
      title: "Checklist - Préparation audience tribunal",
      description: "Liste des documents et étapes pour préparer votre audience",
      type: "Checklist",
      format: "PDF",
      size: "156 KB",
      downloads: 934,
      category: "Justice",
      lastUpdate: "08/03/2024"
    },
    {
      title: "Contrat de location - Points de vigilance",
      description: "Guide d'analyse des clauses essentielles d'un bail",
      type: "Guide",
      format: "PDF",
      size: "423 KB",
      downloads: 1567,
      category: "Logement",
      lastUpdate: "12/03/2024"
    },
    {
      title: "Modèle de plainte discrimination",
      description: "Modèle de courrier pour signaler une discrimination",
      type: "Modèle",
      format: "DOCX",
      size: "67 KB",
      downloads: 789,
      category: "Travail",
      lastUpdate: "14/03/2024"
    },
    {
      title: "Dossier médical - Demande de communication",
      description: "Formulaire pour obtenir votre dossier médical",
      type: "Formulaire",
      format: "PDF",
      size: "89 KB",
      downloads: 1234,
      category: "Santé",
      lastUpdate: "11/03/2024"
    }
  ];

  const categories = ["Tous", "Administration", "Justice", "Logement", "Travail", "Santé", "Éducation"];
  const types = ["Tous", "Modèle", "Formulaire", "Checklist", "Guide"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/acces-aux-droits" 
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mr-2 sm:mr-4"
              >
                ←
              </Link>
              <Link to="/acces-aux-droits" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity duration-200">
                <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-3 sm:h-6" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">Accès aux Droits</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Ressources pratiques</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Observatoire</Button>
              </Link>
            </div>
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
              <BreadcrumbPage>Ressources pratiques</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Ressources pratiques</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Modèles, formulaires et documents prêts à utiliser pour exercer vos droits
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="relative max-w-sm sm:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une ressource..." className="pl-10 text-sm sm:text-base" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Catégorie:</span>
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
            <div className="flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Type:</span>
              {types.map((type) => (
                <Button
                  key={type}
                  variant={type === "Tous" ? "default" : "outline"}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {resources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{resource.category}</Badge>
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {resource.downloads}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{resource.format}</span>
                      <span>{resource.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {resource.lastUpdate}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Ressources les plus demandées</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Kit de défense des droits du locataire
                </CardTitle>
                <CardDescription>
                  Ensemble complet de modèles et guides pour les problèmes de logement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>8 documents • ZIP • 2.3 MB</div>
                    <div>Téléchargé 5,432 fois</div>
                  </div>
                  <Button>
                    Télécharger le kit
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  Guide complet des recours administratifs
                </CardTitle>
                <CardDescription>
                  Modèles et procédures pour tous types de recours contre l'administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>12 documents • ZIP • 3.1 MB</div>
                    <div>Téléchargé 3,876 fois</div>
                  </div>
                  <Button variant="secondary">
                    Télécharger le guide
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8">
            <h3 className="text-xl font-semibold mb-2">Besoin d'une ressource spécifique ?</h3>
            <p className="text-muted-foreground mb-4">
              Suggérez-nous de nouveaux modèles ou formulaires
            </p>
            <Link to="/contact">
              <Button>Faire une suggestion</Button>
            </Link>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RessourcesPratiques;