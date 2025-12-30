import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Folder, 
  Settings,
  ChevronLeft,
  ChevronDown,
  Video,
  Camera,
  Newspaper,
  FileText,
  ExternalLink,
  BookOpen,
  Map,
  MapPin,
  Building,
  MessageCircle,
  MessageSquare,
  BarChart3,
  HelpCircle,
  LogOut,
  Scale,
  PenTool,
  FileCheck
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  type: "observatoire" | "acces-aux-droits";
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const AdminSidebar = ({ type, isCollapsed = false, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const basePath = `/admin/${type}`;
  
  // State for collapsible groups
  const [mediathequeOpen, setMediathequeOpen] = useState(
    location.pathname.includes('/mediatheque') || location.pathname.includes('/albums-photos')
  );
  const [actualitesOpen, setActualitesOpen] = useState(
    location.pathname.includes('/actualites') || 
    location.pathname.includes('/ressources-pratiques') || 
    location.pathname.includes('/liens-utiles') || 
    location.pathname.includes('/guides-pratiques')
  );
  const [faqChatOpen, setFaqChatOpen] = useState(
    location.pathname.includes('/faq-chatbot')
  );
  const [carteOpen, setCarteOpen] = useState(
    location.pathname.includes('/carte-interactive') || location.pathname.includes('/adresses-utiles')
  );
  const [contenuOpen, setContenuOpen] = useState(
    location.pathname.includes('/contenus') || 
    location.pathname.includes('/blogs') || 
    location.pathname.includes('/commentaires-content') || 
    location.pathname.includes('/analyses-juridiques') || 
    location.pathname.includes('/fiches-jurisprudence')
  );

  // Navigation items pour Observatoire - standalone items
  const observatoireStandaloneItems = [
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
    }
  ];

  // Navigation items pour Observatoire - grouped contenus
  const observatoireContenuItems = {
    title: "Contenus",
    description: "Gestion des contenus",
    icon: Folder,
    isOpen: contenuOpen,
    setIsOpen: setContenuOpen,
    items: [
      { title: "Blogs", href: `${basePath}/blogs`, icon: BookOpen, description: "Articles de blog" },
      { title: "Commentaires", href: `${basePath}/commentaires-content`, icon: MessageSquare, description: "Commentaires juridiques" },
      { title: "Analyses juridiques", href: `${basePath}/analyses-juridiques`, icon: PenTool, description: "Analyses et études" },
      { title: "Fiches jurisprudence", href: `${basePath}/fiches-jurisprudence`, icon: Scale, description: "Fiches de jurisprudence" }
    ]
  };

  // Navigation items pour Observatoire - bottom items
  const observatoireBottomItems = [
    {
      title: "Actualités",
      icon: Newspaper,
      href: `${basePath}/actualites`,
      description: "Gérer les actualités"
    },
    {
      title: "Éditeur",
      icon: FileText,
      href: `${basePath}/editeur`,
      description: "Édition de documents"
    },
    {
      title: "Validation",
      icon: FileCheck,
      href: `${basePath}/validation`,
      description: "Validation des contenus"
    },
    {
      title: "Modération",
      icon: MessageSquare,
      href: `${basePath}/commentaires`,
      description: "Modérer les commentaires"
    },
    {
      title: "Statistiques",
      icon: BarChart3,
      href: `${basePath}/statistiques`,
      description: "Vues, lectures et analyses"
    },
    {
      title: "Historique",
      icon: FileText,
      href: `${basePath}/historique`,
      description: "Historique des actions"
    },
    {
      title: "Paramètres",
      icon: Settings,
      href: `${basePath}/parametres`,
      description: "Configuration"
    }
  ];

  // Navigation items standalone pour Accès aux Droits
  const accesAuxDroitsStandaloneItems = [
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
      title: "Paramètres",
      icon: Settings,
      href: `${basePath}/parametres`,
      description: "Configuration"
    }
  ];

  // Navigation items groupés pour Accès aux Droits
  const accesAuxDroitsGroupedItems = [
    {
      title: "Médiathèque",
      icon: Folder,
      isOpen: mediathequeOpen,
      setIsOpen: setMediathequeOpen,
      items: [
        { title: "Médiathèque", href: `${basePath}/mediatheque`, icon: Video, description: "Vidéos et témoignages" },
        { title: "Albums photos", href: `${basePath}/albums-photos`, icon: Camera, description: "Galerie événements" }
      ]
    },
    {
      title: "Actualités",
      icon: Newspaper,
      isOpen: actualitesOpen,
      setIsOpen: setActualitesOpen,
      items: [
        { title: "Actualités", href: `${basePath}/actualites`, icon: Newspaper, description: "Dernières nouvelles" },
        { title: "Ressources pratiques", href: `${basePath}/ressources-pratiques`, icon: FileText, description: "Modèles et formulaires" },
        { title: "Liens utiles", href: `${basePath}/liens-utiles`, icon: ExternalLink, description: "Sites externes" },
        { title: "Guides pratiques", href: `${basePath}/guides-pratiques`, icon: BookOpen, description: "Guides step-by-step" }
      ]
    },
    {
      title: "FAQ & Chatbot",
      icon: MessageCircle,
      isOpen: faqChatOpen,
      setIsOpen: setFaqChatOpen,
      items: [
        { title: "Configuration", href: `${basePath}/faq-chatbot`, icon: Settings, description: "Personnaliser l'assistant" },
        { title: "Questions FAQ", href: `${basePath}/faq-questions`, icon: HelpCircle, description: "Gérer les questions" }
      ]
    },
    {
      title: "Carte interactive",
      icon: Map,
      isOpen: carteOpen,
      setIsOpen: setCarteOpen,
      items: [
        { title: "Carte interactive", href: `${basePath}/carte-interactive`, icon: MapPin, description: "Localiser les services" },
        { title: "Adresses utiles", href: `${basePath}/adresses-utiles`, icon: Building, description: "Organismes et contacts" }
      ]
    }
  ];

  const themeColors = type === "observatoire" 
    ? {
        bg: "bg-[hsl(var(--justclic-blue))]",
        hover: "hover:bg-white/10",
        active: "bg-white/20",
        text: "text-white",
        textMuted: "text-blue-100",
        groupHover: "hover:bg-white/10"
      }
    : {
        bg: "bg-[hsl(var(--justclic-yellow-dark))]",
        hover: "hover:bg-black/10", 
        active: "bg-black/20",
        text: "text-white",
        textMuted: "text-white/80",
        groupHover: "hover:bg-black/10"
      };

  const renderNavItem = (item: { title: string; icon: any; href: string; description: string }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link key={item.href} to={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-auto p-3 transition-all",
            themeColors.text,
            themeColors.hover,
            isActive && themeColors.active,
            isCollapsed && "px-2"
          )}
        >
          <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && (
            <div className="text-left">
              <div className="font-medium">{item.title}</div>
              <div className={cn("text-xs", themeColors.textMuted)}>
                {item.description}
              </div>
            </div>
          )}
        </Button>
      </Link>
    );
  };

  const renderCollapsibleGroup = (group: { title: string; description?: string; icon: any; isOpen: boolean; setIsOpen: (open: boolean) => void; items: { title: string; href: string; icon: any; description: string }[] }) => {
    const hasActiveItem = group.items.some(item => location.pathname === item.href);
    
    return (
      <Collapsible
        key={group.title}
        open={group.isOpen}
        onOpenChange={group.setIsOpen}
        className="space-y-1"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-auto p-3 transition-all",
              themeColors.text,
              themeColors.groupHover,
              hasActiveItem && themeColors.active,
              isCollapsed && "px-2"
            )}
          >
            <group.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && (
              <>
                <div className="text-left flex-1">
                  <div className="font-medium">{group.title}</div>
                  {group.description && (
                    <div className={cn("text-xs", themeColors.textMuted)}>
                      {group.description}
                    </div>
                  )}
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  group.isOpen && "rotate-180"
                )} />
              </>
            )}
          </Button>
        </CollapsibleTrigger>

        {!isCollapsed && (
          <CollapsibleContent className="space-y-1">
            {group.items.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 transition-all",
                      themeColors.text,
                      themeColors.hover,
                      isActive && themeColors.active
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className={cn("text-xs", themeColors.textMuted)}>
                        {item.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  };

  return (
    <aside className={cn(
      "flex flex-col transition-all duration-300 border-r border-slate-200 sticky top-0 h-screen",
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
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-track-[hsl(var(--justclic-yellow))] scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
        {/* Pour Observatoire */}
        {type === "observatoire" && (
          <>
            {/* Standalone items at top */}
            {observatoireStandaloneItems.map(renderNavItem)}
            
            {/* Contenus collapsible group */}
            {renderCollapsibleGroup(observatoireContenuItems)}
            
            {/* Bottom items */}
            {observatoireBottomItems.map(renderNavItem)}
          </>
        )}

        {/* Pour Accès aux Droits: standalone items */}
        {type === "acces-aux-droits" && accesAuxDroitsStandaloneItems.map(renderNavItem)}

        {/* Pour Accès aux Droits: grouped items with collapsible */}
        {type === "acces-aux-droits" && accesAuxDroitsGroupedItems.map(renderCollapsibleGroup)}
      </nav>

      {/* Footer with logout */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            const loginPath = type === "observatoire" 
              ? "/admin/observatoire/login" 
              : "/admin/acces-aux-droits/login";
            navigate(loginPath);
          }}
          className={cn(
            "w-full justify-start",
            themeColors.text,
            themeColors.hover,
            isCollapsed && "px-2"
          )}
        >
          <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Déconnexion"}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
