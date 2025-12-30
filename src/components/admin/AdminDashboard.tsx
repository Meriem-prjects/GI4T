import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  XCircle, 
  Users,
  AlertTriangle,
  Plus,
  UserPlus,
  Eye,
  BarChart3,
  CheckCircle,
  Edit,
  Trash,
  Activity,
  LucideIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AdminDashboardProps {
  type: "observatoire" | "acces-aux-droits";
}

const AdminDashboard = ({ type }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const basePath = type === "observatoire" ? "/admin/observatoire" : "/admin/acces-aux-droits";
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

  // Fonction pour formater les messages d'activité
  const formatActivityMessage = (activity: any): { message: string; icon: LucideIcon; color: string } => {
    const { entity_type, action, details } = activity;
    
    if (entity_type === 'document' && action === 'status_change') {
      const newStatus = details?.new_status;
      
      if (newStatus === 'processed') {
        return { message: 'Document validé', icon: CheckCircle, color: 'text-green-500 bg-green-100' };
      } else if (newStatus === 'pending_validation') {
        return { message: 'Document soumis pour validation', icon: Clock, color: 'text-yellow-600 bg-yellow-100' };
      } else if (newStatus === 'rejected' || newStatus === 'draft') {
        return { message: 'Document rejeté', icon: XCircle, color: 'text-red-500 bg-red-100' };
      }
      return { message: 'Statut modifié', icon: Edit, color: 'text-blue-500 bg-blue-100' };
    }
    
    // Actions génériques
    const actionLabels: Record<string, { message: string; icon: LucideIcon; color: string }> = {
      'create': { message: 'Nouveau contenu créé', icon: Plus, color: 'text-green-500 bg-green-100' },
      'update': { message: 'Contenu modifié', icon: Edit, color: 'text-blue-500 bg-blue-100' },
      'delete': { message: 'Contenu supprimé', icon: Trash, color: 'text-red-500 bg-red-100' },
    };
    
    return actionLabels[action] || { message: action || 'Action', icon: Activity, color: 'text-gray-500 bg-gray-100' };
  };

  // Récupérer les dernières activités (uniquement pour Observatoire)
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      if (type !== "observatoire") return [];
      
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: type === "observatoire"
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
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`${basePath}/contenus`)}
        >
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

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`${basePath}/validation`)}
        >
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
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`${basePath}/contenus`)}
          >
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

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`${basePath}/utilisateurs`)}
        >
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

      {/* Alertes et Raccourcis - Uniquement pour Observatoire */}
      {type === "observatoire" && (
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`${basePath}/validation`)}
                      >
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`${basePath}/contenus`)}
                      >
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
              <Button 
                className={`w-full justify-start ${themeColors.badge} text-white hover:opacity-90`}
                onClick={() => navigate(`${basePath}/editeur`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer contenu
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`${basePath}/utilisateurs`)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter utilisateur
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`${basePath}/validation`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Contenus en attente
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`${basePath}/statistiques`)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Voir les statistiques détaillées
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Actions - Uniquement pour Observatoire */}
      {type === "observatoire" && (
        <Card>
          <CardHeader>
            <CardTitle>Dernières actions</CardTitle>
            <CardDescription>Activité récente des utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const formatted = formatActivityMessage(activity);
                  const IconComponent = formatted.icon;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formatted.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{formatted.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.entity_type === 'document' ? 'Document' : 'Contenu'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Aucune activité récente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;