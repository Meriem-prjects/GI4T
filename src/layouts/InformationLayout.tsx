import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const InformationLayout = () => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-4' : 'space-x-2 sm:space-x-4'}`}>
              <Link 
                to="/" 
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mr-2 sm:mr-4"
              >
                {isRTL ? '→' : '←'}
              </Link>
              <Link to="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity duration-200">
                {!isRTL ? (
                  <>
                    <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic Logo" className="h-3 sm:h-6" />
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold text-foreground">JustClic.tn</h1>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Information citoyenne simplifiée</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <h1 className="text-lg sm:text-xl font-bold text-foreground font-almarai">JustClic.tn</h1>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block font-almarai">معلومات مواطنية مبسطة</p>
                    </div>
                    <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic Logo" className="h-3 sm:h-6" />
                  </>
                )}
              </Link>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-4' : 'space-x-2 sm:space-x-4'}`}>
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
              <Link to="/observatoire">
                <Button variant="outline" size="sm" className={`text-xs sm:text-sm ${isRTL ? 'font-almarai' : ''}`}>
                  {isRTL ? 'المرصد' : 'Observatoire'}
                </Button>
              </Link>
              <Link to="/acces-aux-droits">
                <Button variant="outline" size="sm" className={`text-xs sm:text-sm ${isRTL ? 'font-almarai' : ''}`}>
                  {isRTL ? 'الوصول إلى الحقوق' : 'Accès aux Droits'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default InformationLayout;