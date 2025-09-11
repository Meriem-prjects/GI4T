import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Users, Target, BookOpen, Award, Globe, Building, Heart, Mail } from "lucide-react";

const ODFPartenaires = () => {
  const teamMembers = [
    {
      name: "Prof. Ahmed Ben Salem",
      role: "Directeur Scientifique",
      expertise: "Droit constitutionnel, Droits de l'homme",
      description: "Professeur de droit constitutionnel à l'Université de Tunis, expert en droits fondamentaux"
    },
    {
      name: "Dr. Fatma Kallel", 
      role: "Responsable Recherche",
      expertise: "Droit administratif, Libertés publiques",
      description: "Docteur en droit, spécialisée dans l'analyse des politiques publiques et libertés"
    },
    {
      name: "Me. Karim Essid",
      role: "Coordinateur Juridique", 
      expertise: "Droit pénal, Procédures judiciaires",
      description: "Avocat au barreau de Tunis, expert en procédures et droits de la défense"
    }
  ];

  const partners = [
    {
      name: "Ministère de la Justice",
      type: "Institutionnel",
      description: "Partenariat pour l'accès aux décisions de justice et la formation",
      collaboration: "Mise à disposition des décisions, formations communes"
    },
    {
      name: "Université de Tunis", 
      type: "Académique",
      description: "Collaboration pour la recherche et la formation en droits fondamentaux",
      collaboration: "Programmes de recherche, stages étudiants"
    },
    {
      name: "Association Tunisienne des Droits de l'Homme",
      type: "Associatif",
      description: "Partenariat pour la sensibilisation et la défense des droits",
      collaboration: "Campagnes d'information, événements publics"
    },
    {
      name: "Union Européenne",
      type: "International", 
      description: "Soutien financier et technique pour le développement de l'observatoire",
      collaboration: "Financement de projets, échanges d'expertise"
    }
  ];

  const methodology = [
    {
      title: "Collecte des données",
      description: "Rassemblement systématique des décisions de justice et textes juridiques",
      icon: BookOpen
    },
    {
      title: "Analyse juridique",
      description: "Étude approfondie par nos experts pour identifier les évolutions",
      icon: Users
    },
    {
      title: "Validation scientifique", 
      description: "Processus de relecture et validation par le comité scientifique",
      icon: Award
    },
    {
      title: "Publication et diffusion",
      description: "Mise à disposition du public via notre plateforme numérique",
      icon: Globe
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
                <Link to="/textes-fondamentaux" className="text-sm hover:text-primary transition-colors">Textes fondamentaux</Link>
                <Link to="/analyses-opinions" className="text-sm hover:text-primary transition-colors">Analyses & Opinions</Link>
                <Link to="/actualites" className="text-sm hover:text-primary transition-colors">Actualités</Link>
                <a href="#" className="text-sm text-primary font-medium">À propos</a>
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
              <BreadcrumbPage>ODF & Partenaires</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">ODF & Partenaires</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez l'Observatoire des Droits Fondamentaux, son équipe d'experts, 
            sa méthodologie et ses partenaires institutionnels et associatifs.
          </p>
        </section>

        {/* Mission & Objectifs */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Notre Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  L'Observatoire des Droits Fondamentaux a pour mission de faciliter l'accès 
                  à la justice et aux informations juridiques en Tunisie. Nous collectons, 
                  analysons et diffusons les décisions de justice, textes fondamentaux et 
                  analyses juridiques pour promouvoir une meilleure compréhension des droits 
                  et libertés de chacun.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Nos Objectifs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Démocratiser l'accès au droit et à la jurisprudence</li>
                  <li>• Analyser l'évolution des droits fondamentaux</li>
                  <li>• Sensibiliser le public aux enjeux juridiques</li>
                  <li>• Accompagner les professionnels du droit</li>
                  <li>• Contribuer au débat public sur la justice</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Méthodologie */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Notre Méthodologie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodology.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="text-center relative">
                  <CardHeader>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex justify-center mb-3 mt-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{step.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Équipe scientifique */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Équipe Scientifique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.name} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    <strong>Expertise:</strong> {member.expertise}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partenaires */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Nos Partenaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <Card key={partner.name} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Building className="w-6 h-6 text-primary" />
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{partner.type}</Badge>
                  </div>
                  <CardDescription>
                    {partner.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Collaboration:</strong> {partner.collaboration}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-muted rounded-xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">Nous Contacter</h3>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Vous souhaitez collaborer avec l'ODF, proposer un partenariat ou obtenir 
            plus d'informations sur nos activités ? N'hésitez pas à nous contacter.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">
              Prendre contact
            </Link>
          </Button>
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

export default ODFPartenaires;