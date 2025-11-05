import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Video, Headphones, Mic, Eye, Heart, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const MediathequeContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedType, setSelectedType] = useState("Tous");
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const mediaContent = [
    {
      id: 1,
      title: "Témoignage : Mon recours contre une discrimination",
      description: "Sarah raconte comment elle a fait valoir ses droits suite à une discrimination à l'embauche",
      type: "Vidéo",
      category: "Témoignages",
      duration: "8:45",
      views: 12450,
      likes: 234,
      thumbnail: "/api/placeholder/320/180",
      featured: true
    },
    {
      id: 2,
      title: "Comment contester une décision administrative",
      description: "Guide vidéo étape par étape pour effectuer un recours administratif",
      type: "Vidéo",
      category: "Tutoriels",
      duration: "15:30",
      views: 8930,
      likes: 187,
      thumbnail: "/api/placeholder/320/180",
      featured: false
    },
    {
      id: 3,
      title: "Podcast Droits & Société - Épisode 12",
      description: "L'accès au logement social : défis et solutions en Tunisie",
      type: "Audio",
      category: "Podcasts",
      duration: "32:15",
      views: 3420,
      likes: 89,
      thumbnail: "/api/placeholder/320/180",
      featured: true
    },
    {
      id: 4,
      title: "Webinaire : Vos droits face à l'administration",
      description: "Conférence en ligne avec des experts du droit administratif",
      type: "Webinaire",
      category: "Formations",
      duration: "1:24:30",
      views: 5678,
      likes: 156,
      thumbnail: "/api/placeholder/320/180",
      featured: false
    },
    {
      id: 5,
      title: "Les droits des femmes au travail",
      description: "Documentaire sur l'égalité professionnelle et les recours possibles",
      type: "Vidéo",
      category: "Documentaires",
      duration: "28:12",
      views: 9876,
      likes: 312,
      thumbnail: "/api/placeholder/320/180",
      featured: false
    },
    {
      id: 6,
      title: "Interview : Médiateur de la République",
      description: "Rencontre avec le Médiateur sur son rôle et ses missions",
      type: "Audio",
      category: "Interviews",
      duration: "18:45",
      views: 4567,
      likes: 98,
      thumbnail: "/api/placeholder/320/180",
      featured: false
    }
  ];

  const categories = [
    t('allCategories'), 
    t('testimonials'), 
    t('tutorials'), 
    t('podcasts'), 
    t('trainings'), 
    t('documentaries'), 
    t('interviews')
  ];
  const types = [t('allCategories'), t('video'), t('audio'), t('webinar')];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Vidéo":
        return Video;
      case "Audio":
        return Headphones;
      case "Webinaire":
        return Mic;
      default:
        return Play;
    }
  };

  const filteredContent = mediaContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || item.category === selectedCategory;
    const matchesType = selectedType === "Tous" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredContent = mediaContent.filter(item => item.featured);

  return (
    <main className={`flex-1 ${isRTL ? 'font-almarai' : ''}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('mediaLibraryTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('mediaLibraryTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('mediaLibraryDesc')}
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

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-sm font-medium text-muted-foreground ${isRTL ? 'ml-2' : 'mr-2'}`}>{t('category')}:</span>
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

          <div className="flex flex-wrap gap-2">
            <span className={`text-sm font-medium text-muted-foreground ${isRTL ? 'ml-2' : 'mr-2'}`}>{t('type')}:</span>
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="transition-all duration-200"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        {selectedCategory === "Tous" && selectedType === "Tous" && (
          <div className="mb-12 animate-fade-in">
            <h2 className={`text-2xl font-semibold mb-6 ${isRTL ? 'text-right' : ''}`}>{t('featured')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredContent.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow duration-300 border-primary/20 hover-scale">
                    <div className="relative">
                      <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                        <Icon className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <Badge className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} bg-primary/90`}>
                        {t('featured')}
                      </Badge>
                      <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background`}>
                        {item.type}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{item.title}</CardTitle>
                      <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`flex items-center justify-between mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span>{item.duration}</span>
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {item.views.toLocaleString()}
                          </div>
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Heart className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {item.likes}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      
                      <Button className="w-full" size="sm">
                        <Play className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('watch')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Content Grid */}
        <div className="mb-12 animate-fade-in">
          <h2 className={`text-2xl font-semibold mb-6 ${isRTL ? 'text-right' : ''}`}>
            {selectedCategory === "Tous" && selectedType === "Tous" 
              ? t('allResources')
              : `${selectedCategory !== "Tous" ? selectedCategory : ""} ${selectedType !== "Tous" ? selectedType : ""}`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => {
              const Icon = getTypeIcon(item.type);
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                  <div className="relative">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background text-xs`}>
                      {item.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>{item.title}</h3>
                    <p className={`text-xs text-muted-foreground mb-3 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                      {item.description}
                    </p>
                    <div className={`flex items-center justify-between mb-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{item.duration}</span>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {item.views > 1000 ? `${Math.floor(item.views/1000)}k` : item.views}
                        </div>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Heart className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {item.likes}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full text-xs">
                      <Play className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('watch')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`bg-muted/50 rounded-lg p-6 text-center animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{t('shareStory')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('shareStoryDesc')}
          </p>
          <Button>
            {isRTL ? 'اقترح شهادة' : 'Proposer un témoignage'}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default MediathequeContent;