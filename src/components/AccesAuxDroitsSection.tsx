import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Map, Image } from "lucide-react";
import { Link } from "react-router-dom";

const AccesAuxDroitsSection = () => {
  return (
    <Link to="/acces-aux-droits" className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-l from-yellow-50 to-yellow-100 flex flex-col relative cursor-pointer">
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-12 sm:py-16 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="mb-4 sm:mb-6">
            <img 
              src="/Feelinx_upload/logo-acces-aux-droits.png" 
              alt="Accès aux Droits" 
              className="h-10 sm:h-14 w-auto object-contain max-w-full"
            />
          </div>
          
          <h2 className="text-primary text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center max-w-md leading-tight">
            Accès aux Droits
          </h2>
        </div>

        {/* Center Section - Primary CTA (matches Observatoire) */}
        <div className="w-full max-w-sm sm:max-w-md my-8 sm:my-12">
          <Link to="/acces-aux-droits/carte-interactive">
            <Button className="w-full h-14 sm:h-16 bg-accent text-accent-foreground rounded-xl shadow-lg border-0 flex items-center justify-center gap-3">
              <Map className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-base sm:text-lg">Carte interactive</span>
            </Button>
          </Link>
        </div>

        {/* Bottom Section - Quick Access Cards (aligned like Observatoire) */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            <Link to="/acces-aux-droits/mediatheque" className="block">
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-28 sm:h-32 hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Médiathèques</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AccesAuxDroitsSection;