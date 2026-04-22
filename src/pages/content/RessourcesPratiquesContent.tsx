import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Calendar, Eye, ChevronRight, Scale, Home, Briefcase, Heart, Users, Wallet, FolderOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const RessourcesPratiquesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [hoveredResource, setHoveredResource] = useState<number | null>(null);
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();

  const categoryCards = [
    { id: "all", name: t('allCategories'), icon: FolderOpen, color: "bg-slate-600", bgColor: "bg-slate-50", count: 6 },
    { id: "justice", name: t('justice'), icon: Scale, color: "bg-amber-600", bgColor: "bg-amber-50", count: 2 },
    { id: "housing", name: t('housing'), icon: Home, color: "bg-emerald-600", bgColor: "bg-emerald-50", count: 2 },
    { id: "finances", name: t('finances'), icon: Wallet, color: "bg-purple-600", bgColor: "bg-purple-50", count: 1 },
    { id: "employment", name: t('employment'), icon: Briefcase, color: "bg-blue-600", bgColor: "bg-blue-50", count: 1 },
    { id: "health", name: t('health'), icon: Heart, color: "bg-rose-600", bgColor: "bg-rose-50", count: 0 },
    { id: "family", name: t('family'), icon: Users, color: "bg-cyan-600", bgColor: "bg-cyan-50", count: 0 }
  ];

  const resources = [
    {
      id: 1,
      titleKey: 'resourceLegalAidForm',
      descKey: 'resourceLegalAidFormDesc',
      category: t('justice'),
      categoryId: "justice",
      typeKey: 'formType',
      format: "PDF",
      size: "245 KB",
      downloads: 2450,
      lastUpdated: "2024-01-15",
      featured: true,
      color: "bg-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      id: 2,
      titleKey: 'resourceEvictionLetter',
      descKey: 'resourceEvictionLetterDesc',
      category: t('housing'),
      categoryId: "housing",
      typeKey: 'letterType',
      format: "DOC",
      size: "32 KB",
      downloads: 1890,
      lastUpdated: "2024-01-10",
      featured: false,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      id: 3,
      titleKey: 'resourceOverdebtFile',
      descKey: 'resourceOverdebtFileDesc',
      category: t('finances'),
      categoryId: "finances",
      typeKey: 'dossierType',
      format: "ZIP",
      size: "1.2 MB",
      downloads: 1250,
      lastUpdated: "2023-12-20",
      featured: true,
      color: "bg-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      id: 4,
      titleKey: 'resourceJobCenterClaim',
      descKey: 'resourceJobCenterClaimDesc',
      category: t('employment'),
      categoryId: "employment",
      typeKey: 'letterType',
      format: "PDF",
      size: "156 KB",
      downloads: 3100,
      lastUpdated: "2024-01-12",
      featured: false,
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      id: 5,
      titleKey: 'resourceSocialHousingRequest',
      descKey: 'resourceSocialHousingRequestDesc',
      category: t('housing'),
      categoryId: "housing",
      typeKey: 'dossierType',
      format: "PDF",
      size: "890 KB",
      downloads: 1750,
      lastUpdated: "2023-12-18",
      featured: false,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      id: 6,
      titleKey: 'resourceFineContestation',
      descKey: 'resourceFineContestationDesc',
      category: t('justice'),
      categoryId: "justice",
      typeKey: 'letterType', 
      format: "DOC",
      size: "28 KB",
      downloads: 920,
      lastUpdated: "2024-01-08",
      featured: false,
      color: "bg-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    }
  ];

  const filteredResources = resources.filter(resource => {
    const title = t(resource.titleKey as any);
    const desc = t(resource.descKey as any);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || selectedCategory === t('allCategories') || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('practicalResourcesTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className={`text-center mb-6 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('practicalResourcesTitle')}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('practicalResourcesDesc')}
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

        {/* Featured Resources */}
        {(selectedCategory === "Tous" || selectedCategory === t('allCategories')) && (
          <div className="mb-10 animate-fade-in">
            <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>{t('featuredResources')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredResources.map((resource) => (
                <Card 
                  key={resource.id} 
                  className={`hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${resource.bgColor}`}
                  onMouseEnter={() => setHoveredResource(resource.id)}
                  onMouseLeave={() => setHoveredResource(null)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${resource.color} text-white`}>
                        {t('featured')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                    <CardTitle className={`text-lg ${hoveredResource === resource.id ? resource.textColor : ''} transition-colors`}>
                      {t(resource.titleKey as any)}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t(resource.descKey as any)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {resource.format}
                        </div>
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {resource.downloads}
                        </div>
                      </div>
                      <span>{resource.size}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className={`flex-1 transition-all duration-200 ${hoveredResource === resource.id ? `${resource.color} text-white` : ''}`}
                        variant={hoveredResource === resource.id ? "default" : "outline"}
                        size="sm"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t('download')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div className="mb-10 animate-fade-in">
          <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>
            {(selectedCategory === "Tous" || selectedCategory === t('allCategories')) ? t('allResources') : `${t('practicalResourcesTitle')} - ${selectedCategory}`}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResources.map((resource) => {
              const isHovered = hoveredResource === resource.id;
              return (
                <Card 
                  key={resource.id} 
                  className={`hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${resource.bgColor}`}
                  onMouseEnter={() => setHoveredResource(resource.id)}
                  onMouseLeave={() => setHoveredResource(null)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h3 className={`font-medium text-sm ${isHovered ? resource.textColor : ''} transition-colors ${isRTL ? 'text-right' : ''}`}>
                            {t(resource.titleKey as any)}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {t(resource.typeKey as any)}
                          </Badge>
                        </div>
                        <p className={`text-xs text-muted-foreground mb-3 ${isRTL ? 'text-right' : ''}`}>
                          {t(resource.descKey as any)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {resource.format}
                            </div>
                            <div className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              {resource.downloads}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(resource.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR')}
                            </div>
                          </div>
                          <span>{resource.size}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-4">
                        <Button 
                          size="sm" 
                          className={`text-xs transition-all duration-200 ${isHovered ? `${resource.color} text-white` : ''}`}
                          variant={isHovered ? "default" : "outline"}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-muted/50 rounded-lg p-6 text-center animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">{t('stayInformed')}</h3>
          <p className="text-muted-foreground mb-4">
            {isRTL ? 'اشترك ليصلك جديد الموارد' : 'Recevez les nouvelles ressources par courriel.'}
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder={`${t('yourEmail')}...`} className="flex-1" />
            <Button>
              {t('subscribe')}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RessourcesPratiquesContent;
