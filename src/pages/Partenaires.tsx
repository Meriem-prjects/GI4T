import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Globe, MapPin, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";

const Partenaires = () => {
  const partners = [
    {
      id: 1,
      name: "Democracy Reporting International (DRI)",
      type: "Organisation internationale",
      description: "Organisation non-gouvernementale qui soutient les processus démocratiques et la participation citoyenne.",
      location: "Berlin, Allemagne - Bureau Tunis",
      website: "https://democracy-reporting.org",
      email: "tunisia@democracy-reporting.org",
      logo: "/Feelinx_upload/dri-logo.png",
      featured: true,
      collaboration: "Depuis 2019",
      focus: ["Démocratie participative", "Droits civiques", "Formation"]
    },
    {
      id: 2,
      name: "Global Institute for Transitions (GI4T)",
      type: "Institut de recherche",
      description: "Institut spécialisé dans l'accompagnement des transitions démocratiques et la consolidation de l'État de droit.",
      location: "Tunis, Tunisie",
      website: "https://gi4t.org",
      email: "contact@gi4t.org",
      logo: "/api/placeholder/100/100",
      featured: true,
      collaboration: "Depuis 2020",
      focus: ["Transition démocratique", "État de droit", "Gouvernance"]
    },
    {
      id: 3,
      name: "L'agora Djerba (CinémaTour)",
      type: "Association culturelle",
      description: "Association qui utilise le cinéma et les arts pour sensibiliser aux droits humains et à la citoyenneté.",
      location: "Djerba, Tunisie",
      website: "https://agora-djerba.tn",
      email: "contact@agora-djerba.tn",
      logo: "/api/placeholder/100/100",
      collaboration: "Depuis 2021",
      focus: ["Éducation civique", "Arts et culture", "Jeunesse"]
    },
    {
      id: 4,
      name: "Association Tunisienne des Médias Alternatifs (ATMA)",
      type: "Association médiatique",
      description: "Réseau de médias indépendants œuvrant pour la transparence et l'accès à l'information.",
      location: "Tunis, Tunisie",
      website: "https://atma.tn",
      email: "contact@atma.tn",
      logo: "/api/placeholder/100/100",
      collaboration: "Depuis 2022",
      focus: ["Liberté de presse", "Accès à l'information", "Médias alternatifs"]
    }
  ];

  const partnershipTypes = [
    {
      title: "Partenaires stratégiques",
      count: 2,
      description: "Organisations avec lesquelles nous développons des programmes à long terme"
    },
    {
      title: "Partenaires opérationnels", 
      count: 4,
      description: "Organisations qui participent à nos actions de terrain"
    },
    {
      title: "Partenaires institutionnels",
      count: 6,
      description: "Institutions publiques et organismes officiels"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Nos Partenaires</h1>
                <p className="text-sm text-muted-foreground">Ensemble pour les droits fondamentaux</p>
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
              <BreadcrumbPage>Partenaires</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Nos Partenaires</h2>
          <p className="text-lg text-muted-foreground mb-6">
            L'Observatoire des Droits Fondamentaux travaille en collaboration avec des organisations nationales et internationales pour promouvoir l'accès aux droits en Tunisie.
          </p>
        </div>

        {/* Partnership Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {partnershipTypes.map((type, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">{type.count}</CardTitle>
                <CardDescription className="font-semibold">{type.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un partenaire..." className="pl-10" />
          </div>
        </div>

        {/* Featured Partners */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6">Partenaires principaux</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {partners.filter(partner => partner.featured).map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="w-16 h-16 object-contain rounded-lg border"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{partner.name}</CardTitle>
                      <Badge variant="secondary" className="mb-2">{partner.type}</Badge>
                      <CardDescription className="text-base">
                        {partner.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {partner.location}
                    </div>
                    {partner.collaboration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Collaboration {partner.collaboration}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Domaines de collaboration :</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.focus.map((focus, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/partenaire-${partner.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}>
                        En savoir plus
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-1" />
                        Site web
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Partners */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6">Tous nos partenaires</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="w-12 h-12 object-contain rounded-lg border"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">{partner.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">{partner.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Détails
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Call to Action */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Devenir partenaire</CardTitle>
            <CardDescription>
              Vous souhaitez collaborer avec l'ODF pour promouvoir les droits fondamentaux ?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Nous contacter
                </Button>
              </Link>
              <Button variant="outline">
                Télécharger notre brochure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Partenaires;