import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit, 
  Plus, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  History
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ITEMS_PER_PAGE = 20;

const AdminHistorique = () => {
  const { isAdmin } = useAuth();
  const [period, setPeriod] = useState("30");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Vérification d'accès - uniquement pour les super admins
  if (!isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Cette page est réservée aux administrateurs avec accès complet.
          Seuls les super-administrateurs peuvent consulter l'historique des actions.
        </p>
      </div>
    );
  }

  // Formater les messages d'action
  const formatAction = (action: string, details: any) => {
    const newStatus = details?.new_status;
    const oldStatus = details?.old_status;

    if (action === 'status_change') {
      if (newStatus === 'processed') {
        return { message: 'Document validé', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      }
      if (newStatus === 'pending_validation') {
        return { message: 'Document soumis pour validation', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' };
      }
      if (newStatus === 'draft' && oldStatus === 'pending_validation') {
        return { message: 'Document rejeté', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      }
      if (newStatus === 'draft') {
        return { message: 'Document dépublié', icon: XCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      }
    }

    const actionLabels: Record<string, { message: string; icon: any; color: string; bgColor: string }> = {
      'create': { message: 'Document créé', icon: Plus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'update': { message: 'Document modifié', icon: Edit, color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'delete': { message: 'Document supprimé', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
      'pdfa_validation': { message: 'Validation PDF/A', icon: CheckCircle, color: 'text-teal-600', bgColor: 'bg-teal-100' },
    };

    return actionLabels[action] || { message: action || 'Action', icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  // Récupérer l'historique des activités
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ["activity-history", period, actionFilter, page],
    queryFn: async () => {
      // Calculer la date limite
      let dateLimit = null;
      if (period !== "all") {
        const days = parseInt(period);
        dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
      }

      // Construire la requête de base
      let query = supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Appliquer le filtre de période
      if (dateLimit) {
        query = query.gte("created_at", dateLimit.toISOString());
      }

      // Appliquer le filtre d'action
      if (actionFilter !== "all") {
        if (actionFilter === "validation") {
          query = query.eq("action", "status_change")
            .contains("details", { new_status: "processed" });
        } else if (actionFilter === "submission") {
          query = query.eq("action", "status_change")
            .contains("details", { new_status: "pending_validation" });
        } else if (actionFilter === "rejection") {
          query = query.eq("action", "status_change")
            .contains("details", { new_status: "draft", old_status: "pending_validation" });
        } else {
          query = query.eq("action", actionFilter);
        }
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: activities, count, error } = await query;

      if (error) throw error;
      if (!activities || activities.length === 0) return { activities: [], total: 0, documents: {}, users: {} };

      // Récupérer les IDs des documents et utilisateurs uniques
      const documentIds = [...new Set(
        activities
          .filter(a => a.entity_type === 'document')
          .map(a => a.entity_id)
      )];

      const userIds = [...new Set(
        activities
          .filter(a => a.user_id)
          .map(a => a.user_id)
      )];

      // Récupérer les titres des documents
      const { data: documents } = await supabase
        .from("documents")
        .select("id, title, title_ar")
        .in("id", documentIds);

      const documentMap = new Map(
        documents?.map(d => [d.id, d.title || d.title_ar || 'Document sans titre']) || []
      );

      // Récupérer les profils utilisateurs
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIds);

      const userMap = new Map(
        profiles?.map(p => [
          p.user_id, 
          p.first_name && p.last_name 
            ? `${p.first_name} ${p.last_name}` 
            : p.email || 'Utilisateur inconnu'
        ]) || []
      );

      // Récupérer les rôles des utilisateurs
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const roleMap = new Map(
        roles?.map(r => [r.user_id, r.role]) || []
      );

      return {
        activities: activities.map(activity => ({
          ...activity,
          documentTitle: activity.entity_type === 'document' 
            ? documentMap.get(activity.entity_id) || 'Document supprimé'
            : null,
          userName: activity.user_id 
            ? userMap.get(activity.user_id) || 'Utilisateur inconnu'
            : 'Système',
          userRole: activity.user_id 
            ? roleMap.get(activity.user_id) || 'user'
            : null
        })),
        total: count || 0
      };
    }
  });

  const activities = activitiesData?.activities || [];
  const totalItems = activitiesData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Export CSV
  const handleExport = () => {
    if (!activities.length) return;

    const csvData = activities.map(activity => {
      const formatted = formatAction(activity.action, activity.details);
      return {
        Date: format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", { locale: fr }),
        Utilisateur: activity.userName,
        Rôle: getRoleLabel(activity.userRole),
        Action: formatted.message,
        Document: activity.documentTitle || '-',
        Détails: JSON.stringify(activity.details)
      };
    });

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique-actions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRoleLabel = (role: string | null) => {
    const roleLabels: Record<string, string> = {
      'admin': 'Super Admin',
      'admin_observatoire': 'Validateur',
      'admin_acces_droits': 'Admin Accès Droits',
      'user': 'Utilisateur'
    };
    return roleLabels[role || ''] || role || 'Système';
  };

  const getRoleBadgeVariant = (role: string | null) => {
    if (role === 'admin') return 'default';
    if (role === 'admin_observatoire') return 'secondary';
    return 'outline';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Historique des actions</h1>
            <p className="text-muted-foreground">
              Suivi complet de toutes les activités administratives
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!activities.length}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Période</label>
              <Select value={period} onValueChange={(v) => { setPeriod(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">90 derniers jours</SelectItem>
                  <SelectItem value="all">Tout l'historique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Type d'action</label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="validation">Validations</SelectItem>
                  <SelectItem value="submission">Soumissions</SelectItem>
                  <SelectItem value="rejection">Rejets</SelectItem>
                  <SelectItem value="create">Créations</SelectItem>
                  <SelectItem value="update">Modifications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activités récentes</CardTitle>
            <CardDescription>
              {totalItems} action{totalItems > 1 ? 's' : ''} trouvée{totalItems > 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucune activité trouvée pour les critères sélectionnés</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Date/Heure</TableHead>
                    <TableHead className="w-[200px]">Utilisateur</TableHead>
                    <TableHead className="w-[120px]">Rôle</TableHead>
                    <TableHead className="w-[200px]">Action</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="w-[180px]">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => {
                    const formatted = formatAction(activity.action, activity.details);
                    const Icon = formatted.icon;
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium text-sm">
                          {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {activity.userName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(activity.userRole)}>
                            {getRoleLabel(activity.userRole)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${formatted.bgColor}`}>
                              <Icon className={`h-4 w-4 ${formatted.color}`} />
                            </div>
                            <span className="text-sm font-medium">{formatted.message}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {activity.documentTitle || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {activity.details?.old_status && activity.details?.new_status && (
                            <span>{activity.details.old_status} → {activity.details.new_status}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHistorique;
