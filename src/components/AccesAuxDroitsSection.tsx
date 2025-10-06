import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Image } from "lucide-react";
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
        <div className="w-full max-w-sm sm:max-w-md my-8 sm:my-12">
          <TunisiaMapButton />
        </div>

        {/* Bottom Section - Quick Access Cards */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28">
              <CardContent className="p-3 sm:p-4 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">FAQ & Chat</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28">
              <CardContent className="p-3 sm:p-4 h-full">
                <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                  <Image className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Médiathèques</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Photos & Vidéos</p>
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