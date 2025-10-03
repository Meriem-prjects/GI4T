import { Button } from "@/components/ui/button";
import { Newspaper, FileText, ExternalLink, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const ActualitesNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/acces-aux-droits/actualites",
      label: "Actualités",
      icon: Newspaper,
      description: "Dernières nouvelles"
    },
    {
      path: "/acces-aux-droits/ressources-pratiques",
      label: "Ressources pratiques",
      icon: FileText,
      description: "Modèles et formulaires"
    },
    {
      path: "/acces-aux-droits/liens-utiles",
      label: "Liens utiles",
      icon: ExternalLink,
      description: "Sites externes"
    },
    {
      path: "/acces-aux-droits/guides-pratiques",
      label: "Guides",
      icon: BookOpen,
      description: "Guides step-by-step"
    }
  ];

  return (
    <nav className="border-b bg-card/50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-1 overflow-x-auto py-2 scrollbar-hide scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 h-auto flex-col min-w-0 transition-all duration-300 hover:scale-105",
                    isActive && "bg-primary text-primary-foreground shadow-md",
                    !isActive && "hover:bg-muted hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 transition-transform duration-200" />
                    <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
                  </div>
                  <span className="text-xs opacity-80 hidden md:block text-center transition-opacity duration-200">
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

export default ActualitesNav;
