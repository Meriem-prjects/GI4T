import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminCarteInteractive from "./AdminCarteInteractive";
import AdminAccesDroitsUsersManagement from "./AdminAccesDroitsUsersManagement";
import AdminAdressesUtiles from "./AdminAdressesUtiles";
import AdminChatbotConfig from "./AdminChatbotConfig";
import AdminFAQQuestions from "./AdminFAQQuestions";
import AdminAlbumsPhotos from "./AdminAlbumsPhotos";
import AdminMediatheque from "./AdminMediatheque";
import AdminActualites from "./AdminActualites";
import AdminActualitesEditor from "./AdminActualitesEditor";
import AdminUsefulLinks from "./AdminUsefulLinks";
import AdminPracticalResources from "./AdminPracticalResources";
import AdminPracticalGuides from "./AdminPracticalGuides";
import AdminAccesDroitsParametres from "./AdminAccesDroitsParametres";
import { cn } from "@/lib/utils";

const AdminAccesAuxDroits = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="ltr">
      <AdminSidebar
        type="acces-aux-droits"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={cn(
        "flex-1 overflow-y-scroll transition-all duration-300",
        sidebarCollapsed ? "ml-0" : "ml-0"
      )}>
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Administration Accès aux Droits
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-slate-50">
          <Routes>
            <Route index element={<AdminDashboard type="acces-aux-droits" />} />
            <Route path="utilisateurs" element={<AdminAccesDroitsUsersManagement />} />
            <Route path="parametres" element={<AdminAccesDroitsParametres />} />

            {/* Médiathèque */}
            <Route path="mediatheque" element={<AdminMediatheque />} />
            <Route path="albums-photos" element={<AdminAlbumsPhotos />} />

            {/* Actualités — scoped to acces_droits so the list & editor stay isolated. */}
            <Route path="actualites" element={<AdminActualites section="acces_droits" />} />
            <Route path="actualites/new" element={<AdminActualitesEditor section="acces_droits" />} />
            <Route path="actualites/edit/:id" element={<AdminActualitesEditor section="acces_droits" />} />
            <Route path="ressources-pratiques" element={<AdminPracticalResources />} />
            <Route path="liens-utiles" element={<AdminUsefulLinks />} />
            <Route path="guides-pratiques" element={<AdminPracticalGuides />} />

            {/* FAQ & Chatbot */}
            <Route path="faq-chatbot" element={<AdminChatbotConfig />} />
            <Route path="faq-questions" element={<AdminFAQQuestions />} />

            {/* Carte interactive */}
            <Route path="carte-interactive" element={<AdminCarteInteractive />} />
            <Route path="adresses-utiles" element={<AdminAdressesUtiles />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminAccesAuxDroits;