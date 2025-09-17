import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, Home, Search, BookOpen, Users, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const PlanDuSite = () => {
  const siteStructure = [
    {
      section: "Accueil",
      icon: <Home className="h-5 w-5" />,
      pages: [
        { title: "Page d'accueil", path: "/", description: "Page d'accueil principale" },
        { title: "Observatoire", path: "/observatoire", description: "Interface de recherche jurisprudentielle" }
      ]
    },
    {
      section: "Accès aux droits (Citoyens)",
      icon: <BookOpen className="h-5 w-5" />,
      pages: [
        { title: "Accueil Accès aux droits", path: "/acces-aux-droits", description: "Hub principal pour les citoyens" },
        { title: "Guides pratiques", path: "/acces-aux-droits/guides-pratiques", description: "Guides step-by-step pour exercer ses droits" },
        { title: "Ressources pratiques", path: "/acces-aux-droits/ressources-pratiques", description: "Modèles, formulaires et documents" },
        { title: "Carte interactive", path: "/acces-aux-droits/carte-interactive", description: "Localisation des services d'aide" },
        { title: "Médiathèque", path: "/acces-aux-droits/mediatheque", description: "Vidéos, audios et contenus pédagogiques" }
      ]
    },
    {
      section: "Base documentaire",
      icon: <Search className="h-5 w-5" />,
      pages: [
        { title: "Recherche avancée", path: "/recherche-avancee", description: "Moteur de recherche multicritères" },
        { title: "Résultats de recherche", path: "/search-results", description: "Affichage des résultats de recherche" },
        { title: "Détail d'une décision", path: "/decision/:id", description: "Page détaillée d'une décision juridique", dynamic: true },
        { title: "Textes fondamentaux", path: "/textes-fondamentaux", description: "Corpus des textes de référence" },
        { title: "Analyses & Opinions", path: "/analyses-opinions", description: "Analyses expertes et opinions" },
        { title: "Actualités", path: "/actualites", description: "Actualités juridiques et institutionnelles" }
      ]
    },
    {
      section: "Institutionnel",
      icon: <Users className="h-5 w-5" />,
      pages: [
        { title: "À propos", path: "/a-propos", description: "Présentation de l'Observatoire" },
        { title: "Qui sommes-nous", path: "/qui-sommes-nous", description: "Équipe et collaborateurs" },
        { title: "Méthodologie", path: "/methodologie", description: "Approche scientifique et méthodes" },
        { title: "ODF & Partenaires", path: "/odf-partenaires", description: "Réseau de partenaires institutionnels" }
      ]
    },
    {
      section: "Contact & Légal",
      icon: <Phone className="h-5 w-5" />,
      pages: [
        { title: "Contact", path: "/contact", description: "Formulaire de contact et coordonnées" },
        { title: "Mentions légales", path: "/mentions-legales", description: "Informations légales obligatoires" },
        { title: "Plan du site", path: "/plan-du-site", description: "Cette page - structure complète du site" }
      ]
    }
  ];

  const stats = [
    { label: "Pages principales", value: "20+" },
    { label: "Sections thématiques", value: "5" },
    { label: "Pages dynamiques", value: "3" },
    { label: "Langues disponibles", value: "2" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/observatoire" className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
                <p className="text-sm text-muted-foreground">Plan du site</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">العربية</Button>
              <Link to="/acces-aux-droits">
                <Button variant="ghost" size="sm">Accès aux Droits</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/observatoire">Observatoire</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Plan du site</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Map className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Plan du site</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Structure complète et navigation du site de l'Observatoire des Droits Fondamentaux
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Site Structure */}
        <div className="space-y-8">
          {siteStructure.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  {section.icon}
                  {section.section}
                  <Badge variant="outline">{section.pages.length} pages</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.pages.map((page, pageIndex) => (
                    <div key={pageIndex} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            {page.dynamic ? (
                              <span>{page.title}</span>
                            ) : (
                              <Link 
                                to={page.path} 
                                className="hover:text-primary transition-colors"
                              >
                                {page.title}
                              </Link>
                            )}
                            {page.dynamic && <Badge variant="secondary" className="text-xs">Dynamique</Badge>}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                          <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                            {page.path}
                          </code>
                        </div>
                        {!page.dynamic && (
                          <Link to={page.path}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tips */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>Navigation et accessibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Principales entrées</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <strong>Observatoire :</strong> Interface de recherche et base documentaire
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <strong>Accès aux droits :</strong> Ressources pratiques pour citoyens
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <strong>Recherche avancée :</strong> Moteur de recherche multicritères
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <strong>Guides pratiques :</strong> Accompagnement étape par étape
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Fonctionnalités</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                      Navigation multilingue (FR/AR)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                      Recherche contextuelle sur chaque page
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                      Fil d'Ariane sur toutes les pages
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                      Liens vers les réseaux sociaux
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12">
          <Card className="inline-block p-6">
            <h3 className="font-semibold mb-2">Besoin d'aide pour naviguer ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notre équipe est disponible pour vous guider dans l'utilisation du site
            </p>
            <Link to="/contact">
              <Button>Nous contacter</Button>
            </Link>
          </Card>
        </div>

        {/* Last update */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Plan du site mis à jour : Mars 2024</p>
        </div>
      </div>
    </div>
  );
};

export default PlanDuSite;