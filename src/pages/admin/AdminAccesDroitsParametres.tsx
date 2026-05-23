import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Shield, Database, FileText, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminAccesDroitsParametres = () => {
  const { user, isAdmin, isAccesDroitsAdmin } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Paramètres</h2>
        <p className="text-sm text-muted-foreground">Configuration de l'espace Accès aux Droits</p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Compte connecté</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium">{user?.email ?? "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Rôles</Label>
            <p className="font-medium">
              {[isAdmin && "Admin", isAccesDroitsAdmin && "Admin Accès aux Droits"]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Sections gérées</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Liens directs vers les sections du back-office Accès aux Droits.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/admin/acces-aux-droits/actualites">
              <FileText className="h-4 w-4 mr-2" /> Actualités
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/admin/acces-aux-droits/guides-pratiques">
              <FileText className="h-4 w-4 mr-2" /> Guides pratiques
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/admin/acces-aux-droits/ressources-pratiques">
              <FileText className="h-4 w-4 mr-2" /> Ressources
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/admin/acces-aux-droits/liens-utiles">
              <Globe className="h-4 w-4 mr-2" /> Liens utiles
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/admin/acces-aux-droits/mediatheque">
              <FileText className="h-4 w-4 mr-2" /> Médiathèque
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/admin/acces-aux-droits/utilisateurs">
              <Settings className="h-4 w-4 mr-2" /> Utilisateurs
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Préférences d'affichage</h3>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div>
            <Label>Mode sombre</Label>
            <p className="text-xs text-muted-foreground">Activable globalement via le sélecteur de thème</p>
          </div>
          <Switch disabled />
        </div>
        <p className="text-xs text-muted-foreground italic">
          D'autres paramètres seront ajoutés selon les besoins (notifications, langue par défaut, etc.).
        </p>
      </Card>
    </div>
  );
};

export default AdminAccesDroitsParametres;
