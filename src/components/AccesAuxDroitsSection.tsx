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
        {/* Logo centered at top */}
        <div className="flex items-center justify-center mx-0 px-0 py-0 my-0">
          <img src={accesDroitsLogo} alt="Accès aux Droits" className="h-40 sm:h-48 md:h-56 w-auto object-contain" />
        </div>
        
        {/* Description text */}
        <p className={`text-blue-800 text-base sm:text-lg text-center leading-relaxed max-w-2xl ${isRTL ? 'font-almarai' : ''}`}>
          {t('accessDescription')}
        </p>

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