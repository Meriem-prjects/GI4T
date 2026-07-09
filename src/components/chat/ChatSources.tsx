import { useState } from "react";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { api } from "@/api/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { renderChatMarkdown, isArabicText } from "@/lib/markdown-chat";
import { createDocumentPath } from "@/lib/urlUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types emitted by /api/fn/acces-droits-chat. Kept next to the render
// code so the FloatingAssistant + AssistantVirtuel share one contract.
export type SourceType = "fiche" | "guide" | "news" | "resource" | "link" | "training";

export interface ChatSource {
  id: string;
  type: SourceType;
  title: string;
  titleAr: string | null;
  categoryName: string | null;
  categoryNameAr: string | null;
  similarity: number;
  href: string | null;
}

// Shape-agnostic normaliser: the backend response goes through the
// snake_case Express middleware, so titleAr arrives as title_ar. Fold
// both spellings so this helper is safe wherever the raw payload comes
// from.
export function normaliseSources(raw: unknown): ChatSource[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      id: String(o.id ?? ""),
      type: ((o.type as SourceType) || "fiche"),
      title: String(o.title ?? ""),
      titleAr: (o.title_ar ?? o.titleAr ?? null) as string | null,
      categoryName: (o.category_name ?? o.categoryName ?? null) as string | null,
      categoryNameAr: (o.category_name_ar ?? o.categoryNameAr ?? null) as string | null,
      similarity: Number(o.similarity ?? 0),
      href: (o.href ?? null) as string | null,
    };
  });
}

const TYPE_META: Record<
  SourceType,
  { icon: typeof FileText; labelFr: string; labelAr: string }
> = {
  fiche: { icon: FileText, labelFr: "Fiche observatoire", labelAr: "بطاقة المرصد" },
  guide: { icon: BookOpen, labelFr: "Guide pratique", labelAr: "دليل عملي" },
  news: { icon: Newspaper, labelFr: "Actualité", labelAr: "خبر" },
  resource: { icon: Download, labelFr: "Ressource", labelAr: "مورد" },
  link: { icon: ExternalLink, labelFr: "Lien utile", labelAr: "رابط مفيد" },
  training: { icon: Sparkles, labelFr: "Q/R officielle", labelAr: "سؤال/جواب رسمي" },
};

function scoreVisual(sim: number, isRTL: boolean): { bg: string; text: string; label: string } {
  if (sim >= 0.35)
    return {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      label: isRTL ? "مطابقة ممتازة" : "Excellente correspondance",
    };
  if (sim >= 0.25)
    return {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: isRTL ? "مطابقة جيدة" : "Bonne correspondance",
    };
  return {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: isRTL ? "مطابقة معتدلة" : "Correspondance modérée",
  };
}

interface PreviewState {
  source: ChatSource;
  loading: boolean;
  title: string;
  bodyHtml: string;
  bodyIsAr: boolean;
  externalHref: string | null;
}

interface ChatSourcesProps {
  sources: ChatSource[];
  primaryColor?: string;
  /** Extra label above the source cards. */
  label?: string;
}

/**
 * Renders the "FICHES LIÉES" strip of source cards for a chat reply and
 * owns the preview dialog that opens when a citizen clicks one. Fiches,
 * guides, actualités and Q/R fetch their body in-place; resources and
 * useful links open externally.
 */
