import { Card, CardContent } from "@/components/ui/card";
import { MapPin, MessageCircle, Image } from "lucide-react";
import { Link } from "react-router-dom";
import TunisiaMapButton from "./TunisiaMapButton";

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

        {/* Center Section - Tunisia Map Button */}
        <TunisiaMapButton />

        {/* Bottom Section - Quick Access Cards */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-20 sm:h-24">
              <CardContent className="p-2 sm:p-3 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-1.5">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-card-foreground">FAQ & Chat</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-20 sm:h-24">
              <CardContent className="p-2 sm:p-3 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-1.5">
                  <Image className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-card-foreground">Médiathèques</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Photos & Vidéos</p>
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

export default AccesAuxDroitsSection;