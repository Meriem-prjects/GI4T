import { Button } from "@/components/ui/button";
import { BookOpen, FileText, MapPin, Video } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AccesAuxDroitsNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/guides-pratiques",
      label: "Guides pratiques",
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
      description: "Services près de vous"
    },
    {
      path: "/mediatheque",
      label: "Médiathèque",
      icon: Video,
      description: "Vidéos et témoignages"
    }
  ];

  return (
    <nav className="border-b bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 h-auto flex-col",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs opacity-80 hidden sm:block">
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