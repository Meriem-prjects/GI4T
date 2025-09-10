import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeSection, setActiveSection] = useState<"left" | "right">("left");

  return (
    <>
      {/* SEO Meta Tags */}
      <title>JustClic.tn - Information citoyenne simplifiée | Accès aux droits fondamentaux</title>
      <meta name="description" content="JustClic.tn facilite l'accès aux droits fondamentaux en Tunisie. Observatoire des droits et plateforme citoyenne pour une information simplifiée." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      <div className="flex min-h-screen">
        {/* Left Section - Observatoire des Droits Fondamentaux */}
        <section 
          className={`flex-1 transition-all duration-700 ease-in-out ${
            activeSection === "left" ? "flex-[1.2]" : "flex-[0.8]"
          }`}
          style={{
            background: "linear-gradient(135deg, hsl(212, 100%, 94%), hsl(224, 76%, 78%))"
          }}
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-md w-full">
              <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[hsl(var(--justclic-blue))]">
                Observatoire des Droits Fondamentaux
              </h1>
              
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="left-email" className="text-sm font-medium text-[hsl(var(--justclic-blue))]">
                      Adresse e-mail
                    </label>
                    <Input 
                      id="left-email"
                      type="email" 
                      placeholder="votre@email.com"
                      className="border-[hsl(var(--justclic-blue))] focus:ring-[hsl(var(--justclic-blue))]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="left-password" className="text-sm font-medium text-[hsl(var(--justclic-blue))]">
                      Mot de passe
                    </label>
                    <Input 
                      id="left-password"
                      type="password" 
                      placeholder="••••••••"
                      className="border-[hsl(var(--justclic-blue))] focus:ring-[hsl(var(--justclic-blue))]"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-[hsl(var(--justclic-blue))] hover:bg-[hsl(var(--justclic-blue))]/90 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
                    onClick={() => setActiveSection("left")}
                  >
                    Accéder à l'Observatoire
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <a href="#" className="text-sm text-[hsl(var(--justclic-blue))] hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Center Logo */}
        <div className="absolute left-1/2 top-8 transform -translate-x-1/2 z-10">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center">
              <h1 className="text-3xl font-bold tracking-wide">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">JUST</span>
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">CLIC</span>
                <span className="text-red-500 text-xl">.tn</span>
              </h1>
            </div>
            <p className="text-center text-sm text-[hsl(var(--justclic-blue))] mt-2 font-medium">
              Information citoyenne simplifiée
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="absolute top-8 right-8 flex items-center space-x-2 z-10">
          <Button 
            variant="outline"
            size="sm"
            className="bg-white/90 text-[hsl(var(--justclic-blue))] border-[hsl(var(--justclic-blue))]"
          >
            FR
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            AR
          </Button>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>

        {/* Right Section - Accès aux droits */}
        <section 
          className={`flex-1 transition-all duration-700 ease-in-out ${
            activeSection === "right" ? "flex-[1.2]" : "flex-[0.8]"
          }`}
          style={{
            background: "linear-gradient(135deg, hsl(46, 100%, 88%), hsl(46, 87%, 75%))"
          }}
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-md w-full">
              <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[hsl(var(--justclic-blue))]">
                Accès aux droits
              </h1>
              
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="right-email" className="text-sm font-medium text-[hsl(var(--justclic-blue))]">
                      Adresse e-mail
                    </label>
                    <Input 
                      id="right-email"
                      type="email" 
                      placeholder="votre@email.com"
                      className="border-[hsl(var(--justclic-blue))] focus:ring-[hsl(var(--justclic-blue))]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="right-password" className="text-sm font-medium text-[hsl(var(--justclic-blue))]">
                      Mot de passe
                    </label>
                    <Input 
                      id="right-password"
                      type="password" 
                      placeholder="••••••••"
                      className="border-[hsl(var(--justclic-blue))] focus:ring-[hsl(var(--justclic-blue))]"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-[hsl(var(--justclic-blue))] hover:bg-[hsl(var(--justclic-blue))]/90 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
                    onClick={() => setActiveSection("right")}
                  >
                    Accéder aux droits
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <a href="#" className="text-sm text-[hsl(var(--justclic-blue))] hover:underline">
                    Créer un compte
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
