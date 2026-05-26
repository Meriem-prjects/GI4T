// Data-graphic visualisations for the 7 chapters of the ODF "Guide du citoyen
// — Accès au juge administratif" (May 2025). Each component is a pure SVG
// reproduction of a key infographic from the PDF, themed to match the
// corresponding guide card's colour palette and aware of RTL.

import {
  Scale,
  Building2,
  Briefcase,
  Clock,
  UserCheck,
  HeartHandshake,
  Users,
  XCircle,
  CheckCircle2,
  FileText,
  Coins,
  Zap,
  HelpCircle,
  Gavel,
  Stamp,
  Languages,
  Eye,
  ArrowRight,
} from "lucide-react";

/* ---------------------------------------------------------------------------
 * 1. Organisation judiciaire — three jurisdictional orders + military
 * ------------------------------------------------------------------------ */
export function OrganisationVisual({ isRTL }: { isRTL: boolean }) {
  const baseOrders = [
    {
      icon: Scale,
      titleFr: "Justice judiciaire",
      titleAr: "القضاء العدلي",
      subFr: "Civil • Pénal • Commercial",
      subAr: "مدني • جزائي • تجاري",
      color: "from-blue-500 to-blue-600",
      ring: "ring-blue-200",
    },
    {
      icon: Gavel,
      titleFr: "Justice administrative",
      titleAr: "القضاء الإداري",
      subFr: "Citoyen ↔ Administration",
      subAr: "المواطن ↔ الإدارة",
      color: "from-rose-500 to-rose-600",
      ring: "ring-rose-200",
    },
    {
      icon: Coins,
      titleFr: "Justice financière",
      titleAr: "القضاء المالي",
      subFr: "Cour des comptes",
      subAr: "محكمة المحاسبات",
      color: "from-emerald-500 to-emerald-600",
      ring: "ring-emerald-200",
    },
  ];
  const orders = isRTL ? [...baseOrders].reverse() : baseOrders;
  return (
    <div className="my-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Crown node */}
      <div className="flex justify-center mb-3">
        <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold inline-flex items-center gap-2">
          <Scale className="h-4 w-4" />
          {isRTL ? "النظام القضائي التونسي" : "Système juridictionnel tunisien"}
        </div>
      </div>
      {/* Connectors */}
      <div className="flex justify-center mb-2">
        <svg width="240" height="20" viewBox="0 0 240 20" aria-hidden>
          <path d="M120 0 L120 10 L20 10 L20 20 M120 10 L120 20 M120 10 L220 10 L220 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300" />
        </svg>
      </div>
      {/* 3 leaves */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {orders.map((o) => {
          const Icon = o.icon;
          return (
            <div key={o.titleFr} className={`rounded-lg p-3 bg-gradient-to-br ${o.color} text-white shadow-sm ring-2 ${o.ring}`}>
              <Icon className="h-5 w-5 mb-1.5" />
              <div className="text-xs font-semibold leading-tight">{isRTL ? o.titleAr : o.titleFr}</div>
              <div className="text-[10px] opacity-90 mt-0.5">{isRTL ? o.subAr : o.subFr}</div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-3">
        {isRTL
          ? "+ المحاكم العسكرية (مختصة بالعسكريين وأمن الدولة)"
          : "+ Juridictions militaires (militaires & sécurité de l'État)"}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 2. Tribunal Administratif — Tunisia with 12 regional chambers
 * ------------------------------------------------------------------------ */
export function TribunalVisual({ isRTL }: { isRTL: boolean }) {
  // Stylised dots placed approximately on a Tunisia silhouette (svg coords).
  const chambers = [
    { x: 200, y: 70, fr: "Bizerte", ar: "بنزرت" },
    { x: 220, y: 100, fr: "Tunis*", ar: "تونس*" },
    { x: 175, y: 105, fr: "Béja", ar: "باجة" },
    { x: 230, y: 140, fr: "Nabeul", ar: "نابل" },
    { x: 145, y: 145, fr: "Le Kef", ar: "الكاف" },
    { x: 215, y: 180, fr: "Sousse", ar: "سوسة" },
    { x: 160, y: 200, fr: "Kairouan", ar: "القيروان" },
    { x: 230, y: 230, fr: "Sfax", ar: "صفاقس" },
    { x: 115, y: 215, fr: "Kasserine", ar: "القصرين" },
    { x: 95, y: 270, fr: "Gafsa", ar: "قفصة" },
    { x: 195, y: 295, fr: "Gabès", ar: "قابس" },
    { x: 175, y: 360, fr: "Médenine", ar: "مدنين" },
  ];

  return (
    <div className="my-4">
      <div className="flex flex-col md:flex-row gap-4 items-center bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4">
        {/* Map */}
        <svg viewBox="50 40 220 360" className="w-40 h-64 md:w-44 md:h-72 flex-shrink-0">
          {/* Tunisia simplified outline */}
          <path
            d="M 200 50 L 235 70 L 240 100 L 245 140 L 240 180 L 250 220 L 240 250 L 220 280 L 210 320 L 190 360 L 170 380 L 145 380 L 150 350 L 140 320 L 110 290 L 90 260 L 95 220 L 110 200 L 100 170 L 115 150 L 140 130 L 145 100 L 170 75 L 200 50 Z"
            fill="#fff1f2"
            stroke="#fb7185"
            strokeWidth="1.5"
          />
          {/* Chamber dots */}
          {chambers.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r="5" fill="#e11d48" stroke="white" strokeWidth="1.5" />
              <circle cx={c.x} cy={c.y} r="9" fill="none" stroke="#fb7185" strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="5;12;5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
        {/* Legend */}
        <div className="flex-1 min-w-0">
          <div className="text-rose-700 font-semibold mb-2 text-sm">
            {isRTL ? "12 دائرة جهوية" : "12 chambres régionales"}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            {chambers.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
                <span className="truncate">{isRTL ? c.ar : c.fr}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            {isRTL ? "* المقر الرئيسي" : "* siège principal"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 3. Quand saisir — 4 recourse types in a 2x2 grid
 * ------------------------------------------------------------------------ */
export function RecoursVisual({ isRTL }: { isRTL: boolean }) {
  const items = [
    { icon: XCircle, fr: "Annulation", ar: "الإلغاء", descFr: "Décision illégale", descAr: "قرار غير شرعي", color: "bg-amber-500" },
    { icon: Coins, fr: "Indemnisation", ar: "التعويض", descFr: "Préjudice subi", descAr: "ضرر متكبد", color: "bg-orange-500" },
    { icon: Zap, fr: "Référé", ar: "الاستعجالي", descFr: "Urgence", descAr: "حالة الاستعجال", color: "bg-red-500" },
    { icon: HelpCircle, fr: "Interprétation", ar: "التفسير", descFr: "Décision ambiguë", descAr: "قرار غامض", color: "bg-yellow-500" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3 my-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.fr} className="bg-white border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 shadow-sm">
            <div className={`w-9 h-9 ${it.color} rounded-md flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-amber-900">{isRTL ? it.ar : it.fr}</div>
              <div className="text-[11px] text-muted-foreground">{isRTL ? it.descAr : it.descFr}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 4. Délais — horizontal timeline 60 jours / 2 mois / 15 ans
 * ------------------------------------------------------------------------ */
export function DelaisVisual({ isRTL }: { isRTL: boolean }) {
  const baseStops = [
    { label: "60j", labelAr: "60 يوم", titleFr: "Annulation", titleAr: "الإلغاء", color: "bg-emerald-500", ring: "ring-emerald-300" },
    { label: "2m", labelAr: "شهرين", titleFr: "Recours préalable", titleAr: "المطلب المسبق", color: "bg-teal-500", ring: "ring-teal-300" },
    { label: "15a", labelAr: "15 سنة", titleFr: "Indemnisation", titleAr: "التعويض", color: "bg-green-600", ring: "ring-green-300" },
  ];
  // In Arabic, the timeline must read right-to-left: 60 يوم on the right,
  // 15 سنة on the left. Reversing the array (instead of relying on CSS dir)
  // keeps the gradient line and ring positions stable across languages.
  const stops = isRTL ? [...baseStops].reverse() : baseStops;
  return (
    <div className="my-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`text-xs font-semibold text-emerald-800 mb-3 flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Clock className="h-3.5 w-3.5" />
        {isRTL ? "الآجال الأساسية" : "Les délais essentiels"}
      </div>
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute left-6 right-6 top-6 h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-green-400" />
        {/* Stops */}
        <div className="grid grid-cols-3 gap-2 relative">
          {stops.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 ${s.color} rounded-full text-white font-bold flex items-center justify-center shadow-md ring-4 ${s.ring} relative z-10 text-sm`}>
                {isRTL ? s.labelAr.split(" ")[0] : s.label}
              </div>
              <div className={`text-[11px] font-medium mt-2 ${isRTL ? "font-almarai" : ""}`}>
                {isRTL ? s.titleAr : s.titleFr}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className={`text-[10px] text-emerald-700 text-center mt-3 italic ${isRTL ? "font-almarai" : ""}`}>
        {isRTL ? "هذه الآجال من النظام العام : القاضي يتثبت فيها تلقائيا" : "Ces délais sont d'ordre public — le juge les vérifie d'office"}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 5. Avocat — comparison 1ère instance vs Appel/Cassation
 * ------------------------------------------------------------------------ */
export function AvocatVisual({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 my-4">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-dashed border-indigo-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-800">
            {isRTL ? "الدرجة الأولى" : "1ère instance"}
          </span>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <UserCheck className="h-8 w-8 text-indigo-600 my-2" />
        <div className="text-sm font-semibold text-indigo-900">
          {isRTL ? "اختياري" : "Facultatif"}
        </div>
        <div className="text-[11px] text-indigo-700 mt-1">
          {isRTL ? "في بعض الطعون البسيطة" : "Sur recours simples"}
        </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold opacity-90">
            {isRTL ? "الاستئناف / التعقيب" : "Appel / Cassation"}
          </span>
          <XCircle className="h-5 w-5 text-red-300" />
        </div>
        <UserCheck className="h-8 w-8 text-white/90 my-2" />
        <div className="text-sm font-semibold">
          {isRTL ? "إجباري" : "Obligatoire"}
        </div>
        <div className="text-[11px] opacity-90 mt-1">
          {isRTL ? "محامي لدى المحكمة الإدارية" : "Avocat près du TA"}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 6. Aide juridictionnelle — what's covered
 * ------------------------------------------------------------------------ */
export function AideVisual({ isRTL }: { isRTL: boolean }) {
  const items = [
    { icon: UserCheck, fr: "Avocat", ar: "محامي" },
    { icon: Stamp, fr: "Huissier", ar: "عدل تنفيذ" },
    { icon: FileText, fr: "Expertise", ar: "خبرة" },
    { icon: Languages, fr: "Traduction", ar: "ترجمة" },
    { icon: Gavel, fr: "Exécution", ar: "تنفيذ" },
  ];
  return (
    <div className="my-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <HeartHandshake className="h-5 w-5 text-purple-600" />
        <span className="text-sm font-semibold text-purple-800">
          {isRTL ? "ما تتكفل به الدولة" : "Pris en charge par l'État"}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.fr} className="flex flex-col items-center text-center bg-white rounded-md p-2 shadow-sm">
              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center mb-1.5">
                <Icon className="h-4 w-4 text-purple-700" />
              </div>
              <span className="text-[10px] font-medium leading-tight">{isRTL ? it.ar : it.fr}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-purple-700 text-center mt-3 italic">
        {isRTL ? "100% مجاني للمتمتعين بالشروط" : "100% gratuit pour les bénéficiaires"}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * 7. Médiateur — process flow Citoyen → Médiateur → Administration → Résolution
 * ------------------------------------------------------------------------ */
export function MediateurVisual({ isRTL }: { isRTL: boolean }) {
  const baseSteps = [
    { icon: Users, fr: "Citoyen", ar: "المواطن", color: "bg-cyan-500" },
    { icon: HeartHandshake, fr: "Médiateur", ar: "الموفق", color: "bg-cyan-700" },
    { icon: Building2, fr: "Administration", ar: "الإدارة", color: "bg-slate-600" },
    { icon: CheckCircle2, fr: "Résolution", ar: "الحل", color: "bg-emerald-500" },
  ];
  // In Arabic the parcours must flow right-to-left: Citoyen on the right,
  // Résolution on the left. Reverse the array and flip arrow direction.
  const steps = isRTL ? [...baseSteps].reverse() : baseSteps;
  return (
    <div className="my-4 bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-lg p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`text-xs font-semibold text-cyan-800 mb-3 flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Eye className="h-3.5 w-3.5" />
        {isRTL ? "مسار الحل الودي" : "Parcours amiable"}
      </div>
      <div className="flex items-center justify-between gap-1">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.fr} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center shadow-md`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className={`text-[10px] font-medium mt-1.5 text-center leading-tight ${isRTL ? "font-almarai" : ""}`}>
                  {isRTL ? s.ar : s.fr}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className={`h-4 w-4 text-cyan-400 flex-shrink-0 -mt-4 ${isRTL ? "rotate-180" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className={`text-[10px] text-cyan-700 text-center mt-3 italic ${isRTL ? "font-almarai" : ""}`}>
        {isRTL ? "مجاني • بدون محامي • قبل المحكمة" : "Gratuit • Sans avocat • Avant le tribunal"}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Index — pick the right visual for a guide id
 * ------------------------------------------------------------------------ */
export const GUIDE_VISUALS: Record<string, (props: { isRTL: boolean }) => JSX.Element> = {
  organisation: OrganisationVisual,
  "tribunal-admin": TribunalVisual,
  "quand-saisir": RecoursVisual,
  delais: DelaisVisual,
  avocat: AvocatVisual,
  "aide-judiciaire": AideVisual,
  mediateur: MediateurVisual,
};
