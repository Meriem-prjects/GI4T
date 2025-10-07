import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useChatbotConfig } from "@/hooks/useChatbotConfig";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AssistantVirtuel = () => {
  const { data: config, isLoading: configLoading } = useChatbotConfig();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (config?.welcome_message) {
      setMessages([{
        id: 1,
        role: "assistant",
        content: config.welcome_message,
        timestamp: new Date()
      }]);
    }
  }, [config?.welcome_message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(
        `https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/acces-droits-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: conversationHistory,
            stream: true
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Impossible de lire la réponse");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                assistantContent += content;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantContent }
                    : msg
                ));
              }
            } catch (e) {
              // Ignorer les erreurs de parsing JSON pour les chunks partiels
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Requête annulée');
      } else {
        console.error("Erreur lors de l'envoi du message:", error);
        toast({
          title: "Erreur",
          description: "Impossible de contacter l'assistant. Veuillez réessayer.",
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
    <div className="min-h-screen bg-background" style={{ fontFamily }}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10" style={{ color: primaryColor }} />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Assistant Virtuel
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Posez vos questions juridiques en temps réel
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5" style={{ color: primaryColor }} />
                Discutez avec notre assistant
              </CardTitle>
              <CardDescription>
                Notre assistant est disponible 24h/24 pour répondre à vos questions juridiques
              </CardDescription>
            </CardHeader>
            
            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === 'user' 
                          ? 'text-white' 
                          : 'bg-muted text-foreground'
                      }`}
                      style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isStreaming && messages[messages.length - 1]?.content === "" && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin" style={{ color: secondaryColor }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Chat Input */}
            <div className="p-6 border-t bg-muted/30">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tapez votre question..."
                  onKeyPress={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                  disabled={isStreaming}
                  className="flex-1 h-12"
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
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Appuyez sur Entrée pour envoyer votre message
              </p>
            </div>
          </Card>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-3">Comment fonctionne l'assistant ?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Posez vos questions en langage naturel</li>
              <li>• Recevez des réponses juridiques adaptées à votre situation</li>
              <li>• L'assistant utilise les documents d'apprentissage pour des réponses précises</li>
              <li>• Votre conversation est confidentielle et sécurisée</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantVirtuel;
