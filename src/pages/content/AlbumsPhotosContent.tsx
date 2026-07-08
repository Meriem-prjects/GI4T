import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Eye, Camera, Users, ChevronRight, X, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PhotoAlbum {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  date: string;
  location: string;
  location_ar: string;
  governorate: string;
  category: string;
  cover_image_url: string;
  photo_urls: string[];
  photo_count: number;
  views: number;
  featured: boolean;
  published: boolean;
}

const AlbumsPhotosContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  // Selected album opens a dialog with all its photos. lightboxIndex, when
  // set, promotes one photo to a full-screen overlay so the visitor can
  // browse with the arrow keys / on-screen buttons.
  const [openAlbum, setOpenAlbum] = useState<PhotoAlbum | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  // Arrow-key navigation inside the lightbox.
  useEffect(() => {
    if (lightboxIndex === null || !openAlbum) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      const total = openAlbum.photo_urls?.length ?? 0;
      if (total === 0) return;
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? 0 : (i + 1) % total));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? 0 : (i - 1 + total) % total));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, openAlbum]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("photo_albums")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setAlbums(data);
      } else {
        // Fallback to static data
        setAlbums(defaultAlbums);
      }
    } catch {
      setAlbums(defaultAlbums);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const categories = [
    t('allCategories'),
    t('eventsCategory'),
    t('trainings'),
    t('campaigns'),
    t('conferences'),
    t('workshops'),
    t('ceremonies')
  ];

  const categoryMap: Record<string, string> = {
    [t('eventsCategory')]: "Événements",
    [t('trainings')]: "Formations",
    [t('campaigns')]: "Campagnes",
    [t('conferences')]: "Conférences",
    [t('workshops')]: "Ateliers",
    [t('ceremonies')]: "Cérémonies",
  };

  const filteredAlbums = albums.filter(album => {
    const titleToSearch = isRTL ? (album.title_ar || album.title) : album.title;
    const descToSearch = isRTL ? (album.description_ar || album.description) : album.description;
    const locationToSearch = isRTL ? (album.location_ar || album.location) : album.location;

    const matchesSearch =
      (titleToSearch || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (descToSearch || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (locationToSearch || "").toLowerCase().includes(searchTerm.toLowerCase());

    const englishCategory = categoryMap[selectedCategory] || selectedCategory;
    const matchesCategory = selectedCategory === "Tous" || selectedCategory === t('allCategories') || album.category === englishCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredAlbums = filteredAlbums.filter(album => album.featured);
  const totalPhotos = albums.reduce((sum, album) => sum + (album.photo_count || 0), 0);

  const getTitle = (album: PhotoAlbum) => isRTL ? (album.title_ar || album.title) : album.title;
  const getDesc = (album: PhotoAlbum) => isRTL ? (album.description_ar || album.description) : album.description;
  const getLocation = (album: PhotoAlbum) => isRTL ? (album.location_ar || album.location) : album.location;

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

        {loading ? (
          <div className="flex justify-center py-16">
            <Camera className="h-10 w-10 animate-pulse text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Featured Albums */}
            {(selectedCategory === "Tous" || selectedCategory === t('allCategories')) && featuredAlbums.length > 0 && (
              <div className="mb-12 animate-fade-in">
                <h2 className={`text-2xl font-semibold mb-6 text-center ${isRTL ? 'text-right' : ''}`}>{t('featured')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredAlbums.map((album) => (
                    <Card key={album.id} className="hover:shadow-lg transition-shadow duration-300 border-primary/20 hover-scale">
                      <div className="relative">
                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
                          {album.cover_image_url ? (
                            <img src={album.cover_image_url} alt={getTitle(album)} className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <Badge className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-primary/90`}>
                          {t('featured')}
                        </Badge>
                        <Badge variant="outline" className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-background`}>
                          {album.category}
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{getTitle(album)}</CardTitle>
                        <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                          {getDesc(album)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={`flex items-center justify-between mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {album.date && (
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Calendar className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {album.date}
                              </div>
                            )}
                            {getLocation(album) && (
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <MapPin className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {getLocation(album)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-4 mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Camera className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {album.photo_count || 0} {t('photos')}
                          </div>
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {album.views || 0} {t('views')}
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => {
                            setOpenAlbum(album);
                            setLightboxIndex(null);
                          }}
                        >
                          {isRTL ? 'عرض الألبوم' : "Voir l'album"}
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
                {selectedCategory === "Tous" || selectedCategory === t('allCategories')
                  ? (isRTL ? 'جميع الألبومات' : 'Tous les albums')
                  : `${isRTL ? 'ألبومات' : 'Albums'} - ${selectedCategory}`}
              </h2>

              {filteredAlbums.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد ألبومات' : 'Aucun album trouvé'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlbums.map((album) => (
                    <Card key={album.id} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                      <div className="relative">
                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
                          {album.cover_image_url ? (
                            <img src={album.cover_image_url} alt={getTitle(album)} className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background text-xs`}>
                          {album.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>{getTitle(album)}</h3>
                        <p className={`text-xs text-muted-foreground mb-3 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                          {getDesc(album)}
                        </p>
                        <div className="space-y-2 mb-3 text-xs text-muted-foreground">
                          {album.date && (
                            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Calendar className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {album.date}
                            </div>
                          )}
                          {getLocation(album) && (
                            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <MapPin className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              <span className="line-clamp-1">{getLocation(album)}</span>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center justify-between mb-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Camera className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {album.photo_count || 0} {t('photos')}
                          </div>
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {album.views || 0}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setOpenAlbum(album);
                            setLightboxIndex(null);
                          }}
                        >
                          {isRTL ? 'عرض الألبوم' : "Voir l'album"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Newsletter Signup */}
        <div className={`bg-muted/50 rounded-lg p-6 text-center animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{isRTL ? 'لا تفوت أي حدث' : 'Ne ratez aucun événement'}</h3>
          <p className="text-muted-foreground mb-4">
            {isRTL
              ? 'اشترك في نشرتنا الإخبارية للحصول على معلومات حول الأحداث القادمة واكتشاف الصور مسبقًا.'
              : 'Abonnez-vous à notre newsletter pour être informé de nos prochains événements et découvrir les photos en avant-première.'}
          </p>
          <div className={`flex gap-2 max-w-md mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Input placeholder={t('yourEmail')} className={`flex-1 ${isRTL ? 'text-right' : ''}`} />
            <Button>{t('subscribe')}</Button>
          </div>
        </div>
      </div>

      {/* Album dialog — grid of thumbnails; click any thumbnail to promote
          it into a full-screen lightbox with arrow-key navigation. */}
      <Dialog open={!!openAlbum} onOpenChange={(v) => !v && setOpenAlbum(null)}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle className={isRTL ? "font-almarai text-right" : ""}>
              {openAlbum ? getTitle(openAlbum) : ""}
            </DialogTitle>
            {openAlbum && (
              <p className={`text-sm text-muted-foreground ${isRTL ? "font-almarai text-right" : ""}`}>
                {openAlbum.date}
                {openAlbum.location ? ` · ${getLocation(openAlbum)}` : ""}
                {" · "}
                {openAlbum.photo_urls?.length || 0} {t("photos")}
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {openAlbum && openAlbum.photo_urls && openAlbum.photo_urls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {openAlbum.photo_urls.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative aspect-square bg-muted rounded-md overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className={isRTL ? "font-almarai" : ""}>
                  {isRTL ? "لا توجد صور في هذا الألبوم" : "Aucune photo dans cet album"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox — sits above the album dialog, previous/next + close. */}
      {openAlbum && lightboxIndex !== null && openAlbum.photo_urls?.[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2 rounded-full hover:bg-white/10"
            aria-label={isRTL ? "إغلاق" : "Fermer"}
          >
            <X className="h-6 w-6" />
          </button>
          {openAlbum.photo_urls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const total = openAlbum.photo_urls.length;
                  setLightboxIndex((i) => (i === null ? 0 : (i - 1 + total) % total));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-3 rounded-full hover:bg-white/10"
                aria-label={isRTL ? "التالي" : "Précédent"}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const total = openAlbum.photo_urls.length;
                  setLightboxIndex((i) => (i === null ? 0 : (i + 1) % total));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-3 rounded-full hover:bg-white/10"
                aria-label={isRTL ? "السابق" : "Suivant"}
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={openAlbum.photo_urls[lightboxIndex]}
            alt=""
            className="max-w-[92vw] max-h-[92vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {openAlbum.photo_urls.length}
          </div>
        </div>
      )}
    </main>
  );
};

// Fallback static data used if database is empty
const defaultAlbums: PhotoAlbum[] = [
  {
    id: "1", title: "Journée Portes Ouvertes - Accès aux Droits", title_ar: "يوم الأبواب المفتوحة - حق الوصول",
    date: "15 Mars 2024", location: "Centre-ville de Tunis", location_ar: "وسط مدينة تونس",
    photo_urls: [], photos: 45, photo_count: 45, views: 1250, category: "Événements",
    description: "Grande journée d'information sur les droits des citoyens",
    description_ar: "يوم معلومات بشأن حقوق المواطنين",
    cover_image_url: "", governorate: "Tunis", featured: true, published: true
  } as any,
  {
    id: "3", title: "Campagne sensibilisation - Droits des femmes", title_ar: "حملة توعية - حقوق المرأة",
    date: "8 Mars 2024", location: "Avenue Habib Bourguiba", location_ar: "شارع الحبيب بورقيبة",
    photo_urls: [], photo_count: 67, views: 2100, category: "Campagnes",
    description: "Campagne de sensibilisation à l'égalité des droits",
    description_ar: "حملة توعية للمساواة في الحقوق",
    cover_image_url: "", governorate: "Tunis", featured: true, published: true
  } as any,
];

export default AlbumsPhotosContent;