import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Map, Video, FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const AccesAuxDroits = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Accès aux Droits</h1>
                <p className="text-sm text-muted-foreground">Espace citoyen - Connaître et exercer vos droits</p>
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

      {/* Navigation */}
      <AccesAuxDroitsNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Connaissez vos droits fondamentaux
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Informations pratiques, guides et ressources pour comprendre et exercer vos droits
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un droit, une situation..." 
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Accès rapide</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/guides-pratiques">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Guides pratiques</CardTitle>
                  <CardDescription>
                    Guides step-by-step pour exercer vos droits
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/ressources-pratiques">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Ressources pratiques</CardTitle>
                  <CardDescription>
                    Modèles, formulaires et documents utiles
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/carte-interactive">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Map className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Carte interactive</CardTitle>
                  <CardDescription>
                    Trouvez les services près de chez vous
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/mediatheque">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Médiathèque</CardTitle>
                  <CardDescription>
                    Vidéos explicatives et témoignages
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Rights Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Vos droits par catégorie</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Droit au logement", desc: "Location, expulsion, aides au logement", cases: "156 cas" },
              { title: "Droit au travail", desc: "Emploi, discrimination, conditions de travail", cases: "234 cas" },
              { title: "Droit à la santé", desc: "Accès aux soins, protection sociale", cases: "187 cas" },
              { title: "Droit à l'éducation", desc: "Scolarité, formation professionnelle", cases: "143 cas" },
              { title: "Droits sociaux", desc: "Prestations, handicap, famille", cases: "298 cas" },
              { title: "Liberté d'expression", desc: "Presse, manifestation, association", cases: "89 cas" }
            ].map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category.cases}</span>
                    <Button variant="outline" size="sm">Explorer</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AccesAuxDroits;