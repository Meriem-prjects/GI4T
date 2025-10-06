import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CarteInteractiveNav from "@/components/CarteInteractiveNav";
import MediathequeNav from "@/components/MediathequeNav";
import ActualitesNav from "@/components/ActualitesNav";
import FAQNav from "@/components/FAQNav";
import Footer from "@/components/Footer";

const AccesAuxDroitsLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Determine which sub-navigation to show based on current route
  const getSubNav = () => {
    if (location.pathname.includes('/carte-interactive') || location.pathname.includes('/adresses-utiles')) {
      return <CarteInteractiveNav />;
    } else if (location.pathname.includes('/mediatheque') || location.pathname.includes('/albums-photos')) {
      return <MediathequeNav />;
    } else if (location.pathname.includes('/actualites') || location.pathname.includes('/ressources-pratiques') || 
               location.pathname.includes('/liens-utiles') || location.pathname.includes('/guides-pratiques')) {
      return <ActualitesNav />;
    } else if (location.pathname.includes('/foire-aux-questions') || location.pathname.includes('/assistant-virtuel')) {
      return <FAQNav />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/acces-aux-droits" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity duration-200">
                <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-6 sm:h-8 md:h-12" />
                <div>
                  <h1 className="text-sm sm:text-base md:text-2xl font-bold text-foreground">Accès aux Droits</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Espace citoyen</p>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              <Link to="/acces-aux-droits/carte-interactive" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Carte interactive
              </Link>
              <Link to="/acces-aux-droits/mediatheque" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Médiathèque
              </Link>
              <Link to="/acces-aux-droits/actualites" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Actualités
              </Link>
              <Link to="/acces-aux-droits/foire-aux-questions" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                FAQ/Chat
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
              <Link to="/acces-aux-droits">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Observatoire
                </Button>
              </Link>
            </div>
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
                  <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-6 sm:h-8 w-auto" />
                  <h2 className="font-bold text-primary">Accès aux Droits</h2>
                </div>
                <nav className="flex flex-col space-y-2 mt-4 px-4">
                  <Link to="/acces-aux-droits" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Accueil</Link>
                  <Link to="/acces-aux-droits/carte-interactive" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Carte interactive</Link>
                  <Link to="/acces-aux-droits/adresses-utiles" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Adresses utiles</Link>
                  <Link to="/acces-aux-droits/mediatheque" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Médiathèque</Link>
                  <Link to="/acces-aux-droits/albums-photos" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Albums photos</Link>
                  <Link to="/acces-aux-droits/actualites" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Actualités</Link>
                  <Link to="/acces-aux-droits/foire-aux-questions" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">FAQ</Link>
                  <Link to="/acces-aux-droits/assistant-virtuel" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Assistant Virtuel</Link>
                  <Link to="/acces-aux-droits/ressources-pratiques" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Ressources pratiques</Link>
                  <Link to="/acces-aux-droits/liens-utiles" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Liens utiles</Link>
                  <Link to="/acces-aux-droits/guides-pratiques" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Guides pratiques</Link>
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
      </header>

      {/* Sub-navigation - changes based on route */}
      {getSubNav()}

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccesAuxDroitsLayout;
