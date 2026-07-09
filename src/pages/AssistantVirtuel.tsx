import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useChatbotConfig } from "@/hooks/useChatbotConfig";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { renderChatMarkdown, isArabicText } from "@/lib/markdown-chat";
import {
  ChatSources,
  normaliseSources,
  type ChatSource,
} from "@/components/chat/ChatSources";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
}

const AssistantVirtuel = () => {
  const { data: config, isLoading: configLoading } = useChatbotConfig();
  const { toast } = useToast();
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Pick the Arabic welcome message when the UI is in Arabic mode, fall
    // back to the French one (which is always present) otherwise.
    const welcome = isRTL
      ? (config?.welcome_message_ar || config?.welcome_message)
      : config?.welcome_message;
    if (welcome) {
      setMessages([{
        id: 1,
        role: "assistant",
        content: welcome,
        timestamp: new Date(),
      }]);
    }
  }, [config?.welcome_message, config?.welcome_message_ar, isRTL]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsStreaming(true);

    const assistantMessageId = messages.length + 2;
    let assistantContent = "";

    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date()
    }]);

    try {
      abortControllerRef.current = new AbortController();

      // Conversation history sent to the bot for context (last N turns).
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Use the supabase-shim which routes to /api/fn/acces-droits-chat
      // on our local backend (the old hardcoded Supabase Cloud URL is
      // dead since the migration).
      const { data, error } = await supabase.functions.invoke('acces-droits-chat', {
        body: {
          message: userMessage.content,
          history,
          language: isRTL ? 'ar' : 'fr',
        },
      });

      if (error) throw new Error(error.message ?? 'Erreur API');
      const answer = (data as { answer?: string } | null)?.answer ?? '';
      if (!answer) throw new Error(isRTL ? 'لم يرد المساعد' : "L'assistant n'a pas répondu");

      assistantContent = answer;
      const sources = normaliseSources((data as { sources?: unknown } | null)?.sources);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: assistantContent, sources }
            : msg,
        ),
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Requête annulée');
      } else {
        console.error("Erreur lors de l'envoi du message:", error);
        toast({
          title: isRTL ? "خطأ" : "Erreur",
          description: isRTL 
            ? "لا يمكن الاتصال بالمساعد. يرجى المحاولة مرة أخرى." 
            : "Impossible de contacter l'assistant. Veuillez réessayer.",
          variant: "destructive"
        });
        
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const primaryColor = config?.primary_color || "#3B82F6";
  const secondaryColor = config?.secondary_color || "#10B981";
  const fontFamily = config?.font_family || "Inter, sans-serif";

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-almarai' : ''}`} style={{ fontFamily }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className={`container mx-auto px-4 text-center ${isRTL ? 'text-right' : ''}`}>
          <div className={`flex items-center justify-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageCircle className="h-10 w-10" style={{ color: primaryColor }} />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isRTL ? 'المساعد الافتراضي' : 'Assistant Virtuel'}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL ? 'اطرح أسئلتك القانونية في الوقت الفعلي' : 'Posez vos questions juridiques en temps réel'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col shadow-lg">
            <CardHeader className={`border-b ${isRTL ? 'text-right' : ''}`}>
              <CardTitle className={`text-xl flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MessageCircle className="h-5 w-5" style={{ color: primaryColor }} />
                {isRTL ? 'دردشة مع مساعدنا' : 'Discutez avec notre assistant'}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : ''}>
                {isRTL 
                  ? 'مساعدنا متاح على مدار الساعة طوال أيام الأسبوع للإجابة على أسئلتك القانونية'
                  : 'Notre assistant est disponible 24h/24 pour répondre à vos questions juridiques'}
              </CardDescription>
            </CardHeader>
            
            {/* Chat Messages */}
            <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {messages.map((msg) => {
                  // Auto-detect Arabic per message so mixed conversations
                  // (user asks in FR, bot answers in AR, or vice versa)
                  // still render each bubble in the correct direction.
                  const msgIsArabic = isArabicText(msg.content);
                  const bubbleDir = msgIsArabic ? "rtl" : "ltr";
                  return (
                    <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        dir={bubbleDir}
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === 'user'
                            ? 'text-white'
                            : 'bg-muted text-foreground'
                        } ${msgIsArabic ? 'font-almarai text-right' : 'text-left'}`}
                        style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
                      >
                        {msg.role === 'assistant' ? (
                          <div
                            className="chat-md text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderChatMarkdown(msg.content) }}
                          />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <span className="text-xs opacity-70 mt-2 block">
                          {msg.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-TN' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="max-w-[80%] w-full">
                          <ChatSources
                            sources={msg.sources}
                            primaryColor={primaryColor}
                            label={isRTL ? 'مصادر ذات صلة' : 'Sources liées'}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {isStreaming && messages[messages.length - 1]?.content === "" && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: secondaryColor }} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Chat Input */}
            <div className="p-6 border-t bg-muted/30">
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isRTL ? 'اكتب سؤالك...' : 'Tapez votre question...'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isStreaming) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isStreaming}
                  className={`flex-1 h-12 ${isRTL ? 'text-right' : ''}`}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="lg" 
                  className="px-6 text-white"
                  disabled={isStreaming || !inputMessage.trim()}
                  style={{ backgroundColor: primaryColor }}
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إرسال' : 'Envoyer'}
                    </>
                  )}
                </Button>
              </div>
              <p className={`text-xs text-muted-foreground mt-3 text-center ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'اضغط على Enter لإرسال رسالتك' : 'Appuyez sur Entrée pour envoyer votre message'}
              </p>
            </div>
          </Card>

          {/* Info Section */}
          <div className={`mt-8 p-6 bg-muted/30 rounded-lg ${isRTL ? 'text-right' : ''}`}>
            <h3 className="font-semibold mb-3">
              {isRTL ? 'كيف يعمل المساعد؟' : 'Comment fonctionne l\'assistant ?'}
            </h3>
            <ul className={`space-y-2 text-sm text-muted-foreground ${isRTL ? 'list-none' : ''}`}>
              <li>{isRTL ? '• اطرح أسئلتك بلغة طبيعية' : '• Posez vos questions en langage naturel'}</li>
              <li>{isRTL ? '• احصل على إجابات قانونية مكيفة لحالتك' : '• Recevez des réponses juridiques adaptées à votre situation'}</li>
              <li>{isRTL ? '• يستخدم المساعد وثائق التدريب للحصول على إجابات دقيقة' : '• L\'assistant utilise les documents d\'apprentissage pour des réponses précises'}</li>
              <li>{isRTL ? '• محادثتك سرية وآمنة' : '• Votre conversation est confidentielle et sécurisée'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantVirtuel;
