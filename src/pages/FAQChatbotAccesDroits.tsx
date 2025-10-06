import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Search, HelpCircle, FileText, Scale, Users, Send } from "lucide-react";
import { Link } from "react-router-dom";

const FAQChatbotAccesDroits = () => {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "Bonjour ! Je suis votre assistant juridique virtuel. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const faqCategories = [
    {
      title: "Droit du travail",
      icon: Users,
      count: 15,
      questions: [
        {
          question: "Comment démissionner légalement ?",
          answer: "Pour démissionner légalement en Tunisie, vous devez respecter le préavis prévu dans votre contrat de travail ou la convention collective. Remettez une lettre de démission écrite à votre employeur mentionnant la date de fin de votre contrat."
        },
        {
          question: "Quels sont mes droits en cas de licenciement ?",
          answer: "En cas de licenciement, vous avez droit à un préavis, une indemnité de licenciement selon votre ancienneté, le solde de tout compte, et éventuellement une indemnité compensatrice de congés payés non pris."
        }
      ]
    },
    {
      title: "État civil",
      icon: FileText,
      count: 12,
      questions: [
        {
          question: "Comment obtenir un acte de naissance ?",
          answer: "Vous pouvez obtenir un acte de naissance en vous rendant à l'état civil de votre commune de naissance, en ligne via le portail e-gouvernement, ou en mandatant une personne avec procuration."
        },
        {
          question: "Quelles pièces pour changer de nom ?",
          answer: "Pour changer de nom, vous devez déposer une demande au tribunal de première instance avec votre acte de naissance, un certificat de résidence, et justifier des motifs légitimes du changement."
        }
      ]
    },
    {
      title: "Droit au logement",
      icon: Scale,
      count: 18,
      questions: [
        {
          question: "Comment contester une expulsion ?",
          answer: "Pour contester une expulsion, vous devez saisir le tribunal compétent dans les délais légaux avec l'assistance d'un avocat. Vous pouvez également demander des délais de grâce si votre situation le justifie."
        },
        {
          question: "Quels sont mes droits de locataire ?",
          answer: "Vos droits incluent : jouissance paisible du logement, protection contre les augmentations abusives, droit au renouvellement du bail, et obligation du propriétaire d'effectuer les grosses réparations."
        }
      ]
    }
  ];

  const popularQuestions = [
    "Comment porter plainte ?",
    "Obtenir un casier judiciaire",
    "Droits lors d'un contrôle police",
    "Procédure de divorce",
    "Pension alimentaire"
  ];

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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            FAQ & Assistant Virtuel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement des réponses à vos questions juridiques ou discutez avec notre assistant virtuel.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Questions Fréquentes</h2>
            </div>

            {/* Search FAQ */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher dans la FAQ..." className="pl-10" />
              </div>
            </div>

            {/* Popular Questions */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Questions populaires</h3>
              <div className="flex flex-wrap gap-2">
                {popularQuestions.map((question, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {question}
                  </Badge>
                ))}
              </div>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-6">
              {faqCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <div className="flex-1">
                          <CardTitle className="flex items-center justify-between">
                            {category.title}
                            <Badge variant="secondary">{category.count}</Badge>
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        {category.questions.map((faq, faqIndex) => (
                          <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Chatbot Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Assistant Virtuel</h2>
            </div>

            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Discutez avec notre assistant</CardTitle>
                <CardDescription>
                  Posez vos questions juridiques en temps réel
                </CardDescription>
              </CardHeader>
              
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <span className="text-xs opacity-70">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Chat Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tapez votre question..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Notre assistant est disponible 24h/24 pour répondre à vos questions
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <section className="mt-16 py-12 bg-muted/30 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à explorer nos autres ressources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/acces-aux-droits/guides-pratiques">
                <Button variant="outline">
                  Consulter les Guides
                </Button>
              </Link>
              <Link to="/observatoire">
                <Button>
                  Accéder à l'Observatoire
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FAQChatbotAccesDroits;
