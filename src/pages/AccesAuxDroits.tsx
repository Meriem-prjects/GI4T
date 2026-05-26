import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Gavel,
  HeartHandshake,
  Sparkles,
  MapPin,
  BookOpen,
  Video,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AccesAuxDroits = () => {
  const { isRTL } = useLanguage();
  const dir = isRTL ? "rtl" : "ltr";
  const font = isRTL ? "font-almarai" : "";
  const arrow = isRTL ? "mr-1.5 rotate-180" : "ml-1.5";

  // ─── 3 étapes du parcours citoyen ────────────────────────────────
  // Inspiré du Guide du citoyen (ODF, mai 2025). Volontairement réduit
  // à 3 étapes pour ne pas surcharger la page d'accueil — chaque étape
  // pointe vers les guides détaillés.
  const journey = [
    {
      step: "01",
      icon: Compass,
      titleFr: "Comprendre",
      titleAr: "تفهم حقوقك",
      descFr: "Quel tribunal est compétent ? Quels délais respecter ? Quels recours s'offrent à vous face à l'administration ?",
      descAr: "أي محكمة مختصة بقضيتك ؟ شنية الآجال إلي يلزم تحترمها ؟ شنوة الحلول إلي عندك قدام الإدارة ؟",
      link: "/acces-aux-droits/guides-pratiques",
      accent: "from-blue-500/15 to-blue-500/5",
      dot: "bg-blue-500",
    },
    {
      step: "02",
      icon: Gavel,
      titleFr: "Agir",
      titleAr: "تتصرف بفعالية",
      descFr: "Annuler une décision injuste, demander réparation d'un préjudice, obtenir une mesure urgente du juge.",
      descAr: "تلغي قرار غير عادل، تطلب التعويض على ضرر، تتحصل على إذن استعجالي من القاضي.",
      link: "/acces-aux-droits/ressources-pratiques",
      accent: "from-amber-500/15 to-amber-500/5",
      dot: "bg-amber-500",
    },
    {
      step: "03",
      icon: HeartHandshake,
      titleFr: "Être accompagné",
      titleAr: "تتلقى المساعدة",
      descFr: "Aide juridictionnelle gratuite, Médiateur Administratif, assistant virtuel : vous n'êtes jamais seul·e.",
      descAr: "الإعانة القضائية المجانية، الموفق الإداري، المساعد الافتراضي : أنت ما توليش وحدك.",
      link: "/acces-aux-droits/assistant-virtuel",
      accent: "from-emerald-500/15 to-emerald-500/5",
      dot: "bg-emerald-500",
    },
  ];

  // ─── Ressources rapides — 4 entrées seulement, minimalistes ─────
  const resources = [
    {
      icon: BookOpen,
      titleFr: "Guides pratiques",
      titleAr: "أدلة عملية",
      link: "/acces-aux-droits/guides-pratiques",
    },
    {
      icon: FileText,
      titleFr: "Modèles & formulaires",
      titleAr: "نماذج ومطبوعات",
      link: "/acces-aux-droits/ressources-pratiques",
    },
    {
      icon: MapPin,
      titleFr: "Près de chez vous",
      titleAr: "قريب منك",
      link: "/acces-aux-droits/carte-interactive",
    },
    {
      icon: Video,
      titleFr: "Vidéos pédagogiques",
      titleAr: "فيديوهات تعليمية",
      link: "/acces-aux-droits/mediatheque",
    },
  ];

  return (
    <main className="bg-gradient-to-b from-background via-background to-muted/30">
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />
        <div className="container relative mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-16">
          <div className="max-w-3xl mx-auto text-center" dir={dir}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 ${font}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {isRTL ? "النفاذ إلى الحقوق للجميع" : "L'accès aux droits pour toutes et tous"}
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5 ${font}`}>
              {isRTL ? (
                <>
                  اعرف حقوقك.
                  <br />
                  <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                    دافع عليها.
                  </span>
                </>
              ) : (
                <>
                  Connaissez vos droits.
                  <br />
                  <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                    Faites-les valoir.
                  </span>
                </>
              )}
            </h1>
            <p className={`text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 ${font}`}>
              {isRTL
                ? "كل المعلومات إلي تحتاجها كي يبدى عندك مشكل مع إدارة عمومية : واضحة، مبسطة، بلهجة تونسية وفرنسية."
                : "Toutes les informations dont vous avez besoin face à l'administration publique : claires, simplifiées, en français et en arabe tunisien."}
            </p>
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <Button asChild size="lg" className={`min-w-[200px] ${font}`}>
                <Link to="/acces-aux-droits/guides-pratiques">
                  {isRTL ? "ابدأ المسار التوجيهي" : "Démarrer le parcours"}
                  <ArrowRight className={`h-4 w-4 ${arrow}`} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className={`min-w-[200px] ${font}`}>
                <Link to="/acces-aux-droits/assistant-virtuel">
                  {isRTL ? "اسأل المساعد" : "Poser une question"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── 3 ÉTAPES — PARCOURS CITOYEN ─────────── */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14" dir={dir}>
          <div className="inline-block w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-4" />
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${font}`}>
            {isRTL ? "ثلاث خطوات لتفعيل حقوقك" : "Trois étapes pour faire valoir vos droits"}
          </h2>
          <p className={`text-muted-foreground ${font}`}>
            {isRTL
              ? "مسار بسيط ، مبسط ، يرافقك من الفهم إلى الفعل."
              : "Un parcours simple qui vous accompagne, de la compréhension à l'action."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {journey.map((j) => {
            const Icon = j.icon;
            const title = isRTL ? j.titleAr : j.titleFr;
            const desc = isRTL ? j.descAr : j.descFr;
            return (
              <Link key={j.step} to={j.link} className="group">
                <Card className={`h-full overflow-hidden border-border/60 hover:border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`h-1.5 bg-gradient-to-r ${j.accent}`} />
                  <CardContent className="p-6 md:p-7" dir={dir}>
                    <div className={`flex items-start justify-between mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${j.accent} flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <span className={`text-3xl font-bold text-muted-foreground/30 ${font}`}>
                        {j.step}
                      </span>
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 group-hover:text-primary transition-colors ${font}`}>
                      {title}
                    </h3>
                    <p className={`text-sm text-muted-foreground leading-relaxed mb-5 ${font}`}>
                      {desc}
                    </p>
                    <div className={`flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity ${font} ${isRTL ? "flex-row-reverse" : ""}`}>
                      {isRTL ? "اكتشف" : "Découvrir"}
                      <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────── RESSOURCES RAPIDES — MINIMALISTE ─────────── */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8" dir={dir}>
            <h2 className={`text-lg md:text-xl font-semibold text-muted-foreground ${font}`}>
              {isRTL ? "كل الموارد في متناول يدك" : "Toutes les ressources à votre portée"}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {resources.map((r, i) => {
              const Icon = r.icon;
              const title = isRTL ? r.titleAr : r.titleFr;
              return (
                <Link
                  key={i}
                  to={r.link}
                  className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-background border border-border/60 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className={`text-sm font-medium text-center ${font}`} dir={dir}>
                    {title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── CTA FINAL — ASSISTANT VIRTUEL ─────────── */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto" dir={dir}>
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center mx-auto mb-5">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${font}`}>
                {isRTL ? "هل لديك سؤال محدد ؟" : "Une question précise ?"}
              </h3>
              <p className={`text-base md:text-lg opacity-90 max-w-xl mx-auto mb-7 ${font}`}>
                {isRTL
                  ? "اطرح سؤالك مباشرة على المساعد الافتراضي. إجابة فورية بالعربية أو الفرنسية، مبنية على القانون التونسي."
                  : "Posez votre question à l'assistant virtuel. Réponse immédiate en français ou en arabe, fondée sur le droit tunisien."}
              </p>
              <Button asChild size="lg" variant="secondary" className={`min-w-[220px] ${font}`}>
                <Link to="/acces-aux-droits/assistant-virtuel">
                  {isRTL ? "افتح المساعد الآن" : "Discuter maintenant"}
                  <ArrowRight className={`h-4 w-4 ${arrow}`} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default AccesAuxDroits;
