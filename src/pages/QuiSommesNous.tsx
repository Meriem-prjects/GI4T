import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

const QuiSommesNous = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-muted-foreground`}>
            <Link to="/" className="hover:text-primary">{t('home')}</Link>
            <span>›</span>
            <Link to="/information/qui-sommes-nous" className="hover:text-primary">{t('information')}</Link>
            <span>›</span>
            <span className="text-foreground">{t('whoWeAre')}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className={`container mx-auto px-4 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('whoWeAre')} ؟
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('whoWeAreSubtitle')}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className={isRTL ? 'text-right' : 'text-center'}>
                <Target className={`h-12 w-12 text-primary mb-4 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
                <CardTitle className="text-xl">{t('ourMission')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-center'}`}>
                  {t('ourMissionText')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className={isRTL ? 'text-right' : 'text-center'}>
                <Eye className={`h-12 w-12 text-primary mb-4 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
                <CardTitle className="text-xl">{t('ourVision')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-center'}`}>
                  {t('ourVisionText')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className={isRTL ? 'text-right' : 'text-center'}>
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('ourValues')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={isRTL ? 'text-right' : 'text-center'}>
                <Heart className={`h-10 w-10 text-primary mb-4 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
                <h3 className="font-semibold text-lg mb-2">{t('accessibility')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('accessibilityText')}
                </p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-center'}>
                <Users className={`h-10 w-10 text-primary mb-4 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
                <h3 className="font-semibold text-lg mb-2">{t('transparency')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('transparencyText')}
                </p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-center'}>
                <Target className={`h-10 w-10 text-primary mb-4 ${isRTL ? 'mr-auto' : 'mx-auto'}`} />
                <h3 className="font-semibold text-lg mb-2">{t('engagement')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('engagementText')}
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className={`mt-12 ${isRTL ? 'text-right' : 'text-center'}`}>
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('ourTeam')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className={isRTL ? 'text-right' : 'text-center'}>
                  <div className={`w-20 h-20 bg-primary/10 rounded-full mb-4 flex items-center justify-center ${isRTL ? 'mr-auto' : 'mx-auto'}`}>
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{t('legalExperts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : ''}`}>
                    {t('legalExpertsText')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={isRTL ? 'text-right' : 'text-center'}>
                  <div className={`w-20 h-20 bg-primary/10 rounded-full mb-4 flex items-center justify-center ${isRTL ? 'mr-auto' : 'mx-auto'}`}>
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{t('developers')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : ''}`}>
                    {t('developersText')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={isRTL ? 'text-right' : 'text-center'}>
                  <div className={`w-20 h-20 bg-primary/10 rounded-full mb-4 flex items-center justify-center ${isRTL ? 'mr-auto' : 'mx-auto'}`}>
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{t('community')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : ''}`}>
                    {t('communityText')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className={`container mx-auto px-4 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('joinMission')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('joinMissionText')}
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'justify-end' : 'justify-center'}`}>
            <Link to="/observatoire">
              <Button size="lg">
                {t('discoverObservatory')}
              </Button>
            </Link>
            <Link to="/acces-aux-droits">
              <Button variant="outline" size="lg">
                {t('accessResources')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuiSommesNous;