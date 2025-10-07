import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const FAQNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/acces-aux-droits/assistant-virtuel",
      label: "Assistant Virtuel",
      icon: MessageCircle,
      description: "Chat en temps réel"
    },
    {
      path: "/acces-aux-droits/foire-aux-questions",
      label: "Foire aux Questions",
      icon: HelpCircle,
      description: "Questions fréquentes"
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

export default FAQNav;
