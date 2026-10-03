import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Video, Headphones, Mic, Eye, Heart, ChevronRight, Film, Users, BookOpen, MessageSquare, MapPin, Clapperboard, Gavel, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayerDialog } from "@/components/media/VideoPlayerDialog";
import { useGovernorates } from "@/hooks/useGovernorates";
import { getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

/** YouTube links and direct video files play in the page's dialog; other
 * hosts (Vimeo, Facebook…) open in a new tab. */
const playsInDialog = (url: string) =>
  !!getYouTubeId(url) || url.includes("/api/storage/") || /\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(url);

interface MediaItem {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  type: string;
  category: string;
  category_id: string;
  governorate: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  views: number;
  likes: number;
  featured: boolean;
  published: boolean;
}

// Category metadata — `category` in the DB is French-only, so the labels
// shown to visitors come from here (DB value as fallback for unknown ids).
const CATEGORY_META: Record<string, { icon: LucideIcon; color: string; bgColor: string; labelFr: string; labelAr: string }> = {
  testimonials: { icon: Users, color: "bg-rose-600", bgColor: "bg-rose-50", labelFr: "Témoignages", labelAr: "شهادات" },
  tutorials: { icon: BookOpen, color: "bg-blue-600", bgColor: "bg-blue-50", labelFr: "Tutoriels", labelAr: "دروس تعليمية" },
  podcasts: { icon: Headphones, color: "bg-purple-600", bgColor: "bg-purple-50", labelFr: "Podcasts", labelAr: "بودكاست" },
  trainings: { icon: Video, color: "bg-emerald-600", bgColor: "bg-emerald-50", labelFr: "Formations", labelAr: "تكوين" },
  documentaries: { icon: Film, color: "bg-amber-600", bgColor: "bg-amber-50", labelFr: "Documentaires", labelAr: "أفلام وثائقية" },
  interviews: { icon: MessageSquare, color: "bg-cyan-600", bgColor: "bg-cyan-50", labelFr: "Interviews", labelAr: "حوارات" },
  campaigns: { icon: MapPin, color: "bg-orange-600", bgColor: "bg-orange-50", labelFr: "Campagnes terrain", labelAr: "حملات ميدانية" },
  fiction: { icon: Clapperboard, color: "bg-indigo-600", bgColor: "bg-indigo-50", labelFr: "Série fiction", labelAr: "سلسلة درامية" },
  taktouk: { icon: Gavel, color: "bg-amber-500", bgColor: "bg-amber-50", labelFr: "Capsules Taktouk", labelAr: "كبسولات طقطوق" },
};
const DEFAULT_META = { icon: Play, color: "bg-slate-600", bgColor: "bg-slate-50", labelFr: "", labelAr: "" };

// DB values of media_items.type
const MEDIA_TYPES = ["Vidéo", "Audio", "Webinaire"] as const;

const getTypeIcon = (type: string) => {
  if (type === "Audio") return Headphones;
  if (type === "Webinaire") return Mic;
  return Video;
};

const MediathequeContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  // "all" or one of MEDIA_TYPES — compared against the DB value, never
  // against a translated label (that broke the filter in Arabic).
  const [selectedType, setSelectedType] = useState("all");
  const [mediaContent, setMediaContent] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<MediaItem | null>(null);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const { governorates = [] } = useGovernorates();

  // media_items.governorate is the French name; show the Arabic one in RTL.
  const getGovernorateLabel = (name: string) =>
    (isRTL && governorates.find((g) => g.name === name)?.name_ar) || name;

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("media_items")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) console.error("Failed to load media_items:", error);
      setMediaContent(data ?? []);
    } catch (err) {
      console.error("Failed to load media_items:", err);
      setMediaContent([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const typeLabels: Record<string, string> = { "Vidéo": t('video'), "Audio": t('audio'), "Webinaire": t('webinar') };
  const types = [{ id: "all", label: t('allCategories') }, ...MEDIA_TYPES.map((id) => ({ id, label: typeLabels[id] }))];
  const getTypeLabel = (type: string) => typeLabels[type] || type;

  const getCategoryLabel = (item: MediaItem) => {
    const meta = CATEGORY_META[item.category_id];
    if (!meta) return item.category;
    return isRTL ? meta.labelAr : meta.labelFr;
  };

  const watch = (item: MediaItem) => {
    if (!item.video_url) return;
    if (playsInDialog(item.video_url)) setPlaying(item);
    else window.open(item.video_url, '_blank', 'noopener');
  };

  // Uploaded thumbnail first, else the one YouTube generates.
  const getThumbnail = (item: MediaItem) => {
    if (item.thumbnail_url) return item.thumbnail_url;
    const id = item.video_url ? getYouTubeId(item.video_url) : null;
    return id ? getYouTubeThumbnail(id) : "";
  };

  // Build dynamic category cards from content
  const categoryCounts: Record<string, number> = {};
  for (const item of mediaContent) {
    const key = item.category_id || "all";
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  }

  const categoryCards = [
    { id: "all", name: t('allCategories'), icon: Film, color: "bg-slate-600", bgColor: "bg-slate-50", count: mediaContent.length },
    ...Object.entries(categoryCounts).map(([id, count]) => {
      const meta = CATEGORY_META[id] || DEFAULT_META;
      const item = mediaContent.find(m => m.category_id === id);
      return { id, name: item ? getCategoryLabel(item) : id, icon: meta.icon, color: meta.color, bgColor: meta.bgColor, count };
    }),
  ];

  const filteredContent = mediaContent.filter(item => {
    const titleToSearch = isRTL ? (item.title_ar || item.title) : item.title;
    const descToSearch = isRTL ? (item.description_ar || item.description) : item.description;
    const matchesSearch =
      (titleToSearch || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (descToSearch || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredContent = mediaContent.filter(item => item.featured);

  const getTitle = (item: MediaItem) => isRTL ? (item.title_ar || item.title) : item.title;
  const getDesc = (item: MediaItem) => isRTL ? (item.description_ar || item.description) : item.description;

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

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className={`text-center mb-6 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('mediaLibraryTitle')}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">{t('mediaLibraryDesc')}</p>
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
              const isSelected = selectedCategory === cat.id;
              return (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${isSelected ? 'ring-2 ring-primary shadow-md' : ''} ${cat.bgColor}`}
                  onClick={() => setSelectedCategory(cat.id)}
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
            <Button key={type.id} variant={selectedType === type.id ? "default" : "outline"} size="sm"
              onClick={() => setSelectedType(type.id)} className="transition-all duration-200">
              {type.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Film className="h-10 w-10 animate-pulse text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Featured Content */}
            {selectedCategory === "all" && selectedType === "all" && !searchTerm && featuredContent.length > 0 && (
              <div className="mb-10 animate-fade-in">
                <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>{t('featured')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {featuredContent.map((item) => {
                    const Icon = getTypeIcon(item.type);
                    const meta = CATEGORY_META[item.category_id] || DEFAULT_META;
                    return (
                      <Card key={item.id} className={`hover:shadow-lg transition-all duration-300 border border-border/50 ${meta.bgColor}`}>
                        <div className="relative">
                          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
                            {getThumbnail(item) ? (
                              <img src={getThumbnail(item)} alt={getTitle(item)} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-16 h-16 ${meta.color} rounded-full flex items-center justify-center shadow-lg`}>
                                <Icon className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          <Badge className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} ${meta.color} text-white`}>{t('featured')}</Badge>
                          <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background`}>{getTypeLabel(item.type)}</Badge>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{getTitle(item)}</CardTitle>
                          <CardDescription className={`text-sm ${isRTL ? 'text-right' : ''}`}>{getDesc(item)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className={`flex items-center justify-between mb-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {item.duration && <span>{item.duration}</span>}
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}><Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{item.views?.toLocaleString() || 0}</div>
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}><Heart className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{item.likes || 0}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">{getCategoryLabel(item)}</Badge>
                          </div>
                          <Button
                            className={`w-full ${meta.color} text-white hover:opacity-90`}
                            size="sm"
                            onClick={() => watch(item)}
                          >
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
                {selectedType !== "all"
                  ? getTypeLabel(selectedType)
                  : selectedCategory === "all"
                    ? t('allResources')
                    : categoryCards.find((c) => c.id === selectedCategory)?.name}
              </h2>
              {filteredContent.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Film className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isRTL ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredContent.map((item) => {
                    const Icon = getTypeIcon(item.type);
                    const meta = CATEGORY_META[item.category_id] || DEFAULT_META;
                    return (
                      <Card key={item.id} className={`hover:shadow-lg transition-all duration-300 border border-border/50 ${meta.bgColor}`}>
                        <div className="relative">
                          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
                            {getThumbnail(item) ? (
                              <img src={getThumbnail(item)} alt={getTitle(item)} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-12 h-12 ${meta.color} rounded-full flex items-center justify-center shadow-md`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-background text-xs`}>{getTypeLabel(item.type)}</Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>{getTitle(item)}</h3>
                          <p className={`text-xs text-muted-foreground mb-3 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>{getDesc(item)}</p>
                          {item.governorate && <p className={`text-xs text-muted-foreground mb-2 ${isRTL ? 'text-right' : ''}`}>📍 {getGovernorateLabel(item.governorate)}</p>}
                          <div className={`flex items-center justify-between mb-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {item.duration && <span>{item.duration}</span>}
                            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}><Eye className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{item.views > 1000 ? `${Math.floor(item.views / 1000)}k` : item.views || 0}</div>
                              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}><Heart className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{item.likes || 0}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={`w-full text-xs ${meta.color} text-white hover:opacity-90`}
                            onClick={() => watch(item)}
                          >
                            <Play className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {t('watch')}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className={`bg-muted/50 rounded-lg p-6 text-center animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{t('shareStory')}</h3>
          <p className="text-muted-foreground mb-4">{t('shareStoryDesc')}</p>
          <Button>{isRTL ? 'اقترح شهادة' : 'Proposer un témoignage'}</Button>
        </div>
      </div>

      <VideoPlayerDialog item={playing} open={!!playing} onOpenChange={() => setPlaying(null)} />
    </main>
  );
};

export default MediathequeContent;
