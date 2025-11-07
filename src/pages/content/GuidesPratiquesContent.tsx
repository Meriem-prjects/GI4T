import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Download, BookOpen, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const GuidesPratiquesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const guides = [
    {
      id: 1,
      titleKey: 'guideJobSeeker',
      descKey: 'guideJobSeekerDesc',
      category: t('employment'),
      duration: "15 min",
      difficulty: t('beginner'),
      downloads: 1250,
      tagKeys: ['tagPoleEmploi', 'tagAllocation', 'tagFormation']
    },
    {
      id: 2,
      titleKey: 'guideHousingRights',
      descKey: 'guideHousingRightsDesc',
      category: t('housing'), 
      duration: "20 min",
      difficulty: t('intermediate'),
      downloads: 980,
      tagKeys: ['tagAPL', 'tagBailleur', 'tagExpulsion']
    },
    {
      id: 3,
      titleKey: 'guideHealthAccess',
      descKey: 'guideHealthAccessDesc',
      category: t('health'),
      duration: "12 min", 
      difficulty: t('beginner'),
      downloads: 1450,
      tagKeys: ['tagCMU', 'tagSecuriteSociale', 'tagMedecin']
    },
    {
      id: 4,
      titleKey: 'guideFamilyRights',
      descKey: 'guideFamilyRightsDesc',
      category: t('family'),
      duration: "18 min",
      difficulty: t('intermediate'), 
      downloads: 720,
      tagKeys: ['tagCAF', 'tagEcole', 'tagGarde']
    },
    {
      id: 5,
      titleKey: 'guideLegalAid',
      descKey: 'guideLegalAidDesc',
      category: t('justice'),
      duration: "10 min",
      difficulty: t('beginner'),
      downloads: 650,
      tagKeys: ['tagAvocat', 'tagTribunal', 'tagGratuit']
    },
    {
      id: 6,
      titleKey: 'guideForeigners',
      descKey: 'guideForeignersDesc',
      category: t('immigration'),
      duration: "25 min",
      difficulty: t('advanced'),
      downloads: 890,
      tagKeys: ['tagPrefecture', 'tagVisa', 'tagNaturalisation']
    }
  ];

  const categories = [
    t('allCategories'), 
    t('employment'), 
    t('housing'), 
    t('health'), 
    t('family'), 
    t('justice'), 
    t('immigration')
  ];

  const filteredGuides = guides.filter(guide => {
    const title = t(guide.titleKey as any);
    const desc = t(guide.descKey as any);
    const tags = guide.tagKeys.map(key => t(key as any));
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === t('allCategories') || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className={`flex-1 ${isRTL ? 'font-almarai' : ''}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('practicalGuidesTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('practicalGuidesTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('practicalGuidesDesc')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-fade-in">
          <div className="relative mb-4">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('searchDot')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fade-in">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="hover:shadow-lg transition-shadow duration-300 hover-scale">
              <CardHeader>
                <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="secondary" className="text-xs">
                    {guide.category}
                  </Badge>
                  <div className={`flex items-center text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Download className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {guide.downloads}
                  </div>
                </div>
                <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{t(guide.titleKey as any)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm text-muted-foreground mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {t(guide.descKey as any)}
                </p>
                
                <div className={`flex items-center justify-between mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Clock className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {guide.duration}
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Users className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {guide.difficulty}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.tagKeys.map((tagKey) => (
                    <Badge key={tagKey} variant="outline" className="text-xs">
                      {t(tagKey as any)}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <BookOpen className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t('read')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`bg-muted/50 rounded-lg p-6 text-center animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{t('needHelp')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('needHelpDesc')}
          </p>
          <Button>
            {t('contactUs')}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default GuidesPratiquesContent;