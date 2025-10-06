import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

const AssistantVirtuel = () => {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "Bonjour ! Je suis votre assistant juridique virtuel. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        type: "user",
        message: inputMessage,
        timestamp: new Date()
      };
      
      const botResponse = {
        id: chatMessages.length + 2,
        type: "bot",
        message: "Merci pour votre question. Notre équipe juridique vous répondra dans les plus brefs délais. En attendant, consultez notre FAQ ou nos guides pratiques.",
        timestamp: new Date()
      };

      setChatMessages([...chatMessages, newMessage, botResponse]);
      setInputMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10 text-primary" />
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
                <MessageCircle className="h-5 w-5 text-primary" />
                Discutez avec notre assistant
              </CardTitle>
              <CardDescription>
                Notre assistant est disponible 24h/24 pour répondre à vos questions juridiques
              </CardDescription>
            </CardHeader>
            
            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Chat Input */}
            <div className="p-6 border-t bg-muted/30">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tapez votre question..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 h-12"
                />
                <Button onClick={handleSendMessage} size="lg" className="px-6">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
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
              <li>• Consultez les ressources complémentaires suggérées</li>
              <li>• Votre conversation est confidentielle et sécurisée</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantVirtuel;
