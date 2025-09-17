import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Building } from "lucide-react";
import { Link } from "react-router-dom";

const ObservatoireSection = () => {
  return (
    <Link to="/observatoire" className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col relative cursor-pointer">
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-8 sm:py-12 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          <div className="mb-2 sm:mb-3">
            <img 
              src="/Feelinx_upload/odf-logo.png" 
              alt="Observatoire des Droits" 
              className="h-8 sm:h-12 w-auto object-contain max-w-full"
            />
          </div>
          
          <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center max-w-md leading-tight">
            Observatoire des Droits
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
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28">
              <CardContent className="p-4 sm:p-6 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Textes</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Constitution</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28">
              <CardContent className="p-4 sm:p-6 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                  <Building className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Juridictions</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tribunaux</p>
                  </div>
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