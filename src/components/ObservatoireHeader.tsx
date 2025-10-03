import { useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ObservatoireHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2 sm:py-4 relative">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 sm:h-12" />
            <div>
              <h1 className="text-base sm:text-2xl font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Surveillance et protection des droits citoyens</p>
            </div>
          </div>
          <div className="flex items-center ml-auto">
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/acces-aux-droits">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Accès aux Droits</Button>
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
                    <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto" />
                    <h2 className="font-bold text-primary">ODF</h2>
                  </div>
                  <nav className="flex flex-col space-y-2 mt-4 px-4">
                    <Link to="/" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Accueil</Link>
                    <Link to="/observatoire" className="text-base text-primary p-2 rounded-lg bg-muted font-medium">Observatoire</Link>
                    <Link to="/observatoire/analyses-opinions" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Analyses & Opinions</Link>
                    <Link to="/observatoire/actualites" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted">Actualités</Link>
                    <div className="border-t pt-4 mt-4">
                      <Link to="/acces-aux-droits" className="text-base hover:text-primary p-2 rounded-lg hover:bg-muted flex items-center">
                        <span>→ Accès aux Droits</span>
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
  );
};

export default ObservatoireHeader;
