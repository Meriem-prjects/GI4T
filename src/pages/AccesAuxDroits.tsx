import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Map, Video, FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const AccesAuxDroits = () => {
  return (
    <>
      {/* Quick Access Cards */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12">Accès rapide</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link to="/acces-aux-droits/guides-pratiques">
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

            <Link to="/acces-aux-droits/ressources-pratiques">
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

            <Link to="/acces-aux-droits/carte-interactive">
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

            <Link to="/acces-aux-droits/mediatheque">
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
      <section className="py-8 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12">Vos droits par catégorie</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    </>
  );
};

export default AccesAuxDroits;