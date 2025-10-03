import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Map, Video, FileText, Scale, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const AccesAuxDroits = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-3 sm:h-6" />
              <div>
                <h1 className="text-base sm:text-2xl font-bold text-foreground">Accès aux Droits</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/acces-aux-droits/carte-interactive" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Carte interactive
              </Link>
              <Link to="/acces-aux-droits/mediatheque" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Médiathèque
              </Link>
              <Link to="/acces-aux-droits/actualites" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Actualités
              </Link>
            </nav>
            
            <div className="flex items-center ml-auto">
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
                <Link to="/observatoire">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Observatoire</Button>
                </Link>
              </div>
              
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden p-2 absolute right-4 top-3">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 p-4 border-b">
                      <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-3 sm:h-6 w-auto" />
                      <h2 className="font-bold text-primary">Droits</h2>
                    </div>
                    <nav className="flex flex-col space-y-2 mt-4 px-4">
                      <Link to="/" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Accueil</Link>
                      <a href="#" className="text-base text-primary p-2 rounded-lg bg-muted font-medium">Accès aux Droits</a>
                      <Link to="/acces-aux-droits/guides-pratiques" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Guides pratiques</Link>
                      <Link to="/acces-aux-droits/ressources-pratiques" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Ressources pratiques</Link>
                      <Link to="/acces-aux-droits/carte-interactive" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Carte interactive</Link>
                      <Link to="/acces-aux-droits/mediatheque" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Médiathèque</Link>
                      <Link to="/acces-aux-droits/publications" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Publications</Link>
                      <Link to="/acces-aux-droits/liens-utiles" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Liens utiles</Link>
                      <Link to="/acces-aux-droits/albums-photos" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Albums photos</Link>
                      <div className="border-t pt-4 mt-4">
                        <Link to="/observatoire" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted flex items-center">
                          <span>→ Observatoire</span>
                        </Link>
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <AccesAuxDroitsNav />


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

      <Footer />
    </div>
  );
};

export default AccesAuxDroits;