import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Building, MapPin, Map, ChevronRight, User, Home, Gavel, BookOpen, Tag, Info, Mail, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

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
        <header className="bg-white h-16 sm:h-20 flex items-center justify-center relative border-b border-border shadow-sm">
          <div className="text-center">
            {/* Actual JustClic Logo */}
            <div className="flex items-center justify-center mb-1">
              <img 
                src="/Feelinx_upload/justclic-logo.png" 
                alt="JustClic.tn" 
                className="h-8 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-primary text-xs font-medium hidden sm:block">Information citoyenne simplifiée</p>
          </div>
          
          {/* Language Switcher */}
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex items-center">
            <div className="flex items-center bg-muted rounded-full p-1">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium">
                FR
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-transparent rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm">
                AR
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - Split Screen */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Section (Desktop) / Top Section (Mobile) - Blue Background - Legal Observatory */}
          <Link to="/observatoire" className="w-full h-1/2 lg:w-1/2 lg:h-full bg-gradient-to-b lg:bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col relative hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center justify-center px-4 sm:px-8 h-full">
              {/* ODF Logo */}
              <div className="mb-2 sm:mb-3">
                <img 
                  src="/Feelinx_upload/odf-logo.png" 
                  alt="Observatoire des Droits" 
                  className="h-8 sm:h-12 w-auto object-contain max-w-full"
                />
              </div>
              
              <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center mb-4 sm:mb-8 max-w-md leading-tight">
                Observatoire<br className="sm:hidden" />
                <span className="hidden sm:inline"> des</span> Droits
              </h2>
              
              <div className="w-full max-w-sm sm:max-w-md space-y-3 sm:space-y-4">
                {/* Search Bar */}
                <Button className="w-full h-12 sm:h-14 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg border-0 flex items-center justify-center gap-3 transition-all hover:scale-105">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm sm:text-base">Rechercher une décision</span>
                </Button>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-center text-center">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                        <h3 className="font-semibold text-xs sm:text-sm text-card-foreground mb-1">Textes</h3>
                        <p className="text-xs text-muted-foreground">Constitution</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-center text-center">
                        <Building className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                        <h3 className="font-semibold text-xs sm:text-sm text-card-foreground mb-1">Juridictions</h3>
                        <p className="text-xs text-muted-foreground">Tribunaux</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Section (Desktop) / Bottom Section (Mobile) - Yellow Background - Citizen Access */}
          <Link to="/acces-aux-droits" className="w-full h-1/2 lg:w-1/2 lg:h-full bg-gradient-to-b lg:bg-gradient-to-l from-yellow-50 to-yellow-100 flex flex-col relative hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center justify-center px-4 sm:px-8 h-full">
              {/* Accès aux Droits Logo */}
              <div className="mb-2 sm:mb-3">
                <img 
                  src="/Feelinx_upload/logo-acces-aux-droits.png" 
                  alt="Accès aux Droits" 
                  className="h-8 sm:h-12 w-auto object-contain max-w-full"
                />
              </div>
              
              <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center mb-4 sm:mb-8 max-w-md leading-tight">
                Accès aux Droits
              </h2>

              <div className="w-full max-w-sm sm:max-w-md space-y-3 sm:space-y-4">
                {/* Quick Access Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm text-card-foreground mb-1">Guides</h3>
                        <p className="text-xs text-muted-foreground">Pratiques</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-center text-center">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                        <h3 className="font-semibold text-xs sm:text-sm text-card-foreground mb-1">Services</h3>
                        <p className="text-xs text-muted-foreground">Proximité</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Interactive Map Button */}
                <Button className="w-full h-12 sm:h-14 bg-white hover:bg-accent/50 text-foreground border border-border rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-105">
                  <Map className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm sm:text-base">Carte interactive</span>
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-border py-3 sm:py-6 shadow-sm">
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
              <a href="#" className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Accueil
              </a>
              <a href="#" className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors">
                Décisions
              </a>
              <a href="#" className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors">
                Droits
              </a>
              <a href="#" className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors">
                À propos
              </a>
              <a href="#" className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
