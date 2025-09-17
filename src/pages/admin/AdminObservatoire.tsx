import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminEditor from "./AdminEditor";
import { cn } from "@/lib/utils";

const AdminObservatoire = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar 
        type="observatoire"
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
                Administration Observatoire des Droits
              </h1>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50">
          <Routes>
            <Route index element={<AdminDashboard type="observatoire" />} />
            <Route path="utilisateurs" element={<div className="p-6">Utilisateurs - En développement</div>} />
            <Route path="contenus" element={<div className="p-6">Contenus - En développement</div>} />
            <Route path="editeur" element={<AdminEditor />} />
            <Route path="validation" element={<div className="p-6">Validation - En développement</div>} />
            <Route path="historique" element={<div className="p-6">Historique - En développement</div>} />
            <Route path="mediatheque" element={<div className="p-6">Médiathèque - En développement</div>} />
            <Route path="parametres" element={<div className="p-6">Paramètres - En développement</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminObservatoire;