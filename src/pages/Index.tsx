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
      
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Sections */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-[#DCEBFE]"></div>
          <div className="w-1/2 bg-[#FFF3C7]"></div>
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 w-full h-[246px] bg-white z-10">
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* Logo Placeholder - Using text until logo is available */}
            <div className="text-center mt-6">
              <h1 className="text-5xl font-bold tracking-wide">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">JUST</span>
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">CLIC</span>
                <span className="text-red-500 text-3xl">.tn</span>
              </h1>
            </div>
            <p className="text-center text-[#4B61E5] text-[30px] font-poppins font-semibold mt-2">
              Information citoyenne simplifiée
            </p>
            
            {/* Language Switcher & Profile */}
            <div className="absolute top-[68px] right-[124px] flex items-center gap-5">
              <div className="flex items-center">
                <Button className="bg-[#EEF2FF] text-[#4B61E5] hover:bg-[#EEF2FF]/80 rounded-full px-8 py-4 text-[35px] font-inter font-medium h-[71px] border-0">
                  FR
                </Button>
                <Button variant="ghost" className="text-[#6B7280] hover:bg-transparent rounded-full px-8 py-4 text-[35px] font-inter font-medium h-[71px]">
                  AR
                </Button>
              </div>
              <div className="w-[103px] h-[103px] bg-gray-200 rounded-full border-[3px] border-white"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="absolute top-[246px] left-0 right-0 bottom-0 flex">
          {/* Left Section - Blue Background */}
          <div className="w-1/2 flex flex-col items-center relative px-[513px] pt-[468px]">
            {/* Title */}
            <h2 className="text-[#4B61E5] text-[46px] font-spartan font-semibold leading-[72px] text-center mb-[176px]">
              Observatoire des Droits Fondamentaux
            </h2>
            
            {/* Search Bar */}
            <div className="mb-[36px]">
              <Button className="w-[780px] h-[83px] bg-[#FFF3C8] hover:bg-[#FFF3C8]/90 text-[#1E2E96] rounded-[18px] shadow-lg border-0 flex items-center justify-center gap-4">
                <Search className="w-6 h-6" />
                <span className="text-[24px] font-poppins font-semibold">Rechercher une décision</span>
              </Button>
            </div>

            {/* Cards */}
            <div className="space-y-[36px]">
              {/* Textes fondamentaux */}
              <Card className="w-[780px] bg-[#F9FAFB] rounded-[18px] border-0 shadow-sm">
                <CardContent className="p-9">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-[27px] h-[24px] text-[#1E40AF]" />
                    <h3 className="text-[#111827] text-[24px] font-poppins font-semibold">Textes fondamentaux</h3>
                  </div>
                  <div className="space-y-4 ml-9">
                    <div className="flex items-center gap-4 text-[#374151] text-[24px] font-poppins">
                      <div className="w-4 h-5 bg-[#374151] rounded-sm flex-shrink-0"></div>
                      Constitution
                    </div>
                    <div className="flex items-center gap-4 text-[#374151] text-[24px] font-poppins">
                      <div className="w-4 h-5 bg-[#374151] rounded-sm flex-shrink-0"></div>
                      Lois fondamentales
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Juridictions */}
              <Card className="w-[780px] bg-[#F9FAFB] rounded-[18px] border-0 shadow-sm">
                <CardContent className="p-9">
                  <div className="flex items-center gap-3 mb-6">
                    <Building className="w-6 h-6 text-[#1E40AF]" />
                    <h3 className="text-[#111827] text-[24px] font-poppins font-semibold">Juridictions</h3>
                  </div>
                  <div className="space-y-4 ml-9">
                    <div className="flex items-center gap-4 text-[#374151] text-[24px] font-poppins">
                      <div className="w-[18px] h-[18px] bg-[#374151] rounded-full flex-shrink-0"></div>
                      Conseil constitutionnel
                    </div>
                    <div className="flex items-center gap-4 text-[#374151] text-[24px] font-poppins">
                      <div className="w-[18px] h-[18px] bg-[#374151] rounded-full flex-shrink-0"></div>
                      Tribunal administratif
                    </div>
                    <div className="flex items-center gap-4 text-[#374151] text-[24px] font-poppins">
                      <div className="w-[18px] h-[18px] bg-[#374151] rounded-full flex-shrink-0"></div>
                      Cour de cassation
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Section - Yellow Background */}
          <div className="w-1/2 flex flex-col items-center relative px-[256px] pt-[469px]">
            {/* Title */}
            <h2 className="text-[#4B61E5] text-[46px] font-spartan font-semibold leading-[72px] text-center mb-[175px]">
              Accès aux droits
            </h2>

            {/* Cards */}
            <div className="space-y-[36px]">
              {/* Guides pratiques */}
              <Card className="w-[780px] bg-[#FFF7ED] rounded-[18px] border-0 shadow-sm">
                <CardContent className="p-9">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-[21px] h-6 text-[#F97316]" />
                    <h3 className="text-[#111827] text-[24px] font-poppins font-semibold">Guides pratiques</h3>
                  </div>
                  <div className="space-y-4 ml-9">
                    <div className="flex items-center justify-between text-[#374151] text-[24px] font-poppins">
                      <span>Vos droits au quotidien</span>
                      <ChevronRight className="w-[18px] h-[21px]" />
                    </div>
                    <div className="flex items-center justify-between text-[#374151] text-[24px] font-poppins">
                      <span>Publications citoyennes</span>
                      <ChevronRight className="w-[18px] h-[21px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campagnes d'information */}
              <Card className="w-[780px] bg-gradient-to-r from-[#EFF6FF] to-[#FFF7ED] rounded-[18px] border-0 shadow-sm">
                <CardContent className="p-9">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-[27px] h-6 text-[#1E40AF]" />
                    <h3 className="text-[#111827] text-[24px] font-poppins font-semibold">Campagnes d'information</h3>
                  </div>
                  
                  <Button className="w-[709px] h-[74px] bg-white hover:bg-white/90 text-[#374151] border border-[#E5E7EB] rounded-[12px] shadow-sm flex items-center justify-center gap-4 ml-9">
                    <Map className="w-[27px] h-6 text-[#374151]" />
                    <span className="text-[24px] font-poppins font-medium">Carte dynamique interactive</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-8 left-0 right-0 bg-transparent py-4 z-10">
          <div className="flex justify-center gap-12">
            <div className="flex gap-12 text-[#4B5FE4]">
              <a href="#" className="text-[25px] font-poppins font-medium hover:text-[#4B5FE4]/80">Accueil</a>
              <a href="#" className="text-[25px] font-poppins hover:text-[#4B5FE4]/80">Décisions</a>
              <a href="#" className="text-[25px] font-poppins hover:text-[#4B5FE4]/80">Fiches pratiques</a>
              <a href="#" className="text-[25px] font-poppins hover:text-[#4B5FE4]/80">Thématiques</a>
            </div>
            <div className="flex gap-12 text-[#4B5FE4]">
              <a href="#" className="text-[25px] font-poppins hover:text-[#4B5FE4]/80">JustiClic</a>
              <a href="#" className="text-[25px] font-poppins hover:text-[#4B5FE4]/80">À propos</a>
              <a href="#" className="text-[25px] font-poppins hover:text-[#4B5FE4]/80">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
