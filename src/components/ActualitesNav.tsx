import { Button } from "@/components/ui/button";
import { Home, Newspaper, FileText, ExternalLink, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const ActualitesNav = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const navItems = [
    {
      path: "/acces-aux-droits",
      label: t('home'),
      icon: Home,
      description: t('homepage')
    },
    {
      path: "/acces-aux-droits/actualites",
      label: t('actualites'),
      icon: Newspaper,
      description: t('latestNews')
    },
    {
      path: "/acces-aux-droits/ressources-pratiques",
      label: t('practicalResources'),
      icon: FileText,
      description: t('formsModels')
    },
    {
      path: "/acces-aux-droits/publications",
      label: t('publications'),
      icon: Newspaper,
      description: t('publicationsDesc')
    },
    {
      path: "/acces-aux-droits/liens-utiles",
      label: t('usefulLinks'),
      icon: ExternalLink,
      description: t('externalSites')
    },
    {
      path: "/acces-aux-droits/guides-pratiques",
      label: t('practicalGuides'),
      icon: BookOpen,
      description: t('stepByStepGuides')
    }
  ];

  const isActualitesPage = location.pathname === "/acces-aux-droits/actualites";
  const isSubResourcePage = ["/acces-aux-droits/guides-pratiques", "/acces-aux-droits/liens-utiles", "/acces-aux-droits/publications"].includes(location.pathname);

  const filteredNavItems = navItems.filter(item => {
    if (isActualitesPage) {
      return !["/acces-aux-droits/ressources-pratiques", "/acces-aux-droits/publications", "/acces-aux-droits/liens-utiles", "/acces-aux-droits/guides-pratiques"].includes(item.path);
    }
    if (isSubResourcePage) {
      return !["/acces-aux-droits/actualites", "/acces-aux-droits/ressources-pratiques"].includes(item.path);
    }
    return true;
  });

  return (
    <nav className="border-b bg-card/50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-1 overflow-x-auto py-2 scrollbar-hide scroll-smooth">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 h-auto flex-col min-w-0 transition-all duration-300 hover:scale-105",
                    isActive && "bg-primary text-primary-foreground shadow-md",
                    !isActive && "hover:bg-muted hover:shadow-sm",
                    isRTL && "font-almarai"
                  )}
                >
                  <div className={`flex items-center gap-1 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 transition-transform duration-200" />
                    <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
                  </div>
                  <span className="text-[10px] opacity-70 hidden md:block text-center transition-opacity duration-200 line-clamp-1 max-w-[140px]">
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
