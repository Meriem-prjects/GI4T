import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Calendar, Eye, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const Publications = () => {
  const publications = [
    {
      id: 1,
      title: "Guide des droits administratifs en Tunisie 2024",
      type: "Guide officiel",
      category: "Droits administratifs",
      date: "15 Mars 2024",
      downloads: 2340,
      pages: 156,
      description: "Guide complet sur les procédures administratives et droits des citoyens tunisiens.",
      size: "2.4 MB"
    },
    {
      id: 2,
      title: "Rapport annuel sur l'accès aux droits - 2023",
      type: "Rapport",
      category: "Statistiques",
      date: "10 Janvier 2024",
      downloads: 1890,
      pages: 89,
      description: "Analyse des tendances et défis dans l'accès aux droits fondamentaux en Tunisie.",
      size: "5.1 MB"
    },
    {
      id: 3,
      title: "Procédures de recours administratif",
      type: "Guide pratique",
      category: "Procédures",
      date: "28 Février 2024",
      downloads: 3200,
      pages: 42,
      description: "Comment contester une décision administrative et connaître ses droits de recours.",
      size: "1.8 MB"
    },
    {
      id: 4,
      title: "Droits des personnes en situation de handicap",
      type: "Brochure",
      category: "Droits spécifiques",
      date: "05 Mars 2024",
      downloads: 1560,
      pages: 28,
      description: "Droits spécifiques et aides disponibles pour les personnes en situation de handicap.",
      size: "1.2 MB"
    },
    {
      id: 5,
      title: "Accès à l'information publique - Mode d'emploi",
      type: "Guide",
      category: "Transparence",
      date: "20 Février 2024",
      downloads: 980,
      pages: 35,
      description: "Procédures pour accéder aux documents administratifs et informations publiques.",
      size: "1.6 MB"
    },
    {
      id: 6,
      title: "Droits du travail dans l'administration publique",
      type: "Manuel",
      category: "Droit du travail",
      date: "12 Janvier 2024",
      downloads: 2100,
      pages: 78,
      description: "Droits et obligations des fonctionnaires et agents de l'État tunisien.",
      size: "3.2 MB"
    }
  ];

  const categories = ["Tous", "Droits administratifs", "Statistiques", "Procédures", "Droits spécifiques", "Transparence", "Droit du travail"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Accès aux Droits</h1>
                <p className="text-sm text-muted-foreground">Campagne d'information avec carte interactive</p>
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
              <BreadcrumbPage>Publications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Publications</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Accédez à tous les documents officiels, guides pratiques et rapports sur les droits fondamentaux en Tunisie.
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher dans les publications..." className="pl-10" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
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

        {/* Publications Grid */}
        <div className="grid gap-6 mb-8">
          {publications.map((publication) => (
            <Card key={publication.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">{publication.type}</Badge>
                      <Badge variant="outline">{publication.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{publication.title}</CardTitle>
                    <CardDescription className="text-base">
                      {publication.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {publication.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {publication.downloads} téléchargements  
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {publication.pages} pages
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{publication.size}</span>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Recevez nos nouvelles publications</CardTitle>
            <CardDescription>
              Abonnez-vous pour être informé des dernières publications et mises à jour.
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
      
      <Footer />
    </div>
  );
};

export default Publications;