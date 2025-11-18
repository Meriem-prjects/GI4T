import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import logoAccesDroitsFr from "@/assets/logo-acces-droits-fr.png";
import logoAccesDroitsAr from "@/assets/logo-acces-aux-droits.png";
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
        {/* Logo */}
        <div className="flex justify-center items-center mb-4">
          <img src={isRTL ? logoAccesDroitsAr : logoAccesDroitsFr} alt="Accès aux Droits" className="h-32 sm:h-40 w-auto object-contain" />
        </div>
        
        {/* Title */}
        

        {/* Description */}
        <p className={`text-blue-800 text-base sm:text-lg text-center max-w-md leading-relaxed ${isRTL ? 'font-almarai' : ''}`}>
          {t('accessDescription')}
        </p>

        {/* Primary CTA */}
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