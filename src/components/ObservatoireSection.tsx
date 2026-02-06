import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useTypingPlaceholder } from "@/hooks/useTypingPlaceholder";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import logoOdfFr from "@/assets/logo-odf-fr-new.png";
import logoOdfAr from "@/assets/logo-odf-ar.png";

const ObservatoireSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  const animatedPlaceholder = useTypingPlaceholder(language);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/observatoire/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Card 
      role="button"
      tabIndex={0}
      aria-label="Accéder à l'Observatoire des Droits"
      onClick={() => navigate('/observatoire')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/observatoire');
        }
      }}
      className="bg-gradient-to-br from-[#4164D7] to-[#5574E0] border-0 shadow-2xl hover:shadow-3xl transition-all cursor-pointer hover:scale-[1.02] duration-300"
    >
      <CardContent className="p-5 sm:p-8 md:p-12 flex flex-col items-center justify-center space-y-5 sm:space-y-8 min-h-[350px] sm:min-h-[450px] md:min-h-[500px]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={language === 'ar' ? logoOdfAr : logoOdfFr}
            alt="Observatoire des Droits Fondamentaux" 
            className="h-32 sm:h-40 md:h-48 w-auto object-contain"
          />
        </div>

        {/* Description */}
        <p className={`text-white text-center text-base sm:text-lg max-w-md leading-relaxed ${isRTL ? 'font-almarai' : ''}`}>
          {t('observatoryDescription')}
        </p>

        {/* Search Input */}
        <div
          className="w-full max-w-md relative z-10"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder={animatedPlaceholder}
            language={language}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ObservatoireSection;
