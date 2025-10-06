import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminCarteInteractive from "./AdminCarteInteractive";
import AdminAccesDroitsUsersManagement from "./AdminAccesDroitsUsersManagement";
import AdminAdressesUtiles from "./AdminAdressesUtiles";
import AdminChatbotConfig from "./AdminChatbotConfig";
import { cn } from "@/lib/utils";

const AdminAccesAuxDroits = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar 
        type="acces-aux-droits"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300",
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
            <Route path="parametres" element={<div className="p-6">Paramètres - En développement</div>} />
            
            {/* Médiathèque */}
            <Route path="mediatheque" element={<div className="p-6">Médiathèque - Vidéos et témoignages - En développement</div>} />
            <Route path="albums-photos" element={<div className="p-6">Albums photos - Galerie événements - En développement</div>} />
            
            {/* Actualités */}
            <Route path="actualites" element={<div className="p-6">Actualités - Dernières nouvelles - En développement</div>} />
            <Route path="ressources-pratiques" element={<div className="p-6">Ressources pratiques - Modèles et formulaires - En développement</div>} />
            <Route path="liens-utiles" element={<div className="p-6">Liens utiles - Sites externes - En développement</div>} />
            <Route path="guides-pratiques" element={<div className="p-6">Guides pratiques - Guides step-by-step - En développement</div>} />
            
            {/* FAQ & Chatbot */}
            <Route path="faq-chatbot" element={<AdminChatbotConfig />} />
            
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