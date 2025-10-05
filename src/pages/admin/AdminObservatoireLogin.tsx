import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { setupObservatoireAdmin } from "@/utils/setupObservatoireAdmin";

const AdminObservatoireLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingUpAdmin, setSettingUpAdmin] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSetupInitialAdmin = async () => {
    setSettingUpAdmin(true);
    try {
      const result = await setupObservatoireAdmin();
      if (result.success) {
        toast.success("Administrateur Observatoire créé avec succès", {
          description: "Email: admin.observatoire@feelinx.dev",
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
        navigate("/admin/observatoire");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md border-blue-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Observatoire des Droits</CardTitle>
          <CardDescription className="text-blue-700">
            Connectez-vous pour accéder à l'espace Observatoire
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
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
              {settingUpAdmin ? "Création en cours..." : "Créer l'admin Observatoire"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Email: admin.observatoire@feelinx.dev - Mot de passe: observatoire2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminObservatoireLogin;
