import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ExternalLink,
  Shield,
  Gavel,
  Heart,
  Briefcase,
  ChevronRight,
  Phone,
  Building2,
  Scale,
  Landmark,
  HeartHandshake,
  Users,
  Stethoscope,
  GraduationCap,
  Home,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Megaphone,
  HandCoins,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminManagedSection from "@/components/accesdroits/AdminManagedSection";

// Curated directory of useful links for Tunisian citizens. Every URL below
// was HTTP-checked (curl) before inclusion; entries with dead domains
// (FTDES, SNIT, legalisation.tn) were removed rather than left broken.

interface UsefulLink {
  nameFr: string;
  nameAr: string;
  descFr: string;
  descAr: string;
  url: string;
  phone?: string;
  icon: typeof Building2;
  official: boolean;
}

interface LinkCategory {
  id: string;
  titleFr: string;
  titleAr: string;
  icon: typeof Shield;
  color: string;
  textColor: string;
  bgAccent: string;
  links: UsefulLink[];
}

const CATEGORIES: LinkCategory[] = [
  // ── 1. Justice administrative ─────────────────────────────────────────
  {
    id: "justice-admin",
    titleFr: "Justice administrative",
    titleAr: "القضاء الإداري",
    icon: Scale,
    color: "bg-rose-600",
    textColor: "text-rose-700",
    bgAccent: "bg-rose-50",
    links: [
      {
        nameFr: "Tribunal Administratif de Tunisie",
        nameAr: "المحكمة الإدارية بتونس",
        descFr: "Juridiction compétente pour les litiges entre citoyens et administration : recours en annulation, indemnisation, référés.",
        descAr: "المحكمة المختصة بالنزاعات بين المواطن والإدارة : دعاوى الإلغاء، التعويض، الاستعجالي.",
        url: "http://www.ta.gov.tn",
        phone: "+216 71 786 633",
        icon: Building2,
        official: true,
      },
      {
        nameFr: "Médiateur Administratif",
        nameAr: "الموفق الإداري",
        descFr: "Institution gratuite qui intervient à l'amiable auprès de l'administration avant d'aller au tribunal.",
        descAr: "مؤسسة مجانية تتدخل وديا لدى الإدارة قبل اللجوء للمحكمة.",
        url: "https://www.mediateur.tn",
        phone: "+216 71 256 200",
        icon: HeartHandshake,
        official: true,
      },
      {
        nameFr: "Ministère de la Justice — e-Justice",
        nameAr: "وزارة العدل — العدالة الإلكترونية",
        descFr: "Services en ligne : casier judiciaire, suivi de dossier, aide juridictionnelle.",
        descAr: "خدمات عن بعد : السجل العدلي، متابعة الملف، الإعانة العدلية.",
        url: "http://www.e-justice.tn",
        phone: "+216 71 568 666",
        icon: Gavel,
        official: true,
      },
      {
        nameFr: "Cour des Comptes",
        nameAr: "محكمة المحاسبات",
        descFr: "Contrôle de la gestion des deniers publics. Rapports annuels publics.",
        descAr: "مراقبة التصرف في المال العام. تقارير سنوية عمومية.",
        url: "http://www.courdescomptes.nat.tn",
        icon: HandCoins,
        official: true,
      },
      {
        nameFr: "Journal Officiel — IORT",
        nameAr: "الرائد الرسمي",
        descFr: "Publication officielle des lois et décrets. Recherche par date et numéro.",
        descAr: "النشر الرسمي للقوانين والأوامر. بحث بالتاريخ والعدد.",
        url: "http://www.iort.gov.tn",
        icon: Megaphone,
        official: true,
      },
      {
        nameFr: "Ordre National des Avocats",
        nameAr: "الهيئة الوطنية للمحامين",
        descFr: "Annuaire des avocats par spécialité et région. Doléances déontologiques.",
        descAr: "دليل المحامين حسب الاختصاص والجهة. شكاوى تأديبية.",
        url: "http://www.avocat.org.tn",
        phone: "+216 71 798 622",
        icon: Briefcase,
        official: true,
      },
    ],
  },

  // ── 2. Institutions de l'État ─────────────────────────────────────────
  {
    id: "institutions",
    titleFr: "Institutions de l'État",
    titleAr: "مؤسسات الدولة",
    icon: Landmark,
    color: "bg-blue-600",
    textColor: "text-blue-700",
    bgAccent: "bg-blue-50",
    links: [
      {
        nameFr: "Présidence de la République",
        nameAr: "رئاسة الجمهورية",
        descFr: "Site officiel de Carthage : décrets présidentiels, agenda, communiqués.",
        descAr: "الموقع الرسمي لقرطاج : الأوامر الرئاسية، البرنامج، البلاغات.",
        url: "http://www.carthage.tn",
        icon: Landmark,
        official: true,
      },
      {
        nameFr: "Présidence du Gouvernement",
        nameAr: "رئاسة الحكومة",
        descFr: "Décrets gouvernementaux, communiqués du Conseil des ministres.",
        descAr: "الأوامر الحكومية، بلاغات مجلس الوزراء.",
        url: "http://www.pm.gov.tn",
        icon: Building2,
        official: true,
      },
      {
        nameFr: "Portail National de l'Administration",
        nameAr: "البوابة الوطنية للإدارة",
        descFr: "Point d'entrée unique pour toutes les démarches administratives en ligne.",
        descAr: "نقطة الدخول الموحدة لكل الخدمات الإدارية عن بعد.",
        url: "http://www.tunisie.gov.tn",
        icon: Globe,
        official: true,
      },
      {
        nameFr: "Assemblée des Représentants du Peuple",
        nameAr: "مجلس نواب الشعب",
        descFr: "Travaux parlementaires, projets de loi, séances plénières.",
        descAr: "الأشغال البرلمانية، مشاريع القوانين، الجلسات العامة.",
        url: "http://www.arp.tn",
        icon: Users,
        official: true,
      },
      {
        nameFr: "Banque Centrale de Tunisie",
        nameAr: "البنك المركزي التونسي",
        descFr: "Médiateur bancaire pour litiges client-banque, taux de change.",
        descAr: "الموفق البنكي للنزاعات بين الحرفاء والبنوك، أسعار الصرف.",
        url: "https://www.bct.gov.tn",
        phone: "+216 71 122 000",
        icon: HandCoins,
        official: true,
      },
    ],
  },

  // ── 3. Droits humains et instances indépendantes ──────────────────────
  {
    id: "droits-humains",
    titleFr: "Droits humains et instances",
    titleAr: "حقوق الإنسان والهيئات المستقلة",
    icon: ShieldCheck,
    color: "bg-purple-600",
    textColor: "text-purple-700",
    bgAccent: "bg-purple-50",
    links: [
      {
        nameFr: "INPDP — Protection des données personnelles",
        nameAr: "الهيئة الوطنية لحماية المعطيات الشخصية",
        descFr: "Plaintes concernant l'usage abusif de données personnelles.",
        descAr: "شكاوى حول الاستعمال المفرط للمعطيات الشخصية.",
        url: "http://www.inpdp.nat.tn",
        phone: "+216 71 808 282",
        icon: Lock,
        official: true,
      },
      {
        nameFr: "INLUCC — Lutte contre la corruption",
        nameAr: "الهيئة الوطنية لمكافحة الفساد",
        descFr: "Dénoncer la corruption administrative en toute confidentialité.",
        descAr: "التبليغ عن الفساد الإداري في سرية تامة.",
        url: "http://www.inlucc.tn",
        phone: "80 10 22 22",
        icon: ShieldCheck,
        official: true,
      },
      {
        nameFr: "HAICA — Audiovisuel",
        nameAr: "الهيئة العليا المستقلة للاتصال السمعي والبصري",
        descFr: "Régulation des médias, traitement des plaintes contre les chaînes.",
        descAr: "تعديل الإعلام، معالجة الشكاوى ضد القنوات.",
        url: "http://www.haica.tn",
        icon: Megaphone,
        official: true,
      },
      {
        nameFr: "Ligue Tunisienne des Droits de l'Homme",
        nameAr: "الرابطة التونسية للدفاع عن حقوق الإنسان",
        descFr: "Plus ancienne association de défense des droits dans le monde arabe.",
        descAr: "أقدم جمعية للدفاع عن الحقوق في العالم العربي.",
        url: "https://ltdh-tunisie.org",
        phone: "+216 71 245 175",
        icon: Users,
        official: false,
      },
      {
        nameFr: "ATFD — Femmes démocrates",
        nameAr: "الجمعية التونسية للنساء الديمقراطيات",
        descFr: "Centres d'écoute pour femmes victimes de violences.",
        descAr: "مراكز الإصغاء للنساء ضحايا العنف.",
        url: "https://atfd-tunisie.org",
        phone: "+216 71 322 920",
        icon: HeartHandshake,
        official: false,
      },
    ],
  },

  // ── 4. Aide sociale et santé ──────────────────────────────────────────
  {
    id: "aide-sociale",
    titleFr: "Aide sociale et santé",
    titleAr: "المساعدة الاجتماعية والصحة",
    icon: Heart,
    color: "bg-emerald-600",
    textColor: "text-emerald-700",
    bgAccent: "bg-emerald-50",
    links: [
      {
        nameFr: "Ministère des Affaires Sociales",
        nameAr: "وزارة الشؤون الاجتماعية",
        descFr: "Aides sociales, familles nécessiteuses, personnes handicapées, retraités.",
        descAr: "المساعدات الاجتماعية، الأسر المعوزة، الأشخاص ذوي الإعاقة، المتقاعدين.",
        url: "http://www.social.gov.tn",
        phone: "+216 71 894 433",
        icon: HeartHandshake,
        official: true,
      },
      {
        nameFr: "CNAM — Assurance maladie",
        nameAr: "الصندوق الوطني للتأمين على المرض",
        descFr: "Carte santé, remboursements, hospitalisation, médecin traitant.",
        descAr: "البطاقة الصحية، الاسترجاع، الاستشفاء، الطبيب المعالج.",
        url: "http://www.cnam.nat.tn",
        phone: "81 100 100",
        icon: Stethoscope,
        official: true,
      },
      {
        nameFr: "CNSS — Sécurité sociale (privé)",
        nameAr: "الصندوق الوطني للضمان الاجتماعي",
        descFr: "Affiliation salariés privés, pensions retraite, prestations familiales.",
        descAr: "انخراط الأجراء بالقطاع الخاص، جراية التقاعد، المنح العائلية.",
        url: "http://www.cnss.tn",
        phone: "81 102 020",
        icon: HandCoins,
        official: true,
      },
      {
        nameFr: "CNRPS — Retraites fonction publique",
        nameAr: "الصندوق الوطني للتقاعد والحيطة الاجتماعية",
        descFr: "Pensions de retraite, capital décès, prêts logement (agents publics).",
        descAr: "جرايات التقاعد، رأس مال الوفاة، قروض السكن (أعوان القطاع العمومي).",
        url: "https://www.cnrps.nat.tn",
        phone: "81 103 030",
        icon: HandCoins,
        official: true,
      },
      {
        nameFr: "Ministère de la Santé",
        nameAr: "وزارة الصحة",
        descFr: "Cartes de soin gratuit, hôpitaux publics, vaccinations.",
        descAr: "بطاقات العلاج المجاني، المستشفيات العمومية، التلاقيح.",
        url: "https://www.santetunisie.rns.tn",
        phone: "190",
        icon: Stethoscope,
        official: true,
      },
    ],
  },

  // ── 5. Travail, emploi et logement ────────────────────────────────────
  {
    id: "travail-logement",
    titleFr: "Travail, emploi et logement",
    titleAr: "الشغل والتشغيل والسكن",
    icon: Briefcase,
    color: "bg-amber-600",
    textColor: "text-amber-700",
    bgAccent: "bg-amber-50",
    links: [
      {
        nameFr: "ANETI — Agence pour l'Emploi",
        nameAr: "الوكالة الوطنية للتشغيل والعمل المستقل",
        descFr: "Inscription demandeurs d'emploi, offres, accompagnement à l'auto-emploi.",
        descAr: "تسجيل طالبي الشغل، العروض، مرافقة العمل المستقل.",
        url: "http://www.emploi.nat.tn",
        phone: "+216 71 781 200",
        icon: Briefcase,
        official: true,
      },
      {
        nameFr: "Inspection du Travail",
        nameAr: "تفقدية الشغل",
        descFr: "Plaintes contre l'employeur : salaires impayés, licenciement abusif, harcèlement.",
        descAr: "شكاوى ضد المُؤجر : الأجور غير المدفوعة، الطرد التعسفي، التحرش.",
        url: "http://www.emploi.gov.tn",
        phone: "+216 71 568 280",
        icon: Scale,
        official: true,
      },
      {
        nameFr: "UGTT — Union Générale Tunisienne du Travail",
        nameAr: "الاتحاد العام التونسي للشغل",
        descFr: "Centrale syndicale historique : conseils, défense, médiation employeur.",
        descAr: "المنظمة النقابية التاريخية : استشارة، دفاع، وساطة مع المُؤجر.",
        url: "http://www.ugtt.org.tn",
        phone: "+216 71 330 300",
        icon: Users,
        official: false,
      },
      {
        nameFr: "ATFP — Formation professionnelle",
        nameAr: "الوكالة التونسية للتكوين المهني",
        descFr: "Centres de formation publics, diplômes BTS/BTP, reconversion adultes.",
        descAr: "مراكز التكوين العمومية، شهادات المؤهل التقني، إعادة التكوين للكبار.",
        url: "http://www.atfp.tn",
        phone: "+216 71 832 000",
        icon: GraduationCap,
        official: true,
      },
      {
        nameFr: "AFH — Agence Foncière d'Habitation",
        nameAr: "الوكالة العقارية للسكنى",
        descFr: "Lotissements viabilisés, terrains à bâtir, programmes premiers acquéreurs.",
        descAr: "تقسيمات مهيأة، أراضي للبناء، برامج المقتنين الأولين.",
        url: "https://www.afh.nat.tn",
        phone: "+216 71 286 000",
        icon: Home,
        official: true,
      },
    ],
  },

  // ── 6. Citoyenneté et état civil ──────────────────────────────────────
  {
    id: "etat-civil",
    titleFr: "Citoyenneté et état civil",
    titleAr: "المواطنة والحالة المدنية",
    icon: Shield,
    color: "bg-cyan-600",
    textColor: "text-cyan-700",
    bgAccent: "bg-cyan-50",
    links: [
      {
        nameFr: "Ministère de l'Intérieur",
        nameAr: "وزارة الداخلية",
        descFr: "Carte d'identité, passeport, certificats de résidence.",
        descAr: "بطاقة التعريف، جواز السفر، شهائد الإقامة.",
        url: "http://www.interieur.gov.tn",
        phone: "197",
        icon: Shield,
        official: true,
      },
      {
        nameFr: "e-Houwiya — Identité numérique",
        nameAr: "الهوية الرقمية",
        descFr: "Authentification en ligne pour services publics avec la CIN.",
        descAr: "المصادقة الرقمية للخدمات العمومية بالاعتماد على بطاقة التعريف.",
        url: "http://www.tunisie.gov.tn",
        icon: Lock,
        official: true,
      },
      {
        nameFr: "Ministère des Affaires Étrangères",
        nameAr: "وزارة الشؤون الخارجية",
        descFr: "Tunisiens à l'étranger : passeport, légalisation consulaire, rapatriement.",
        descAr: "التونسيون بالخارج : جواز السفر، التصديق القنصلي، الترحيل.",
        url: "https://www.diplomatie.gov.tn",
        phone: "+216 71 847 000",
        icon: Globe,
        official: true,
      },
      {
        nameFr: "INS — Institut National de la Statistique",
        nameAr: "المعهد الوطني للإحصاء",
        descFr: "Statistiques officielles, recensements, indices des prix.",
        descAr: "الإحصائيات الرسمية، التعدادات، مؤشرات الأسعار.",
        url: "http://www.ins.tn",
        phone: "+216 71 891 002",
        icon: Building2,
        official: true,
      },
    ],
  },
];

