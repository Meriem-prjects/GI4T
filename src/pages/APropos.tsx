import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Target, Eye, Users, Award, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const APropos = () => {
  const achievements = [
    { number: "15,247", label: "Décisions analysées", description: "Base documentaire complète" },
    { number: "35", label: "Droits fondamentaux", description: "Couverture exhaustive" },
    { number: "127", label: "Juridictions", description: "Nationales et internationales" },
    { number: "50+", label: "Experts contributeurs", description: "Réseau multidisciplinaire" }
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Indépendance",
      description: "Analyse objective et impartiale des décisions de justice, sans influence politique ou partisane."
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Transparence",
      description: "Méthodologie ouverte et données accessibles pour garantir la fiabilité de nos analyses."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Accessibilité",
      description: "Information juridique rendue compréhensible pour tous les citoyens et professionnels."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Excellence",
      description: "Standards élevés de recherche et d'analyse grâce à notre réseau d'experts reconnus."
    }
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
                <p className="text-sm text-muted-foreground">À propos</p>
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
              <BreadcrumbPage>À propos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-6">À propos de l'Observatoire des Droits Fondamentaux</h1>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                L'Observatoire des Droits Fondamentaux (ODF) est une initiative de recherche et de documentation 
                dédiée à l'analyse systématique des décisions de justice relatives aux droits fondamentaux au Maroc 
                et dans la région MENA.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Créé en partenariat avec des institutions académiques et de la société civile, l'ODF constitue 
                une ressource unique pour comprendre l'évolution de la jurisprudence en matière de droits humains.
              </p>
              <div className="flex gap-4">
                <Link to="/qui-sommes-nous">
                  <Button>
                    Découvrir l'équipe
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/methodologie">
                  <Button variant="outline">
                    Notre méthodologie
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rendre accessible l'information juridique sur les droits fondamentaux à travers une analyse 
                rigoureuse et indépendante de la jurisprudence, favorisant ainsi une meilleure compréhension 
                et protection des droits humains.
              </p>
            </div>
          </div>
        </div>

        {/* Key Figures */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">L'ODF en chiffres</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">{achievement.number}</CardTitle>
                  <CardDescription className="font-semibold">{achievement.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Nos valeurs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">{value.icon}</div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Une approche collaborative</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                L'ODF s'appuie sur un réseau de partenaires institutionnels et associatifs pour garantir 
                la qualité et la pertinence de ses analyses
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold mb-2">Partenaires académiques</h4>
                  <p className="text-sm text-muted-foreground">Universités et centres de recherche</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Société civile</h4>
                  <p className="text-sm text-muted-foreground">ONG et associations de défense des droits</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Experts</h4>
                  <p className="text-sm text-muted-foreground">Juristes et spécialistes reconnus</p>
                </div>
              </div>
              <Link to="/odf-partenaires">
                <Button>
                  Voir tous nos partenaires
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Impact */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Notre impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Recherche</Badge>
                  Publications scientifiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 45 analyses approfondies publiées</li>
                  <li>• 12 rapports thématiques annuels</li>
                  <li>• 8 articles dans des revues spécialisées</li>
                  <li>• Participation à 15 conférences internationales</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Formation</Badge>
                  Renforcement des capacités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 250+ juristes formés aux droits fondamentaux</li>
                  <li>• 30 ateliers de formation organisés</li>
                  <li>• 15 universités partenaires</li>
                  <li>• 5 programmes de recherche soutenus</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8 max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Rejoignez notre mission</h3>
            <p className="text-muted-foreground mb-6">
              Contribuez à la protection et à la promotion des droits fondamentaux en vous joignant à notre communauté
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button>Nous contacter</Button>
              </Link>
              <Link to="/odf-partenaires">
                <Button variant="outline">Devenir partenaire</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default APropos;