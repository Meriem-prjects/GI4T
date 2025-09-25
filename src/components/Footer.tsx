import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Mail, Instagram, Twitter, Linkedin, Youtube, Phone, MapPin } from "lucide-react";
const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left section - Logo and description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic.tn" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Votre plateforme d'information citoyenne en Tunisie. 
              Accédez facilement à vos droits et aux services administratifs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <h4 className="text-base font-semibold text-white">Contact</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@justclic.tn</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+216 XX XX XX XX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Tunis, Tunisie</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle section - Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Navigation</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <a href="#" className="block hover:text-white transition-colors">Observatoire des droits</a>
              <a href="#" className="block hover:text-white transition-colors">Accès aux droits</a>
              <a href="#" className="block hover:text-white transition-colors">Publications</a>
              <a href="#" className="block hover:text-white transition-colors">Ressources pratiques</a>
              <a href="#" className="block hover:text-white transition-colors">À propos</a>
            </div>
          </div>

          {/* Right section - Social Media & Newsletter */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Suivez-nous</h3>
              <div className="flex flex-wrap gap-3">
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
              <h4 className="text-base font-semibold text-white">Newsletter</h4>
              <div className="space-y-2">
                <Input 
                  placeholder="Votre email" 
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500" 
                />
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium">
                  S'ABONNER
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
              <a href="#" className="hover:text-white transition-colors">Plan du site</a>
            </div>
            
            <div className="text-center md:text-right text-sm text-gray-400 space-y-1">
              <p>© 2025 JustClic.tn. Tous droits réservés</p>
              <p>
                Développé par <span className="text-blue-400 font-semibold">Feelinx</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;