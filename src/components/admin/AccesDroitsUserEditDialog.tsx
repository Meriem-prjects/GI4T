import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_id: string;
  role: string | null;
  permissions: string[];
}

interface AccesDroitsUserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onSuccess: () => void;
}

const SECTIONS = [
  { value: 'mediatheque', label: 'Médiathèque' },
  { value: 'actualites', label: 'Actualités' },
  { value: 'carte-interactive', label: 'Carte interactive' },
  { value: 'albums-photos', label: 'Albums photos' },
  { value: 'ressources-pratiques', label: 'Ressources pratiques' },
  { value: 'liens-utiles', label: 'Liens utiles' },
  { value: 'guides-pratiques', label: 'Guides pratiques' },
  { value: 'publications', label: 'Publications' },
  { value: 'adresses-utiles', label: 'Adresses utiles' }
];

const AccesDroitsUserEditDialog = ({ open, onOpenChange, user, onSuccess }: AccesDroitsUserEditDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    role: user.role as "admin_acces_droits" | "editor_acces_droits" | null
  });
  const [selectedSections, setSelectedSections] = useState<string[]>(user.permissions);

  useEffect(() => {
    setFormData({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      role: user.role as "admin_acces_droits" | "editor_acces_droits" | null
    });
    setSelectedSections(user.permissions);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName
        })
        .eq("user_id", user.user_id);

      if (profileError) throw profileError;

      // Update role if changed
      if (formData.role && formData.role !== user.role) {
        const { error: roleUpdateError } = await supabase.functions.invoke("update-user-roles", {
          body: {
            user_id: user.user_id,
            roles: [formData.role]
          }
        });

        if (roleUpdateError) throw roleUpdateError;
      }

      // Update permissions for editors
      if (formData.role === "editor_acces_droits") {
        // Delete existing permissions
        await supabase
          .from("acces_droits_permissions")
          .delete()
          .eq("user_id", user.user_id);

        // Insert new permissions
        if (selectedSections.length > 0) {
          const permissionsToInsert = selectedSections.map(section => ({
            user_id: user.user_id,
            section
          }));

          const { error: permError } = await supabase
            .from("acces_droits_permissions")
            .insert(permissionsToInsert);

          if (permError) throw permError;
        }
      } else {
        // If not editor, remove all permissions
        await supabase
          .from("acces_droits_permissions")
          .delete()
          .eq("user_id", user.user_id);
      }

      toast.success("Utilisateur mis à jour avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations et les permissions de l'utilisateur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.role || undefined}
              onValueChange={(value: "admin_acces_droits" | "editor_acces_droits") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_acces_droits">Admin Accès aux Droits</SelectItem>
                <SelectItem value="editor_acces_droits">Éditeur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "editor_acces_droits" && (
            <div className="space-y-3">
              <Label>Sections autorisées</Label>
              <div className="grid grid-cols-2 gap-3 border rounded-lg p-4">
                {SECTIONS.map((section) => (
                  <div key={section.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${section.value}`}
                      checked={selectedSections.includes(section.value)}
                      onCheckedChange={() => handleSectionToggle(section.value)}
                    />
                    <label
                      htmlFor={`edit-${section.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>
              {formData.role === "editor_acces_droits" && selectedSections.length === 0 && (
                <p className="text-sm text-yellow-600">
                  Veuillez sélectionner au moins une section pour l'éditeur
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || (formData.role === "editor_acces_droits" && selectedSections.length === 0)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccesDroitsUserEditDialog;
