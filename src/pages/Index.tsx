import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Book, Building2, FileText, ArrowRight, Users, Map } from "lucide-react";

const Index = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  return (
    <>
      {/* SEO Meta Tags */}
      <title>JustClic.tn - Information citoyenne simplifiée | Accès aux droits fondamentaux</title>
      <meta name="description" content="JustClic.tn facilite l'accès aux droits fondamentaux en Tunisie. Observatoire des droits et plateforme citoyenne pour une information simplifiée." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      <div className="flex min-h-screen bg-white">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 bg-white h-24 flex items-center justify-between px-8 z-20 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-wide">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">JUST</span>
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">CLIC</span>
                <span className="text-red-500 text-xl">.tn</span>
              </h1>
              <p className="text-sm text-[hsl(var(--justclic-blue))] font-medium">
                Information citoyenne simplifiée
              </p>
            </div>
          </div>

          {/* Language Switcher & Profile */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="default"
              size="sm"
              className="bg-[hsl(var(--justclic-blue-light))] text-[hsl(var(--justclic-blue))] hover:bg-[hsl(var(--justclic-blue-light))]/80 rounded-full px-4"
            >
              FR
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="text-gray-500 rounded-full px-4"
            >
              AR
            </Button>
            <div className="w-10 h-10 bg-gray-300 rounded-full ml-4"></div>
          </div>
        </header>

        {/* Left Section - Observatoire des Droits Fondamentaux */}
        <section className="flex-1 bg-gradient-to-br from-blue-100 to-blue-200 pt-24">
          <div className="h-full flex flex-col justify-center px-12 py-8">
            <h2 className="text-4xl font-bold text-[hsl(var(--justclic-blue))] mb-12 text-center">
              Observatoire des Droits Fondamentaux
            </h2>

            <div className="max-w-lg mx-auto space-y-8">
              {/* Search Bar */}
              <Card className="p-6 bg-yellow-100 border-0 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6 text-[hsl(var(--justclic-blue))]" />
                  <Input 
                    placeholder="Rechercher une décision"
                    className="border-0 bg-transparent text-[hsl(var(--justclic-blue))] placeholder:text-[hsl(var(--justclic-blue))]/70 font-medium"
                  />
                </div>
              </Card>

              {/* Textes fondamentaux */}
              <Card className="p-6 bg-gray-50 border-0 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Book className="w-6 h-6 text-[hsl(var(--justclic-blue))]" />
                  <h3 className="text-xl font-semibold text-gray-900">Textes fondamentaux</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                    <span>Constitution</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                    <span>Lois fondamentales</span>
                  </div>
                </div>
              </Card>

              {/* Juridictions */}
              <Card className="p-6 bg-gray-50 border-0 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="w-6 h-6 text-[hsl(var(--justclic-blue))]" />
                  <h3 className="text-xl font-semibold text-gray-900">Juridictions</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Conseil constitutionnel</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Tribunal administratif</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Cour de cassation</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Right Section - Accès aux droits */}
        <section className="flex-1 bg-gradient-to-br from-yellow-100 to-yellow-200 pt-24">
          <div className="h-full flex flex-col justify-center px-12 py-8">
            <h2 className="text-4xl font-bold text-[hsl(var(--justclic-blue))] mb-12 text-center">
              Accès aux droits
            </h2>

            <div className="max-w-lg mx-auto space-y-8">
              {/* Guides pratiques */}
              <Card className="p-6 bg-orange-50 border-0 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Guides pratiques</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <ArrowRight className="w-4 h-4" />
                    <span>Vos droits au quotidien</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 hover:text-[hsl(var(--justclic-blue))] cursor-pointer transition-colors">
                    <ArrowRight className="w-4 h-4" />
                    <span>Publications citoyennes</span>
                  </div>
                </div>
              </Card>

              {/* Campagnes d'information */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-orange-50 border-0 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-[hsl(var(--justclic-blue))]" />
                  <h3 className="text-xl font-semibold text-gray-900">Campagnes d'information</h3>
                </div>
                <Button className="w-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 justify-center">
                  <Map className="w-5 h-5 mr-2" />
                  Carte dynamique interactive
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
          <div className="flex justify-between px-12">
            <nav className="flex space-x-12">
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">Accueil</a>
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">Décisions</a>
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">Fiches pratiques</a>
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">Thématiques</a>
            </nav>
            <nav className="flex space-x-12">
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">JustiClic</a>
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">À propos</a>
              <a href="#" className="text-[hsl(var(--justclic-blue))] hover:underline">Contact</a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
