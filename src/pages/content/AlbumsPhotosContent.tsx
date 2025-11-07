import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Eye, Camera, Users, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const AlbumsPhotosContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const albums = [
    {
      id: 1,
      title: "Journée Portes Ouvertes - Accès aux Droits",
      date: "15 Mars 2024",
      location: "Centre-ville de Tunis",
      photos: 45,
      views: 1250,
      category: "Événements",
      description: "Grande journée d'information sur les droits des citoyens",
      thumbnail: "/api/placeholder/300/200",
      featured: true
    },
    {
      id: 2,
      title: "Formation des médiateurs sociaux",
      date: "8 Mars 2024",
      location: "Salle de conférences, Ministère",
      photos: 28,
      views: 890,
      category: "Formations",
      description: "Session de formation pour les nouveaux médiateurs",
      thumbnail: "/api/placeholder/300/200",
      featured: false
    },
    {
      id: 3,
      title: "Campagne sensibilisation - Droits des femmes",
      date: "8 Mars 2024",
      location: "Avenue Habib Bourguiba",
      photos: 67,
      views: 2100,
      category: "Campagnes",
      description: "Campagne de sensibilisation à l'égalité des droits",
      thumbnail: "/api/placeholder/300/200",
      featured: true
    },
    {
      id: 4,
      title: "Conférence sur l'aide juridictionnelle",
      date: "25 Février 2024",
      location: "Palais de Justice, Tunis",
      photos: 32,
      views: 750,
      category: "Conférences",
      description: "Conférence sur l'accès à la justice pour tous",
      thumbnail: "/api/placeholder/300/200",
      featured: false
    },
    {
      id: 5,
      title: "Atelier participatif - Jeunes et citoyenneté",
      date: "18 Février 2024",
      location: "Centre culturel, Sfax",
      photos: 51,
      views: 1420,
      category: "Ateliers",
      description: "Sensibilisation des jeunes à leurs droits civiques",
      thumbnail: "/api/placeholder/300/200",
      featured: false
    },
    {
      id: 6,
      title: "Remise de prix - Concours droits humains",
      date: "10 Février 2024",
      location: "Théâtre municipal, Tunis",
      photos: 38,
      views: 980,
      category: "Cérémonies",
      description: "Cérémonie de remise des prix du concours étudiant",
      thumbnail: "/api/placeholder/300/200",
      featured: false
    }
  ];

  const categories = [
    t('allCategories'), 
    t('eventsCategory'), 
    t('trainings'), 
    t('campaigns'), 
    t('conferences'), 
    t('workshops'), 
    t('ceremonies')
  ];

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         album.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         album.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || album.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredAlbums = albums.filter(album => album.featured);
  const totalPhotos = albums.reduce((sum, album) => sum + album.photos, 0);

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
            <span className="text-foreground">{t('photoAlbumsTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('photoAlbumsTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            {t('photoAlbumsDesc')}
          </p>
          <div className={`flex items-center justify-center gap-6 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Camera className="h-4 w-4" />
              {totalPhotos} {t('photos')}
            </div>
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className="h-4 w-4" />
              {albums.length} {t('albums')}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-fade-in">
          <div className="relative mb-4 max-w-md mx-auto">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('searchDot')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
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

        {/* Featured Albums */}
        {selectedCategory === "Tous" && (
          <div className="mb-12 animate-fade-in">
            <h2 className={`text-2xl font-semibold mb-6 text-center ${isRTL ? 'text-right' : ''}`}>{t('featured')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredAlbums.map((album) => (
                <Card key={album.id} className="hover:shadow-lg transition-shadow duration-300 border-primary/20 hover-scale">
                  <div className="relative">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <Badge className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-primary/90`}>
                      {t('featured')}
                    </Badge>
                    <Badge variant="outline" className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-background`}>
                      {album.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{album.title}</CardTitle>
                    <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                      {album.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`flex items-center justify-between mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {album.date}
                        </div>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {album.location}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center justify-between mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Camera className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {album.photos} {t('photos')}
                        </div>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {album.views} {t('views')}
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="sm">
                      {isRTL ? 'عرض الألبوم' : 'Voir l\'album'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Albums */}
        <div className="mb-12 animate-fade-in">
          <h2 className={`text-2xl font-semibold mb-6 ${isRTL ? 'text-right' : ''}`}>
            {selectedCategory === "Tous" ? (isRTL ? 'جميع الألبومات' : 'Tous les albums') : `${isRTL ? 'ألبومات' : 'Albums'} - ${selectedCategory}`}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <Card key={album.id} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background text-xs`}>
                    {album.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>{album.title}</h3>
                  <p className={`text-xs text-muted-foreground mb-3 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                    {album.description}
                  </p>
                  <div className="space-y-2 mb-3 text-xs text-muted-foreground">
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {album.date}
                    </div>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span className="line-clamp-1">{album.location}</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between mb-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Camera className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {album.photos} {t('photos')}
                    </div>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {album.views}
                    </div>
                  </div>
                  <Button size="sm" className="w-full text-xs">
                    {isRTL ? 'عرض الألبوم' : 'Voir l\'album'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className={`bg-muted/50 rounded-lg p-6 text-center animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{isRTL ? 'لا تفوت أي حدث' : 'Ne ratez aucun événement'}</h3>
          <p className="text-muted-foreground mb-4">
            {isRTL ? 'اشترك في نشرتنا الإخبارية للحصول على معلومات حول الأحداث القادمة واكتشاف الصور مسبقًا.' : 'Abonnez-vous à notre newsletter pour être informé de nos prochains événements et découvrir les photos en avant-première.'}
          </p>
          <div className={`flex gap-2 max-w-md mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Input placeholder={t('yourEmail')} className={`flex-1 ${isRTL ? 'text-right' : ''}`} />
            <Button>
              {t('subscribe')}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AlbumsPhotosContent;