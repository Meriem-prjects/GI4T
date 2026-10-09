import { Button } from "@/components/ui/button";
import { Home, Search, BookOpen, FileText, Newspaper, Library, Users, LineChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { ODF_HUBS, ODF_TYPES, odfType } from "@/lib/odf";

// Onglet actif : la rubrique de la page courante (ex. « Analyses & Opinions »
// sur /observatoire/blogs ou sur un blog ouvert depuis cette rubrique).
function isActivePath(pathname: string, path: string): boolean {
  if (path === "/observatoire") return pathname === path;
  if (pathname === path || pathname.startsWith(path + "/")) return true;
  const type = ODF_TYPES.find((t) => pathname === t.path || pathname.startsWith(t.path + "/"));
  return !!type?.hub && ODF_HUBS[type.hub].path === path;
}

const ObservatoireNav = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const navItems = [
    {
      path: "/observatoire",
      label: t('observatoireNavHome'),
      icon: Home,
      description: t('observatoireNavHomeDesc')
    },
    {
      path: "/observatoire/search-results",
      label: t('observatoireNavSearch'),
      icon: Search,
      description: t('observatoireNavSearchDesc')
    },
    {
      path: "/observatoire/droits-fondamentaux", 
      label: t('observatoireNavFundamentalRights'),
      icon: BookOpen,
      description: t('observatoireNavFundamentalRightsDesc')
    },
    {
      path: "/observatoire/analyses-opinions",
      label: t('observatoireNavAnalyses'),
      icon: FileText,
      description: t('observatoireNavAnalysesDesc')
    },
    {
      path: odfType("articles").path,
      label: t('observatoireNavSociology'),
      icon: Users,
      description: t('observatoireNavSociologyDesc')
    },
    {
      path: odfType("economie").path,
      label: t('observatoireNavEconomy'),
      icon: LineChart,
      description: t('observatoireNavEconomyDesc')
    },
    {
      path: "/observatoire/publications",
      label: t('observatoireNavPublications'),
      icon: Library,
      description: t('observatoireNavPublicationsDesc')
    },
    {
      path: "/observatoire/actualites",
      label: t('observatoireNavNews'),
      icon: Newspaper,
      description: t('observatoireNavNewsDesc')
    }
  ];

  return (
    <nav className="border-b bg-card/50 animate-fade-in">
      <div className="container mx-auto px-2 sm:px-4">
        {/* w-max + mx-auto : centré s'il tient, défilable sans rognure sinon */}
        <div className="overflow-x-auto py-2 scrollbar-hide scroll-smooth">
        <div className={cn(
          "flex w-max mx-auto items-center",
          isRTL ? "space-x-reverse space-x-1" : "space-x-1"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(location.pathname, item.path);
            
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center px-2 2xl:px-3 py-2 h-auto flex-col min-w-0 transition-all duration-300 hover:scale-105",
                    isActive && "bg-primary text-primary-foreground shadow-md",
                    !isActive && "hover:bg-muted hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "flex items-center",
                    isRTL ? "gap-x-reverse gap-1 sm:gap-2" : "gap-1 sm:gap-2"
                  )}>
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 transition-transform duration-200" />
                    <span className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
                  </div>
                  <span className="text-xs opacity-80 hidden min-[1360px]:block text-center transition-opacity duration-200">
                    {item.description}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
        </div>
      </div>
    </nav>
  );
};

export default ObservatoireNav;