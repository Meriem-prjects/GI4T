import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminEditor from "./AdminEditor";
import AdminContenus from "./AdminContenus";
import AdminValidation from "./AdminValidation";
import AdminParametres from "./AdminParametres";
import AdminUsersManagement from "@/components/admin/AdminUsersManagement";
import AdminCommentaires from "./AdminCommentaires";
import AdminStatistiques from "./AdminStatistiques";
import AdminBlogs from "./AdminBlogs";
import AdminCommentairesContent from "./AdminCommentairesContent";
import AdminAnalysesJuridiques from "./AdminAnalysesJuridiques";
import AdminFichesJurisprudence from "./AdminFichesJurisprudence";
import AdminActualites from "./AdminActualites";
import AdminActualitesEditor from "./AdminActualitesEditor";
import AdminHistorique from "./AdminHistorique";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const AdminObservatoire = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="ltr">
      <AdminSidebar 
        type="observatoire"
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
                Administration Observatoire des Droits
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50">
          <Routes>
            <Route index element={<AdminDashboard type="observatoire" />} />
            <Route path="utilisateurs" element={<AdminUsersManagement />} />
            <Route path="contenus" element={<AdminContenus />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="commentaires-content" element={<AdminCommentairesContent />} />
            <Route path="analyses-juridiques" element={<AdminAnalysesJuridiques />} />
            <Route path="fiches-jurisprudence" element={<AdminFichesJurisprudence />} />
            <Route path="actualites" element={<AdminActualites />} />
            <Route path="actualites/new" element={<AdminActualitesEditor />} />
            <Route path="actualites/edit/:id" element={<AdminActualitesEditor />} />
            <Route path="editeur" element={<AdminEditor />} />
            <Route path="validation" element={<AdminValidation />} />
            <Route path="commentaires" element={<AdminCommentaires />} />
            <Route path="statistiques" element={<AdminStatistiques />} />
            <Route path="historique" element={<AdminHistorique />} />
            <Route path="parametres" element={<AdminParametres />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminObservatoire;
