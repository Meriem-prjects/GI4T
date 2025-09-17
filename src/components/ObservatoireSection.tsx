import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Building } from "lucide-react";
import { Link } from "react-router-dom";

const ObservatoireSection = () => {
  return (
    <Link to="/observatoire" className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col relative cursor-pointer">
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-8 sm:py-12 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center">
          <div className="mb-2 sm:mb-3">
            <img 
              src="/Feelinx_upload/odf-logo.png" 
              alt="Observatoire des Droits" 
              className="h-8 sm:h-12 w-auto object-contain max-w-full"
            />
          </div>
          
          <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center max-w-md leading-tight">
            Observatoire<br className="sm:hidden" />
            <span className="hidden sm:inline"> des</span> Droits
          </h2>
        </div>
        
        {/* Center Section - Search */}
        <div className="w-full max-w-sm sm:max-w-md">
          <Button className="w-full h-12 sm:h-14 bg-accent text-accent-foreground rounded-xl shadow-lg border-0 flex items-center justify-center gap-3">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">Rechercher une décision</span>
          </Button>
        </div>

        {/* Bottom Section - Quick Access */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center text-center">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                  <h3 className="font-semibold text-xs sm:text-sm text-card-foreground mb-1">Textes</h3>
                  <p className="text-xs text-muted-foreground">Constitution</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0">
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
  );
};

export default ObservatoireSection;