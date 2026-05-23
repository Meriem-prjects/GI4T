import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, Eye, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface NewsRow {
  id: string;
  title: string;
  title_ar?: string;
  excerpt: string;
  excerpt_ar?: string;
  category?: string;
  image_url?: string;
  read_time?: number;
  views?: number;
  is_featured?: boolean;
  published_at?: string;
  created_at?: string;
}

const ActualitesAccesDroits = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Input placeholder={t('searchDot')} className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`} />
          </div>
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : news.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            {isRTL ? "لا توجد أخبار حالياً" : "Aucune actualité publiée pour le moment."}
          </Card>
        ) : (
        <div className="space-y-6 animate-fade-in">
          {news.map((item) => {
            const title = isRTL && item.title_ar ? item.title_ar : item.title;
            const excerpt = isRTL && item.excerpt_ar ? item.excerpt_ar : item.excerpt;
            const dateStr = item.published_at ?? item.created_at;
            return (
            <Card key={item.id} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className={`flex flex-col lg:flex-row gap-4 ${isRTL ? 'text-right' : ''}`}>
                  <div className="flex-1">
                    {item.is_featured && <Badge className="mb-2">{t('featured')}</Badge>}
                    {item.category && (
                      <Badge variant="outline" className="mb-2">
                        {item.category}
                      </Badge>
                    )}
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-4">{excerpt}</p>
                    <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {dateStr && (
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR')}
                        </div>
                      )}
                      {item.read_time && (
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {item.read_time} min
                        </div>
                      )}
                      {item.views != null && (
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Eye className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {item.views}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'justify-start' : ''}`}>
                    <Button>
                      {t('readMore')}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        )}

        {/* Load More */}
        <div className="flex justify-center mt-8 animate-fade-in">
          <Button variant="outline">
            {isRTL ? 'عرض المزيد من الأخبار' : "Voir plus d'actualités"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ActualitesAccesDroits;
