import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface NewsRow {
  id: string;
  title: string;
  title_ar?: string | null;
  excerpt: string;
  excerpt_ar?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  created_at?: string;
}

// Latest Accès-aux-droits news on the home page. Renders nothing until
// the back-office has published some.
const ActualitesHomeSection = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const [articles, setArticles] = useState<NewsRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("section", "acces_droits")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (cancelled) return;
      if (error) console.error("Failed to load home news:", error);
      setArticles((data as NewsRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (articles.length === 0) return null;

  const formatDate = (article: NewsRow) => {
    const dateStr = article.published_at ?? article.created_at;
    return dateStr
      ? new Date(dateStr).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";
  };

  return (
    <section className={`py-16 bg-background ${isRTL ? 'rtl' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          {!isRTL ? (
            <>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                {t('newsSection')}
              </h2>
              <img src="/justclic-logo.png" alt="JustClic" className="h-12 sm:h-14 w-auto object-contain" />
            </>
          ) : (
            <>
              <img src="/justclic-logo.png" alt="JustClic" className="h-12 sm:h-14 w-auto object-contain" />
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground font-almarai">
                {t('newsSection')}
              </h2>
            </>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
          {articles.map((article) => {
            const title = isRTL && article.title_ar ? article.title_ar : article.title;
            const excerpt = isRTL && article.excerpt_ar ? article.excerpt_ar : article.excerpt;
            return (
            <Link
              key={article.id}
              to="/acces-aux-droits/actualites"
              className="group"
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                {/* Badge */}
                <div className={`p-4 pb-0 ${isRTL ? 'text-right' : ''}`}>
                  <Badge
                    className={`bg-[#F4D03F] text-gray-900 font-semibold px-4 py-1 rounded-full ${isRTL ? 'font-almarai' : ''}`}
                  >
                    {t('awarenessCampaign')}
                  </Badge>
                </div>

                {/* Image */}
                {article.image_url && (
                  <div className="overflow-hidden px-4 pt-4">
                    <img
                      src={article.image_url}
                      alt={title}
                      loading="lazy"
                      className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className={`p-6 ${isRTL ? 'text-right' : ''}`}>
                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors ${isRTL ? 'font-almarai' : ''}`}>
                    {title}
                  </h3>

                  {/* Meta */}
                  <p className={`text-sm text-muted-foreground mb-3 ${isRTL ? 'font-almarai' : ''}`}>
                    {formatDate(article)}
                  </p>

                  {/* Excerpt */}
                  <p className={`text-muted-foreground mb-4 line-clamp-3 ${isRTL ? 'font-almarai' : ''}`}>
                    {excerpt}
                  </p>

                  {/* Read More Link */}
                  <span className={`text-primary font-semibold hover:underline ${isRTL ? 'font-almarai' : ''}`}>
                    {t('readMore')}
                  </span>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ActualitesHomeSection;
