import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { setupAccesDroitsAdmin } from "@/utils/setupAccesDroitsAdmin";

const AdminAccesDroitsLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingUpAdmin, setSettingUpAdmin] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSetupInitialAdmin = async () => {
    setSettingUpAdmin(true);
    try {
      const result = await setupAccesDroitsAdmin();
      if (result.success) {
        toast.success("Administrateur Accès aux Droits créé avec succès", {
          description: "Email: admin.accesdroits@feelinx.dev",
        });
      } else {
        toast.error("Erreur lors de la création", {
          description: result.error?.message || "Une erreur est survenue",
        });
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setSettingUpAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error("Erreur de connexion", {
          description: error.message === "Invalid login credentials" 
            ? "Email ou mot de passe incorrect"
            : error.message
        });
      } else {
        toast.success("Connexion réussie");
        navigate("/admin/acces-aux-droits");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-4" dir="ltr">
      <Card className="w-full max-w-md border-yellow-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-900">Accès aux Droits</CardTitle>
          <CardDescription className="text-yellow-700">
            Connectez-vous pour accéder à l'espace Accès aux Droits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSetupInitialAdmin}
              disabled={settingUpAdmin}
            >
              {settingUpAdmin ? "Création en cours..." : "Créer l'admin Accès aux Droits"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Email: admin.accesdroits@feelinx.dev - Mot de passe: accesdroits2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAccesDroitsLogin;
