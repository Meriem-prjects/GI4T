import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, FileText, Scale, Users } from "lucide-react";

const FoireAuxQuestions = () => {
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
        },
        {
          question: "Comment obtenir un certificat de travail ?",
          answer: "L'employeur est légalement obligé de vous remettre un certificat de travail à la fin de votre contrat. Ce document doit mentionner la date d'embauche, la date de fin, et le poste occupé."
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
        },
        {
          question: "Comment rectifier une erreur sur un acte d'état civil ?",
          answer: "La rectification d'une erreur matérielle se fait par requête auprès du procureur de la République. Pour les erreurs de fond, une procédure judiciaire devant le tribunal est nécessaire."
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
        },
        {
          question: "Comment déposer un dossier de logement social ?",
          answer: "Le dépôt se fait auprès de la municipalité ou de l'organisme gestionnaire (SPROLS). Vous devez fournir : pièce d'identité, justificatif de revenus, certificat de résidence, et composition familiale."
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-10 w-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Questions Fréquentes
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement des réponses à vos questions juridiques les plus courantes
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Rechercher dans la FAQ..." 
              className="pl-12 h-14 text-base"
            />
          </div>
        </div>

        {/* Popular Questions */}
        <div className="mb-12 max-w-3xl mx-auto">
          <h3 className="font-semibold text-lg mb-4">Questions populaires</h3>
          <div className="flex flex-wrap gap-2">
            {popularQuestions.map((question, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-2 px-4"
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-6">
          {faqCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
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
                        <AccordionTrigger className="text-left hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
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
    </div>
  );
};

export default FoireAuxQuestions;
