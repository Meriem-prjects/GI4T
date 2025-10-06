import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle } from "lucide-react";
import { useFAQItems } from "@/hooks/useFAQItems";

const FoireAuxQuestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: faqItems, isLoading } = useFAQItems(true);

  // Group FAQ items by category
  const groupedFAQs = faqItems?.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = {
        title: item.category,
        title_ar: item.category_ar,
        count: 0,
        questions: []
      };
    }
    acc[category].count++;
    acc[category].questions.push(item);
    return acc;
  }, {} as Record<string, {
    title: string;
    title_ar: string | null;
    count: number;
    questions: typeof faqItems;
  }>);

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? Object.entries(groupedFAQs || {}).reduce((acc, [key, category]) => {
        const filteredQuestions = category.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.question_ar && q.question_ar.includes(searchQuery)) ||
            (q.answer_ar && q.answer_ar.includes(searchQuery))
        );
        if (filteredQuestions.length > 0) {
          acc[key] = { ...category, questions: filteredQuestions, count: filteredQuestions.length };
        }
        return acc;
      }, {} as typeof groupedFAQs)
    : groupedFAQs;

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">Chargement des questions...</p>
              </CardContent>
            </Card>
          ) : !filteredFAQs || Object.keys(filteredFAQs).length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  {searchQuery ? "Aucune question ne correspond à votre recherche" : "Aucune question disponible"}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(filteredFAQs).map(([categoryKey, category]) => (
              <Card key={categoryKey} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-6 w-6 text-primary" />
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
                      <AccordionItem key={faq.id} value={`item-${categoryKey}-${faqIndex}`}>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FoireAuxQuestions;
