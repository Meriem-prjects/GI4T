import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  XCircle, 
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminDashboardProps {
  type: "observatoire" | "acces-aux-droits";
}

const AdminDashboard = ({ type }: AdminDashboardProps) => {
  const themeColors = type === "observatoire" 
    ? {
        primary: "text-[hsl(var(--justclic-blue))]",
        bg: "bg-[hsl(var(--justclic-blue-light))]",
        badge: "bg-[hsl(var(--justclic-blue))]"
      }
    : {
        primary: "text-[hsl(var(--accent))]",
        bg: "bg-[hsl(var(--justclic-yellow-light))]",
        badge: "bg-[hsl(var(--accent))]"
      };

  const sectionTitle = type === "observatoire" ? "Observatoire des Droits" : "Accès aux Droits";

  // Récupérer les statistiques réelles selon le type d'administration
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", type],
    queryFn: async () => {
      if (type === "observatoire") {
        // Statistiques pour l'Observatoire des Droits (documents juridiques)
        const { count: publishedCount } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("status", "processed");

        const { count: pendingCount } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_validation");

        const { count: rejectedCount } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft");

        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        return {
          published: publishedCount || 0,
          pending: pendingCount || 0,
          rejected: rejectedCount || 0,
          activeUsers: usersCount || 0,
        };
      } else {
        // Statistiques pour Accès aux Droits (événements)
        const { count: publishedCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "published");

        const { count: draftCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft");

        const { count: totalEvents } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        const { count: registrationsCount } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true });

        return {
          published: publishedCount || 0,
          pending: draftCount || 0,
          rejected: 0, // Pas de statut "rejeté" pour les événements
          activeUsers: registrationsCount || 0,
        };
      }
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vue d'ensemble</h1>
        <p className="text-muted-foreground">
          Accès rapide aux statistiques et actions clés - {sectionTitle}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {type === "observatoire" ? "Contenus publiés" : "Événements publiés"}
            </CardTitle>
            <FileText className={`w-4 h-4 ${themeColors.primary}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.published}</div>
                <p className="text-xs text-muted-foreground">
                  {type === "observatoire" ? "Documents validés et publiés" : "Événements actifs"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {type === "observatoire" ? "En attente" : "Brouillons"}
            </CardTitle>
            <Clock className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {type === "observatoire" ? "Nécessitent une validation" : "Événements non publiés"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {type === "observatoire" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.rejected}</div>
                  <p className="text-xs text-muted-foreground">
                    À corriger et resoumettre
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {type === "observatoire" ? "Utilisateurs actifs" : "Inscriptions"}
            </CardTitle>
            <Users className={`w-4 h-4 ${themeColors.primary}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {type === "observatoire" ? "Comptes utilisateurs créés" : "Inscriptions aux événements"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;