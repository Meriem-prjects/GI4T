import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Edit, 
  CheckCircle, 
  History, 
  Folder, 
  Settings,
  ChevronLeft,
  Archive
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  type: "observatoire" | "acces-aux-droits";
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const AdminSidebar = ({ type, isCollapsed = false, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const basePath = `/admin/${type}`;
  
  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: basePath,
      description: "Vue d'ensemble"
    },
    {
      title: "Utilisateurs",
      icon: Users,
      href: `${basePath}/utilisateurs`,
      description: "Gestion des utilisateurs"
    },
    {
      title: "Contenus",
      icon: FileText,
      href: `${basePath}/contenus`,
      description: "Gestion des contenus"
    },
    {
      title: "Éditeur",
      icon: Edit,
      href: `${basePath}/editeur`,
      description: "Créer du contenu"
    },
    {
      title: "Optimiseur PDF/A",
      icon: Archive,
      href: `${basePath}/pdfa-optimizer`,
      description: "Optimisation PDF/A"
    },
    {
      title: "Validation",
      icon: CheckCircle,
      href: `${basePath}/validation`,
      description: "Valider les contenus"
    },
    {
      title: "Historique",
      icon: History,
      href: `${basePath}/historique`,
      description: "Historique des actions"
    },
    {
      title: "Médiathèque",
      icon: Folder,
      href: `${basePath}/mediatheque`,
      description: "Gestion des fichiers"
    },
    {
      title: "Paramètres",
      icon: Settings,
      href: `${basePath}/parametres`,
      description: "Configuration"
    }
  ];

  const themeColors = type === "observatoire" 
    ? {
        bg: "bg-[hsl(var(--justclic-blue))]",
        hover: "hover:bg-[hsl(var(--justclic-blue))]/90",
        active: "bg-[hsl(var(--justclic-blue))]/80",
        text: "text-white",
        textMuted: "text-blue-100"
      }
    : {
        bg: "bg-[hsl(var(--accent))]",
        hover: "hover:bg-[hsl(var(--accent))]/90", 
        active: "bg-[hsl(var(--accent))]/80",
        text: "text-white",
        textMuted: "text-yellow-100"
      };

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 border-r border-slate-200",
      themeColors.bg,
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className={cn("font-semibold text-lg", themeColors.text)}>
                {type === "observatoire" ? "Observatoire" : "Accès aux Droits"}
              </h2>
              <p className={cn("text-sm", themeColors.textMuted)}>
                Administration
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn("p-2 hover:bg-white/10", themeColors.text)}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {/* Navigation items removed */}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <Link to="/admin">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              themeColors.text,
              themeColors.hover,
              isCollapsed && "px-2"
            )}
          >
            <ChevronLeft className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Retour admin"}
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;