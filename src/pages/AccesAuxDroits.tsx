import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Map, Video, FileText, Scale, Menu, History, Bookmark, Globe, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const AccesAuxDroits = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-8 sm:h-12" />
              <div>
                <h1 className="text-base sm:text-2xl font-bold text-foreground">Accès aux Droits</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Espace citoyen - Connaître et exercer vos droits</p>
              </div>
            </div>
            
            {/* Desktop Quick Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>1,247 guides</span>
              </div>
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Favoris
              </Button>
            </div>

            <div className="flex items-center ml-auto">
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Globe className="h-4 w-4 mr-2" />
                  العربية
                </Button>
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
                      <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-8 w-auto" />
                      <h2 className="font-bold text-primary">Droits</h2>
                    </div>
                    <nav className="flex flex-col space-y-2 mt-4 px-4">
                      <Link to="/" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Accueil</Link>
                      <a href="#" className="text-base text-primary p-2 rounded-lg bg-muted font-medium">Accès aux Droits</a>
                      <Link to="/guides-pratiques" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Guides pratiques</Link>
                      <Link to="/ressources-pratiques" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Ressources pratiques</Link>
                      <Link to="/carte-interactive" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Carte interactive</Link>
                      <Link to="/mediatheque" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Médiathèque</Link>
                      <Link to="/publications" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Publications</Link>
                      <Link to="/liens-utiles" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Liens utiles</Link>
                      <Link to="/albums-photos" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Albums photos</Link>
                      <Link to="/partenaires" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Partenaires</Link>
                      <Link to="/chatbot-faq" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">FAQ</Link>
                      <Link to="/contact" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Contact</Link>
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
        
        {/* Breadcrumb Navigation */}
        <div className="hidden md:block border-t bg-muted/30">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Accueil</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Accès aux Droits</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <AccesAuxDroitsNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
            Connaissez vos droits fondamentaux
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Informations pratiques, guides et ressources pour comprendre et exercer vos droits
          </p>
          <div className="max-w-sm sm:max-w-md mx-auto px-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un droit..." 
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12">Accès rapide</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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