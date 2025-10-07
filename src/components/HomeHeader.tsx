import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";

const HomeHeader = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top section with logo */}
        <div className="flex items-center justify-center py-4 relative">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <img 
                src="/Feelinx_upload/justclic-logo.png" 
                alt="JustClic.tn" 
                className="h-8 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-primary text-xs font-medium hidden sm:block">{t('header.simplifiedCitizenInfo')}</p>
          </div>
          
          {/* Language Switcher */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            <div className="flex items-center bg-muted rounded-full p-1">
              <Button 
                size="sm" 
                onClick={() => setLanguage('fr')}
                className={`rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium ${
                  language === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'
                }`}
              >
                FR
              </Button>
              <Button 
                size="sm" 
                onClick={() => setLanguage('ar')}
                className={`rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium ${
                  language === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'
                }`}
              >
                AR
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation section */}
        <nav className="border-t border-border">
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center space-x-6">
              <Link to="/information/qui-sommes-nous">
                <Button variant="ghost" className="text-sm">
                  {t('navigation.whoWeAre')}
                </Button>
              </Link>

              <Link to="/information/actualites">
                <Button variant="ghost" className="text-sm">
                  {t('navigation.news')}
                </Button>
              </Link>

              <Link to="/information/faq-chatbot">
                <Button variant="ghost" className="text-sm">
                  {t('navigation.faqChatbot')}
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