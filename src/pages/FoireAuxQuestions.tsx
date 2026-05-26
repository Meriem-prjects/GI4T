import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, HelpCircle, ChevronLeft, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { useFAQItems } from "@/hooks/useFAQItems";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface FAQItem {
  id: string;
  question: string;
  question_ar?: string | null;
  answer: string;
  answer_ar?: string | null;
  category: string;
  category_ar?: string | null;
}

interface Topic {
  key: string;
  title: string;
  titleAr: string | null;
  questions: FAQItem[];
}

// Couleurs pastel par thème — distribution déterministe via hash du nom
// pour que chaque catégorie garde la même couleur entre rechargements.
const ACCENTS = [
  { dot: "bg-blue-500", soft: "bg-blue-50", border: "border-blue-200/60" },
  { dot: "bg-rose-500", soft: "bg-rose-50", border: "border-rose-200/60" },
  { dot: "bg-amber-500", soft: "bg-amber-50", border: "border-amber-200/60" },
  { dot: "bg-emerald-500", soft: "bg-emerald-50", border: "border-emerald-200/60" },
  { dot: "bg-purple-500", soft: "bg-purple-50", border: "border-purple-200/60" },
  { dot: "bg-cyan-500", soft: "bg-cyan-50", border: "border-cyan-200/60" },
  { dot: "bg-orange-500", soft: "bg-orange-50", border: "border-orange-200/60" },
];
function accentFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

const FoireAuxQuestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<FAQItem | null>(null);
  const { data: faqItems, isLoading } = useFAQItems(true);
  const { isRTL } = useLanguage();
  const dir = isRTL ? "rtl" : "ltr";
  const font = isRTL ? "font-almarai" : "";

  // Group by category preserving display order.
  const topics: Topic[] = useMemo(() => {
    if (!faqItems) return [];
    const map = new Map<string, Topic>();
    for (const item of faqItems as FAQItem[]) {
      if (!map.has(item.category)) {
        map.set(item.category, {
          key: item.category,
          title: item.category,
          titleAr: item.category_ar ?? null,
          questions: [],
        });
      }
      map.get(item.category)!.questions.push(item);
    }
    return Array.from(map.values());
  }, [faqItems]);

  // Filter topics by search query (matches Q or A in either language).
  const visibleTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics
      .map((t) => ({
        ...t,
        questions: t.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q) ||
            (item.question_ar?.includes(searchQuery) ?? false) ||
            (item.answer_ar?.includes(searchQuery) ?? false),
        ),
      }))
      .filter((t) => t.questions.length > 0);
  }, [topics, searchQuery]);

  // Total Q count for the hero badge.
  const totalQuestions = topics.reduce((acc, t) => acc + t.questions.length, 0);

  return (
    <main className={`min-h-screen bg-background ${font}`} dir={dir}>
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-amber-500/8 pointer-events-none" />
        <div className="container relative mx-auto px-4 pt-14 md:pt-20 pb-10 md:pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5 ${font}`}>
              <HelpCircle className="h-3.5 w-3.5" />
              {isRTL
                ? `أكثر من ${totalQuestions} سؤال`
                : `Plus de ${totalQuestions} questions`}
            </div>
            <h1 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${font}`}>
              {isRTL ? "الأسئلة الشائعة" : "Questions Fréquentes"}
            </h1>
            <p className={`text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-7 ${font}`}>
              {isRTL
                ? "إجابات واضحة ومبسطة على الأسئلة الأكثر شيوعا حول حقوقك. مرتبة حسب الموضوع."
                : "Des réponses claires et simplifiées aux questions les plus courantes sur vos droits. Classées par thème."}
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`}
              />
              <Input
                placeholder={
                  isRTL
                    ? "اكتب كلمة أو سؤال (مثال : محامي، تعويض، حرية…)"
                    : "Tapez un mot-clé (ex : avocat, indemnisation, liberté…)"
                }
                className={`h-14 text-base rounded-xl shadow-sm border-border/60 ${isRTL ? "pr-12 text-right" : "pl-12"} ${font}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── THEMES + SLIDERS ───────────────── */}
      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            {isRTL ? "جاري التحميل…" : "Chargement…"}
          </div>
        ) : visibleTopics.length === 0 ? (
          <Card className="p-10 max-w-xl mx-auto text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? isRTL
                  ? "لا توجد أسئلة تطابق بحثك."
                  : "Aucune question ne correspond à votre recherche."
                : isRTL
                  ? "لا توجد أسئلة متاحة."
                  : "Aucune question disponible."}
            </p>
          </Card>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {visibleTopics.map((topic) => (
              <TopicRow
                key={topic.key}
                topic={topic}
                isRTL={isRTL}
                font={font}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {/* ───────────────── CTA ASSISTANT ───────────────── */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <Card className="max-w-3xl mx-auto overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="p-8 md:p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center mx-auto mb-5">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className={`text-xl md:text-2xl font-bold mb-2 ${font}`}>
              {isRTL ? "لم تجد سؤالك ؟" : "Vous n'avez pas trouvé votre question ?"}
            </h2>
            <p className={`opacity-90 mb-6 max-w-lg mx-auto text-sm md:text-base ${font}`}>
              {isRTL
                ? "اسأل المساعد الافتراضي مباشرة. مدرّب على القانون التونسي ويجيب باللغتين."
                : "Posez votre question à l'assistant virtuel. Formé au droit tunisien, il répond en français et en arabe."}
            </p>
            <Button asChild size="lg" variant="secondary" className={font}>
              <Link to="/acces-aux-droits/assistant-virtuel">
                <MessageCircle className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {isRTL ? "افتح المساعد" : "Ouvrir l'assistant"}
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* ───────────────── DIALOG : RÉPONSE COMPLÈTE ───────────────── */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl" dir={dir}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${font} leading-relaxed`}>
              {selected && (isRTL ? selected.question_ar || selected.question : selected.question)}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className={`text-foreground leading-relaxed ${font}`}>
              {isRTL ? selected.answer_ar || selected.answer : selected.answer}
            </div>
          )}
          {selected && (
            <Badge variant="outline" className={`w-fit ${font}`}>
              {isRTL ? selected.category_ar || selected.category : selected.category}
            </Badge>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

// ─────────────────── TopicRow ───────────────────
// Une rangée par thème : titre à gauche, slider horizontal de cartes
// de questions à droite, avec boutons de scroll gauche/droite.

interface TopicRowProps {
  topic: Topic;
  isRTL: boolean;
  font: string;
  onSelect: (item: FAQItem) => void;
}

const TopicRow = ({ topic, isRTL, font, onSelect }: TopicRowProps) => {
  const accent = accentFor(topic.key);
  const scrollerId = `slider-${topic.key.replace(/[^a-z0-9]/gi, "-")}`;

  const scroll = (dir: "prev" | "next") => {
    const el = document.getElementById(scrollerId);
    if (!el) return;
    const cardWidth = 300;
    const delta = (dir === "next" ? 1 : -1) * cardWidth * (isRTL ? -1 : 1);
    el.scrollBy({ left: delta * 2, behavior: "smooth" });
  };

  const title = isRTL && topic.titleAr ? topic.titleAr : topic.title;

  return (
    <section>
      <div className={`flex items-end justify-between mb-4 gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className={isRTL ? "text-right" : ""}>
          <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${font}`}>
              {topic.questions.length} {isRTL ? "أسئلة" : "questions"}
            </Badge>
          </div>
          <h2 className={`text-xl md:text-2xl font-bold ${font}`}>{title}</h2>
        </div>
        <div className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-full"
            onClick={() => scroll("prev")}
            aria-label="Précédent"
          >
            <ChevronLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-full"
            onClick={() => scroll("next")}
            aria-label="Suivant"
          >
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Scroller horizontal natif avec snap */}
      <div
        id={scrollerId}
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {topic.questions.map((item) => {
          const question = isRTL && item.question_ar ? item.question_ar : item.question;
          const answer = isRTL && item.answer_ar ? item.answer_ar : item.answer;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group flex-shrink-0 w-[280px] sm:w-[320px] snap-start text-${isRTL ? "right" : "left"}`}
            >
              <Card
                className={`h-full p-5 border ${accent.border} ${accent.soft} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col`}
              >
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <HelpCircle className={`h-4 w-4 ${accent.dot.replace("bg-", "text-")}`} />
                  <span className={`text-[10px] uppercase tracking-wider text-muted-foreground font-medium ${font}`}>
                    {isRTL ? "سؤال" : "Question"}
                  </span>
                </div>
                <h3 className={`text-sm md:text-base font-semibold mb-3 line-clamp-3 group-hover:text-foreground ${font}`}>
                  {question}
                </h3>
                <p className={`text-xs md:text-sm text-muted-foreground line-clamp-3 ${font}`}>
                  {answer}
                </p>
                <div className={`mt-auto pt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity ${font} ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "اقرأ الإجابة الكاملة ←" : "Lire la réponse →"}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FoireAuxQuestions;
