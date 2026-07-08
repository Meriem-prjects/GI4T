import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Loader2,
  X,
  Sparkles,
  FileText,
  BookOpen,
  Newspaper,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbotConfig } from "@/hooks/useChatbotConfig";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { renderChatMarkdown, isArabicText } from "@/lib/markdown-chat";
import { createDocumentPath } from "@/lib/urlUtils";
import { api } from "@/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// A compact, floating chat popup shown at the bottom-right of every public
// page. It shares the same backend function (`acces-droits-chat`) as the
// full page at /acces-aux-droits/assistant-virtuel — so a citizen can ask a
// quick question without navigating away. Hidden on the full-page route to
// avoid a duplicate, and on all admin routes to keep the back-office clean.

type SourceType = "fiche" | "guide" | "news" | "resource" | "link" | "training";

interface Source {
  id: string;
  type: SourceType;
  title: string;
  titleAr: string | null;
  categoryName: string | null;
  categoryNameAr: string | null;
  similarity: number;
  href: string | null;
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

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

// Colour + label for a similarity score. Thresholds match the raw cosine
// range we actually see on this bilingual corpus (French question →
// Arabic fiche): a "very relevant" match sits at 0.35+, a "solid" one
// at 0.25+, and anything above the retrieval floor is still worth
// showing.
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

const HIDDEN_PATHS = [
  "/acces-aux-droits/assistant-virtuel",
];

function shouldHide(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  return HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

interface PreviewState {
  source: Source;
  loading: boolean;
  title: string;
  titleAr: string | null;
  bodyHtml: string;
  bodyIsAr: boolean;
  externalHref: string | null;
}

export const FloatingAssistant = () => {
  const { pathname } = useLocation();
  const { isRTL, language } = useLanguage();
  const { data: config } = useChatbotConfig();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Ref on the newest assistant reply so we can align its TOP with the
  // top of the visible chat area (rather than autoscrolling to the very
  // bottom of a long reply, which forces the reader to scroll back up).
  const lastAssistantRef = useRef<HTMLDivElement | null>(null);
  const prevStreamingRef = useRef(false);

  // Fetches the content for a source and opens the preview dialog. For
  // types we can render inline (fiche / guide / news), we pull from the
  // matching /api/... endpoint. For resources and useful links, we just
  // open the target in a new tab — there's nothing to preview.
  const openSourcePreview = async (source: Source) => {
    if (source.type === "resource" || source.type === "link") {
      if (source.href) window.open(source.href, "_blank", "noopener,noreferrer");
      return;
    }
    setPreview({
      source,
      loading: true,
      title: source.title,
      titleAr: source.titleAr,
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
      // Merged snake/camel picker so we don't rebuild this per type.
      const pick = <T,>(...keys: string[]): T | null => {
        for (const k of keys) {
          const v = raw[k];
          if (v !== undefined && v !== null && v !== "") return v as T;
        }
        return null;
      };
      const titleFr = (pick<string>("title") as string) ?? source.title;
      const titleAr = (pick<string>("title_ar", "titleAr") as string | null) ?? source.titleAr;
      // Prefer already-translated body when we have it, otherwise fall
      // back to the source-language content. Fiches carry both.
      const bodyFr =
        (pick<string>(
          "translated_content",
          "translatedContent",
          "content",
        ) as string | null) ?? "";
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
        titleAr,
        bodyHtml: renderChatMarkdown(chosen),
        bodyIsAr: isArabicText(chosen),
        externalHref,
      });
    } catch (err) {
      toast({
        title: isRTL ? "خطأ" : "Erreur",
        description: isRTL
          ? "تعذّر تحميل المحتوى."
          : "Impossible de charger le contenu.",
        variant: "destructive",
      });
      setPreview(null);
      void err;
    }
  };

  const hidden = shouldHide(pathname);
  const primaryColor = config?.primary_color || "#3B82F6";

  const welcome = useMemo(() => {
    return isRTL
      ? (config?.welcome_message_ar || config?.welcome_message)
      : config?.welcome_message;
  }, [config?.welcome_message, config?.welcome_message_ar, isRTL]);

  // Seed the greeting when the panel opens for the first time or the
  // language/welcome text changes.
  useEffect(() => {
    if (!welcome) return;
    setMessages([{ id: 1, role: "assistant", content: welcome, timestamp: new Date() }]);
  }, [welcome]);

  // Scroll behaviour: while the assistant is still thinking (spinner),
  // stick to the bottom so the citizen sees their own message + the
  // loader. As soon as the reply arrives (streaming → false), align the
  // TOP of that reply with the top of the chat pane so the reader
  // starts from the first line — long answers used to scroll straight
  // to the end.
  useEffect(() => {
    if (!scrollRef.current) return;
    const wasStreaming = prevStreamingRef.current;
    prevStreamingRef.current = isStreaming;
    // Reply just landed → jump to its top.
    if (wasStreaming && !isStreaming && lastAssistantRef.current) {
      requestAnimationFrame(() => {
        lastAssistantRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }
    // Default: user is sending / spinner up — stay pinned to the bottom.
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Close the panel automatically when the user navigates to a hidden page.
  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  const send = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    const userMsg: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    const assistantId = messages.length + 2;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", timestamp: new Date() }]);
    setInputMessage("");
    setIsStreaming(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("acces-droits-chat", {
        body: { message: userMsg.content, history, language: isRTL ? "ar" : "fr" },
      });
      if (error) throw new Error(error.message ?? "Erreur API");
      const payload = data as { answer?: string; sources?: Source[] } | null;
      const answer = payload?.answer ?? "";
      if (!answer) throw new Error(isRTL ? "لم يرد المساعد" : "L'assistant n'a pas répondu");
      // Backend response goes through the snake_case middleware, so titleAr
      // arrives as title_ar etc. Normalise here.
      const rawSources = (payload?.sources ?? []) as Array<Record<string, unknown>>;
      const sources: Source[] = rawSources.map((r) => ({
        id: String(r.id ?? ""),
        type: ((r.type as SourceType) || "fiche"),
        title: String(r.title ?? ""),
        titleAr: (r.title_ar ?? r.titleAr ?? null) as string | null,
        categoryName: (r.category_name ?? r.categoryName ?? null) as string | null,
        categoryNameAr: (r.category_name_ar ?? r.categoryNameAr ?? null) as string | null,
        similarity: Number(r.similarity ?? 0),
        href: (r.href ?? null) as string | null,
      }));
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: answer, sources } : m)),
      );
    } catch (err) {
      toast({
        title: isRTL ? "خطأ" : "Erreur",
        description: isRTL
          ? "لا يمكن الاتصال بالمساعد. حاول لاحقا."
          : "Impossible de contacter l'assistant. Réessayez.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  };

  if (hidden) return null;

  return (
    <>
      {/* Launcher button — always visible when hidden panel */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={isRTL ? "افتح المساعد" : "Ouvrir l'assistant"}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 w-[min(92vw,380px)] h-[min(70vh,560px)] rounded-2xl shadow-2xl bg-background border border-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 text-white flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ backgroundColor: primaryColor }}
          >
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Sparkles className="h-4 w-4" />
              <div>
                <div className={`text-sm font-semibold leading-tight ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL ? "المساعد الافتراضي" : "Assistant virtuel"}
                </div>
                <div className={`text-[10px] opacity-80 leading-tight ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL ? "متاح على مدار الساعة" : "Disponible 24h/24"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/20"
              aria-label={isRTL ? "إغلاق" : "Fermer"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
            {(() => {
              // Track the index of the last non-empty assistant message so we
              // can pin its ref for the scroll-to-top-of-reply effect.
              const lastAssistantIndex = (() => {
                for (let i = messages.length - 1; i >= 0; i--) {
                  const m = messages[i];
                  if (m.role === "assistant" && m.content) return i;
                }
                return -1;
              })();
              return messages.map((msg, index) => {
              const msgAr = isArabicText(msg.content);
              return (
                <div
                  key={msg.id}
                  ref={index === lastAssistantIndex ? lastAssistantRef : undefined}
                  className={`flex flex-col gap-2 scroll-mt-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    dir={msgAr ? "rtl" : "ltr"}
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-background border border-border rounded-bl-sm"
                    } ${msgAr ? "font-almarai text-right" : "text-left"}`}
                    style={msg.role === "user" ? { backgroundColor: primaryColor } : {}}
                  >
                    {msg.role === "assistant" ? (
                      <div className="chat-md" dangerouslySetInnerHTML={{ __html: renderChatMarkdown(msg.content) }} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {/* Retrieval-augmented fiche cards. Only rendered for the
                      assistant's turns that came back with matches. */}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="max-w-[85%] w-full space-y-1.5">
                      <p
                        className={`text-[10px] uppercase tracking-wide text-muted-foreground px-1 ${
                          isRTL ? "text-right font-almarai" : ""
                        }`}
                      >
                        {isRTL ? "بطاقات ذات صلة" : "Fiches liées"}
                      </p>
                      {msg.sources.map((src) => {
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
                              <div
                                className={`text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary ${
                                  isRTL ? "font-almarai" : ""
                                }`}
                              >
                                {title}
                              </div>
                              <div
                                className={`flex items-center gap-1.5 mt-1 flex-wrap ${
                                  isRTL ? "flex-row-reverse" : ""
                                }`}
                              >
                                <span
                                  className={`text-[10px] text-muted-foreground/80 ${
                                    isRTL ? "font-almarai" : ""
                                  }`}
                                >
                                  {typeLabel}
                                </span>
                                {category && (
                                  <span
                                    className={`text-[10px] text-muted-foreground truncate ${
                                      isRTL ? "font-almarai" : ""
                                    }`}
                                  >
                                    · {category}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${visual.bg} ${visual.text}`}
                                >
                                  {percent}%
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
              });
            })()}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="bg-background border border-border px-3 py-2 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: primaryColor }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2 border-t bg-background">
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isRTL ? "اكتب سؤالك..." : "Tapez votre question..."}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={isStreaming}
                className={`h-10 text-sm ${isRTL ? "text-right font-almarai" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                onClick={send}
                size="icon"
                disabled={isStreaming || !inputMessage.trim()}
                className="h-10 w-10 shrink-0 text-white"
                style={{ backgroundColor: primaryColor }}
                aria-label={isRTL ? "إرسال" : "Envoyer"}
              >
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className={`text-[10px] text-muted-foreground mt-1.5 text-center ${isRTL ? "font-almarai" : ""}`} lang={language}>
              {isRTL ? "أجب باللغة العربية أو الفرنسية" : "Réponses en français ou en arabe"}
            </p>
          </div>
        </div>
      )}

      {/* Preview dialog — opens over the whole page when the user clicks a
          source card. We fetch the target's body from the API and render
          the same markdown pipeline the chat uses. */}
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
};

export default FloatingAssistant;
