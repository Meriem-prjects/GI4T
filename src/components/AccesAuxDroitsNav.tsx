import { Button } from "@/components/ui/button";
import { BookOpen, FileText, MapPin, Video, ExternalLink, Camera } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AccesAuxDroitsNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/guides-pratiques",
      label: "Guides",
      icon: BookOpen,
      description: "Guides step-by-step"
    },
    {
      path: "/ressources-pratiques", 
      label: "Ressources pratiques",
      icon: FileText,
      description: "Modèles et formulaires"
    },
    {
      path: "/carte-interactive",
      label: "Carte interactive", 
      icon: MapPin,
      description: "Campagne d'information"
    },
    {
      path: "/publications",
      label: "Publications",
      icon: BookOpen,
      description: "Documents officiels"
    },
    {
      path: "/liens-utiles",
      label: "Liens utiles",
      icon: ExternalLink,
      description: "Sites externes"
    },
    {
      path: "/mediatheque",
      label: "Médiathèque",
      icon: Video,
      description: "Vidéos et témoignages"
    },
    {
      path: "/albums-photos",
      label: "Albums photos",
      icon: Camera,
      description: "Galerie événements"
    }
  ];

  return (
    <nav className="border-b bg-card/50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 h-auto flex-col min-w-0",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
                  </div>
                  <span className="text-xs opacity-80 hidden md:block text-center">
                    {item.description}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AccesAuxDroitsNav;