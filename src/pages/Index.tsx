import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Building, MapPin, Map, ChevronRight, User, Home, Gavel, BookOpen, Tag, Info, Mail, Newspaper } from "lucide-react";
import justclicLogo from "../Feelinx_upload/justclic-logo.png";

const Index = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <title>JustClic.tn - Information citoyenne simplifiée | Accès aux droits fondamentaux</title>
      <meta name="description" content="JustClic.tn facilite l'accès aux droits fondamentaux en Tunisie. Observatoire des droits et plateforme citoyenne pour une information simplifiée." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=League+Spartan:wght@600;700&family=Inter:wght@400;500&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="w-full h-screen flex flex-col">
        {/* Header with Logo */}
        <header className="bg-white h-20 flex items-center justify-center relative border-b border-border shadow-sm">
          <div className="text-center">
            {/* Actual JustClic Logo */}
            <div className="flex items-center justify-center mb-1">
              <img 
                src="/lovable-uploads/e9c07c06-5d02-4e3a-a6d8-b04fdb0c7ffa.png" 
                alt="JustClic.tn" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-primary text-xs font-medium">Information citoyenne simplifiée</p>
          </div>
          
          {/* Language Switcher & Login */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-full p-1">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-1 text-sm font-medium">
                FR
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-transparent rounded-full px-4 py-1 text-sm">
                AR
              </Button>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border-border hover:bg-accent">
              <User className="w-4 h-4" />
              Se connecter
            </Button>
          </div>
        </header>

        {/* Main Content - Split Screen */}
        <div className="flex-1 flex">
          {/* Left Section - Blue Background - Legal Observatory */}
          <div className="w-1/2 bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col relative">
            <div className="flex flex-col items-center justify-center px-8 h-full">
              <h2 className="text-primary text-3xl font-spartan font-bold text-center mb-12 max-w-md">
                Observatoire des Droits Fondamentaux
              </h2>
              
              <div className="w-full max-w-md space-y-6">
                {/* Search Bar */}
                <Button className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg border-0 flex items-center justify-center gap-3 transition-all hover:scale-105">
                  <Search className="w-5 h-5" />
                  <span className="font-semibold">Rechercher une décision</span>
                </Button>

                {/* Textes fondamentaux */}
                <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-card-foreground">Textes fondamentaux</h3>
                    </div>
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-primary rounded-sm"></div>
                        <span>Constitution</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-primary rounded-sm"></div>
                        <span>Lois fondamentales</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Juridictions */}
                <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Building className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-card-foreground">Juridictions</h3>
                    </div>
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Conseil constitutionnel</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Tribunal administratif</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Cour de cassation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Section - Yellow Background - Citizen Access */}
          <div className="w-1/2 bg-gradient-to-b from-yellow-50 to-yellow-100 flex flex-col relative">
            <div className="flex flex-col items-center justify-center px-8 h-full">
              <h2 className="text-primary text-3xl font-spartan font-bold text-center mb-12 max-w-md">
                Accès aux droits
              </h2>

              <div className="w-full max-w-md space-y-6">
                {/* Guides pratiques */}
                <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-5 h-5 bg-orange-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-semibold text-card-foreground">Guides pratiques</h3>
                    </div>
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                        <span>Vos droits au quotidien</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                        <span>Publications citoyennes</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Campagnes d'information */}
                <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-card-foreground">Campagnes d'information</h3>
                    </div>
                    
                    <Button className="w-full h-14 bg-white hover:bg-accent/50 text-foreground border border-border rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-105">
                      <Map className="w-5 h-5" />
                      <span className="font-semibold">Carte dynamique interactive</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-border py-6 shadow-sm">
          <div className="flex justify-center gap-20">
            {/* Left Section Navigation */}
            <div className="flex gap-8">
              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Accueil
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Décisions
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Fiches pratiques
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Thématiques
              </a>
            </div>
            {/* Right Section Navigation */}
            <div className="flex gap-8">
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Accès aux droits
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                À propos
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Contact
              </a>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Articles
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
