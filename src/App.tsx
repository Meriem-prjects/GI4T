import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Observatoire from "./pages/Observatoire";
import SearchResults from "./pages/SearchResults";
import DecisionDetail from "./pages/DecisionDetail";
import NotFound from "./pages/NotFound";
import TextesFondamentaux from "./pages/TextesFondamentaux";
import AnalysesOpinions from "./pages/AnalysesOpinions";
import Actualites from "./pages/Actualites";
import ODFPartenaires from "./pages/ODFPartenaires";
import Contact from "./pages/Contact";
import AccesAuxDroits from "./pages/AccesAuxDroits";
import GuidesPratiques from "./pages/GuidesPratiques";
import RessourcesPratiques from "./pages/RessourcesPratiques";
import CarteInteractive from "./pages/CarteInteractive";
import Mediatheque from "./pages/Mediatheque";
import RechercheAvancee from "./pages/RechercheAvancee";
import APropos from "./pages/APropos";
import QuiSommesNous from "./pages/QuiSommesNous";
import Methodologie from "./pages/Methodologie";
import MentionsLegales from "./pages/MentionsLegales";
import PlanDuSite from "./pages/PlanDuSite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/observatoire" element={<Observatoire />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/decision/:id" element={<DecisionDetail />} />
          <Route path="/textes-fondamentaux" element={<TextesFondamentaux />} />
          <Route path="/analyses-opinions" element={<AnalysesOpinions />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/odf-partenaires" element={<ODFPartenaires />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Accès aux droits interface */}
          <Route path="/acces-aux-droits" element={<AccesAuxDroits />} />
          <Route path="/guides-pratiques" element={<GuidesPratiques />} />
          <Route path="/ressources-pratiques" element={<RessourcesPratiques />} />
          <Route path="/carte-interactive" element={<CarteInteractive />} />
          <Route path="/mediatheque" element={<Mediatheque />} />
          
          {/* Enhanced observatoire features */}
          <Route path="/recherche-avancee" element={<RechercheAvancee />} />
          
          {/* Institutional pages */}
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/qui-sommes-nous" element={<QuiSommesNous />} />
          <Route path="/methodologie" element={<Methodologie />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/plan-du-site" element={<PlanDuSite />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
