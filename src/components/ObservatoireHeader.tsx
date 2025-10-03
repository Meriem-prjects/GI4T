import { useState } from "react";
import { Menu, Home, Search, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ObservatoireHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const navigate = useNavigate();

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/observatoire/search-results?q=${encodeURIComponent(mobileSearch)}`);
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2 sm:py-4">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
              <p className="text-sm text-muted-foreground">Surveillance et protection des droits citoyens</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/observatoire">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm">العربية</Button>
            <Link to="/acces-aux-droits">
              <Button variant="ghost" size="sm">Accès aux Droits</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8" />
              <h1 className="text-sm font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
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

          {/* Mobile Search Bar */}
          <form onSubmit={handleMobileSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full border-2 focus:border-primary"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-4">Filtres Avancés</h2>
                  <p className="text-sm text-muted-foreground">Les filtres avancés seront disponibles sur la page de résultats de recherche.</p>
                </div>
              </SheetContent>
            </Sheet>
          </form>
        </div>
      </div>
    </header>
  );
};

export default ObservatoireHeader;
