import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const HomeHeader = () => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top section with logo */}
        <div className={`flex items-center justify-between py-3 sm:py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/Feelinx_upload/justclic-logo.png" 
              alt="JustClic.tn" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
          </div>
          
          {/* Controls - Always visible */}
          <div className={`flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language Switcher - Always visible */}
            <div className="flex items-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-full p-0.5 sm:p-1 shadow-sm border border-primary/20">
              <Button 
                size="sm" 
                onClick={() => setLanguage('fr')}
                className={`${language === 'fr' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200`}
              >
                FR
              </Button>
              <Button 
                size="sm"
                onClick={() => setLanguage('ar')}
                className={`${language === 'ar' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200`}
              >
                AR
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="sm:hidden p-1.5 h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-72">
                <div className="flex flex-col h-full">
                  <div className={`flex items-center p-4 border-b ${isRTL ? 'space-x-reverse space-x-2 justify-end' : 'space-x-2'}`}>
                    <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic" className="h-8 w-auto" />
                  </div>
                  <nav className="flex flex-col space-y-1 mt-4 px-4">
                    <Link to="/information/qui-sommes-nous" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {t('whoWeAre')}
                    </Link>
                    <Link to="/information/actualites" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {t('news')}
                    </Link>
                    <Link to="/information/faq-chatbot" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {t('faqChatbot')}
                    </Link>
                    <div className="border-t pt-4 mt-4">
                      <Link to="/observatoire" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted block ${isRTL ? 'font-almarai text-right' : ''}`}>
                        {isRTL ? 'مرصد الحقوق' : 'Observatoire'}
                      </Link>
                      <Link to="/acces-aux-droits" onClick={() => setIsMobileMenuOpen(false)} className={`text-base hover:text-primary p-3 rounded-lg hover:bg-muted block ${isRTL ? 'font-almarai text-right' : ''}`}>
                        {t('accessRights')}
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation section - Desktop only */}
        <nav className="border-t border-border hidden sm:block">
          <div className="flex items-center justify-center py-2 sm:py-3">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 sm:space-x-6 flex-row-reverse' : 'space-x-4 sm:space-x-6'}`}>
              <Link to="/information/qui-sommes-nous">
                <Button variant="ghost" className={`text-sm h-9 px-3 ${isRTL ? 'font-almarai' : ''}`}>
                  {t('whoWeAre')}
                </Button>
              </Link>

              <Link to="/information/actualites">
                <Button variant="ghost" className={`text-sm h-9 px-3 ${isRTL ? 'font-almarai' : ''}`}>
                  {t('news')}
                </Button>
              </Link>

              <Link to="/information/faq-chatbot">
                <Button variant="ghost" className={`text-sm h-9 px-3 ${isRTL ? 'font-almarai' : ''}`}>
                  {t('faqChatbot')}
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default HomeHeader;