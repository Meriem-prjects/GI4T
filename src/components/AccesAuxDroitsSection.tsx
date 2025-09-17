import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Map, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const AccesAuxDroitsSection = () => {
  return (
    <Link to="/acces-aux-droits" className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-l from-yellow-50 to-yellow-100 flex flex-col relative cursor-pointer">
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-8 sm:py-12 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
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
        <div className="w-full max-w-sm sm:max-w-md space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28">
              <CardContent className="p-4 sm:p-6 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Guides</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Pratiques</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28">
              <CardContent className="p-4 sm:p-6 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Services</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Proximité</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Bottom Section - Interactive Map */}
        <div className="w-full max-w-sm sm:max-w-md">
          <Button className="w-full h-12 sm:h-14 bg-white text-foreground border border-border rounded-xl shadow-sm flex items-center justify-center gap-3">
            <Map className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-base">Carte interactive</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default AccesAuxDroitsSection;