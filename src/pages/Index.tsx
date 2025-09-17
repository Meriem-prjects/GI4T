import ObservatoireSection from "@/components/ObservatoireSection";
import AccesAuxDroitsSection from "@/components/AccesAuxDroitsSection";
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
      
      <div className="min-h-screen flex flex-col">
        <HomeHeader />

        {/* Main Content - Split Screen - Full height with gap */}
        <div className="flex-grow flex flex-col md:flex-row mb-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <ObservatoireSection />
          <AccesAuxDroitsSection />
        </div>

        <HomeFooter />
      </div>
    </>
  );
};

export default Index;