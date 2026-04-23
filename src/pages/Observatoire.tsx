import { useState } from "react";
import {
  Scale,
  FileText,
  Megaphone,
  ArrowRight,
  Search,
  Database,
  Code,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourtTypes } from "@/hooks/useCourtTypes";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const Observatoire = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtType, setSelectedCourtType] = useState("all");
  const [selectedDocumentType, setSelectedDocumentType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const { data: courtTypes } = useCourtTypes();
  const { data: documentTypes } = useDocumentTypes();

  // Years list
  const { data: years } = useQuery({
    queryKey: ["document-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("year")
        .not("year", "is", null)
        .order("year", { ascending: false });
      if (error) throw error;
      return [...new Set(data.map((d) => d.year))].filter(Boolean) as number[];
    },
  });

  // Real counts per rubrique
  const { data: counts } = useQuery({
    queryKey: ["observatoire-rubriques-counts"],
    queryFn: async () => {
      const [juris, analyses, news] = await Promise.all([
        supabase
          .from("document_types")
          .select("id")
          .eq("name", "Fiche de jurisprudence")
          .maybeSingle()
          .then(async ({ data }) => {
            if (!data) return 0;
            const { count } = await supabase
              .from("documents")
              .select("id", { count: "exact", head: true })
              .eq("document_type_id", data.id)
              .eq("published", true);
            return count ?? 0;
          }),
        supabase
          .from("document_types")
          .select("id")
          .in("name", ["Analyses juridiques", "Commentaires", "Blogs"])
          .then(async ({ data }) => {
            if (!data || data.length === 0) return 0;
            const ids = data.map((t) => t.id);
            const { count } = await supabase
              .from("documents")
              .select("id", { count: "exact", head: true })
              .in("document_type_id", ids)
              .eq("published", true);
            return count ?? 0;
          }),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true)
          .then(({ count }) => count ?? 0),
      ]);
      return { juris, analyses, news };
    },
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.append("query", q);
    if (selectedCourtType !== "all") params.append("court", selectedCourtType);
    if (selectedDocumentType !== "all") params.append("type", selectedDocumentType);
    if (selectedYear !== "all") params.append("year", selectedYear);
    params.append("ai", "true");
    navigate(`/observatoire/search-results?${params.toString()}`);
  };

  const popularTags = isRTL
    ? [
        { label: "حماية البيانات", query: "protection des données" },
        { label: "حرية التعبير", query: "liberté d'expression" },
        { label: "قانون العمل", query: "droit du travail" },
        { label: "مجلس الدولة", query: "Conseil d'État" },
      ]
    : [
        { label: "RGPD", query: "RGPD" },
        { label: "Liberté d'expression", query: "liberté d'expression" },
        { label: "Droit du travail", query: "droit du travail" },
        { label: "Conseil d'État", query: "Conseil d'État" },
      ];

  const rubriques = [
    {
      key: "fundamental",
      title: isRTL ? "الحقوق الأساسية" : "Droits fondamentaux",
      description: isRTL
        ? "استكشف فقه القضاء المتعلق بالحريات المدنية والحياة الخاصة والمساواة أمام القانون."
        : "Explorez la jurisprudence relative aux libertés civiles, à la vie privée et à l'égalité devant la loi.",
      icon: Scale,
      color: "#4F46E5",
      bgTint: "bg-indigo-50",
      cardBg: "bg-indigo-50/60",
      count: counts?.juris ?? 0,
      cta: isRTL ? "تصفح الملفات" : "Accéder aux dossiers",
      link: "/observatoire/droits-fondamentaux",
    },
    {
      key: "analyses",
      title: isRTL ? "تحليلات وآراء" : "Analyses & Opinions",
      description: isRTL
        ? "قراءات خبراء في أبرز التطورات التشريعية والقرارات القضائية المهمة."
        : "Décryptages d'experts sur les évolutions législatives et les décisions marquantes du trimestre.",
      icon: FileText,
      color: "#DC2626",
      bgTint: "bg-red-50",
      cardBg: "bg-red-50/60",
      count: counts?.analyses ?? 0,
      cta: isRTL ? "قراءة التحاليل" : "Lire les analyses",
      link: "/observatoire/analyses-opinions",
    },
    {
      key: "news",
      title: isRTL ? "الأخبار القانونية" : "Actualités Juridiques",
      description: isRTL
        ? "تابعوا مباشرة الإصلاحات الجارية والقرارات الجديدة الصادرة عن المحاكم العليا."
        : "Suivez en temps réel les réformes en cours et les nouveaux arrêts publiés par les hautes juridictions.",
      icon: Megaphone,
      color: "#F59E0B",
      bgTint: "bg-amber-50",
      cardBg: "bg-amber-50/60",
      count: counts?.news ?? 0,
      isNew: true,
      cta: isRTL ? "عرض الأخبار" : "Voir l'actualité",
      link: "/observatoire/actualites",
    },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "font-almarai" : ""}>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50 py-14 md:py-20 border-b border-border/40">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight mb-5 ${
                isRTL ? "arabic-text font-arabic" : ""
              }`}
            >
              {isRTL
                ? "اِطّلعوا بسهولة على قرارات القضاء والتحاليل القانونية والأدلة العملية"
                : "Accédez facilement aux décisions de justice, analyses juridiques et guides pratiques"}
            </h1>
            <p
              className={`text-sm md:text-base text-muted-foreground mb-8 ${
                isRTL ? "arabic-text font-arabic" : ""
              }`}
            >
              {isRTL
                ? "منصة مواطنية مخصصة للشفافية القانونية ولفهم حقوقكم عبر بيانات مهيكلة."
                : "Une plateforme citoyenne dédiée à la transparence juridique et à la compréhension de vos droits à travers des données structurées."}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-5">
              <div className="flex gap-2 p-2 bg-white rounded-xl shadow-sm border border-border/60 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search
                    className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    type="search"
                    placeholder={
                      isRTL
                        ? "ابحثوا عن قرار أو قانون أو تحليل..."
                        : "Rechercher une décision, une loi ou une analyse..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`border-0 shadow-none focus-visible:ring-0 ${
                      isRTL ? "pr-10 text-right" : "pl-10"
                    }`}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
                >
                  {isRTL ? "بحث" : "Rechercher"}
                </Button>
              </div>
            </form>

            {/* Popular tags */}
            <div
              className={`flex flex-wrap items-center justify-center gap-2 mb-6 text-sm ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <span className="text-muted-foreground">
                {isRTL ? "شائع :" : "Populaire :"}
              </span>
              {popularTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag.query);
                    const params = new URLSearchParams();
                    params.append("query", tag.query);
                    params.append("ai", "true");
                    navigate(`/observatoire/search-results?${params.toString()}`);
                  }}
                  className="px-3 py-1 text-xs rounded-full bg-white border border-border hover:bg-muted transition-colors"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={isRTL ? "كل الأنواع" : "Tous les types"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isRTL ? "كل الأنواع" : "Tous les types"}
                  </SelectItem>
                  {documentTypes?.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {isRTL ? dt.name_ar || dt.name : dt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCourtType} onValueChange={setSelectedCourtType}>
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={isRTL ? "كل المحاكم" : "Tous les tribunaux"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isRTL ? "كل المحاكم" : "Tous les tribunaux"}
                  </SelectItem>
                  {courtTypes?.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {isRTL ? ct.name_ar || ct.name : ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={isRTL ? "كل التواريخ" : "Toutes les dates"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isRTL ? "كل التواريخ" : "Toutes les dates"}
                  </SelectItem>
                  {years?.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* NOS RUBRIQUES */}
      <section className="container mx-auto px-4 py-14">
        <div
          className={`flex items-center justify-between mb-8 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2
            className={`text-2xl md:text-3xl font-bold ${
              isRTL ? "arabic-text font-arabic" : ""
            }`}
          >
            {isRTL ? "أقسامنا" : "Nos Rubriques"}
          </h2>
          <button
            onClick={() =>
              navigate(isRTL ? "/observatoire/analyses-opinions" : "/observatoire/analyses-opinions")
            }
            className={`text-sm text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {isRTL ? "عرض كل الكاتالوج" : "Voir tout le catalogue"}
            <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rubriques.map((r) => {
            const Icon = r.icon;
            return (
              <Card
                key={r.key}
                className={`group ${r.cardBg} border border-border/60 rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300`}
                onClick={() => navigate(r.link)}
              >
                <CardContent className="p-6">
                  <div
                    className={`flex items-start justify-between mb-5 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${r.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: r.color }} />
                    </div>
                    {r.isNew ? (
                      <Badge
                        className="font-semibold rounded-full px-3"
                        style={{ backgroundColor: r.color, color: "white" }}
                      >
                        {isRTL ? "جديد" : "New"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="font-semibold rounded-full px-3"
                        style={{
                          backgroundColor: `${r.color}20`,
                          color: r.color,
                        }}
                      >
                        {r.count.toLocaleString()}
                      </Badge>
                    )}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isRTL ? "text-right arabic-text font-arabic" : ""
                    }`}
                  >
                    {r.title}
                  </h3>
                  <p
                    className={`text-sm text-muted-foreground leading-relaxed mb-6 ${
                      isRTL ? "text-right arabic-text font-arabic" : ""
                    }`}
                  >
                    {r.description}
                  </p>

                  <Button
                    variant="outline"
                    className="w-full bg-white border-border/80 font-semibold hover:text-white"
                    style={
                      {
                        "--hover-bg": r.color,
                        color: r.color,
                      } as React.CSSProperties
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = r.color,
                      (e.currentTarget.style.color = "white"))
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white",
                      (e.currentTarget.style.color = r.color))
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(r.link);
                    }}
                  >
                    {r.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PLATEFORME DE DONNÉES OUVERTES */}
      <section className="container mx-auto px-4 pb-14">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden text-white relative">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-8 md:p-12 ${
              isRTL ? "md:grid-flow-col-dense" : ""
            }`}
          >
            {/* Text + buttons */}
            <div className={isRTL ? "md:col-start-2 text-right" : ""}>
              <h3
                className={`text-2xl md:text-3xl font-bold mb-4 leading-tight ${
                  isRTL ? "arabic-text font-arabic" : ""
                }`}
              >
                {isRTL
                  ? "منصة البيانات المفتوحة"
                  : "Plateforme de Données Ouvertes"}
              </h3>
              <p
                className={`text-sm md:text-base text-slate-300 mb-6 leading-relaxed ${
                  isRTL ? "arabic-text font-arabic" : ""
                }`}
              >
                {isRTL
                  ? "نعتقد أن الوصول إلى القانون ركيزة من ركائز الديمقراطية. منصتنا تحوّل الوثائق القانونية المعقدة إلى بيانات متاحة ومرئية لكل المواطنين."
                  : "Nous croyons que l'accès au droit est un pilier de la démocratie. Notre plateforme transforme des documents juridiques complexes en données accessibles et visualisables pour tous les citoyens."}
              </p>
              <div className={`flex flex-wrap gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                  onClick={() => navigate("/information/qui-sommes-nous")}
                >
                  {isRTL ? "اكتشف المشروع" : "Découvrir le projet"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold"
                  onClick={() => window.open("https://github.com/GI4T/just-click-feelinx-connect", "_blank")}
                >
                  <Code className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {isRTL ? "وثائق API" : "API Documentation"}
                </Button>
              </div>
            </div>

            {/* Illustration */}
            <div
              className={`relative flex items-center justify-center ${
                isRTL ? "md:col-start-1" : ""
              }`}
            >
              <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/20 rounded-full blur-3xl" />
                <div className="relative bg-slate-700/40 backdrop-blur rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center justify-center">
                    <Database className="w-16 h-16 text-blue-400 mr-4" strokeWidth={1.5} />
                    <Scale className="w-20 h-20 text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Observatoire;
