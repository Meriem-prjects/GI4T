import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";
import AccesDroitsUserCreateDialog from "@/components/admin/AccesDroitsUserCreateDialog";
import AccesDroitsUserEditDialog from "@/components/admin/AccesDroitsUserEditDialog";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_id: string;
  role: string | null;
  permissions: string[];
}

const AdminAccesDroitsUsersManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Fetch all users with their roles and permissions
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["acces-droits-users"],
    queryFn: async () => {
      // First, get all user_roles for the roles we're interested in
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "admin_acces_droits", "editor_acces_droits"]);

      if (rolesError) throw rolesError;
      if (!userRoles || userRoles.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(userRoles.map(ur => ur.user_id))];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Fetch permissions for each user
      const usersWithPermissions = await Promise.all(
        profiles.map(async (profile: any) => {
          const { data: permissions } = await supabase
            .from("acces_droits_permissions")
            .select("section")
            .eq("user_id", profile.user_id);

          // Find the role for this user
          const userRole = userRoles.find(ur => ur.user_id === profile.user_id);

          return {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            user_id: profile.user_id,
            role: userRole?.role || null,
            permissions: permissions?.map(p => p.section) || []
          };
        })
      );

      return usersWithPermissions as UserProfile[];
    }
  });

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: userId }
      });

      if (error) throw error;

      toast.success("Utilisateur supprimé avec succès");
      refetch();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression", {
        description: error.message
      });
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (role === "admin") {
      return <Badge className="bg-red-500"><Shield className="w-3 h-3 mr-1" /> Super Admin</Badge>;
    }
    if (role === "admin_acces_droits") {
      return <Badge className="bg-yellow-600"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
    }
    if (role === "editor_acces_droits") {
      return <Badge variant="secondary"><User className="w-3 h-3 mr-1" /> Éditeur</Badge>;
    }
    return <Badge variant="outline">Non défini</Badge>;
  };

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      'mediatheque': 'Médiathèque',
      'actualites': 'Actualités',
      'carte-interactive': 'Carte interactive',
      'albums-photos': 'Albums photos',
      'ressources-pratiques': 'Ressources pratiques',
      'liens-utiles': 'Liens utiles',
      'guides-pratiques': 'Guides pratiques',
      'publications': 'Publications',
      'adresses-utiles': 'Adresses utiles'
    };
    return labels[section] || section;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-yellow-900">Gestion des utilisateurs</h1>
          <p className="text-yellow-700 mt-1">Gérez les admins et éditeurs de l'espace Accès aux Droits</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Administrez les droits d'accès et les permissions par rubrique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Sections autorisées</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.role === "admin" || user.role === "admin_acces_droits" ? (
                        <Badge variant="outline">Toutes les sections</Badge>
                      ) : user.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((section) => (
                            <Badge key={section} variant="secondary" className="text-xs">
                              {getSectionLabel(section)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucune section</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.user_id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé
            </div>
          )}
        </CardContent>
      </Card>

      <AccesDroitsUserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={refetch}
      />

      {editingUser && (
        <AccesDroitsUserEditDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default AdminAccesDroitsUsersManagement;
