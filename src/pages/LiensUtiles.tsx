import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Globe, Building, Users, Scale, Heart, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const LiensUtiles = () => {
  const linkCategories = [
    {
      title: "Institutions publiques",
      icon: Building,
      links: [
        {
          name: "Ministère de la Justice",
          url: "https://www.e-justice.tn",
          description: "Services judiciaires et information juridique officielle",
          verified: true
        },
        {
          name: "Ministère des Affaires Sociales",
          url: "https://www.social.gov.tn",
          description: "Prestations sociales et programmes d'aide",
          verified: true
        },
        {
          name: "Présidence du Gouvernement",
          url: "https://www.pm.gov.tn",
          description: "Portail officiel du gouvernement tunisien",
          verified: true
        },
        {
          name: "Assemblée des Représentants du Peuple",
          url: "https://www.arp.tn",
          description: "Parlement tunisien et textes législatifs",
          verified: true
        }
      ]
    },
    {
      title: "Organisations des droits humains",
      icon: Users,
      links: [
        {
          name: "Ligue Tunisienne des Droits de l'Homme",
          url: "https://www.ltdh.tn",
          description: "Organisation de défense des droits humains",
          verified: true
        },
        {
          name: "Forum Tunisien pour les Droits Économiques et Sociaux",
          url: "https://ftdes.net",
          description: "Défense des droits économiques et sociaux",
          verified: true
        },
        {
          name: "Association Tunisienne des Femmes Démocrates",
          url: "https://www.atfd.org.tn",
          description: "Droits des femmes et égalité des genres",
          verified: true
        },
        {
          name: "Ordre National des Avocats de Tunisie",
          url: "https://www.ordre-avocats.org.tn",
          description: "Assistance juridique et représentation légale",
          verified: true
        }
      ]
    },
    {
      title: "Services juridiques gratuits",
      icon: Scale,
      links: [
        {
          name: "Aide Juridictionnelle",
          url: "https://www.aide-juridique.tn",
          description: "Accès gratuit à la justice pour tous",
          verified: true
        },
        {
          name: "Maisons de Justice",
          url: "https://www.maisons-justice.tn",
          description: "Médiation et conseil juridique de proximité",
          verified: true
        },
        {
          name: "Consultation Juridique Gratuite",
          url: "https://www.consultation-gratuite.tn",
          description: "Conseils juridiques en ligne gratuits",
          verified: false
        }
      ]
    },
    {
      title: "Santé et services sociaux",
      icon: Heart,
      links: [
        {
          name: "Caisse Nationale d'Assurance Maladie",
          url: "https://www.cnam.nat.tn",
          description: "Couverture médicale et remboursements",
          verified: true
        },
        {
          name: "Caisse Nationale de Sécurité Sociale",
          url: "https://www.cnss.nat.tn",
          description: "Prestations de sécurité sociale",
          verified: true
        },
        {
          name: "Programme National d'Aide aux Familles Nécessiteuses",
          url: "https://www.pnafn.nat.tn",
          description: "Aides sociales et programmes de soutien",
          verified: true
        }
      ]
    },
    {
      title: "Éducation et formation",
      icon: BookOpen,
      links: [
        {
          name: "Ministère de l'Éducation",
          url: "https://www.education.gov.tn",
          description: "Système éducatif et droits des élèves",
          verified: true
        },
        {
          name: "Agence Tunisienne de Formation Professionnelle",
          url: "https://www.atfp.nat.tn",
          description: "Formation professionnelle et insertion",
          verified: true
        },
        {
          name: "Centre National des Technologies en Éducation",
          url: "https://www.cnte.tn",
          description: "Ressources éducatives numériques",
          verified: true
        }
      ]
    }
  ];

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
              <BreadcrumbPage>Liens Utiles</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Liens Utiles</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Répertoire complet des sites web et ressources externes pour vous aider dans vos démarches liées aux droits fondamentaux.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un site ou organisation..." className="pl-10" />
          </div>
        </div>

        {/* Links Categories */}
        <div className="space-y-8">
          {linkCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-semibold">{category.title}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {category.links.map((link, linkIndex) => (
                    <Card key={linkIndex} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            {link.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {link.verified && (
                              <Badge variant="default" className="text-xs">Vérifié</Badge>
                            )}
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <CardDescription>{link.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          asChild 
                          className="w-full"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            Visiter le site
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <Card className="bg-primary/5 border-primary/20 mt-12">
          <CardHeader className="text-center">
            <CardTitle>Suggérer un lien</CardTitle>
            <CardDescription>
              Connaissez-vous une ressource utile qui devrait figurer dans cette liste ?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/contact">
              <Button>Proposer un lien</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default LiensUtiles;