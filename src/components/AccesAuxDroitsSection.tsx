import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AccesAuxDroitsSection = () => {
  const navigate = useNavigate();

  return (
    <Card 
      role="button"
      tabIndex={0}
      aria-label="Accéder à la section Accès au droit administratif"
      onClick={() => navigate('/acces-aux-droits')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/acces-aux-droits');
        }
      }}
      style={{ backgroundColor: '#FFDA52' }}
      className="border-0 shadow-2xl hover:shadow-3xl transition-all cursor-pointer hover:scale-[1.02] duration-300"
    >
      <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-8 min-h-[500px]">
        {/* Title */}
        <h2 className="text-blue-900 text-3xl sm:text-4xl font-spartan font-bold text-center max-w-md">
          Accès au droit administratif
        </h2>

        {/* Description */}
        <p className="text-blue-800 text-base sm:text-lg text-center max-w-md leading-relaxed">
          Comprendre ses droits, savoir comment agir : des outils concrets pour tous les citoyens
        </p>

        {/* Primary CTA */}
        <div 
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Link to="/acces-aux-droits/carte-interactive">
            <Button className="w-full h-14 sm:h-16 bg-white text-gray-900 rounded-xl shadow-lg border-0 flex items-center justify-center gap-3 hover:bg-white/90">
              <Map className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-base sm:text-lg">Carte interactive</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccesAuxDroitsSection;