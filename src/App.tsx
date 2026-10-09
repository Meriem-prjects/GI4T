import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ObservatoireProtectedRoute from "@/components/admin/ObservatoireProtectedRoute";
import AccesDroitsProtectedRoute from "@/components/admin/AccesDroitsProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingAssistant from "@/components/FloatingAssistant";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Observatoire from "./pages/Observatoire";
import SearchResults from "./pages/SearchResults";

import NotFound from "./pages/NotFound";
import TextesFondamentaux from "./pages/TextesFondamentaux";
import OdfTypeListPage from "./pages/OdfTypeListPage";
import OdfHub from "./components/observatoire/OdfHub";
import Actualites from "./pages/Actualites";
import ActualiteDetail from "./pages/ActualiteDetail";
import AccesAuxDroits from "./pages/AccesAuxDroits";
import GuidesPratiques from "./pages/GuidesPratiques";
import RessourcesPratiques from "./pages/RessourcesPratiques";
import CarteInteractive from "./pages/CarteInteractive";
import Mediatheque from "./pages/Mediatheque";
import Publications from "./pages/Publications";
import LiensUtiles from "./pages/LiensUtiles";
import AlbumsPhotos from "./pages/AlbumsPhotos";
import AdressesUtiles from "./pages/AdressesUtiles";
import ActualitesAccesDroits from "./pages/ActualitesAccesDroits";
import AccesAuxDroitsLayout from "./layouts/AccesAuxDroitsLayout";
import ObservatoireLayout from "./layouts/ObservatoireLayout";
import InformationLayout from "./layouts/InformationLayout";
import QuiSommesNous from "./pages/QuiSommesNous";
import InformationActualites from "./pages/InformationActualites";
import FAQChatbot from "./pages/FAQChatbot";
import FoireAuxQuestions from "./pages/FoireAuxQuestions";
import AssistantVirtuel from "./pages/AssistantVirtuel";
import AdminSelector from "./pages/admin/AdminSelector";
import AdminObservatoire from "./pages/admin/AdminObservatoire";
import AdminAccesAuxDroits from "./pages/admin/AdminAccesAuxDroits";
import AdminChatbotConfig from "./pages/admin/AdminChatbotConfig";
import AdminObservatoireLogin from "./pages/admin/AdminObservatoireLogin";
import AdminAccesDroitsLogin from "./pages/admin/AdminAccesDroitsLogin";
import CategorieDetail from "./pages/CategorieDetail";
import DocumentDetail from "./pages/DocumentDetail";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <LanguageProvider>
          <AuthProvider>
            <ErrorBoundary>
            <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin Selector - Public */}
            <Route path="/admin" element={<AdminSelector />} />
            
            {/* Admin Login Pages - Public */}
            <Route path="/admin/observatoire/login" element={<AdminObservatoireLogin />} />
            <Route path="/admin/acces-aux-droits/login" element={<AdminAccesDroitsLogin />} />
            
            {/* Observatoire interface */}
          <Route element={<ObservatoireLayout />}>
            <Route path="/observatoire" element={<Observatoire />} />
            <Route path="/observatoire/search-results" element={<SearchResults />} />
            <Route path="/observatoire/droits-fondamentaux" element={<TextesFondamentaux />} />
            <Route path="/observatoire/droits-fondamentaux/:categorySlug" element={<CategorieDetail />} />
            <Route path="/observatoire/droits-fondamentaux/:categorySlug/:documentSlug" element={<DocumentDetail />} />
            <Route path="/observatoire/document/:documentId/:slug?" element={<DocumentDetail />} />
            <Route path="/observatoire/analyses-opinions" element={<OdfHub hub="analyses" />} />
            <Route path="/observatoire/publications" element={<OdfHub hub="publications" />} />
            <Route path="/observatoire/fiches-jurisprudence" element={<OdfTypeListPage typeKey="fiches" />} />
            <Route path="/observatoire/analyses-juridiques" element={<OdfTypeListPage typeKey="analyses" />} />
            <Route path="/observatoire/analyses-juridiques/:categorySlug" element={<OdfTypeListPage typeKey="analyses" />} />
            <Route path="/observatoire/analyses-juridiques/:categorySlug/:documentSlug" element={<DocumentDetail />} />
            <Route path="/observatoire/approche-sociologique" element={<OdfTypeListPage typeKey="articles" />} />
            <Route path="/observatoire/approche-economique" element={<OdfTypeListPage typeKey="economie" />} />
            <Route path="/observatoire/articles" element={<Navigate to="/observatoire/approche-sociologique" replace />} />
            <Route path="/observatoire/commentaires" element={<OdfTypeListPage typeKey="commentaires" />} />
            <Route path="/observatoire/blogs" element={<OdfTypeListPage typeKey="blogs" />} />
            <Route path="/observatoire/recueils" element={<OdfTypeListPage typeKey="recueils" />} />
            <Route path="/observatoire/notes-thematiques" element={<OdfTypeListPage typeKey="notes" />} />
            <Route path="/observatoire/policy-briefs" element={<OdfTypeListPage typeKey="policy" />} />
            <Route path="/observatoire/presentations" element={<OdfTypeListPage typeKey="presentations" />} />
            <Route path="/observatoire/actualites" element={<Actualites />} />
            <Route path="/observatoire/actualites/:newsId" element={<ActualiteDetail />} />
          </Route>
          
          {/* Accès aux droits interface - Unified Layout */}
          <Route element={<AccesAuxDroitsLayout />}>
            <Route path="/acces-aux-droits" element={<AccesAuxDroits />} />
            <Route path="/acces-aux-droits/carte-interactive" element={<CarteInteractive />} />
            <Route path="/acces-aux-droits/adresses-utiles" element={<AdressesUtiles />} />
            <Route path="/acces-aux-droits/mediatheque" element={<Mediatheque />} />
            <Route path="/acces-aux-droits/albums-photos" element={<AlbumsPhotos />} />
            <Route path="/acces-aux-droits/actualites" element={<ActualitesAccesDroits />} />
            <Route path="/acces-aux-droits/foire-aux-questions" element={<FoireAuxQuestions />} />
            <Route path="/acces-aux-droits/assistant-virtuel" element={<AssistantVirtuel />} />
            <Route path="/acces-aux-droits/ressources-pratiques" element={<RessourcesPratiques />} />
            <Route path="/acces-aux-droits/liens-utiles" element={<LiensUtiles />} />
            <Route path="/acces-aux-droits/guides-pratiques" element={<GuidesPratiques />} />
            <Route path="/acces-aux-droits/publications" element={<Publications />} />
          </Route>
          
          {/* Information interface */}
          <Route element={<InformationLayout />}>
            <Route path="/information/qui-sommes-nous" element={<QuiSommesNous />} />
            <Route path="/information/actualites" element={<InformationActualites />} />
            <Route path="/information/faq-chatbot" element={<FAQChatbot />} />
          </Route>
          
          {/* Admin interface - Protected with specific roles */}
          <Route path="/admin/observatoire/*" element={<ObservatoireProtectedRoute><AdminObservatoire /></ObservatoireProtectedRoute>} />
          <Route path="/admin/acces-aux-droits/*" element={<AccesDroitsProtectedRoute><AdminAccesAuxDroits /></AccesDroitsProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
            </ErrorBoundary>
        {/* Global chat bubble — hidden on the full assistant page and on
            all /admin/* routes (handled internally via useLocation). */}
        <FloatingAssistant />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
