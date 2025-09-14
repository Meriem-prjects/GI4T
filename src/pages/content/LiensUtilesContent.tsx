import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Shield, Users, Gavel, Heart, Home, Briefcase, ChevronRight } from "lucide-react";

const LiensUtilesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const linkCategories = [
    {
      title: "Institutions officielles",
      icon: Shield,
      links: [
        {
          name: "Présidence de la République Tunisienne",
          url: "http://www.carthage.tn",
          description: "Site officiel de la Présidence de la République",
          verified: true
        },
        {
          name: "Assemblée des Représentants du Peuple",
          url: "http://www.arp.tn",
          description: "Parlement tunisien - Lois et débats",
          verified: true
        },
        {
          name: "Tribunal Administratif",
          url: "http://www.ta.tn",
          description: "Recours contre les décisions administratives",
          verified: true
        }
      ]
    },
    {
      title: "Droits humains et libertés",
      icon: Users,
      links: [
        {
          name: "Ligue Tunisienne des Droits de l'Homme",
          url: "http://www.ltdh.tn",
          description: "Défense des droits humains en Tunisie",
          verified: true
        },
        {
          name: "Forum Tunisien des Droits Économiques et Sociaux",
          url: "http://www.ftdes.net",
          description: "Droits économiques et sociaux",
          verified: true
        },
        {
          name: "Amnesty International Tunisie",
          url: "https://www.amnesty.org/fr/countries/middle-east-and-north-africa/tunisia/",
          description: "Organisation internationale des droits humains",
          verified: false
        }
      ]
    },
    {
      title: "Justice et aide juridique",
      icon: Gavel,
      links: [
        {
          name: "Ordre des Avocats de Tunis",
          url: "http://www.barreau.org.tn",
          description: "Conseil de l'ordre et annuaire des avocats",
          verified: true
        },
        {
          name: "Ministère de la Justice",
          url: "http://www.e-justice.tn",
          description: "Services de justice électronique",
          verified: true
        },
        {
          name: "Centre d'Information Juridique",
          url: "http://www.legislation.tn",
          description: "Accès aux textes de loi tunisiens",
          verified: true
        }
      ]
    },
    {
      title: "Aide sociale et santé",
      icon: Heart,
      links: [
        {
          name: "Ministère des Affaires Sociales",
          url: "http://www.social.gov.tn",
          description: "Programmes d'aide sociale et de protection",
          verified: true
        },
        {
          name: "Caisse Nationale d'Assurance Maladie",
          url: "http://www.cnam.nat.tn",
          description: "Couverture maladie et remboursements",
          verified: true
        },
        {
          name: "Croissant-Rouge Tunisien",
          url: "http://www.croissantrouge.tn",
          description: "Aide humanitaire et assistance sociale",
          verified: false
        }
      ]
    },
    {
      title: "Logement et urbanisme",
      icon: Home,
      links: [
        {
          name: "Ministère de l'Équipement et de l'Habitat",
          url: "http://www.equipement.tn",
          description: "Politiques de logement et d'aménagement",
          verified: true
        },
        {
          name: "Société Nationale Immobilière de Tunisie",
          url: "http://www.snit.tn",
          description: "Logements sociaux et programmes immobiliers",
          verified: true
        },
        {
          name: "Agence Foncière d'Habitation",
          url: "http://www.afh.tn",
          description: "Promotion du logement social",
          verified: false
        }
      ]
    },
    {
      title: "Emploi et formation",
      icon: Briefcase,
      links: [
        {
          name: "Agence Nationale pour l'Emploi et le Travail Indépendant",
          url: "http://www.aneti.com.tn",
          description: "Recherche d'emploi et formation professionnelle",
          verified: true
        },
        {
          name: "Union Générale Tunisienne du Travail",
          url: "http://www.ugtt.org.tn",
          description: "Syndicat des travailleurs - Défense des droits",
          verified: true
        },
        {
          name: "Ministère de la Formation Professionnelle et de l'Emploi",
          url: "http://www.emploi.gov.tn",
          description: "Politiques d'emploi et de formation",
          verified: true
        }
      ]
    }
  ];

  const filteredCategories = linkCategories.map(category => ({
    ...category,
    links: category.links.filter(link => 
      link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.links.length > 0);

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Accueil</span>
            <ChevronRight className="h-4 w-4" />
            <span>Accès aux droits</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Liens utiles</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Liens Utiles</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez une sélection de sites web essentiels pour vous accompagner dans vos démarches et l'exercice de vos droits.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 animate-fade-in">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Links Categories */}
        <div className="space-y-8 mb-12 animate-fade-in">
          {filteredCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.links.map((link, linkIndex) => (
                    <Card key={linkIndex} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base leading-tight pr-2">{link.name}</CardTitle>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {link.verified && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Vérifié
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm mb-4">
                          {link.description}
                        </CardDescription>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block w-full"
                        >
                          <Button className="w-full" size="sm">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Visiter le site
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggest Link Section */}
        <div className="bg-muted/50 rounded-lg p-6 text-center animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">Suggérer un lien</h3>
          <p className="text-muted-foreground mb-4">
            Vous connaissez un site utile qui devrait figurer dans cette liste ? Partagez-le avec nous !
          </p>
          <Button>
            Suggérer un lien
          </Button>
        </div>
      </div>
    </main>
  );
};

export default LiensUtilesContent;