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
            <Route path="/observatoire/search-results" element={<SearchResults />} />
            <Route path="/observatoire/textes-fondamentaux" element={<TextesFondamentaux />} />
            <Route path="/observatoire/analyses-opinions" element={<AnalysesOpinions />} />
            <Route path="/observatoire/actualites" element={<Actualites />} />
          </Route>
          
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
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
