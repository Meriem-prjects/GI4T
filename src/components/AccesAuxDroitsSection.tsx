import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map, Video, BookOpen, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import logoAccesDroitsFr from "@/assets/logo-acces-droits-fr.png";
import logoAccesDroitsAr from "@/assets/logo-acces-droits-ar.png";

const AccesAuxDroitsSection = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();

  const quickLinks = [
    {
      link: "/acces-aux-droits/mediatheque",
      icon: Video,
      label: t('mediaLibrary'),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      link: "/acces-aux-droits/guides-pratiques",
      icon: BookOpen,
      label: t('practicalGuides'),
      color: "bg-amber-500 hover:bg-amber-600"
    },
    {
      link: "/acces-aux-droits/assistant-virtuel",
      icon: HelpCircle,
      label: t('faqChatbot'),
      color: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

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
      <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-6 min-h-[500px]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={language === 'ar' ? logoAccesDroitsAr : logoAccesDroitsFr}
            alt="Accès aux Droits" 
            className="h-[6.4rem] sm:h-32 md:h-[9.6rem] w-auto object-contain"
          />
        </div>

        {/* Description */}
        <p className={`text-blue-800 text-base sm:text-lg text-center max-w-md leading-relaxed ${isRTL ? 'font-almarai' : ''}`}>
          {t('accessDescription')}
        </p>

        {/* Primary CTA */}
        <div 
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Link to="/acces-aux-droits/carte-interactive">
            <Button className={`w-full h-14 sm:h-16 bg-white text-gray-900 rounded-xl shadow-lg border-0 flex items-center justify-center gap-3 hover:bg-white/90 ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}>
              <Map className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-base sm:text-lg">{t('interactiveMap')}</span>
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div 
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.link} to={item.link} className="flex-1">
                  <Button 
                    className={`w-full h-10 sm:h-12 ${item.color} text-white rounded-lg shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccesAuxDroitsSection;
