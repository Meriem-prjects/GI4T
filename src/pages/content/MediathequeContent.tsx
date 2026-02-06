import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Video, Headphones, Mic, Eye, Heart, ChevronRight, Film, Users, BookOpen, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const MediathequeContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedType, setSelectedType] = useState("Tous");
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const categoryCards = [
    { id: "all", name: t('allCategories'), icon: Film, color: "bg-slate-600", bgColor: "bg-slate-50", count: 6 },
    { id: "testimonials", name: t('testimonials'), icon: Users, color: "bg-rose-600", bgColor: "bg-rose-50", count: 1 },
    { id: "tutorials", name: t('tutorials'), icon: BookOpen, color: "bg-blue-600", bgColor: "bg-blue-50", count: 1 },
    { id: "podcasts", name: t('podcasts'), icon: Headphones, color: "bg-purple-600", bgColor: "bg-purple-50", count: 1 },
    { id: "trainings", name: t('trainings'), icon: Video, color: "bg-emerald-600", bgColor: "bg-emerald-50", count: 1 },
    { id: "documentaries", name: t('documentaries'), icon: Film, color: "bg-amber-600", bgColor: "bg-amber-50", count: 1 },
    { id: "interviews", name: t('interviews'), icon: MessageSquare, color: "bg-cyan-600", bgColor: "bg-cyan-50", count: 1 }
  ];

  const mediaContent = [
    {
      id: 1,
      title: "Témoignage : Mon recours contre une discrimination",
      description: "Sarah raconte comment elle a fait valoir ses droits suite à une discrimination à l'embauche",
      type: "Vidéo",
      category: "Témoignages",
      categoryId: "testimonials",
      duration: "8:45",
      views: 12450,
      likes: 234,
      thumbnail: "/api/placeholder/320/180",
      featured: true,
      color: "bg-rose-600",
      bgColor: "bg-rose-50"
    },
    {
      id: 2,
      title: "Comment contester une décision administrative",
      description: "Guide vidéo étape par étape pour effectuer un recours administratif",
      type: "Vidéo",
      category: "Tutoriels",
      categoryId: "tutorials",
      duration: "15:30",
      views: 8930,
      likes: 187,
      thumbnail: "/api/placeholder/320/180",
      featured: false,
      color: "bg-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: "Podcast Droits & Société - Épisode 12",
      description: "L'accès au logement social : défis et solutions en Tunisie",
      type: "Audio",
      category: "Podcasts",
      categoryId: "podcasts",
      duration: "32:15",
      views: 3420,
      likes: 89,
      thumbnail: "/api/placeholder/320/180",
      featured: true,
      color: "bg-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      title: "Webinaire : Vos droits face à l'administration",
      description: "Conférence en ligne avec des experts du droit administratif",
      type: "Webinaire",
      category: "Formations",
      categoryId: "trainings",
      duration: "1:24:30",
      views: 5678,
      likes: 156,
      thumbnail: "/api/placeholder/320/180",
      featured: false,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      id: 5,
      title: "Les droits des femmes au travail",
      description: "Documentaire sur l'égalité professionnelle et les recours possibles",
      type: "Vidéo",
      category: "Documentaires",
      categoryId: "documentaries",
      duration: "28:12",
      views: 9876,
      likes: 312,
      thumbnail: "/api/placeholder/320/180",
      featured: false,
      color: "bg-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      id: 6,
      title: "Interview : Médiateur de la République",
      description: "Rencontre avec le Médiateur sur son rôle et ses missions",
      type: "Audio",
      category: "Interviews",
      categoryId: "interviews",
      duration: "18:45",
      views: 4567,
      likes: 98,
      thumbnail: "/api/placeholder/320/180",
      featured: false,
      color: "bg-cyan-600",
      bgColor: "bg-cyan-50"
    }
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
    const matchesCategory = selectedCategory === "Tous" || selectedCategory === t('allCategories') || item.category === selectedCategory;
    const matchesType = selectedType === "Tous" || selectedType === t('allCategories') || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredContent = mediaContent.filter(item => item.featured);

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
            <span className="text-foreground">{t('mediaLibraryTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className={`text-center mb-6 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('mediaLibraryTitle')}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('mediaLibraryDesc')}
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
        <div className="mb-6 animate-fade-in">
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

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
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

        {/* Featured Content */}
        {(selectedCategory === "Tous" || selectedCategory === t('allCategories')) && selectedType === "Tous" && (
          <div className="mb-10 animate-fade-in">
            <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>{t('featured')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredContent.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <Card key={item.id} className={`hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${item.bgColor}`}>
                    <div className="relative">
                      <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                        <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <Badge className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} ${item.color} text-white`}>
                        {t('featured')}
                      </Badge>
                      <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background`}>
                        {item.type}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{item.title}</CardTitle>
                      <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`flex items-center justify-between mb-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                      
                      <Button className={`w-full ${item.color} text-white hover:opacity-90`} size="sm">
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
        <div className="mb-10 animate-fade-in">
          <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>
            {(selectedCategory === "Tous" || selectedCategory === t('allCategories')) && selectedType === "Tous" 
              ? t('allResources')
              : `${selectedCategory !== "Tous" && selectedCategory !== t('allCategories') ? selectedCategory : ""} ${selectedType !== "Tous" ? selectedType : ""}`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContent.map((item) => {
              const Icon = getTypeIcon(item.type);
              return (
                <Card key={item.id} className={`hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${item.bgColor}`}>
                  <div className="relative">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center shadow-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
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
                    <Button size="sm" className={`w-full text-xs ${item.color} text-white hover:opacity-90`}>
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
