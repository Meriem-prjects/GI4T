import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Mail, Instagram, Twitter, Linkedin, Youtube, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${isRTL ? 'text-right md:grid-flow-dense' : ''}`}>
          {/* First section - Logo and description */}
          <div className={`space-y-4 ${isRTL ? 'md:order-4' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'justify-end' : ''}`}>
              <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic.tn" className="h-12 w-auto object-contain" />
            </div>
            <p className={`text-gray-300 text-sm leading-relaxed ${isRTL ? 'font-almarai' : ''}`}>
              {t('yourPlatform')}
            </p>
          </div>

          {/* Second section - Navigation Links */}
          <div className={`space-y-4 ${isRTL ? 'md:order-3' : ''}`}>
            <h3 className={`text-lg font-semibold text-white ${isRTL ? 'font-almarai' : ''}`}>{t('navigation')}</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <a href="#" className={`block hover:text-white transition-colors ${isRTL ? 'font-almarai' : ''}`}>{t('observatoryOfRights')}</a>
              <a href="#" className={`block hover:text-white transition-colors ${isRTL ? 'font-almarai' : ''}`}>{t('accessRights')}</a>
              <a href="#" className={`block hover:text-white transition-colors ${isRTL ? 'font-almarai' : ''}`}>{t('publications')}</a>
              <a href="#" className={`block hover:text-white transition-colors ${isRTL ? 'font-almarai' : ''}`}>{t('practicalResources')}</a>
              <a href="#" className={`block hover:text-white transition-colors ${isRTL ? 'font-almarai' : ''}`}>{t('about')}</a>
            </div>
          </div>

          {/* Third section - Contact Info */}
          <div className={`space-y-4 ${isRTL ? 'md:order-2' : ''}`}>
            <h3 className={`text-lg font-semibold text-white ${isRTL ? 'font-almarai' : ''}`}>{t('contact')}</h3>
            <div className={`space-y-2 text-sm text-gray-300 ${isRTL ? 'flex flex-col items-end' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className={isRTL ? 'font-almarai' : ''}>contact@justclic.tn</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className={isRTL ? 'font-almarai' : ''}>+216 XX XX XX XX</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className={isRTL ? 'font-almarai' : ''}>Tunis, Tunisie</span>
              </div>
            </div>
          </div>

          {/* Fourth section - Social Media & Newsletter */}
          <div className={`space-y-6 ${isRTL ? 'md:order-1' : ''}`}>
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold text-white ${isRTL ? 'font-almarai' : ''}`}>{t('followUs')}</h3>
              <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-end' : ''}`}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-600 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-pink-600 bg-pink-600/10 text-pink-400 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all duration-300"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-400 bg-blue-400/10 text-blue-300 hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-300"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-700 bg-blue-700/10 text-blue-300 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all duration-300"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-600 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                >
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className={`text-base font-semibold text-white ${isRTL ? 'font-almarai' : ''}`}>{t('newsletter')}</h4>
              <div className="space-y-2">
                <Input 
                  placeholder={t('yourEmail')}
                  className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 ${isRTL ? 'font-almarai text-right' : ''}`}
                />
                <Button className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium ${isRTL ? 'font-almarai' : ''}`}>
                  {t('subscribe')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 ${isRTL ? 'font-almarai md:justify-end' : ''}`}>
              <a href="#" className="hover:text-white transition-colors">{t('legalNotice')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('privacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('terms')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('siteMap')}</a>
            </div>
            
            <div className={`text-center md:text-right text-sm text-gray-400 space-y-1 ${isRTL ? 'md:text-left font-almarai' : ''}`}>
              <p>© 2025 JustClic.tn. {t('allRightsReserved')}</p>
              <p>
                {t('developedBy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;