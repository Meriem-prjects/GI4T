import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import accesDroitsLogo from "@/assets/acces-droits-logo.png";
const AccesAuxDroitsSection = () => {
  const navigate = useNavigate();
  const {
    isRTL
  } = useLanguage();
  const {
    t
  } = useTranslation();
  return <Card role="button" tabIndex={0} aria-label="Accéder à la section Accès au droit administratif" onClick={() => navigate('/acces-aux-droits')} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/acces-aux-droits');
    }
  }} style={{
    backgroundColor: '#FFDA52'
  }} className="border-0 shadow-2xl hover:shadow-3xl transition-all cursor-pointer hover:scale-[1.02] duration-300">
      <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-8 min-h-[500px]">
        {/* Content Grid: Text on left, Logo on right */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side: Text */}
          <div className="flex flex-col space-y-6">
            
            <p className={`text-blue-800 text-base sm:text-lg text-center md:text-left leading-relaxed ${isRTL ? 'font-almarai' : ''}`}>
              {t('accessDescription')}
            </p>
          </div>

          {/* Right side: Logo */}
          <div className="flex items-center justify-center">
            <img src={accesDroitsLogo} alt="Accès aux Droits" className="h-40 sm:h-48 md:h-56 w-auto object-contain" />
          </div>
        </div>

        {/* Primary CTA - aligned with search bar width */}
        <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
          <Link to="/acces-aux-droits/carte-interactive">
            <Button className={`w-full h-14 sm:h-16 bg-white text-gray-900 rounded-xl shadow-lg border-0 flex items-center justify-center gap-3 hover:bg-white/90 ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}>
              <Map className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-base sm:text-lg">{t('interactiveMap')}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>;
};
export default AccesAuxDroitsSection;