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
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Title */}
          <Link to="/observatoire" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
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

          {/* Navigation and Controls */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            {/* Home Button - Always visible */}
            <Link to="/observatoire">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Language Switcher - Always visible */}
            <div className="flex items-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-full p-0.5 sm:p-1 shadow-sm border border-primary/20">
              <Button 
                size="sm" 
                onClick={() => setLanguage('fr')}
                className={`${language === 'fr' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition-all duration-200`}
              >
                FR
              </Button>
              <Button 
                size="sm"
                onClick={() => setLanguage('ar')}
                className={`${language === 'ar' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition-all duration-200`}
              >
                AR
              </Button>
            </div>
            
            {/* JustClic Button - Hidden on very small screens */}
            <Link to="/" className="hidden xs:block sm:block">
              <Button 
                variant="outline" 
                size="sm" 
                className="px-2 sm:px-3 h-8 sm:h-9 rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-200 shadow-sm"
              >
                <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic" className="h-4 sm:h-5" />
              </Button>
            </Link>
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
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
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'الرئيسية' : 'Accueil'}
                    </Link>
                    <Link to="/observatoire" onClick={() => setIsMobileMenuOpen(false)} className={`text-base text-primary p-3 rounded-lg bg-muted font-medium ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'المرصد' : 'Observatoire'}
                    </Link>
                    <Link to="/observatoire/analyses-opinions" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'تحليلات وآراء' : 'Analyses & Opinions'}
                    </Link>
                    <Link to="/observatoire/actualites" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {isRTL ? 'الأخبار' : 'Actualités'}
                    </Link>
                    <div className="border-t pt-4 mt-4">
                      <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted flex items-center ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}>
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
