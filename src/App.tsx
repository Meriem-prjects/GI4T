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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
