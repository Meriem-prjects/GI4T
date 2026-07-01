import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Send, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbotConfig } from "@/hooks/useChatbotConfig";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { renderChatMarkdown, isArabicText } from "@/lib/markdown-chat";

// A compact, floating chat popup shown at the bottom-right of every public
// page. It shares the same backend function (`acces-droits-chat`) as the
// full page at /acces-aux-droits/assistant-virtuel — so a citizen can ask a
// quick question without navigating away. Hidden on the full-page route to
// avoid a duplicate, and on all admin routes to keep the back-office clean.

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const HIDDEN_PATHS = [
  "/acces-aux-droits/assistant-virtuel",
];

function shouldHide(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  return HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to the bottom on new messages.
  useEffect(() => {
    if (!scrollRef.current) return;
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
      const answer = (data as { answer?: string } | null)?.answer ?? "";
      if (!answer) throw new Error(isRTL ? "لم يرد المساعد" : "L'assistant n'a pas répondu");
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: answer } : m)));
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
            {messages.map((msg) => {
              const msgAr = isArabicText(msg.content);
              return (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                </div>
              );
            })}
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
    </>
  );
};

export default FloatingAssistant;
