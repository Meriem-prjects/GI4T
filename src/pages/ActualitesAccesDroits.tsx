import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Calendar, Clock, ArrowRight, ChevronRight, Loader2, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { renderFormattedContent } from "@/utils/contentFormatter";

interface NewsRow {
  id: string;
  title: string;
  title_ar?: string;
  excerpt: string;
  excerpt_ar?: string;
  content?: string | null;
  content_ar?: string | null;
  category?: string;
  tags?: string[];
  tags_ar?: string[];
  image_url?: string;
  read_time?: number;
  views?: number;
  is_featured?: boolean;
  published_at?: string;
  created_at?: string;
}

// news.category is a single French value; Arabic labels for the ones used
// in this section (unknown values are shown as-is).
const CATEGORY_AR: Record<string, string> = {
  "Campagne terrain": "حملة ميدانية",
  "Bilan de campagne": "حصيلة الحملة",
  "Événement": "حدث",
};

const ActualitesAccesDroits = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openItem, setOpenItem] = useState<NewsRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("section", "acces_droits")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (cancelled) return;
      if (error) console.error("Failed to load acces_droits news:", error);
      setNews((data as NewsRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTitle = (item: NewsRow) => (isRTL && item.title_ar ? item.title_ar : item.title);
  const getExcerpt = (item: NewsRow) => (isRTL && item.excerpt_ar ? item.excerpt_ar : item.excerpt);
  const getContent = (item: NewsRow) => (isRTL ? item.content_ar || item.content : item.content) || "";
  const getTags = (item: NewsRow) => (isRTL && item.tags_ar?.length ? item.tags_ar : item.tags) ?? [];
  const getCategory = (category: string) => (isRTL && CATEGORY_AR[category]) || category;
  const formatDate = (item: NewsRow) => {
    const dateStr = item.published_at ?? item.created_at;
    return dateStr
      ? new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;
  };

  const filteredNews = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return news;
    return news.filter((item) =>
      [item.title, item.title_ar, item.excerpt, item.excerpt_ar, ...(item.tags ?? []), ...(item.tags_ar ?? [])]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q)),
    );
  }, [news, searchTerm]);

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
            <span className="text-foreground">{t('actualites')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('actualites')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'تابع آخر الأخبار والفعاليات المتعلقة بالوصول إلى الحقوق.'
              : "Suivez les dernières nouvelles et événements liés à l'accès aux droits."}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('searchDot')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNews.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            {news.length === 0
              ? isRTL ? "لا توجد أخبار حالياً" : "Aucune actualité publiée pour le moment."
              : isRTL ? "لا توجد نتائج" : "Aucun résultat trouvé"}
          </Card>
        ) : (
        <div className="space-y-6 animate-fade-in">
          {filteredNews.map((item) => {
            const dateLabel = formatDate(item);
            return (
            <Card key={item.id} className="hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className={`flex flex-col sm:flex-row ${isRTL ? 'sm:flex-row-reverse text-right' : ''}`}>
                  {item.image_url && (
                    <button
                      type="button"
                      onClick={() => setOpenItem(item)}
                      className="sm:w-48 lg:w-56 flex-shrink-0 bg-muted"
                    >
                      <img
                        src={item.image_url}
                        alt={getTitle(item)}
                        loading="lazy"
                        className="w-full h-48 sm:h-full object-cover"
                      />
                    </button>
                  )}
                  <div className="flex-1 p-6 flex flex-col">
                    <div className={`flex flex-wrap gap-2 mb-2 ${isRTL ? 'justify-end' : ''}`}>
                      {item.is_featured && <Badge>{t('featured')}</Badge>}
                      {item.category && <Badge variant="outline">{getCategory(item.category)}</Badge>}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{getTitle(item)}</h3>
                    <p className="text-muted-foreground mb-4">{getExcerpt(item)}</p>
                    <div className={`mt-auto flex flex-wrap items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {dateLabel && (
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {dateLabel}
                          </div>
                        )}
                        {item.read_time && (
                          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Clock className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {item.read_time} min
                          </div>
                        )}
                      </div>
                      <Button onClick={() => setOpenItem(item)}>
                        {t('readMore')}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        )}
      </div>

      {/* Full article */}
      <Dialog open={!!openItem} onOpenChange={(v) => !v && setOpenItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          {openItem && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl leading-tight ${isRTL ? 'font-almarai text-right pl-6' : 'pr-6'}`}>
                  {getTitle(openItem)}
                </DialogTitle>
                {formatDate(openItem) && (
                  <p className={`flex items-center gap-1 text-sm text-muted-foreground ${isRTL ? 'font-almarai' : ''}`}>
                    <Calendar className="h-4 w-4" />
                    {formatDate(openItem)}
                  </p>
                )}
              </DialogHeader>
              {openItem.image_url && (
                <img
                  src={openItem.image_url}
                  alt={getTitle(openItem)}
                  className="w-full max-h-[420px] object-contain rounded-lg bg-muted"
                />
              )}
              <div
                className={`prose max-w-none ${isRTL ? 'prose-rtl text-right font-almarai' : ''}`}
                dangerouslySetInnerHTML={{
                  __html: renderFormattedContent(getContent(openItem) || getExcerpt(openItem)),
                }}
              />
              {getTags(openItem).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getTags(openItem).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ActualitesAccesDroits;
