import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const AccesAuxDroitsLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/acces-aux-droits" 
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mr-2 sm:mr-4"
              >
                ←
              </Link>
              <Link to="/acces-aux-droits" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity duration-200">
                <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-3 sm:h-6" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">Accès aux Droits</h1>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Observatoire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <AccesAuxDroitsNav />

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccesAuxDroitsLayout;