import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Settings, TrendingUp, Database, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const AdminMain = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="ltr">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Administration JustClic.tn</h1>
                <p className="text-muted-foreground">Gestion du contenu et des utilisateurs</p>
              </div>
            </div>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              ← Retour au site
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Bienvenue dans l'espace d'administration
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez la section que vous souhaitez administrer. Chaque interface est adaptée aux spécificités de son contenu.
          </p>
        </div>

        {/* Admin Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Observatoire Admin */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--justclic-blue-light))] to-[hsl(var(--justclic-blue))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-[hsl(var(--justclic-blue))]">
                Admin Observatoire des Droits
              </CardTitle>
              <CardDescription className="text-slate-600">
                Gestion du contenu juridique, analyses et recherche documentaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[hsl(var(--justclic-blue))]" />
                  <span>Textes fondamentaux</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--justclic-blue))]" />
                  <span>Analyses & Opinions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[hsl(var(--justclic-blue))]" />
                  <span>Actualités</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[hsl(var(--justclic-blue))]" />
                  <span>Décisions de justice</span>
                </div>
              </div>
              <Link to="/admin/observatoire" className="block">
                <Button className="w-full bg-[hsl(var(--justclic-blue))] hover:bg-[hsl(var(--justclic-blue))]/90 text-white group-hover:scale-105 transition-transform">
                  Accéder à l'administration
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Accès aux Droits Admin */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-orange-100">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--justclic-yellow-light))] to-[hsl(var(--justclic-yellow))] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-[hsl(var(--accent))]">
                Admin Accès aux Droits
              </CardTitle>
              <CardDescription className="text-slate-600">
                Gestion des ressources pratiques, guides et services citoyens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span>Guides pratiques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span>Ressources pratiques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span>Carte interactive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span>Médiathèque</span>
                </div>
              </div>
              <Link to="/admin/acces-aux-droits" className="block">
                <Button className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white group-hover:scale-105 transition-transform">
                  Accéder à l'administration
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-center mb-8">Statistiques générales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">324</div>
                <div className="text-sm text-muted-foreground">Contenus totaux</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent">45</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent">98%</div>
                <div className="text-sm text-muted-foreground">Temps de disponibilité</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminMain;