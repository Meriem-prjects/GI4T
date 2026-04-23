import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  FileText,
  MessageSquare,
  PenSquare,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpenText,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAllAnalysesOpinions, useDocumentTypesCounts } from "@/hooks/useDocumentsByType";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeArabicForDisplay } from "@/lib/arabicUtils";

const AnalysesOpinions = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const [recentOffset, setRecentOffset] = useState(0);
  const RECENT_PAGE_SIZE = 3;

  const { data: documents, isLoading: documentsLoading } = useAllAnalysesOpinions();
  const { data: typeCounts, isLoading: countsLoading } = useDocumentTypesCounts();

  const getTypeCount = (typeName: string) => {
    const typeData = typeCounts?.find((tc) => tc.name === typeName);
    return typeData?.count || 0;
  };

  const categories = [
    {
      name: "analyses-juridiques",
      label: isRTL ? "التحاليل القانونية" : "Analyses juridiques",
      count: getTypeCount("Analyses juridiques"),
      description: isRTL
        ? "دراسات مفصّلة لتطوّر الفقه القضائي والأطر التنظيمية التونسية."
        : "Études détaillées sur l'évolution de la jurisprudence et des cadres réglementaires tunisiens.",
      icon: FileText,
      color: "#2563EB",
      tint: "bg-blue-50",
      badgeBg: "bg-blue-600",
      link: "/observatoire/analyses-juridiques",
    },
    {
      name: "commentaires",
      label: isRTL ? "التعليقات" : "Commentaires",
      count: getTypeCount("Commentaires"),
      description: isRTL
        ? "آراء مستنيرة وتعليقات على أهم القرارات من قبل أساتذة وممارسين."
        : "Opinions éclairées et commentaires d'arrêts majeurs par des universitaires et praticiens.",
      icon: MessageSquare,
      color: "#F59E0B",
      tint: "bg-amber-50",
      badgeBg: "bg-amber-500",
      link: "/observatoire/commentaires",
    },
    {
      name: "blogs",
      label: isRTL ? "المدوّنات" : "Blogs",
      count: getTypeCount("Blogs"),
      description: isRTL
        ? "تأمّلات حول الراهن، مقالات رأي وملاحظات على الحياة المؤسّسية في البلاد."
        : "Réflexions d'actualité, billets d'humeur et observations sur la vie institutionnelle du pays.",
      icon: PenSquare,
      color: "#DC2626",
      tint: "bg-red-50",
      badgeBg: "bg-red-600",
      link: "/observatoire/blogs",
    },
  ];

  const allRecent = documents ?? [];
  const visibleRecent = allRecent.slice(recentOffset, recentOffset + RECENT_PAGE_SIZE);
  const canScrollPrev = recentOffset > 0;
  const canScrollNext = recentOffset + RECENT_PAGE_SIZE < allRecent.length;

  const typeBadgeColor = (typeName?: string) => {
    if (!typeName) return { bg: "bg-gray-100", text: "text-gray-700" };
    const n = typeName.toLowerCase();
    if (n.includes("analyse")) return { bg: "bg-blue-100", text: "text-blue-700" };
    if (n.includes("commentaire")) return { bg: "bg-amber-100", text: "text-amber-800" };
    if (n.includes("blog")) return { bg: "bg-red-100", text: "text-red-700" };
    return { bg: "bg-gray-100", text: "text-gray-700" };
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${isRTL ? "font-almarai" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb — kept untouched */}
      <nav className="mb-6 w-full" aria-label="Breadcrumb" dir={isRTL ? "rtl" : "ltr"}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t("home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{isRTL ? "›" : "›"}</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/observatoire">{t("observatory")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{isRTL ? "›" : "›"}</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t("analysesOpinions")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Title + description — aligned to start, not centered */}
      <header className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
        <h1 className={`text-xl md:text-2xl font-bold mb-2 ${isRTL ? "arabic-text font-arabic" : ""}`}>
          {t("analysesOpinions")}
        </h1>
        <p className={`text-sm md:text-base text-muted-foreground max-w-3xl ${isRTL ? "arabic-text font-arabic" : ""}`}>
          {isRTL
            ? "تصفّحوا تحاليل معمّقة وتوصيات خبراء حول الرهانات القانونية في تونس. فضاء مخصّص للتأمّل الفقهي وتأويل القانون المعاصر."
            : "Accédez à des analyses approfondies et des recommandations d'experts sur les enjeux juridiques en Tunisie. Un espace dédié à la réflexion doctrinale et à l'interprétation du droit contemporain."}
        </p>
      </header>

      {/* 3 category cards in a soft blue panel */}
      <section className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-12 border border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {countsLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-white rounded-xl">
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : categories.map((c) => {
                const Icon = c.icon;
                return (
                  <Card
                    key={c.name}
                    className="bg-white rounded-xl border border-border/60 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className={`flex items-start justify-between mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${c.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: c.color }} />
                        </div>
                        <Badge
                          className={`${c.badgeBg} text-white font-semibold rounded-full px-3`}
                        >
                          {c.count} {isRTL ? "" : c.name === "analyses-juridiques" ? "Articles" : c.name === "commentaires" ? "Analyses" : "Billets"}
                        </Badge>
                      </div>

                      <h3
                        className={`text-lg font-bold mb-2 ${isRTL ? "text-right arabic-text font-arabic" : ""}`}
                      >
                        {c.label}
                      </h3>
                      <p
                        className={`text-sm text-muted-foreground mb-5 leading-relaxed ${isRTL ? "text-right arabic-text font-arabic" : ""}`}
                      >
                        {c.description}
                      </p>

                      <Button
                        asChild
                        variant="outline"
                        className={`w-full border-2 font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
                        style={{ borderColor: c.color, color: c.color }}
                      >
                        <Link to={c.link} className="inline-flex items-center gap-1.5">
                          <span>{isRTL ? "استشارة" : "Consulter"}</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </section>

      {/* Publications récentes */}
      <section className="mb-10">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <h2 className={`text-lg md:text-xl font-bold border-b-2 border-blue-600 pb-1 ${isRTL ? "arabic-text font-arabic" : ""}`}>
            {isRTL ? "أحدث المنشورات" : "Publications Récentes"}
          </h2>
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9"
              disabled={!canScrollPrev}
              onClick={() => setRecentOffset((o) => Math.max(0, o - RECENT_PAGE_SIZE))}
              aria-label="Previous"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9"
              disabled={!canScrollNext}
              onClick={() =>
                setRecentOffset((o) => Math.min(allRecent.length - RECENT_PAGE_SIZE, o + RECENT_PAGE_SIZE))
              }
              aria-label="Next"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {documentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex gap-4">
                  <Skeleton className="w-28 h-28 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : visibleRecent.length > 0 ? (
          <div className="space-y-4">
            {visibleRecent.map((article) => {
              const title = language === "ar" && article.title_ar ? article.title_ar : article.title;
              const summary = language === "ar" && article.summary_ar ? article.summary_ar : article.summary;
              const author = language === "ar" && article.author_ar ? article.author_ar : article.author;
              const keywords = language === "ar" && article.keywords_ar ? article.keywords_ar : article.keywords;
              const typeName =
                language === "ar" && article.document_types?.name_ar
                  ? article.document_types.name_ar
                  : article.document_types?.name;
              const badge = typeBadgeColor(article.document_types?.name);

              return (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 md:p-6">
                    <div className={`flex flex-col sm:flex-row gap-5 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                      {/* Thumbnail */}
                      <div className="w-full sm:w-36 h-36 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                        <BookOpenText className="w-10 h-10 text-slate-400" />
                      </div>

                      <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}>
                        {/* Meta row: badge + date + author */}
                        <div className={`flex flex-wrap items-center gap-2 gap-y-1 mb-2 text-xs text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
                          {typeName && (
                            <Badge className={`${badge.bg} ${badge.text} border-0 rounded-md px-2 py-0.5 font-medium`}>
                              {typeName}
                            </Badge>
                          )}
                          <span className={`inline-flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(article.created_at), "dd MMM yyyy", { locale: isRTL ? ar : fr })}
                          </span>
                          {author && (
                            <span className={`inline-flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <User className="w-3.5 h-3.5" />
                              {author.split(",")[0].trim()}
                            </span>
                          )}
                        </div>

                        <h3 className={`font-bold text-base md:text-lg leading-snug mb-2 ${isRTL ? "arabic-text font-arabic" : ""}`}>
                          {title}
                        </h3>

                        {summary && (
                          <div
                            className={`text-sm text-muted-foreground line-clamp-2 mb-3 ${isRTL ? "arabic-text font-arabic" : ""}`}
                            dir={isRTL ? "rtl" : "ltr"}
                            dangerouslySetInnerHTML={{
                              __html: isRTL
                                ? normalizeArabicForDisplay(summary.replace(/<\/?p>/gi, "").trim())
                                : summary.replace(/<\/?p>/gi, "").trim(),
                            }}
                          />
                        )}

                        <div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          {keywords && keywords.length > 0 && (
                            <div className={`flex flex-wrap gap-1.5 flex-1 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                              {keywords.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className={`text-[11px] font-normal bg-blue-50 text-blue-700 border-0 ${isRTL ? "arabic-text font-arabic" : ""}`}
                                >
                                  {isRTL ? normalizeArabicForDisplay(tag) : tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
                            <Link to={`/observatoire/document/${article.id}`} className="inline-flex items-center gap-1.5">
                              <span>{isRTL ? "قراءة المقال" : "Lire l'article"}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className={`py-8 ${isRTL ? "text-right" : "text-center"}`}>
              <p className="text-muted-foreground">{t("noResults")}</p>
            </CardContent>
          </Card>
        )}

        {/* See all button */}
        {allRecent.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" asChild className="font-semibold border-blue-600 text-blue-600 hover:bg-blue-50">
              <Link to="/observatoire/search-results">
                {isRTL ? "عرض كل المنشورات" : "Voir toutes les publications"}
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalysesOpinions;
