import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Menu, ChevronDown, ChevronRight, Map, Image, Newspaper, MessageCircle, FileText, BookOpen, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CarteInteractiveNav from "@/components/CarteInteractiveNav";
import MediathequeNav from "@/components/MediathequeNav";
import ActualitesNav from "@/components/ActualitesNav";
import FAQNav from "@/components/FAQNav";
import Footer from "@/components/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const AccesAuxDroitsLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const location = useLocation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Determine which sub-navigation to show based on current route
  const getSubNav = () => {
    if (location.pathname.includes('/carte-interactive') || location.pathname.includes('/adresses-utiles')) {
      return <CarteInteractiveNav />;
    } else if (location.pathname.includes('/mediatheque') || location.pathname.includes('/albums-photos')) {
      return <MediathequeNav />;
    } else if (location.pathname.includes('/actualites') || location.pathname.includes('/ressources-pratiques') ||
      location.pathname.includes('/liens-utiles') || location.pathname.includes('/guides-pratiques') ||
      location.pathname.includes('/publications')) {
      return <ActualitesNav />;
    } else if (location.pathname.includes('/foire-aux-questions') || location.pathname.includes('/assistant-virtuel')) {
      return <FAQNav />;
    }
    return null;
  };

  // Mobile menu structure with parent-child hierarchy
  const menuSections = [
    {
      id: 'carte',
      label: t('interactiveMap'),
      icon: Map,
      link: '/acces-aux-droits/carte-interactive',
      children: [
        { label: t('usefulAddresses'), link: '/acces-aux-droits/adresses-utiles' }
      ]
    },
    {
      id: 'mediatheque',
      label: t('mediaLibrary'),
      icon: Image,
      link: '/acces-aux-droits/mediatheque',
      children: [
        { label: t('photoAlbums'), link: '/acces-aux-droits/albums-photos' }
      ]
    },
    {
      id: 'actualites',
      label: t('actualites'),
      icon: Newspaper,
      link: '/acces-aux-droits/actualites',
      children: []
    },
    {
      id: 'ressources',
      label: t('practicalResources'),
      icon: FileText,
      link: '/acces-aux-droits/ressources-pratiques',
      children: [
        { label: t('practicalGuides'), link: '/acces-aux-droits/guides-pratiques' },
        { label: t('publications'), link: '/acces-aux-droits/publications' },
        { label: t('usefulLinks'), link: '/acces-aux-droits/liens-utiles' }
      ]
    },
    {
      id: 'faq',
      label: t('faq'),
      icon: MessageCircle,
      link: '/acces-aux-droits/foire-aux-questions',
      children: [
        { label: t('virtualAssistant'), link: '/acces-aux-droits/assistant-virtuel' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-2 sm:py-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link to="/acces-aux-droits" className={`flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity ${isRTL ? 'ml-auto' : ''}`}>
              {isRTL ? (
                <>
                  <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt={t('accessToRights')} className="h-8 sm:h-10 md:h-14 flex-shrink-0" />
                  <div className="text-right">
                    <h1 className="text-sm sm:text-base md:text-2xl font-bold text-foreground font-almarai">{t('accessToRights')}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block font-almarai">{t('citizenSpace')}</p>
                  </div>
                </>
              ) : (
                <>
                  <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt={t('accessToRights')} className="h-6 sm:h-8 md:h-12 flex-shrink-0" />
                  <div>
                    <h1 className="text-sm sm:text-base md:text-2xl font-bold text-foreground">{t('accessToRights')}</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{t('citizenSpace')}</p>
                  </div>
                </>
              )}
            </Link>

            <nav className={`hidden md:flex items-center absolute ${isRTL ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'} gap-6`}>
              <Link to="/acces-aux-droits/carte-interactive" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('interactiveMap')}
              </Link>
              <Link to="/acces-aux-droits/mediatheque" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('mediaLibrary')}
              </Link>
              <Link to="/acces-aux-droits/actualites" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('actualites')}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 outline-none ${isRTL ? 'font-almarai flex-row-reverse' : ''}`}>
                  {t('practicalResources')}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/acces-aux-droits/guides-pratiques" className={`w-full cursor-pointer flex items-center gap-2 ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}>
                      <BookOpen className="h-4 w-4" />
                      {t('practicalGuides')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/acces-aux-droits/publications" className={`w-full cursor-pointer flex items-center gap-2 ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}>
                      <Newspaper className="h-4 w-4" />
                      {t('publications')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/acces-aux-droits/liens-utiles" className={`w-full cursor-pointer flex items-center gap-2 ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}>
                      <ExternalLink className="h-4 w-4" />
                      {t('usefulLinks')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/acces-aux-droits/assistant-virtuel" className={`text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 ${isRTL ? 'font-almarai' : ''}`}>
                {t('faqChatbot')}
              </Link>
            </nav>

            <div className={`flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
              {/* Home Button - Always visible */}
              <Link to="/acces-aux-droits">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>

              {/* Language Switcher - Always visible */}
              <div className="flex items-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-full p-0.5 sm:p-1 shadow-sm border border-primary/20">
                <Button
                  size="sm"
                  onClick={() => setLanguage('fr')}
                  className={`${language === 'fr' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition-all duration-200`}
                >
                  FR
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLanguage('ar')}
                  className={`${language === 'ar' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:text-primary'} rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition-all duration-200`}
                >
                  AR
                </Button>
              </div>

              {/* JustClic Button - Hidden on very small screens */}
              <Link to="/" className="hidden xs:block sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 sm:px-3 h-8 sm:h-9 rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-200 shadow-sm"
                >
                  <img src="/Feelinx_upload/justclic-logo.png" alt="JustClic" className="h-4 sm:h-5" />
                </Button>
              </Link>

              {/* Mobile Menu - In flow, not absolute */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden p-1.5 h-8 w-8 sm:h-9 sm:w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"} className="w-80 overflow-y-auto">
                  <div className="flex flex-col h-full">
                    <div className={`flex items-center p-4 border-b ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt={t('accessToRights')} className="h-6 sm:h-8 w-auto" />
                      <h2 className={`font-bold text-primary ${isRTL ? 'font-almarai' : ''}`}>{t('accessToRights')}</h2>
                    </div>

                    <nav className="flex flex-col mt-4 px-2">
                      {/* Home Link */}
                      <Link
                        to="/acces-aux-droits"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-base font-medium hover:text-primary p-3 rounded-lg hover:bg-muted flex items-center gap-3 ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}
                      >
                        <Home className="h-5 w-5 text-primary" />
                        {t('home')}
                      </Link>

                      <div className="h-px bg-border my-2" />

                      {/* Hierarchical Menu Sections */}
                      {menuSections.map((section) => {
                        const Icon = section.icon;
                        const isOpen = openSections.includes(section.id);
                        const isCurrentSection = location.pathname.includes(section.link.split('/').pop() || '');

                        return (
                          <div key={section.id} className="mb-1">
                            <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Link
                                  to={section.link}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex-1 text-base font-medium p-3 rounded-lg hover:bg-muted flex items-center gap-3 ${isCurrentSection ? 'text-primary bg-primary/5' : 'hover:text-primary'
                                    } ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}
                                >
                                  <Icon className={`h-5 w-5 ${isCurrentSection ? 'text-primary' : 'text-muted-foreground'}`} />
                                  {section.label}
                                </Link>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 p-0 hover:bg-muted"
                                  >
                                    {isOpen ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className={`h-4 w-4 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>

                              <CollapsibleContent>
                                <div className={`${isRTL ? 'pr-6 border-r-2' : 'pl-6 border-l-2'} border-muted ml-5 mr-5 mt-1 mb-2`}>
                                  {section.children.map((child, idx) => {
                                    const isChildCurrent = location.pathname === child.link;
                                    return (
                                      <Link
                                        key={idx}
                                        to={child.link}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block text-sm p-2.5 rounded-lg hover:bg-muted ${isChildCurrent ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                          } ${isRTL ? 'font-almarai text-right' : ''}`}
                                      >
                                        {child.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}

                      <div className="h-px bg-border my-3" />

                      {/* Footer Link */}
                      <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-sm text-muted-foreground hover:text-primary p-3 rounded-lg hover:bg-muted flex items-center gap-2 ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}
                      >
                        <span>{isRTL ? '←' : '→'}</span>
                        <span>{t('homepage')}</span>
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-navigation - changes based on route */}
      {getSubNav()}

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccesAuxDroitsLayout;
