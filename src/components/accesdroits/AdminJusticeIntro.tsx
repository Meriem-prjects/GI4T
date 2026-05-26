import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Scale,
  Building2,
  Clock,
  Briefcase,
  HeartHandshake,
  Users,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Theme {
  id: string;
  icon: typeof Scale;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  link: string;
  color: string;
  bgColor: string;
  textColor: string;
}

// Six thematic teasers summarising the ODF "Guide du citoyen — Accès
// au juge administratif" (May 2025). Each card is a one-line synthesis
// of a chapter; the full content lives in the Guides Pratiques tab.
const THEMES: Theme[] = [
  {
    id: "organisation",
    icon: Scale,
    titleFr: "Organisation judiciaire en Tunisie",
    titleAr: "التنظيم القضائي في تونس",
    descFr: "Comprendre les trois grands ordres : justice judiciaire, administrative et financière, et savoir quel tribunal saisir.",
    descAr: "فهم الأقسام الثلاثة للقضاء: العدلي والإداري والمالي، ومعرفة المحكمة المختصة في كل نزاع.",
    link: "/acces-aux-droits/guides-pratiques",
    color: "bg-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "tribunal-admin",
    icon: Building2,
    titleFr: "Tribunal Administratif",
    titleAr: "المحكمة الإدارية",
    descFr: "Où se trouve le tribunal administratif, ses 12 chambres régionales, et comment savoir laquelle est compétente.",
    descAr: "أين توجد المحكمة الإدارية، دوائرها الإبتدائية الجهوية الـ12، وكيف نعرف الدائرة المختصة جغرافيا.",
    link: "/acces-aux-droits/guides-pratiques",
    color: "bg-rose-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    id: "quand-saisir",
    icon: Briefcase,
    titleFr: "Quand saisir le juge administratif ?",
    titleAr: "متى نلجأ للقضاء الإداري ؟",
    descFr: "Annuler une décision administrative, demander une indemnisation, obtenir une autorisation ou un constat en urgence.",
    descAr: "إلغاء قرار إداري، طلب تعويض، الحصول على إذن أو معاينة استعجالية.",
    link: "/acces-aux-droits/guides-pratiques",
    color: "bg-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    id: "delais",
    icon: Clock,
    titleFr: "Délais à respecter",
    titleAr: "الآجال إلي يلزم نحترموها",
    descFr: "60 jours pour annuler une décision, 2 mois pour le recours préalable, 15 ans pour demander réparation d'un dommage.",
    descAr: "60 يوم لإلغاء قرار إداري، شهرين للمطلب المسبق، 15 عام لطلب التعويض على الضرر.",
    link: "/acces-aux-droits/guides-pratiques",
    color: "bg-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    id: "aide-judiciaire",
    icon: HeartHandshake,
    titleFr: "Aide juridictionnelle gratuite",
    titleAr: "اإلعانة القضائية المجانية",
    descFr: "Si vos revenus sont insuffisants, l'État prend en charge votre avocat, les frais d'huissier, d'expertise et de traduction.",
    descAr: "إذا كان دخلك ال يكفي لتكليف محامي، الدولة تتكفل بأتعاب المحامي والخبراء والترجمة وتنفيذ الأحكام.",
    link: "/acces-aux-droits/guides-pratiques",
    color: "bg-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "mediateur",
    icon: Users,
    titleFr: "Médiateur Administratif",
    titleAr: "الموفق اإلداري",
    descFr: "Avant d'aller au tribunal, le Médiateur peut intervenir auprès de l'administration pour résoudre votre problème à l'amiable.",
    descAr: "قبل التوجه للمحكمة، الموفق الإداري يتدخل لدى الإدارة لحل المشكل بطريقة ودية.",
    link: "/acces-aux-droits/adresses-utiles",
    color: "bg-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-600",
  },
];

const AdminJusticeIntro = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="py-8 md:py-14 bg-gradient-to-b from-background to-muted/40">
      <div className="container mx-auto px-4">
        {/* Intro header */}
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12" dir={isRTL ? "rtl" : "ltr"}>
          <Badge variant="outline" className="mb-3 gap-1.5">
            <Shield className="h-3 w-3" />
            {isRTL ? "حقوقك أمام الإدارة" : "Vos droits face à l'administration"}
          </Badge>
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isRTL ? "font-almarai" : ""}`}>
            {isRTL
              ? "النفاذ إلى القضاء الإداري"
              : "Accès aux droits administratifs"}
          </h2>
          <p className={`text-base md:text-lg text-muted-foreground ${isRTL ? "font-almarai" : ""}`}>
            {isRTL
              ? "كل ما يلزمك تعرفو كي يبدى عندك مشكل مع إدارة عمومية : كيفاش تطعن في قرار إداري، كيفاش تطلب التعويض، شنية الآجال، شكون يعاونك. كل المعلومات والأمثلة العملية متوفرة في الأقسام التالية."
              : "Tout ce qu'il faut savoir quand vous avez un litige avec une administration publique : comment contester une décision, demander une indemnisation, respecter les délais, vous faire aider. Les guides pratiques détaillés sont disponibles dans les sections suivantes."}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            const title = isRTL ? theme.titleAr : theme.titleFr;
            const desc = isRTL ? theme.descAr : theme.descFr;
            return (
              <Card
                key={theme.id}
                className={`group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${theme.bgColor} h-full`}
              >
                <CardContent className="p-5 md:p-6 flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
                  <div className={`w-11 h-11 ${theme.color} rounded-lg flex items-center justify-center shadow-sm mb-4`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`text-base md:text-lg font-semibold mb-2 group-hover:${theme.textColor} transition-colors ${isRTL ? "font-almarai" : ""}`}>
                    {title}
                  </h3>
                  <p className={`text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 ${isRTL ? "font-almarai" : ""}`}>
                    {desc}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={`w-full mt-auto ${isRTL ? "font-almarai" : ""}`}
                  >
                    <Link to={theme.link}>
                      {isRTL ? "اقرأ المزيد" : "En savoir plus"}
                      <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "mr-1.5 rotate-180" : "ml-1.5"}`} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA — assistant virtuel */}
        <div className="mt-8 md:mt-10 max-w-2xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center sm:text-start">
                <h4 className={`font-semibold mb-1 ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL ? "تحتاج لمساعدة فورية ؟" : "Besoin d'aide immédiate ?"}
                </h4>
                <p className={`text-sm text-muted-foreground ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL
                    ? "اسأل المساعد الافتراضي مباشرة بالعربية أو بالفرنسية"
                    : "Posez votre question à l'assistant virtuel en français ou en arabe"}
                </p>
              </div>
              <Button asChild className={`flex-shrink-0 ${isRTL ? "font-almarai" : ""}`}>
                <Link to="/acces-aux-droits/assistant-virtuel">
                  {isRTL ? "افتح المساعد" : "Ouvrir l'assistant"}
                  <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-1.5 rotate-180" : "ml-1.5"}`} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdminJusticeIntro;
