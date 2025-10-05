import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AccesDroitsUserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const AccesDroitsUserCreateDialog = ({ open, onOpenChange, onSuccess }: AccesDroitsUserCreateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "editor_acces_droits" as "admin_acces_droits" | "editor_acces_droits"
  });
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user via edge function
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: {
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          roles: [formData.role]
        }
      });

      if (error) throw error;

      // If editor role, add section permissions
      if (formData.role === "editor_acces_droits" && selectedSections.length > 0 && data.user_id) {
        const permissionsToInsert = selectedSections.map(section => ({
          user_id: data.user_id,
          section
        }));

        const { error: permError } = await supabase
          .from("acces_droits_permissions")
          .insert(permissionsToInsert);

        if (permError) throw permError;
      }

      toast.success("Utilisateur créé avec succès");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "editor_acces_droits"
      });
      setSelectedSections([]);
    } catch (error: any) {
      toast.error("Erreur lors de la création", {
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
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Ajoutez un admin ou un éditeur pour l'espace Accès aux Droits
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.role}
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
                      id={section.value}
                      checked={selectedSections.includes(section.value)}
                      onCheckedChange={() => handleSectionToggle(section.value)}
                    />
                    <label
                      htmlFor={section.value}
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
              {loading ? "Création..." : "Créer l'utilisateur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccesDroitsUserCreateDialog;
