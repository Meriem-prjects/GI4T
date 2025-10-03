import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";
import { Home } from "lucide-react";
import ActualitesNav from "@/components/ActualitesNav";
import Footer from "@/components/Footer";

const ActualitesLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/acces-aux-droits" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity duration-200">
                <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-8 sm:h-12" />
                <div>
                  <h1 className="text-base sm:text-2xl font-bold text-foreground">Accès aux Droits</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Espace citoyen</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center ml-auto">
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                <Link to="/acces-aux-droits/carte-interactive" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                  Carte interactive
                </Link>
                <Link to="/acces-aux-droits/mediatheque" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                  Médiathèque
                </Link>
                <Link to="/acces-aux-droits/actualites" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                  Actualités
                </Link>
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
          </div>
        </div>
      </header>

      {/* Navigation */}
      <ActualitesNav />

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ActualitesLayout;
