import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const HomeFooter = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  return <footer className="bg-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isRTL ? 'rtl' : ''}`}>
          {/* Left section - Logo and description */}
          <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3 flex-row-reverse' : 'space-x-3'}`}>
              <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic.tn" className="h-10 w-auto object-contain" />
              
            </div>
            <p className={`text-gray-300 text-sm leading-relaxed ${isRTL ? 'font-almarai' : ''}`}>
              {isRTL ? "منصتك للمعلومات المدنية في تونس. الوصول بسهولة إلى حقوقك والخدمات الإدارية." : "Votre plateforme d'information citoyenne en Tunisie. Accédez facilement à vos droits et aux services administratifs."}
            </p>
          </div>

          {/* Middle section - Navigation Links & Social */}
          <div className={`space-y-4 text-center ${isRTL ? 'font-almarai' : ''}`}>
            <h3 className="text-lg font-semibold text-white">{isRTL ? "التنقل" : "Navigation"}</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-300">
              <a href="#" className="hover:text-white transition-colors">{t('contact')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('legal')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('sitemap')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('social')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('terms')}</a>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              
              
            </div>
          </div>

          {/* Right section - Stay Updated */}
          <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
            <h3 className={`text-lg font-semibold text-white ${isRTL ? 'font-almarai' : ''}`}>{t('stayInformed')}</h3>
            <div className="space-y-3">
              <Input placeholder={t('yourEmail')} className={`bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 ${isRTL ? 'text-right font-almarai' : ''}`} />
              <Button className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${isRTL ? 'font-almarai' : ''}`}>
                {t('newsletter')}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className={`text-center text-sm text-gray-400 space-y-2 ${isRTL ? 'font-almarai' : ''}`}>
            <p>{isRTL ? "© 2025 JustClic.tn. جميع الحقوق محفوظة | سياسة الخصوصية" : "© 2025 JustClic.tn. Tous droits réservés | Privacy Policy"}</p>
            <p>
              {t('developedBy')} <span className="text-blue-400 font-semibold">Feelinx</span>
            </p>
          </div>
        </div>
      </div>
    </footer>;
};
export default HomeFooter;