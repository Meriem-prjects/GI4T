import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, FileText, BarChart3, CheckCircle, BookOpen, Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Methodologie = () => {
  const phases = [
    {
      phase: "1",
      title: "Collecte des décisions",
      icon: <Search className="h-8 w-8 text-primary" />,
      description: "Identification et collecte systématique des décisions pertinentes",
      details: [
        "Veille jurisprudentielle continue",
        "Sources multiples : nationales et internationales",
        "Critères de sélection prédéfinis",
        "Validation par l'équipe scientifique"
      ]
    },
    {
      phase: "2",
      title: "Analyse juridique",
      icon: <FileText className="h-8 w-8 text-primary" />,
      description: "Analyse approfondie du contenu et de la portée des décisions",
      details: [
        "Grille d'analyse standardisée",
        "Identification des droits concernés",
        "Analyse du raisonnement juridique",
        "Évaluation de l'impact potentiel"
      ]
    },
    {
      phase: "3",
      title: "Catégorisation",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      description: "Classification selon notre système de droits fondamentaux",
      details: [
        "35 catégories de droits fondamentaux",
        "Taxonomie juridictionnelle",
        "Indexation par mots-clés",
        "Métadonnées enrichies"
      ]
    },
    {
      phase: "4",
      title: "Validation",
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      description: "Contrôle qualité et validation par les pairs",
      details: [
        "Relecture par minimum 2 experts",
        "Validation du conseil scientifique",
        "Cohérence avec la base existante",
        "Correction et enrichissement"
      ]
    }
  ];

  const criteria = [
    {
      category: "Juridictions couvertes",
      items: [
        "Cour constitutionnelle",
        "Cour de cassation",
        "Conseil d'État",
        "Cours d'appel",
        "Tribunaux de première instance",
        "Juridictions spécialisées",
        "Cour européenne des droits de l'homme",
        "Comités onusiens"
      ]
    },
    {
      category: "Types de décisions",
      items: [
        "Arrêts définitifs",
        "Jugements de première instance",
        "Ordonnances de référé",
        "Décisions constitutionnelles",
        "Avis consultatifs",
        "Recommandations"
      ]
    },
    {
      category: "Critères de pertinence",
      items: [
        "Impact sur les droits fondamentaux",
        "Nouveauté jurisprudentielle",
        "Portée générale de la décision",
        "Intérêt pédagogique",
        "Évolution de la jurisprudence"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 sm:py-4 relative">
          <div className="flex items-center justify-between">
            <Link to="/observatoire" className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 sm:h-10 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">Méthodologie</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Observatoire des Droits Fondamentaux</p>
              </div>
            </Link>
            
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4 ml-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/acces-aux-droits">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Accès aux Droits</Button>
              </Link>
            </div>

            {/* Mobile: Just the essential navigation */}
            <div className="sm:hidden">
              <Link to="/observatoire">
                <Button variant="ghost" size="sm" className="text-xs px-2">
                  ← Retour
                </Button>
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
              <BreadcrumbPage>Méthodologie</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold">Méthodologie</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Notre approche scientifique rigoureuse pour la collecte, l'analyse et la classification 
            des décisions relatives aux droits fondamentaux
          </p>
        </div>

        {/* Overview */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Approche scientifique</CardTitle>
              <CardDescription className="text-lg">
                L'ODF s'appuie sur une méthodologie éprouvée, développée en collaboration avec des experts 
                internationaux et validée par notre conseil scientifique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">4</div>
                  <p className="text-sm text-muted-foreground">Phases d'analyse</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">35</div>
                  <p className="text-sm text-muted-foreground">Droits fondamentaux</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <p className="text-sm text-muted-foreground">Critères d'analyse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Phases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Processus d'analyse</h2>
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {phase.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-primary text-primary-foreground">Phase {phase.phase}</Badge>
                        <CardTitle className="text-xl">{phase.title}</CardTitle>
                      </div>
                      <CardDescription className="text-lg">{phase.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="ml-20">
                    <ul className="grid md:grid-cols-2 gap-2">
                      {phase.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selection Criteria */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Critères de sélection</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {criteria.map((criterion, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{criterion.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {criterion.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Standards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Standards de qualité</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Contrôle qualité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Double validation :</strong> Chaque analyse est relue par au moins deux experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Cohérence :</strong> Vérification de la cohérence avec la base existante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Actualisation :</strong> Révision périodique des analyses existantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Traçabilité :</strong> Documentation complète du processus d'analyse</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Indicateurs de performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Délai de traitement :</strong> Maximum 30 jours par décision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Taux de validation :</strong> &gt;95% des analyses validées en première lecture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Exhaustivité :</strong> Couverture de 100% des décisions pertinentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Mise à jour :</strong> Base actualisée quotidiennement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tools and Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Outils et ressources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Guide méthodologique complet
                </CardTitle>
                <CardDescription>
                  Documentation détaillée de notre processus d'analyse (120 pages)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>PDF • 2.4 MB • Version 3.2</div>
                    <div>Mis à jour : Mars 2024</div>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  Grille d'analyse standardisée
                </CardTitle>
                <CardDescription>
                  Formulaire d'analyse utilisé par nos experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>Excel • 450 KB • Template</div>
                    <div>Utilisé par 50+ experts</div>
                  </div>
                  <Button variant="secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8 max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Questions sur notre méthodologie ?</h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe est disponible pour répondre à vos questions techniques ou méthodologiques
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button>
                  Nous contacter
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/qui-sommes-nous">
                <Button variant="outline">Rencontrer l'équipe</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Methodologie;