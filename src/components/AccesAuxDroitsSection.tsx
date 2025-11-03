import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Map, Image } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AccesAuxDroitsSection = () => {
  const navigate = useNavigate();

  return (
    <Card 
      role="button"
      tabIndex={0}
      aria-label="Accéder à la section Accès aux Droits"
      onClick={() => navigate('/acces-aux-droits')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/acces-aux-droits');
        }
      }}
      className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-2xl hover:shadow-3xl transition-all cursor-pointer hover:scale-[1.02] duration-300"
    >
      <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-8 min-h-[500px]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/Feelinx_upload/logo-acces-aux-droits.png" 
            alt="Accès aux Droits" 
            className="h-32 sm:h-40 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-primary text-2xl sm:text-3xl font-spartan font-bold text-center max-w-md">
          Accès aux Droits
        </h2>

        {/* Primary CTA */}
        <div 
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Link to="/acces-aux-droits/carte-interactive">
            <Button className="w-full h-14 sm:h-16 bg-accent text-accent-foreground rounded-xl shadow-lg border-0 flex items-center justify-center gap-3 hover:bg-accent/90">
              <Map className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-base sm:text-lg">Carte interactive</span>
            </Button>
          </Link>
        </div>

        {/* Quick Access Cards */}
        <div 
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Link to="/acces-aux-droits/foire-aux-questions" className="block">
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28 hover:shadow-xl transition-shadow">
                <CardContent className="p-4 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-card-foreground">FAQ & Chat</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/acces-aux-droits/mediatheque" className="block">
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-24 sm:h-28 hover:shadow-xl transition-shadow">
                <CardContent className="p-4 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm text-card-foreground">Médiathèques</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccesAuxDroitsSection;