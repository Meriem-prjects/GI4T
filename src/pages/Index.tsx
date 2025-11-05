import ObservatoireSection from "@/components/ObservatoireSection";
import AccesAuxDroitsSection from "@/components/AccesAuxDroitsSection";
import ActualitesHomeSection from "@/components/ActualitesHomeSection";
import HomeHeader from "@/components/HomeHeader";
import HomeFooter from "@/components/HomeFooter";

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
      
      <div className="min-h-screen flex flex-col bg-background">
        <HomeHeader />

        {/* Main Content - Card Grid Layout */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto" dir="ltr">
              <ObservatoireSection />
              <AccesAuxDroitsSection />
            </div>
          </div>

          {/* Actualités Section */}
          <ActualitesHomeSection />
        </main>

        <HomeFooter />
      </div>
    </>
  );
};

export default Index;