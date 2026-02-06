import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Download, BookOpen, ChevronRight, Home, Briefcase, Heart, GraduationCap, Scale, Plane, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const GuidesPratiquesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [hoveredGuide, setHoveredGuide] = useState<number | null>(null);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const categoryCards = [
    { id: "all", name: t('allCategories'), icon: BookOpen, color: "bg-slate-600", bgColor: "bg-slate-50", count: 6 },
    { id: "employment", name: t('employment'), icon: Briefcase, color: "bg-blue-600", bgColor: "bg-blue-50", count: 1 },
    { id: "housing", name: t('housing'), icon: Home, color: "bg-emerald-600", bgColor: "bg-emerald-50", count: 1 },
    { id: "health", name: t('health'), icon: Heart, color: "bg-rose-600", bgColor: "bg-rose-50", count: 1 },
    { id: "family", name: t('family'), icon: Users, color: "bg-purple-600", bgColor: "bg-purple-50", count: 1 },
    { id: "justice", name: t('justice'), icon: Scale, color: "bg-amber-600", bgColor: "bg-amber-50", count: 1 },
    { id: "immigration", name: t('immigration'), icon: Plane, color: "bg-cyan-600", bgColor: "bg-cyan-50", count: 1 }
  ];

  const guides = [
    {
      id: 1,
      titleKey: 'guideJobSeeker',
      descKey: 'guideJobSeekerDesc',
      categoryId: "employment",
      category: t('employment'),
      duration: "15 min",
      difficulty: t('beginner'),
      downloads: 1250,
      tagKeys: ['tagPoleEmploi', 'tagAllocation', 'tagFormation'],
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      id: 2,
      titleKey: 'guideHousingRights',
      descKey: 'guideHousingRightsDesc',
      categoryId: "housing",
      category: t('housing'), 
      duration: "20 min",
      difficulty: t('intermediate'),
      downloads: 980,
      tagKeys: ['tagAPL', 'tagBailleur', 'tagExpulsion'],
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      id: 3,
      titleKey: 'guideHealthAccess',
      descKey: 'guideHealthAccessDesc',
      categoryId: "health",
      category: t('health'),
      duration: "12 min", 
      difficulty: t('beginner'),
      downloads: 1450,
      tagKeys: ['tagCMU', 'tagSecuriteSociale', 'tagMedecin'],
      color: "bg-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600"
    },
    {
      id: 4,
      titleKey: 'guideFamilyRights',
      descKey: 'guideFamilyRightsDesc',
      categoryId: "family",
      category: t('family'),
      duration: "18 min",
      difficulty: t('intermediate'), 
      downloads: 720,
      tagKeys: ['tagCAF', 'tagEcole', 'tagGarde'],
      color: "bg-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      id: 5,
      titleKey: 'guideLegalAid',
      descKey: 'guideLegalAidDesc',
      categoryId: "justice",
      category: t('justice'),
      duration: "10 min",
      difficulty: t('beginner'),
      downloads: 650,
      tagKeys: ['tagAvocat', 'tagTribunal', 'tagGratuit'],
      color: "bg-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      id: 6,
      titleKey: 'guideForeigners',
      descKey: 'guideForeignersDesc',
      categoryId: "immigration",
      category: t('immigration'),
      duration: "25 min",
      difficulty: t('advanced'),
      downloads: 890,
      tagKeys: ['tagPrefecture', 'tagVisa', 'tagNaturalisation'],
      color: "bg-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
    }
  ];

  const filteredGuides = guides.filter(guide => {
    const title = t(guide.titleKey as any);
    const desc = t(guide.descKey as any);
    const tags = guide.tagKeys.map(key => t(key as any));
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Tous" || selectedCategory === t('allCategories') || guide.category === selectedCategory;
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
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className={`text-center mb-6 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('practicalGuidesTitle')}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('practicalGuidesDesc')}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 animate-fade-in">
          <div className="relative max-w-md mx-auto">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('searchDot')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>
        </div>

        {/* Category Cards */}
        <div className="mb-8 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categoryCards.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name || (cat.id === "all" && (selectedCategory === "Tous" || selectedCategory === t('allCategories')));
              return (
                <Card 
                  key={cat.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${isSelected ? 'ring-2 ring-primary shadow-md' : ''} ${cat.bgColor}`}
                  onClick={() => setSelectedCategory(cat.id === "all" ? t('allCategories') : cat.name)}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium line-clamp-1">{cat.name}</span>
                    <Badge variant="secondary" className="mt-1 text-xs">{cat.count}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 animate-fade-in">
          {filteredGuides.map((guide) => {
            const isHovered = hoveredGuide === guide.id;
            return (
              <Card 
                key={guide.id} 
                className={`hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${guide.bgColor}`}
                onMouseEnter={() => setHoveredGuide(guide.id)}
                onMouseLeave={() => setHoveredGuide(null)}
              >
                <CardHeader className="pb-3">
                  <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Badge className={`${guide.color} text-white text-xs`}>
                      {guide.category}
                    </Badge>
                    <div className={`flex items-center text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Download className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {guide.downloads}
                    </div>
                  </div>
                  <CardTitle className={`text-lg ${isHovered ? guide.textColor : ''} transition-colors ${isRTL ? 'text-right' : ''}`}>
                    {t(guide.titleKey as any)}
                  </CardTitle>
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
                      <GraduationCap className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
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
                    <Button 
                      className={`flex-1 transition-all duration-200 ${isHovered ? `${guide.color} text-white` : ''}`}
                      variant={isHovered ? "default" : "outline"}
                      size="sm"
                    >
                      <BookOpen className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('read')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
