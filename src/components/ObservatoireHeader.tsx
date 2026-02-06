import { useState } from "react";
import { Menu, Home, Scale, FileText, Newspaper, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const ObservatoireHeader = () => {
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

  // Mobile menu structure with parent-child hierarchy
  const menuSections = [
    {
      id: 'droits',
      label: isRTL ? 'الحقوق الأساسية' : 'Droits Fondamentaux',
      icon: Scale,
      link: '/observatoire/droits-fondamentaux',
      children: [
        { label: isRTL ? 'النصوص الأساسية' : 'Textes fondamentaux', link: '/observatoire/textes-fondamentaux' }
      ]
    },
    {
      id: 'analyses',
      label: isRTL ? 'تحليلات وآراء' : 'Analyses & Opinions',
      icon: FileText,
      link: '/observatoire/analyses-opinions',
      children: [
        { label: isRTL ? 'التحليلات القانونية' : 'Analyses juridiques', link: '/observatoire/analyses-juridiques' },
        { label: isRTL ? 'بطاقات الاجتهاد القضائي' : 'Fiches jurisprudence', link: '/observatoire/fiches-jurisprudence' },
        { label: isRTL ? 'التعليقات' : 'Commentaires', link: '/observatoire/commentaires' }
      ]
    },
    {
      id: 'actualites',
      label: isRTL ? 'الأخبار' : 'Actualités',
      icon: Newspaper,
      link: '/observatoire/actualites',
      children: []
    }
  ];

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Title */}
          <Link to="/observatoire" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
            <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-6 sm:h-8 md:h-12" />
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className={`text-sm sm:text-base md:text-2xl font-bold text-foreground ${isRTL ? 'font-almarai' : ''}`}>
                {isRTL ? 'مرصد الحقوق الأساسية' : 'Observatoire des Droits Fondamentaux'}
              </h1>
              <p className={`text-xs sm:text-sm text-muted-foreground hidden sm:block ${isRTL ? 'font-almarai' : ''}`}>
                {isRTL ? 'مراقبة وحماية حقوق المواطنين' : 'Surveillance et protection des droits citoyens'}
              </p>
            </div>
          </Link>

          {/* Navigation and Controls */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            {/* Home Button - Always visible */}
            <Link to="/observatoire">
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
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-80 overflow-y-auto">
                <div className="flex flex-col h-full">
                  <div className={`flex items-center p-4 border-b ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-6 sm:h-8 w-auto" />
                    <h2 className={`font-bold text-primary ${isRTL ? 'font-almarai' : ''}`}>
                      {isRTL ? 'المرصد' : 'Observatoire'}
                    </h2>
                  </div>
                  
                  <nav className="flex flex-col mt-4 px-2">
                    {/* Home Link */}
                    <Link 
                      to="/observatoire" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={`text-base font-medium hover:text-primary p-3 rounded-lg hover:bg-muted flex items-center gap-3 ${
                        location.pathname === '/observatoire' ? 'text-primary bg-primary/5' : ''
                      } ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}
                    >
                      <Home className="h-5 w-5 text-primary" />
                      {isRTL ? 'الرئيسية' : 'Accueil'}
                    </Link>
                    
                    {/* Search Link */}
                    <Link 
                      to="/observatoire/search-results" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={`text-base font-medium hover:text-primary p-3 rounded-lg hover:bg-muted flex items-center gap-3 ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}
                    >
                      <Search className="h-5 w-5 text-muted-foreground" />
                      {isRTL ? 'البحث' : 'Recherche'}
                    </Link>
                    
                    <div className="h-px bg-border my-2" />
                    
                    {/* Hierarchical Menu Sections */}
                    {menuSections.map((section) => {
                      const Icon = section.icon;
                      const isOpen = openSections.includes(section.id);
                      const isCurrentSection = location.pathname.includes(section.link.split('/').pop() || '');
                      const hasChildren = section.children.length > 0;
                      
                      if (!hasChildren) {
                        return (
                          <Link 
                            key={section.id}
                            to={section.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-base font-medium p-3 rounded-lg hover:bg-muted flex items-center gap-3 mb-1 ${
                              isCurrentSection ? 'text-primary bg-primary/5' : 'hover:text-primary'
                            } ${isRTL ? 'font-almarai flex-row-reverse text-right' : ''}`}
                          >
                            <Icon className={`h-5 w-5 ${isCurrentSection ? 'text-primary' : 'text-muted-foreground'}`} />
                            {section.label}
                          </Link>
                        );
                      }
                      
                      return (
                        <div key={section.id} className="mb-1">
                          <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Link 
                                to={section.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex-1 text-base font-medium p-3 rounded-lg hover:bg-muted flex items-center gap-3 ${
                                  isCurrentSection ? 'text-primary bg-primary/5' : 'hover:text-primary'
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
                                      className={`block text-sm p-2.5 rounded-lg hover:bg-muted ${
                                        isChildCurrent ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
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
                      <span>{isRTL ? 'الصفحة الرئيسية' : 'Page d\'accueil'}</span>
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ObservatoireHeader;
