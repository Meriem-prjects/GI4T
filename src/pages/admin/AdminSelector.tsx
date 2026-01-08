import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users } from "lucide-react";

const AdminSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="ltr">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Espace Administration</h1>
          <p className="text-slate-600">Choisissez l'espace auquel vous souhaitez accéder</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Observatoire Card */}
          <Card 
            className="border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg"
            onClick={() => navigate("/admin/observatoire/login")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/10 rounded-full">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-blue-900">Observatoire des Droits</CardTitle>
              <CardDescription className="text-blue-700">
                Gestion des documents juridiques, textes fondamentaux et analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/observatoire/login");
                }}
              >
                Accéder à l'espace Observatoire
              </Button>
            </CardContent>
          </Card>

          {/* Accès aux Droits Card */}
          <Card 
            className="border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer hover:shadow-lg"
            onClick={() => navigate("/admin/acces-aux-droits/login")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-yellow-500/10 rounded-full">
                  <Users className="h-12 w-12 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-yellow-900">Accès aux Droits</CardTitle>
              <CardDescription className="text-yellow-700">
                Gestion des événements, carte interactive et ressources pratiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/acces-aux-droits/login");
                }}
              >
                Accéder à l'espace Accès aux Droits
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSelector;
