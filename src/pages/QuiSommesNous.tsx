import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Mail, Linkedin, ExternalLink, Users, GraduationCap, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const QuiSommesNous = () => {
  const teamMembers = [
    {
      name: "Pr. Amina Benali",
      role: "Directrice scientifique",
      institution: "Université Mohammed V - Rabat",
      expertise: ["Droit constitutionnel", "Droits fondamentaux", "Droit comparé"],
      bio: "Professeure de droit constitutionnel, spécialiste des droits fondamentaux avec plus de 20 ans d'expérience en recherche et enseignement.",
      photo: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Hassan Alami",
      role: "Coordinateur de recherche",
      institution: "Institut de recherche juridique",
      expertise: ["Droit administratif", "Justice constitutionnelle", "Méthodologie juridique"],
      bio: "Expert en droit administratif et en analyse jurisprudentielle, ancien magistrat et consultant international.",
      photo: "/api/placeholder/150/150"
    },
    {
      name: "Pr. Fatima Zohra Bennani",
      role: "Responsable partenariats",
      institution: "Université Hassan II - Casablanca",
      expertise: ["Droits sociaux", "Droit du travail", "Égalité des genres"],
      bio: "Spécialiste des droits sociaux et de l'égalité, active dans plusieurs organisations de défense des droits humains.",
      photo: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Omar Tazi",
      role: "Analyste principal",
      institution: "Barreau de Casablanca",
      expertise: ["Droit pénal", "Libertés publiques", "Procédure judiciaire"],
      bio: "Avocat au barreau de Casablanca, expert en libertés publiques et procédures judiciaires.",
      photo: "/api/placeholder/150/150"
    },
    {
      name: "Me. Aicha Benomar",
      role: "Juriste senior",
      institution: "Cabinet d'avocats spécialisé",
      expertise: ["Droit de la famille", "Droit des femmes", "Médiation"],
      bio: "Avocate spécialisée en droit de la famille et droits des femmes, médiatrice certifiée.",
      photo: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Youssef Benali",
      role: "Coordonnateur technique",
      institution: "Institut national de recherche",
      expertise: ["Technologies juridiques", "Bases de données", "Analyse quantitative"],
      bio: "Expert en technologies de l'information appliquées au droit, responsable de l'infrastructure technique de l'ODF.",
      photo: "/api/placeholder/150/150"
    }
  ];

  const advisoryBoard = [
    {
      name: "Pr. Driss Alaoui",
      role: "Président du conseil scientifique",
      institution: "Ancien Doyen, Faculté de Droit de Rabat"
    },
    {
      name: "Me. Latifa Jbabdi",
      role: "Membre du conseil",
      institution: "Union de l'Action Féminine"
    },
    {
      name: "Dr. Ahmed Herzenni",
      role: "Membre du conseil",
      institution: "Ancien Président du CNDH"
    },
    {
      name: "Pr. Khadija Elmadmad",
      role: "Membre du conseil",
      institution: "Université Mohammed V - Agdal"
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
                <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">Qui sommes-nous</h1>
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
              <BreadcrumbPage>Qui sommes-nous</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Qui sommes-nous</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Une équipe multidisciplinaire d'experts dédiés à l'analyse et à la promotion des droits fondamentaux
          </p>
        </div>

        {/* Team Overview */}
        <div className="mb-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card className="text-center">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Expertise académique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Professeurs et chercheurs issus des meilleures universités marocaines et internationales
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Expérience pratique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Avocats, magistrats et praticiens du droit avec une solide expérience du terrain
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Engagement citoyen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acteurs de la société civile et défenseurs des droits humains reconnus
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Team */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Équipe principale</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium">{member.role}</CardDescription>
                  <Badge variant="outline" className="text-xs">{member.institution}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2">Expertises:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advisory Board */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Conseil scientifique</CardTitle>
              <CardDescription>
                Des personnalités reconnues qui orientent et valident nos travaux de recherche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {advisoryBoard.map((member, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">{member.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collaborators */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Réseau de collaborateurs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Experts associés</CardTitle>
                <CardDescription>Spécialistes ponctuels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-2">25+</div>
                <p className="text-sm text-muted-foreground">
                  Juristes, sociologues, politologues qui contribuent selon leur expertise
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jeunes chercheurs</CardTitle>
                <CardDescription>Doctorants et post-docs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-2">15</div>
                <p className="text-sm text-muted-foreground">
                  Étudiants chercheurs qui participent aux projets de l'observatoire
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Praticiens</CardTitle>
                <CardDescription>Terrain et application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-2">30+</div>
                <p className="text-sm text-muted-foreground">
                  Avocats, magistrats, fonctionnaires qui enrichissent nos analyses
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8 max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Rejoindre l'équipe</h3>
            <p className="text-muted-foreground mb-6">
              Vous êtes expert en droits fondamentaux et souhaitez contribuer à nos travaux ? 
              Nous sommes toujours à la recherche de nouveaux talents.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button>
                  Nous rejoindre
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/methodologie">
                <Button variant="outline">Notre méthodologie</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuiSommesNous;