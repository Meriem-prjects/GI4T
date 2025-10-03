import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    user_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    roles: string[];
  };
}

const UserEditDialog = ({ open, onOpenChange, user }: UserEditDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setRoles(user.roles || []);
      setNewPassword("");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("update-user-roles", {
        body: {
          userId: user.user_id,
          firstName,
          lastName,
          roles,
          newPassword: newPassword || undefined
        }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Utilisateur modifié avec succès");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la modification", {
        description: error.message
      });
    }
  });

  const handleRoleToggle = (role: string) => {
    setRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de {user.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe (optionnel)</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Laisser vide pour ne pas changer"
            />
          </div>
          <div className="space-y-3">
            <Label>Rôles (Observatoire)</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-admin"
                  checked={roles.includes("admin")}
                  onCheckedChange={() => handleRoleToggle("admin")}
                />
                <label htmlFor="edit-admin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Admin (Accès complet)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-editor"
                  checked={roles.includes("editor")}
                  onCheckedChange={() => handleRoleToggle("editor")}
                />
                <label htmlFor="edit-editor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Éditeur (Créer et éditer du contenu)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-validator"
                  checked={roles.includes("validator")}
                  onCheckedChange={() => handleRoleToggle("validator")}
                />
                <label htmlFor="edit-validator" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Validateur (Valider les contenus)
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Modification..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
