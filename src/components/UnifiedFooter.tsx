import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UnifiedFooter = () => {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/Feelinx_upload/justclic-logo.png" 
                alt="JustClic.tn Logo" 
                className="h-10 w-10"
              />
              <div>
                <h3 className="text-xl font-bold">JustClic.tn</h3>
                <p className="text-sm text-slate-300">Information citoyenne simplifiée</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              JustClic.tn facilite l'accès aux droits fondamentaux en Tunisie. 
              Une plateforme citoyenne pour une information claire et accessible à tous.
            </p>
          </div>

          {/* Middle Column - Contact Info & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-2 text-sm text-slate-300">
              <p>📧 contact@justclic.tn</p>
              <p>📞 +216 XX XXX XXX</p>
              <p>📍 Tunis, Tunisie</p>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
              >
                Facebook
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-600 border-slate-600 text-white hover:bg-slate-700"
              >
                Mail
              </Button>
            </div>
          </div>

          {/* Right Column - Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Restez informés</h4>
            <p className="text-sm text-slate-300">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités 
              sur les droits fondamentaux.
            </p>
            <div className="flex space-x-2">
              <Input 
                type="email" 
                placeholder="Votre email"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
              >
                S'abonner
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Contactez-nous
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Mentions légales
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Plan du site
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Réseaux sociaux
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              CGU / cookies
            </a>
          </div>
          
          <div className="text-center text-sm text-slate-400">
            <p>© 2024 JustClic.tn. Tous droits réservés. | Développé par Feelinx</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UnifiedFooter;