const LiensUtilesContent = () => {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  // Sections collapsed/expanded state. All open by default.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return CATEGORIES.map((cat) => {
      const links = cat.links.filter((l) => {
        if (!q) return true;
        const hay = [l.nameFr, l.nameAr, l.descFr, l.descAr, l.url].join(" ").toLowerCase();
        return hay.includes(q);
      });
      return { ...cat, links };
    }).filter((cat) => {
      if (activeCategory && cat.id !== activeCategory) return false;
      return cat.links.length > 0;
    });
  }, [searchTerm, activeCategory]);

  const totalLinks = useMemo(
    () => CATEGORIES.reduce((sum, c) => sum + c.links.length, 0),
    [],
  );

  return (
    <main className={`flex-1 ${isRTL ? "font-almarai" : ""}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <span>{isRTL ? "الرئيسية" : "Accueil"}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span>{isRTL ? "النفاذ إلى الحقوق" : "Accès aux Droits"}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-foreground">{isRTL ? "روابط مفيدة" : "Liens Utiles"}</span>
          </div>
        </div>
      </div>

      {/* Hero — minimal */}
      <section className="py-6 md:py-8 border-b">
        <div className="container mx-auto px-4 max-w-4xl" dir={isRTL ? "rtl" : "ltr"}>
          <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-xl md:text-2xl font-bold mb-1 ${isRTL ? "font-almarai" : ""}`}>
                {isRTL ? "روابط مفيدة" : "Liens utiles"}
              </h1>
              <p className={`text-sm text-muted-foreground ${isRTL ? "font-almarai" : ""}`}>
                {isRTL
                  ? `${totalLinks} مؤسسة تونسية موثقة : محاكم، وزارات، صناديق اجتماعية، هيئات مستقلة وجمعيات.`
                  : `${totalLinks} institutions tunisiennes vérifiées : tribunaux, ministères, caisses sociales, instances indépendantes, associations.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Admin-managed extras */}
        <AdminManagedSection
          kind="useful_links"
          title={{ fr: "Liens récents ajoutés", ar: "روابط مضافة حديثا" }}
        />

        {/* Search + filter row */}
        <div className="mb-5 space-y-3" dir={isRTL ? "rtl" : "ltr"}>
          <div className="relative">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={isRTL ? "ابحث في الروابط…" : "Rechercher une institution…"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-10 ${isRTL ? "pr-10 text-right" : "pl-10"}`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Category filter chips — compact, no icons inside */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                activeCategory === null
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/30"
              } ${isRTL ? "font-almarai" : ""}`}
            >
              {isRTL ? "الكل" : "Tous"} <span className="opacity-60">({totalLinks})</span>
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(isSelected ? null : cat.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                    isSelected
                      ? `${cat.color} text-white border-transparent`
                      : `bg-background text-foreground border-border hover:border-foreground/30`
                  } ${isRTL ? "font-almarai" : ""}`}
                >
                  {isRTL ? cat.titleAr : cat.titleFr}{" "}
                  <span className={isSelected ? "opacity-80" : "opacity-60"}>({cat.links.length})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg">
            {isRTL ? "لم نعثر على روابط تطابق بحثك." : "Aucune institution ne correspond à votre recherche."}
          </div>
        )}

        {/* Sections — clean list grouped by category */}
        <div className="space-y-6">
          {filtered.map((category) => {
            const Icon = category.icon;
            const isCollapsed = collapsed[category.id];
            return (
              <section key={category.id} dir={isRTL ? "rtl" : "ltr"}>
                {/* Section header — button to collapse/expand */}
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [category.id]: !c[category.id] }))}
                  className={`w-full flex items-center gap-3 mb-2 group ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className={`w-8 h-8 ${category.color} rounded-md flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h2 className={`text-base md:text-lg font-bold flex-1 ${isRTL ? "font-almarai text-right" : ""}`}>
                    {isRTL ? category.titleAr : category.titleFr}
                  </h2>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {category.links.length}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground flex-shrink-0 ${
                      isCollapsed ? (isRTL ? "rotate-90" : "-rotate-90") : ""
                    }`}
                  />
                </button>

                {/* Section body — list rows, no cards */}
                {!isCollapsed && (
                  <div className="border rounded-lg overflow-hidden divide-y">
                    {category.links.map((link, idx) => {
                      const LinkIcon = link.icon;
                      const name = isRTL ? link.nameAr : link.nameFr;
                      const desc = isRTL ? link.descAr : link.descFr;
                      return (
                        <div
                          key={idx}
                          className={`group flex items-start gap-3 p-3 md:p-4 hover:bg-muted/40 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 ${category.bgAccent} ${category.textColor} rounded-md flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <LinkIcon className="h-4 w-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center gap-2 flex-wrap mb-0.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <h3 className={`text-sm md:text-base font-semibold leading-tight ${isRTL ? "font-almarai" : ""}`}>
                                {name}
                              </h3>
                              {link.official && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${category.textColor} ${isRTL ? "font-almarai" : ""}`}>
                                  <CheckCircle2 className="h-3 w-3" />
                                  {isRTL ? "رسمي" : "Officiel"}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs md:text-sm text-muted-foreground leading-relaxed ${isRTL ? "font-almarai" : ""}`}>
                              {desc}
                            </p>

                            {/* Phone — inline below desc when present */}
                            {link.phone && (
                              <a
                                href={`tel:${link.phone.replace(/\s/g, "")}`}
                                className={`inline-flex items-center gap-1.5 text-xs ${category.textColor} hover:underline mt-1.5`}
                                dir="ltr"
                              >
                                <Phone className="h-3 w-3" />
                                <span className="font-mono">{link.phone}</span>
                              </a>
                            )}
                          </div>

                          {/* Visit action */}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 self-center"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`gap-1.5 ${category.textColor} hover:bg-background hover:${category.textColor} ${isRTL ? "font-almarai" : ""}`}
                            >
                              <span className="hidden sm:inline">
                                {isRTL ? "زيارة" : "Visiter"}
                              </span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Bottom CTA — compact */}
        <div className="mt-10 p-4 md:p-5 bg-muted/30 border rounded-lg flex flex-col sm:flex-row items-center gap-3" dir={isRTL ? "rtl" : "ltr"}>
          <HeartHandshake className={`h-6 w-6 text-primary flex-shrink-0 ${isRTL ? "ml-2" : "mr-2"}`} />
          <p className={`text-sm flex-1 text-center sm:text-start ${isRTL ? "font-almarai text-right" : ""}`}>
            {isRTL
              ? "لم تجد جوابا على سؤالك ؟ اسأل المساعد الافتراضي."
              : "Vous ne trouvez pas la réponse à votre question ? Posez-la à l'assistant virtuel."}
          </p>
          <Button asChild variant="default" size="sm" className={`flex-shrink-0 ${isRTL ? "font-almarai" : ""}`}>
            <a href="/acces-aux-droits/assistant-virtuel">
              {isRTL ? "افتح المساعد" : "Ouvrir l'assistant"}
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default LiensUtilesContent;
