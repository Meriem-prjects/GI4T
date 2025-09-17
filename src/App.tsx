import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Observatoire from "./pages/Observatoire";
import SearchResults from "./pages/SearchResults";
import SearchResultsRedirect from "./components/SearchResultsRedirect";
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
import Publications from "./pages/Publications";
import LiensUtiles from "./pages/LiensUtiles";
import AlbumsPhotos from "./pages/AlbumsPhotos";
import Partenaires from "./pages/Partenaires";
import ChatbotFAQ from "./pages/ChatbotFAQ";
import ReseauxSociaux from "./pages/ReseauxSociaux";
import CGUCookies from "./pages/CGUCookies";
import AccesAuxDroitsLayout from "./layouts/AccesAuxDroitsLayout";
import ObservatoireLayout from "./layouts/ObservatoireLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/observatoire/*" element={<Observatoire />} />
          <Route element={<ObservatoireLayout />}>
            <Route path="/observatoire/recherche/search-results" element={<SearchResults />} />
          </Route>
          {/* Legacy redirect for old search-results URL */}
          <Route path="/search-results" element={<SearchResultsRedirect />} />
          <Route path="/decision/:id" element={<DecisionDetail />} />
          
          {/* Standalone observatoire pages - moved to nested structure */}
          
          <Route path="/odf-partenaires" element={<ODFPartenaires />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Accès aux droits interface */}
          <Route path="/acces-aux-droits" element={<AccesAuxDroits />} />
          <Route element={<AccesAuxDroitsLayout />}>
            <Route path="/guides-pratiques" element={<GuidesPratiques />} />
            <Route path="/ressources-pratiques" element={<RessourcesPratiques />} />
            <Route path="/carte-interactive" element={<CarteInteractive />} />
            <Route path="/mediatheque" element={<Mediatheque />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/liens-utiles" element={<LiensUtiles />} />
            <Route path="/albums-photos" element={<AlbumsPhotos />} />
          </Route>
          <Route path="/partenaires" element={<Partenaires />} />
          <Route path="/chatbot-faq" element={<ChatbotFAQ />} />
          <Route path="/reseaux-sociaux" element={<ReseauxSociaux />} />
          <Route path="/cgu-cookies" element={<CGUCookies />} />
          
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
