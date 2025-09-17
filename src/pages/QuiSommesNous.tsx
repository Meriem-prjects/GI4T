import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const QuiSommesNous = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            <span>›</span>
            <Link to="/information/qui-sommes-nous" className="hover:text-primary">Information</Link>
            <span>›</span>
            <span className="text-foreground">Qui sommes-nous</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Qui sommes-nous ?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            JustClic.tn est une plateforme citoyenne dédiée à simplifier l'accès à l'information juridique et aux droits fondamentaux en Tunisie.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Notre Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Démocratiser l'accès à l'information juridique et faciliter l'exercice des droits fondamentaux 
                  pour tous les citoyens tunisiens, en simplifiant des procédures complexes et en fournissant 
                  des ressources pratiques et accessibles.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Notre Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Créer une société tunisienne où chaque citoyen connaît ses droits, peut les exercer pleinement 
                  et a accès à une justice équitable, grâce à une information claire, fiable et facilement accessible.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">Nos Valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Accessibilité</h3>
                <p className="text-muted-foreground text-sm">
                  Information simple et compréhensible pour tous
                </p>
              </div>
              <div className="text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Transparence</h3>
                <p className="text-muted-foreground text-sm">
                  Sources fiables et vérifiées
                </p>
              </div>
              <div className="text-center">
                <Target className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Engagement</h3>
                <p className="text-muted-foreground text-sm">
                  Soutien constant aux citoyens
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">Notre Équipe</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>Experts Juridiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Avocats et juristes spécialisés dans le droit tunisien
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>Développeurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Équipe technique dédiée à l'amélioration continue de la plateforme
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>Communauté</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Citoyens actifs contribuant à l'enrichissement du contenu
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Rejoignez notre mission
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ensemble, construisons une Tunisie où l'information juridique est accessible à tous. 
            Explorez nos ressources et découvrez comment exercer vos droits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/observatoire">
              <Button size="lg">
                Découvrir l'Observatoire
              </Button>
            </Link>
            <Link to="/acces-aux-droits">
              <Button variant="outline" size="lg">
                Accéder aux Ressources
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuiSommesNous;