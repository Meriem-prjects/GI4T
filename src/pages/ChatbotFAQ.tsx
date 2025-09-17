import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge"; 
import { Search, MessageCircle, HelpCircle, Send, Bot, User, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import { useState } from "react";

const ChatbotFAQ = () => {
  const [chatMessages, setChatMessages] = useState([
    {
      type: "bot",
      message: "Bonjour ! Je suis l'assistant virtuel de l'ODF. Comment puis-je vous aider avec vos questions sur les droits fondamentaux ?",
      time: "14:30"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const faqCategories = [
    {
      title: "Droits administratifs",
      questions: [
        {
          question: "Comment contester une décision administrative ?",
          answer: "Vous pouvez contester une décision administrative en déposant un recours gracieux dans un délai de 2 mois, puis éventuellement un recours contentieux devant le tribunal administratif dans les 2 mois suivant le rejet du recours gracieux."
        },
        {
          question: "Quels sont mes droits face à l'administration ?",
          answer: "Vous avez droit à l'information, à la motivation des décisions, au respect des délais, à être entendu, et à bénéficier d'une procédure équitable. L'administration doit également respecter le principe d'égalité de traitement."
        },
        {
          question: "Comment obtenir un document administratif ?",
          answer: "Vous pouvez demander l'accès aux documents administratifs en vertu de la loi sur l'accès à l'information. La demande peut être faite par écrit ou oralement. L'administration doit répondre dans un délai de 20 jours."
        }
      ]
    },
    {
      title: "Aide juridique",
      questions: [
        {
          question: "Comment bénéficier de l'aide juridictionnelle ?",
          answer: "L'aide juridictionnelle est accordée sous conditions de ressources. Vous devez déposer une demande auprès du bureau d'aide juridictionnelle du tribunal compétent avec les justificatifs de vos revenus."
        },
        {
          question: "Où trouver un avocat gratuit ?",
          answer: "Vous pouvez vous adresser aux Maisons de Justice, aux permanences juridiques gratuites organisées par le Barreau, ou bénéficier de l'aide juridictionnelle pour avoir un avocat commis d'office."
        }
      ]
    },
    {
      title: "Droits sociaux",
      questions: [
        {
          question: "Comment faire une demande d'aide sociale ?",
          answer: "Les demandes d'aide sociale se font auprès des services sociaux de votre commune ou du CCAS. Vous devez remplir un dossier avec les pièces justificatives requises selon le type d'aide demandée."
        },
        {
          question: "Quelles sont les aides disponibles pour le logement ?",
          answer: "Il existe plusieurs aides : allocations logement, aide au logement social, fonds de solidarité logement, etc. Contactez les services sociaux locaux pour connaître vos droits selon votre situation."
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Trouver un service près de moi",
      description: "Localiser les services d'aide juridique",
      action: "/acces-aux-droits/carte-interactive",
      icon: "🗺️"
    },
    {
      title: "Télécharger un formulaire",
      description: "Modèles et documents utiles",
      action: "/acces-aux-droits/ressources-pratiques",
      icon: "📄"
    },
    {
      title: "Consulter un guide",
      description: "Guides pratiques step-by-step",
      action: "/acces-aux-droits/guides-pratiques",
      icon: "📖"
    },
    {
      title: "Contacter un expert",
      description: "Prendre rendez-vous pour un conseil",
      action: "/contact",
      icon: "👨‍💼"
    }
  ];

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages(prev => [...prev, {
        type: "user",
        message: inputMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }]);

      // Simulate bot response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: "bot", 
          message: "Merci pour votre question. Je recherche les informations pertinentes...",
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);

      setInputMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Assistant & FAQ</h1>
                <p className="text-sm text-muted-foreground">Aide instantanée et questions fréquentes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="ghost" size="sm">Observatoire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AccesAuxDroitsNav />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/acces-aux-droits">Accès aux Droits</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Assistant & FAQ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chatbot Section */}
          <div>
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Assistant virtuel ODF</CardTitle>
                    <CardDescription>Posez vos questions sur les droits fondamentaux</CardDescription>
                  </div>
                  <Badge variant="default" className="ml-auto">En ligne</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-start gap-2">
                        {msg.type === 'bot' ? (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm">{msg.message}</p>
                          <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Actions rapides</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.action}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{action.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{action.title}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Questions Fréquentes</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher dans la FAQ..." className="pl-10" />
              </div>
            </div>

            <div className="space-y-6">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {category.questions.map((qa, qaIndex) => (
                        <AccordionItem key={qaIndex} value={`${categoryIndex}-${qaIndex}`}>
                          <AccordionTrigger className="text-left">
                            {qa.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {qa.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Support */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Besoin d'aide supplémentaire ?</CardTitle>
                <CardDescription>
                  Notre équipe est là pour vous accompagner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/contact" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Nous écrire
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Nous appeler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotFAQ;