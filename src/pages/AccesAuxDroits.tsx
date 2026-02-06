import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Map, Video, FileText, Home, Briefcase, GraduationCap, Heart, Users, MessageCircle, Scale, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const AccesAuxDroits = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const quickAccessCards = [
    {
      id: "guides",
      link: "/acces-aux-droits/guides-pratiques",
      icon: BookOpen,
      title: t('practicalGuides'),
      description: t('guidesStepByStep'),
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      hoverBorder: "hover:border-amber-300"
    },
    {
      id: "ressources",
      link: "/acces-aux-droits/ressources-pratiques",
      icon: FileText,
      title: t('practicalResources'),
      description: t('formsModelsDocuments'),
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      hoverBorder: "hover:border-blue-300"
    },
    {
      id: "carte",
      link: "/acces-aux-droits/carte-interactive",
      icon: Map,
      title: t('interactiveMap'),
      description: t('findServicesNearYou'),
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      hoverBorder: "hover:border-emerald-300"
    },
    {
      id: "mediatheque",
      link: "/acces-aux-droits/mediatheque",
      icon: Video,
      title: t('mediaLibrary'),
      description: t('explanatoryVideos'),
      color: "bg-purple-600",
      bgColor: "bg-purple-50",
      hoverBorder: "hover:border-purple-300"
    }
  ];

  const rightsCases = [
    { 
      id: "housing",
      title: t('housingRight'), 
      desc: t('housingDesc'), 
      cases: "156",
      icon: Home,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      id: "work",
      title: t('workRight'), 
      desc: t('workDesc'), 
      cases: "234",
      icon: Briefcase,
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      id: "health",
      title: t('healthRight'), 
      desc: t('healthDesc'), 
      cases: "187",
      icon: Heart,
      color: "bg-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600"
    },
    { 
      id: "education",
      title: t('educationRight'), 
      desc: t('educationDesc'), 
      cases: "143",
      icon: GraduationCap,
      color: "bg-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    { 
      id: "social",
      title: t('socialRights'), 
      desc: t('socialDesc'), 
      cases: "298",
      icon: Users,
      color: "bg-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    { 
      id: "freedom",
      title: t('freedomExpression'), 
      desc: t('freedomDesc'), 
      cases: "89",
      icon: MessageCircle,
      color: "bg-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
    }
  ];

  return (
    <>
      {/* Quick Access Cards */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-center mb-5 sm:mb-6 md:mb-8 ${isRTL ? 'font-almarai' : ''}`}>
            {t('quickAccess')}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {quickAccessCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.id} to={card.link}>
                  <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer border ${card.hoverBorder} hover:scale-[1.02] ${card.bgColor} h-full`}>
                    <CardContent className="pt-4 sm:pt-6 text-center flex flex-col items-center p-3 sm:p-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 shadow-sm`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 ${isRTL ? 'font-almarai' : ''}`}>{card.title}</h3>
                      <p className={`text-xs sm:text-sm text-muted-foreground hidden sm:block ${isRTL ? 'font-almarai' : ''}`}>
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rights Categories */}
      <section className="py-6 sm:py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-center mb-5 sm:mb-6 md:mb-8 ${isRTL ? 'font-almarai' : ''}`}>
            {t('yourRightsByCategory')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {rightsCases.map((category) => {
              const Icon = category.icon;
              const isHovered = hoveredCard === category.id;
              return (
                <Card 
                  key={category.id} 
                  className={`hover:shadow-lg transition-all duration-300 cursor-pointer border border-border/50 hover:border-border ${category.bgColor}`}
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${category.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`text-sm sm:text-base ${isHovered ? category.textColor : ''} transition-colors ${isRTL ? 'font-almarai text-right' : ''} truncate`}>
                          {category.title}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className={`${category.color} text-white text-xs flex-shrink-0`}>
                        {category.cases}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                    <CardDescription className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 ${isRTL ? 'font-almarai text-right' : ''}`}>
                      {category.desc}
                    </CardDescription>
                    <Button 
                      variant={isHovered ? "default" : "outline"} 
                      size="sm" 
                      className={`w-full h-9 sm:h-10 text-xs sm:text-sm transition-all duration-200 ${isHovered ? `${category.color} text-white border-0` : ''} ${isRTL ? 'font-almarai' : ''}`}
                    >
                      {t('explore')}
                      <ArrowRight className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRTL ? 'mr-1.5 sm:mr-2 rotate-180' : 'ml-1.5 sm:ml-2'}`} />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default AccesAuxDroits;
