import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";

const ObservatoireSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/observatoire/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col relative">
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-12 sm:py-16 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="mb-4 sm:mb-6">
            <img 
              src="/Feelinx_upload/odf-logo.png" 
              alt="Observatoire des Droits" 
              className="h-10 sm:h-14 w-auto object-contain max-w-full"
            />
          </div>
          
          <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center max-w-md leading-tight">
            Observatoire des Droits
          </h2>
        </div>
        
        {/* Center Section - Search */}
        <div className="w-full max-w-sm sm:max-w-md my-8 sm:my-12">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une décision"
              className="w-full h-14 sm:h-16 bg-accent text-accent-foreground placeholder:text-accent-foreground/70 rounded-xl shadow-lg border-0 pl-12 sm:pl-14 pr-4 text-base sm:text-lg font-semibold focus-visible:ring-2 focus-visible:ring-primary"
            />
          </form>
        </div>

        {/* Bottom Section - Quick Access */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <Link to="/observatoire">
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-28 sm:h-32 cursor-pointer hover:bg-white transition-colors">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-3">
                    <FileText className="w-7 h-7 sm:w-9 sm:h-9 text-primary" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Textes</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Constitution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/observatoire">
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-28 sm:h-32 cursor-pointer hover:bg-white transition-colors">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-3">
                    <Building className="w-7 h-7 sm:w-9 sm:h-9 text-primary" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Juridictions</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Tribunaux</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservatoireSection;