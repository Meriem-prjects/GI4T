import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useTypingPlaceholder } from "@/hooks/useTypingPlaceholder";

const ObservatoireSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [language] = useState<'fr' | 'ar'>('fr'); // Can be extended with language context
  const animatedPlaceholder = useTypingPlaceholder(language);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/observatoire/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label="Ouvrir l’Observatoire des Droits"
      onClick={() => navigate('/observatoire')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/observatoire');
        }
      }}
      className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-b md:bg-gradient-to-r from-[hsl(224,76%,58%)] to-[hsl(224,76%,68%)] flex flex-col relative cursor-pointer hover:brightness-105 transition-all"
    >
      <div className="flex flex-col items-center justify-between px-4 sm:px-8 py-12 sm:py-16 h-full">
        {/* Header Section - Logo & Title */}
        <div className="flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="mb-4 sm:mb-6">
            <img 
              src="/Feelinx_upload/odf-logo.png" 
              alt="Observatoire des Droits" 
              className="h-10 sm:h-14 w-auto object-contain max-w-full"
            />
          </div>
          
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-spartan font-bold text-center max-w-md leading-tight">
            Observatoire des Droits
          </h2>
        </div>
        
        {/* Center Section - Search */}
        <div
          className="w-full max-w-sm sm:max-w-md my-8 sm:my-12 relative z-10"
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

        {/* Bottom Section - Quick Access */}
        <div className="w-full max-w-sm sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <Link 
              to="/observatoire/droits-fondamentaux"
              className="block"
            >
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-28 sm:h-32 hover:bg-white transition-colors">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Droits fondamentaux</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Textes de référence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link 
              to="/observatoire/analyses-opinions"
              className="block"
            >
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-0 h-28 sm:h-32 hover:bg-white transition-colors">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Analyses & Opinions</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Analyses juridiques</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservatoireSection;
