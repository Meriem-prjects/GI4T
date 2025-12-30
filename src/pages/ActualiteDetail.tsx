import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Tag, ArrowLeft, Share2, Copy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useNewsById, usePublishedNews } from "@/hooks/useNews";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { toast } from "sonner";
import { renderFormattedContent } from "@/utils/contentFormatter";

const ActualiteDetail = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();

  const { data: news, isLoading, error } = useNewsById(newsId);
  const { data: relatedNews } = usePublishedNews(news?.category);

  const categoryLabels: Record<string, { fr: string; ar: string }> = {
    jurisprudence: { fr: 'Jurisprudence', ar: 'فقه قضائي' },
    acces_droits: { fr: 'Accès au droit', ar: 'الوصول للقانون' },
    odf: { fr: 'ODF', ar: 'مرصد الحقوق' },
    event: { fr: 'Événements', ar: 'فعاليات' },
    publication: { fr: 'Publications', ar: 'منشورات' }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'd MMMM yyyy', {
        locale: language === 'ar' ? ar : fr
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryLabel = (categoryKey: string) => {
    const label = categoryLabels[categoryKey];
    if (label) {
      return language === 'ar' ? label.ar : label.fr;
    }
    return categoryKey;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(language === 'ar' ? 'تم نسخ الرابط' : 'Lien copié !');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'ar' ? (news?.title_ar || news?.title) : news?.title,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  // Filter related articles (same category, different ID)
  const filteredRelatedNews = relatedNews?.filter(n => n.id !== newsId).slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Skeleton className="h-6 w-64 mb-6" />
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            {language === 'ar' ? 'لم يتم العثور على هذا المقال' : 'Article non trouvé'}
          </p>
          <Button asChild>
            <Link to="/observatoire/actualites">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة إلى الأخبار' : 'Retour aux actualités'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = language === 'ar' ? (news.title_ar || news.title) : news.title;
  const content = language === 'ar' ? (news.content_ar || news.content) : news.content;
  const tags = language === 'ar' ? (news.tags_ar || news.tags) : news.tags;

  return (
    <div className={`container mx-auto px-4 py-6 ${isRTL ? 'font-almarai' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <div className="mb-6 w-full flex justify-start">
        <Breadcrumb>
          <BreadcrumbList className={isRTL ? 'flex-row-reverse' : ''}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/observatoire">{t('observatory')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/observatoire/actualites">{t('actualitesTitle')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto">
        <header className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          {/* Category & Featured Badges */}
          <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Badge className="bg-primary text-primary-foreground">
              {getCategoryLabel(news.category)}
            </Badge>
            {news.is_featured && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {language === 'ar' ? 'مميز' : 'À la une'}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {title}
          </h1>

          {/* Meta Info */}
          <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className="w-4 h-4" />
              {formatDate(news.published_at)}
            </div>
            {news.read_time && (
              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Clock className="w-4 h-4" />
                {news.read_time} {t('min')} {language === 'ar' ? 'للقراءة' : 'de lecture'}
              </div>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {news.image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={news.image_url} 
              alt={title}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className={`prose prose-lg max-w-none mb-8 ${isRTL ? 'prose-rtl text-right' : ''}`}
          dangerouslySetInnerHTML={{ __html: content ? renderFormattedContent(content) : '' }}
        />

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                <Tag className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Share & Back Buttons */}
        <div className={`flex items-center justify-between border-t pt-6 mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button variant="outline" asChild>
            <Link to="/observatoire/actualites">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة إلى الأخبار' : 'Retour aux actualités'}
            </Link>
          </Button>
          
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'مشاركة' : 'Partager'}
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        {filteredRelatedNews.length > 0 && (
          <section>
            <h2 className={`text-2xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'مقالات ذات صلة' : 'Articles connexes'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRelatedNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className={`pb-2 ${isRTL ? 'text-right' : ''}`}>
                    <Badge variant="outline" className="w-fit mb-2">
                      {getCategoryLabel(article.category)}
                    </Badge>
                    <CardTitle className="text-base leading-tight">
                      {language === 'ar' ? (article.title_ar || article.title) : article.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(article.published_at)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="sm" asChild>
                      <Link to={`/observatoire/actualites/${article.id}`}>
                        {t('readMore')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default ActualiteDetail;
