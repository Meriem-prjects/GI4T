import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CarteInteractiveNav from "@/components/CarteInteractiveNav";
import MediathequeNav from "@/components/MediathequeNav";
import ActualitesNav from "@/components/ActualitesNav";
import FAQNav from "@/components/FAQNav";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const AccesAuxDroitsLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  // Determine which sub-navigation to show based on current route
  const getSubNav = () => {
    if (location.pathname.includes('/carte-interactive') || location.pathname.includes('/adresses-utiles')) {
      return <CarteInteractiveNav />;
    } else if (location.pathname.includes('/mediatheque') || location.pathname.includes('/albums-photos')) {
      return <MediathequeNav />;
    } else if (location.pathname.includes('/actualites') || location.pathname.includes('/ressources-pratiques') || 
               location.pathname.includes('/liens-utiles') || location.pathname.includes('/guides-pratiques')) {
      return <ActualitesNav />;
    } else if (location.pathname.includes('/foire-aux-questions') || location.pathname.includes('/assistant-virtuel')) {
      return <FAQNav />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link to="/acces-aux-droits" className={`flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity ${isRTL ? 'ml-auto' : ''}`}>
              {isRTL ? (
                <>
                  <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt={t('accessToRights')} className="h-4 sm:h-6 md:h-8 flex-shrink-0" />
                  <div className="text-right">
                    <h1 className="text-sm sm:text-base md:text-2xl font-bold text-foreground font-almarai">{t('accessToRights')}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block font-almarai">{t('citizenSpace')}</p>
                  </div>
                </>
              ) : (
                <>
                  <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt={t('accessToRights')} className="h-4 sm:h-6 md:h-8 flex-shrink-0" />
                  <div>
                    <h1 className="text-sm sm:text-base md:text-2xl font-bold text-foreground">{t('accessToRights')}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{t('citizenSpace')}</p>
                  </div>
                </>
              )}
            </Link>
            
            <nav className={`hidden md:flex items-center absolute ${isRTL ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'} gap-6`}>
              <Link to="/acces-aux-droits/carte-interactive" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('interactiveMap')}
              </Link>
              <Link to="/acces-aux-droits/mediatheque" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('mediaLibrary')}
              </Link>
              <Link to="/acces-aux-droits/actualites" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('actualites')}
              </Link>
              <Link to="/acces-aux-droits/assistant-virtuel" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('faqChatbot')}
              </Link>
            </nav>

            <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
              {/* Home Button - Enhanced */}
              <Link to="/acces-aux-droits">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-9 p-0 rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              
              {/* Language Switcher - Enhanced */}
              <div className="flex items-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-full p-1 shadow-sm border border-primary/20">
                <Button 
                  size="sm" 
                  onClick={() => setLanguage('fr')}
                  className={`${language === 'fr' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200`}
                >
                  FR
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setLanguage('ar')}
                  className={`${language === 'ar' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200`}
                >
                  AR
                </Button>
              </div>
              
              {/* JustClic Button - Enhanced */}
              <Link to="/">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-3 h-9 rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-200 shadow-sm"
                >
                  <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic" className="h-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden p-2 absolute right-4 top-3">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"} className="w-80">
              <div className="flex flex-col h-full">
                <div className={`flex items-center p-4 border-b ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt={t('accessToRights')} className="h-6 sm:h-8 w-auto" />
                  <h2 className={`font-bold text-primary ${isRTL ? 'font-almarai' : ''}`}>{t('accessToRights')}</h2>
                </div>
                <nav className="flex flex-col space-y-2 mt-4 px-4">
                  <Link to="/acces-aux-droits" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('home')}</Link>
                  <Link to="/acces-aux-droits/carte-interactive" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('interactiveMap')}</Link>
                  <Link to="/acces-aux-droits/adresses-utiles" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('usefulAddresses')}</Link>
                  <Link to="/acces-aux-droits/mediatheque" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('mediaLibrary')}</Link>
                  <Link to="/acces-aux-droits/albums-photos" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('photoAlbums')}</Link>
                  <Link to="/acces-aux-droits/actualites" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('actualites')}</Link>
                  <Link to="/acces-aux-droits/foire-aux-questions" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('faq')}</Link>
                  <Link to="/acces-aux-droits/assistant-virtuel" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('virtualAssistant')}</Link>
                  <Link to="/acces-aux-droits/ressources-pratiques" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('practicalResources')}</Link>
                  <Link to="/acces-aux-droits/liens-utiles" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('usefulLinks')}</Link>
                  <Link to="/acces-aux-droits/guides-pratiques" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>{t('practicalGuides')}</Link>
                  <div className="border-t pt-4 mt-4">
                    <Link to="/" className={`text-base hover:text-primary p-2 rounded-lg hover:bg-muted flex items-center ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}>
                      <span>{isRTL ? '← ' : '→ '}{t('homepage')}</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Sub-navigation - changes based on route */}
      {getSubNav()}

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccesAuxDroitsLayout;
