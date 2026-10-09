import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OdfBreadcrumb from "@/components/observatoire/OdfBreadcrumb";
import OdfDocumentList from "@/components/observatoire/OdfDocumentList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOdfTypeCounts } from "@/hooks/useOdf";
import { ODF_HUBS, docCount, odfType, type Lang, type OdfHubKey } from "@/lib/odf";

const L = {
  fr: { see: "Voir tout", all: "Tous les documents de la rubrique", count: (n: number) => docCount(n, "fr") },
  ar: { see: "عرض الكلّ", all: "كلّ وثائق الركن", count: (n: number) => docCount(n, "ar") },
};

// Page d'une rubrique de l'ODF (« Analyses & Opinions », « Publications ») :
// une carte par type de document, puis tous les documents de la rubrique.
export default function OdfHub({ hub: hubKey }: { hub: OdfHubKey }) {
  const { language } = useLanguage();
  const lang = (language === "ar" ? "ar" : "fr") as Lang;
  const t = L[lang];
  const hub = ODF_HUBS[hubKey];
  const { counts } = useOdfTypeCounts();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.title = `${hub.label[lang]} | ODF`;
  }, [hub, lang]);

  return (
    <div className={lang === "ar" ? "font-almarai" : ""} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6">
        <OdfBreadcrumb lang={lang} items={[{ label: hub.label[lang] }]} />
        <header className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">{hub.label[lang]}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{hub.description[lang]}</p>
        </header>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hub.types.map((key) => {
            const type = odfType(key);
            const Icon = type.icon;
            return (
              <Link
                key={key}
                to={type.path}
                className="group flex flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow"
                    style={{ backgroundColor: type.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  {counts[key] !== undefined && (
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">{t.count(counts[key]!)}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold">{type.label[lang]}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{type.description[lang]}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: type.color }}>
                  {t.see}
                  <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <h2 className="mb-4 text-xl font-bold">{t.all}</h2>
        <OdfDocumentList
          types={hub.types}
          lang={lang}
          layout="grid"
          sorts={["recent", "title"]}
          filters={{ type: true }}
          showType
        />
      </div>
    </div>
  );
}
