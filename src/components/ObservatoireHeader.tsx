import { useState } from "react";
import { Menu, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const ObservatoireHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2 sm:py-4">
        <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo and Title - stays in corner */}
          <Link to="/observatoire" className={`flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-6 sm:h-8 md:h-12" />
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className={`text-sm sm:text-base md:text-2xl font-bold text-foreground ${isRTL ? 'font-almarai' : ''}`}>
                {isRTL ? 'مرصد الحقوق الأساسية' : 'Observatoire des Droits Fondamentaux'}
              </h1>
              <p className={`text-xs sm:text-sm text-muted-foreground hidden sm:block ${isRTL ? 'font-almarai' : ''}`}>
                {isRTL ? 'مراقبة وحماية حقوق المواطنين' : 'Surveillance et protection des droits citoyens'}
              </p>
            </div>
          </Link>

          {/* Navigation and Controls - opposite side */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-4' : 'space-x-2 sm:space-x-4'}`}>
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <Link to="/observatoire">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center bg-muted rounded-full p-1">
                <Button 
                  size="sm" 
                  onClick={() => setLanguage('fr')}
                  className={`${language === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'} rounded-full px-2 text-xs font-medium hover:bg-primary/90`}
                >
                  FR
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setLanguage('ar')}
                  className={`${language === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'} rounded-full px-2 text-xs font-medium hover:bg-primary/90`}
                >
                  AR
                </Button>
              </div>
              <Link to="/">
                <Button variant="outline" size="sm" className="px-2 sm:px-3">
                  <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic" className="h-5 sm:h-6" />
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                <div className="flex flex-col h-full">
                  <div className={`flex items-center p-4 border-b ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-6 sm:h-8 w-auto" />
                    <h2 className={`font-bold text-primary ${isRTL ? 'font-almarai' : ''}`}>ODF</h2>
                  </div>
                  <nav className="flex flex-col space-y-2 mt-4 px-4">
                    <Link to="/" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'الرئيسية' : 'Accueil'}
                    </Link>
                    <Link to="/observatoire" className={`text-base text-primary p-2 rounded-lg bg-muted font-medium ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'المرصد' : 'Observatoire'}
                    </Link>
                    <Link to="/observatoire/analyses-opinions" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'تحليلات وآراء' : 'Analyses & Opinions'}
                    </Link>
                    <Link to="/observatoire/actualites" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'الأخبار' : 'Actualités'}
                    </Link>
                    <div className="border-t pt-4 mt-4">
                      <Link to="/" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted flex items-center ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}>
                        <span>{isRTL ? '← الصفحة الرئيسية' : '→ Page d\'accueil'}</span>
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ObservatoireHeader;