export function ChatSources({ sources, primaryColor = "#3B82F6", label }: ChatSourcesProps) {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [preview, setPreview] = useState<PreviewState | null>(null);

  if (!sources || sources.length === 0) return null;

  const openSourcePreview = async (source: ChatSource) => {
    if (source.type === "resource" || source.type === "link") {
      if (source.href) window.open(source.href, "_blank", "noopener,noreferrer");
      return;
    }
    setPreview({
      source,
      loading: true,
      title: isRTL && source.titleAr ? source.titleAr : source.title,
      bodyHtml: "",
      bodyIsAr: false,
      externalHref: null,
    });
    try {
      let path = "";
      if (source.type === "fiche") path = `/api/documents/${source.id}`;
      else if (source.type === "guide") path = `/api/practical-guides/${source.id}`;
      else if (source.type === "news") path = `/api/news/${source.id}`;
      else if (source.type === "training") path = `/api/chatbot/training-documents/${source.id}`;
      const raw = await api.get<Record<string, unknown>>(path);
      const pick = <T,>(...keys: string[]): T | null => {
        for (const k of keys) {
          const v = raw[k];
          if (v !== undefined && v !== null && v !== "") return v as T;
        }
        return null;
      };
      const titleFr = (pick<string>("title") as string) ?? source.title;
      const titleAr = (pick<string>("title_ar", "titleAr") as string | null) ?? source.titleAr;
      const bodyFr =
        (pick<string>("translated_content", "translatedContent", "content") as string | null) ?? "";
      const bodyAr =
        (pick<string>("content_ar", "contentAr") as string | null) ??
        (isArabicText(bodyFr) ? bodyFr : "");
      const chosen = isRTL && bodyAr ? bodyAr : bodyFr || bodyAr;
      const externalHref =
        source.type === "fiche"
          ? source.categoryName
            ? createDocumentPath(source.categoryName, source.title)
            : null
          : source.href;
      setPreview({
        source,
        loading: false,
        title: isRTL && titleAr ? titleAr : titleFr,
        bodyHtml: renderChatMarkdown(chosen),
        bodyIsAr: isArabicText(chosen),
        externalHref,
      });
    } catch (err) {
      toast({
        title: isRTL ? "خطأ" : "Erreur",
        description: isRTL ? "تعذّر تحميل المحتوى." : "Impossible de charger le contenu.",
        variant: "destructive",
      });
      setPreview(null);
      void err;
    }
  };

  return (
    <>
      <div className={`mt-3 space-y-2 ${isRTL ? "text-right" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
        {label && (
          <div className={`text-[11px] uppercase tracking-wide text-muted-foreground font-semibold ${isRTL ? "font-almarai" : ""}`}>
            {label}
          </div>
        )}
        {sources.map((src) => {
          const title = isRTL && src.titleAr ? src.titleAr : src.title;
          const category = isRTL && src.categoryNameAr ? src.categoryNameAr : src.categoryName;
          const percent = Math.round(src.similarity * 100);
          const visual = scoreVisual(src.similarity, isRTL);
          const meta = TYPE_META[src.type] ?? TYPE_META.fiche;
          const Icon = meta.icon;
          const typeLabel = isRTL ? meta.labelAr : meta.labelFr;
          return (
            <button
              type="button"
              key={`${src.type}-${src.id}`}
              onClick={() => openSourcePreview(src)}
              className={`group w-full text-start flex items-start gap-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:shadow-sm transition-all p-2 ${
                isRTL ? "flex-row-reverse text-right" : ""
              }`}
              title={visual.label}
            >
              <div
                className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Icon className="h-4 w-4" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary ${isRTL ? "font-almarai" : ""}`}>
                  {title}
                </div>
                <div className={`flex items-center gap-1.5 mt-1 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className={`text-[10px] text-muted-foreground/80 ${isRTL ? "font-almarai" : ""}`}>
                    {typeLabel}
                  </span>
                  {category && (
                    <span className={`text-[10px] text-muted-foreground truncate ${isRTL ? "font-almarai" : ""}`}>
                      · {category}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${visual.bg} ${visual.text}`}>
                    {percent}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
              {preview &&
                (() => {
                  const meta = TYPE_META[preview.source.type] ?? TYPE_META.fiche;
                  const Icon = meta.icon;
                  return (
                    <>
                      <Icon className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                      <span className={isRTL ? "font-almarai" : ""}>
                        {isRTL ? meta.labelAr : meta.labelFr}
                      </span>
                      {preview.source.categoryName && (
                        <>
                          <span>·</span>
                          <span className={isRTL ? "font-almarai" : ""}>
                            {isRTL && preview.source.categoryNameAr
                              ? preview.source.categoryNameAr
                              : preview.source.categoryName}
                          </span>
                        </>
                      )}
                    </>
                  );
                })()}
            </div>
            <DialogTitle
              className={`text-lg leading-snug ${
                preview && isArabicText(preview.title) ? "font-almarai text-right" : ""
              }`}
              dir={preview && isArabicText(preview.title) ? "rtl" : "ltr"}
            >
              {preview?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {preview?.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
              </div>
            ) : preview?.bodyHtml ? (
              <div
                className={`chat-md text-sm leading-relaxed ${
                  preview.bodyIsAr ? "font-almarai text-right" : "text-left"
                }`}
                dir={preview.bodyIsAr ? "rtl" : "ltr"}
                dangerouslySetInnerHTML={{ __html: preview.bodyHtml }}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {isRTL ? "لا يوجد محتوى للعرض." : "Aucun contenu à afficher."}
              </p>
            )}
          </div>

          {preview?.externalHref && !preview.loading && (
            <div className={`pt-3 border-t flex ${isRTL ? "justify-start" : "justify-end"}`}>
              <a
                href={preview.externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                {isRTL ? "افتح الصفحة الكاملة" : "Voir la page complète"}
                <ExternalLink className={`h-3 w-3 ${isRTL ? "rotate-180" : ""}`} />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
