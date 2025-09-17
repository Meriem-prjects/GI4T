import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Map, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const AccesAuxDroitsSection = () => {
  return (
    <Link to="/acces-aux-droits" className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-l from-yellow-50 to-yellow-100 flex flex-col relative cursor-pointer">
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-8 sm:py-12 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center">
          <div className="mb-2 sm:mb-3">
            <img 
              src="/Feelinx_upload/logo-acces-aux-droits.png" 
              alt="Accès aux Droits" 
              className="h-4 sm:h-6 md:h-8 w-auto object-contain max-w-full"
            />
          </div>
          
          <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center max-w-md leading-tight">
            Accès aux Droits
          </h2>
        </div>

        {/* Center Section - Quick Access Cards */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0">
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

            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-center text-center">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                  <h3 className="font-semibold text-xs sm:text-sm text-card-foreground mb-1">Services</h3>
                  <p className="text-xs text-muted-foreground">Proximité</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Bottom Section - Interactive Map */}
        <div className="w-full max-w-sm sm:max-w-md">
          <Button className="w-full h-12 sm:h-14 bg-white text-foreground border border-border rounded-xl shadow-sm flex items-center justify-center gap-3">
            <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">Carte interactive</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default AccesAuxDroitsSection;