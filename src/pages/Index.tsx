import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Building, MapPin, Map, ChevronRight } from "lucide-react";

const Index = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <title>JustClic.tn - Information citoyenne simplifiée | Accès aux droits fondamentaux</title>
      <meta name="description" content="JustClic.tn facilite l'accès aux droits fondamentaux en Tunisie. Observatoire des droits et plateforme citoyenne pour une information simplifiée." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=League+Spartan:wght@600;700&family=Inter:wght@400;500&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="w-full h-screen flex flex-col">
        {/* Header with Logo */}
        <header className="bg-white h-32 flex items-center justify-center relative border-b border-gray-100">
          <div className="text-center">
            {/* Logo Placeholder - Replace with actual logo when available */}
            <div className="flex items-center justify-center mb-2">
              <span className="text-5xl font-bold">
                <span className="text-yellow-400">JUST</span>
                <span className="text-blue-600">CLIC</span>
                <span className="text-red-500 text-2xl">.tn</span>
              </span>
            </div>
            <p className="text-blue-600 text-sm font-medium">Information citoyenne simplifiée</p>
          </div>
          
          {/* Language Switcher & Profile */}
          <div className="absolute right-8 top-4 flex items-center gap-4">
            <div className="flex items-center bg-gray-50 rounded-full p-1">
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-4 py-1 text-sm">
                FR
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-transparent rounded-full px-4 py-1 text-sm">
                AR
              </Button>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </header>

        {/* Main Content - Split Screen */}
        <div className="flex-1 flex">
          {/* Left Section - Blue Background */}
          <div className="w-1/2 bg-blue-100 flex flex-col items-center justify-start pt-16 px-8">
            <h2 className="text-blue-700 text-3xl font-spartan font-semibold text-center mb-12 max-w-md">
              Observatoire des Droits Fondamentaux
            </h2>
            
            <div className="w-full max-w-md space-y-6">
              {/* Search Bar */}
              <Button className="w-full h-12 bg-yellow-200 hover:bg-yellow-300 text-gray-700 rounded-lg shadow-sm border-0 flex items-center justify-center gap-3">
                <Search className="w-5 h-5" />
                <span className="font-medium">Rechercher une décision</span>
              </Button>

              {/* Textes fondamentaux */}
              <Card className="bg-white rounded-lg shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Textes fondamentaux</h3>
                  </div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                      <span>Constitution</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                      <span>Lois fondamentales</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Juridictions */}
              <Card className="bg-white rounded-lg shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Juridictions</h3>
                  </div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <span>Conseil constitutionnel</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <span>Tribunal administratif</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <span>Cour de cassation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Section - Yellow Background */}
          <div className="w-1/2 bg-yellow-100 flex flex-col items-center justify-start pt-16 px-8">
            <h2 className="text-blue-700 text-3xl font-spartan font-semibold text-center mb-12 max-w-md">
              Accès aux droits
            </h2>

            <div className="w-full max-w-md space-y-6">
              {/* Guides pratiques */}
              <Card className="bg-orange-50 rounded-lg shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">📋</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Guides pratiques</h3>
                  </div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Vos droits au quotidien</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Publications citoyennes</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campagnes d'information */}
              <Card className="bg-blue-50 rounded-lg shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Campagnes d'information</h3>
                  </div>
                  
                  <Button className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg shadow-sm flex items-center justify-center gap-3">
                    <Map className="w-5 h-5" />
                    <span className="font-medium">Carte dynamique interactive</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-4">
          <div className="flex justify-center gap-16">
            <div className="flex gap-8 text-blue-600">
              <a href="#" className="text-sm font-medium hover:text-blue-800">Accueil</a>
              <a href="#" className="text-sm hover:text-blue-800">Décisions</a>
              <a href="#" className="text-sm hover:text-blue-800">Fiches pratiques</a>
              <a href="#" className="text-sm hover:text-blue-800">Thématiques</a>
            </div>
            <div className="flex gap-8 text-blue-600">
              <a href="#" className="text-sm hover:text-blue-800">JustiClic</a>
              <a href="#" className="text-sm hover:text-blue-800">À propos</a>
              <a href="#" className="text-sm hover:text-blue-800">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
