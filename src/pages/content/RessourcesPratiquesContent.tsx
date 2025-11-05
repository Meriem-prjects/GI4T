import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Calendar, Eye, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
const RessourcesPratiquesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const resources = [
    {
      id: 1,
      titleKey: 'resourceLegalAidForm',
      descKey: 'resourceLegalAidFormDesc',
      category: t('justice'),
      typeKey: 'formType',
      format: "PDF",
      size: "245 KB",
      downloads: 2450,
      lastUpdated: "2024-01-15",
      featured: true
    },
    {
      id: 2,
      titleKey: 'resourceEvictionLetter',
      descKey: 'resourceEvictionLetterDesc',
      category: t('housing'),
      typeKey: 'letterType',
      format: "DOC",
      size: "32 KB",
      downloads: 1890,
      lastUpdated: "2024-01-10",
      featured: false
    },
    {
      id: 3,
      titleKey: 'resourceOverdebtFile',
      descKey: 'resourceOverdebtFileDesc',
      category: t('finances'),
      typeKey: 'dossierType',
      format: "ZIP",
      size: "1.2 MB",
      downloads: 1250,
      lastUpdated: "2023-12-20",
      featured: true
    },
    {
      id: 4,
      titleKey: 'resourceJobCenterClaim',
      descKey: 'resourceJobCenterClaimDesc',
      category: t('employment'),
      typeKey: 'letterType',
      format: "PDF",
      size: "156 KB",
      downloads: 3100,
      lastUpdated: "2024-01-12",
      featured: false
    },
    {
      id: 5,
      titleKey: 'resourceSocialHousingRequest',
      descKey: 'resourceSocialHousingRequestDesc',
      category: t('housing'),
      typeKey: 'dossierType',
      format: "PDF",
      size: "890 KB",
      downloads: 1750,
      lastUpdated: "2023-12-18",
      featured: false
    },
    {
      id: 6,
      titleKey: 'resourceFineContestation',
      descKey: 'resourceFineContestationDesc',
      category: t('justice'),
      typeKey: 'letterType', 
      format: "DOC",
      size: "28 KB",
      downloads: 920,
      lastUpdated: "2024-01-08",
      featured: false
    }
  ];

  const categories = [
    t('allCategories'), 
    t('justice'), 
    t('housing'), 
    t('finances'), 
    t('employment'), 
    t('health'), 
    t('family')
  ];

  const filteredResources = resources.filter(resource => {
    const title = t(resource.titleKey as any);
    const desc = t(resource.descKey as any);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === t('allCategories') || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('practicalResourcesTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('practicalResourcesTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('practicalResourcesDesc')}
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

        {/* Featured Resources */}
        {selectedCategory === t('allCategories') && (
          <div className="mb-12 animate-fade-in">
            <h2 className={`text-2xl font-semibold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('featuredResources')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-300 border-primary/20 hover-scale">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {t('featured')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{t(resource.titleKey as any)}</CardTitle>
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
                      <Button className="flex-1" size="sm">
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
        <div className="mb-12 animate-fade-in">
          <h2 className={`text-2xl font-semibold mb-6 ${isRTL ? 'text-right' : ''}`}>
            {selectedCategory === t('allCategories') ? t('allResources') : `${t('practicalResourcesTitle')} - ${selectedCategory}`}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className={`font-medium text-sm ${isRTL ? 'text-right' : ''}`}>{t(resource.titleKey as any)}</h3>
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
                      <Button size="sm" className="text-xs">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-muted/50 rounded-lg p-6 text-center animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">{t('stayInformed')}</h3>
          <p className="text-muted-foreground mb-4">
            {isRTL ? 'اشترك ليصلك جديد الموارد' : 'Recevez les nouvelles ressources par email.'}
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