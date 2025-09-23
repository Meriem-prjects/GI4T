import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Observatoire from "./pages/Observatoire";
import SearchResults from "./pages/SearchResults";

import NotFound from "./pages/NotFound";
import TextesFondamentaux from "./pages/TextesFondamentaux";
import AnalysesOpinions from "./pages/AnalysesOpinions";
import Actualites from "./pages/Actualites";
import AccesAuxDroits from "./pages/AccesAuxDroits";
import GuidesPratiques from "./pages/GuidesPratiques";
import RessourcesPratiques from "./pages/RessourcesPratiques";
import CarteInteractive from "./pages/CarteInteractive";
import Mediatheque from "./pages/Mediatheque";
import Publications from "./pages/Publications";
import LiensUtiles from "./pages/LiensUtiles";
import AlbumsPhotos from "./pages/AlbumsPhotos";
import AccesAuxDroitsLayout from "./layouts/AccesAuxDroitsLayout";
import ObservatoireLayout from "./layouts/ObservatoireLayout";
import InformationLayout from "./layouts/InformationLayout";
import QuiSommesNous from "./pages/QuiSommesNous";
import InformationActualites from "./pages/InformationActualites";
import FAQChatbot from "./pages/FAQChatbot";
import AdminMain from "./pages/admin/AdminMain";
import AdminObservatoire from "./pages/admin/AdminObservatoire";
import AdminAccesAuxDroits from "./pages/admin/AdminAccesAuxDroits";
import CategorieDetail from "./pages/CategorieDetail";
import DocumentDetail from "./pages/DocumentDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          
          {/* Observatoire interface - Routes spécifiques d'abord */}
          <Route element={<ObservatoireLayout />}>
            <Route path="/observatoire/search-results" element={<SearchResults />} />
            <Route path="/observatoire/droits-fondamentaux" element={<TextesFondamentaux />} />
            <Route path="/observatoire/droits-fondamentaux/:categorySlug" element={<CategorieDetail />} />
            <Route path="/observatoire/droits-fondamentaux/:categorySlug/:documentSlug" element={<DocumentDetail />} />
            <Route path="/observatoire/analyses-opinions" element={<AnalysesOpinions />} />
            <Route path="/observatoire/actualites" element={<Actualites />} />
          </Route>
          
          {/* Route générale observatoire en dernier */}
          <Route path="/observatoire" element={<Observatoire />} />
          
          {/* Accès aux droits interface */}
          <Route path="/acces-aux-droits" element={<AccesAuxDroits />} />
          <Route element={<AccesAuxDroitsLayout />}>
            <Route path="/acces-aux-droits/guides-pratiques" element={<GuidesPratiques />} />
            <Route path="/acces-aux-droits/ressources-pratiques" element={<RessourcesPratiques />} />
            <Route path="/acces-aux-droits/carte-interactive" element={<CarteInteractive />} />
            <Route path="/acces-aux-droits/mediatheque" element={<Mediatheque />} />
            <Route path="/acces-aux-droits/publications" element={<Publications />} />
            <Route path="/acces-aux-droits/liens-utiles" element={<LiensUtiles />} />
            <Route path="/acces-aux-droits/albums-photos" element={<AlbumsPhotos />} />
          </Route>
          
          {/* Information interface */}
          <Route element={<InformationLayout />}>
            <Route path="/information/qui-sommes-nous" element={<QuiSommesNous />} />
            <Route path="/information/actualites" element={<InformationActualites />} />
            <Route path="/information/faq-chatbot" element={<FAQChatbot />} />
          </Route>
          
          {/* Admin interface */}
          <Route path="/admin" element={<AdminMain />} />
          <Route path="/admin/observatoire/*" element={<AdminObservatoire />} />
          <Route path="/admin/acces-aux-droits/*" element={<AdminAccesAuxDroits />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
