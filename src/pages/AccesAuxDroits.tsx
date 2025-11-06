import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Map, Video, FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const AccesAuxDroits = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const quickAccessCards = [
    {
      link: "/acces-aux-droits/guides-pratiques",
      icon: BookOpen,
      title: t('practicalGuides'),
      description: t('guidesStepByStep')
    },
    {
      link: "/acces-aux-droits/ressources-pratiques",
      icon: FileText,
      title: t('practicalResources'),
      description: t('formsModelsDocuments')
    },
    {
      link: "/acces-aux-droits/carte-interactive",
      icon: Map,
      title: t('interactiveMap'),
      description: t('findServicesNearYou')
    },
    {
      link: "/acces-aux-droits/mediatheque",
      icon: Video,
      title: t('mediaLibrary'),
      description: t('explanatoryVideos')
    }
  ];

  const rightsCases = [
    { title: t('housingRight'), desc: t('housingDesc'), cases: "156" },
    { title: t('workRight'), desc: t('workDesc'), cases: "234" },
    { title: t('healthRight'), desc: t('healthDesc'), cases: "187" },
    { title: t('educationRight'), desc: t('educationDesc'), cases: "143" },
    { title: t('socialRights'), desc: t('socialDesc'), cases: "298" },
    { title: t('freedomExpression'), desc: t('freedomDesc'), cases: "89" }
  ];

  return (
    <>
      {/* Quick Access Cards */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <h3 className={`text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12 ${isRTL ? 'font-almarai' : ''}`}>
            {t('quickAccess')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickAccessCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={index} to={card.link}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                      <CardTitle className={`text-center ${isRTL ? 'font-almarai' : ''}`}>{card.title}</CardTitle>
                      <CardDescription className={`text-center ${isRTL ? 'font-almarai' : ''}`}>
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rights Categories */}
      <section className="py-8 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className={`text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12 ${isRTL ? 'font-almarai' : ''}`}>
            {t('yourRightsByCategory')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rightsCases.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <CardTitle className={`flex items-center gap-2 justify-center ${isRTL ? 'font-almarai' : ''}`}>
                    <Scale className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                  <CardDescription className={`text-center ${isRTL ? 'font-almarai' : ''}`}>{category.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-sm text-muted-foreground ${isRTL ? 'font-almarai' : ''}`}>
                      {category.cases} {t('cases')}
                    </span>
                    <Button variant="outline" size="sm" className={isRTL ? 'font-almarai' : ''}>
                      {t('explore')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AccesAuxDroits;