import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  XCircle, 
  Users, 
  AlertTriangle,
  Plus,
  UserPlus,
  Edit,
  Eye
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

  // Récupérer les dernières activités
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  const recentActions = [
    {
      user: "Marie Dubois",
      action: "Contenu publié",
      content: "Guide juridique 2025",
      time: "Il y a 2 heures"
    },
    {
      user: "Jean Martin",
      action: "Contenu rejeté",
      content: "Article fiscalité",
      time: "Il y a 4 heures"
    },
    {
      user: "Sophie Laurent",
      action: "Utilisateur créé",
      content: "",
      time: "Il y a 6 heures"
    }
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.pending ? (
                <div className={`${themeColors.bg} p-4 rounded-lg border-l-4 border-orange-500`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Contenus en attente de validation</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stats.pending} document{stats.pending > 1 ? 's' : ''} nécessite{stats.pending > 1 ? 'nt' : ''} une validation
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Voir détails
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={`${themeColors.bg} p-4 rounded-lg`}>
                  <p className="text-sm text-muted-foreground">Aucune alerte pour le moment</p>
                </div>
              )}

              {stats?.rejected && stats.rejected > 0 && (
                <div className={`${themeColors.bg} p-4 rounded-lg border-l-4 border-red-500`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Contenus rejetés</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stats.rejected} document{stats.rejected > 1 ? 's' : ''} à corriger
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Gérer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Raccourcis</CardTitle>
            <CardDescription>Actions rapides les plus utilisées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className={`w-full justify-start ${themeColors.badge} text-white hover:opacity-90`}>
              <Plus className="w-4 h-4 mr-2" />
              Créer contenu
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter utilisateur
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="w-4 h-4 mr-2" />
              Contenus en attente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières actions</CardTitle>
          <CardDescription>Activité récente des utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {activity.action?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{activity.entity_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Aucune activité récente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;