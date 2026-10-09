import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import OdfBreadcrumb from "@/components/observatoire/OdfBreadcrumb";
import OdfDocumentList from "@/components/observatoire/OdfDocumentList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOdfFacets } from "@/hooks/useOdf";
import { createCategorySlug } from "@/lib/urlUtils";
import { ODF_HUBS, odfType, type Lang, type OdfTypeKey } from "@/lib/odf";

// Liste d'un type de document de l'ODF (fiches, analyses, blogs, recueils…).
export default function OdfTypeListPage({ typeKey }: { typeKey: OdfTypeKey }) {
  const { language } = useLanguage();
  const lang = (language === "ar" ? "ar" : "fr") as Lang;
  const type = odfType(typeKey);
  const hub = type.hub ? ODF_HUBS[type.hub] : undefined;
  const Icon = type.icon;
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [params, setParams] = useSearchParams();
  const facets = useOdfFacets({ types: [typeKey] });

  useEffect(() => {
    document.title = `${type.label[lang]} | ODF`;
  }, [type, lang]);

  // Anciennes adresses /observatoire/analyses-juridiques/<droit> : filtre par droit
  useEffect(() => {
    if (!categorySlug || params.get("droit") || !facets.data) return;
    const cat = facets.data.categories.find(
      (c) => createCategorySlug(c.name) === categorySlug || createCategorySlug(c.name_ar ?? "") === categorySlug,
    );
    if (cat) {
      const p = new URLSearchParams(params);
      p.set("droit", cat.id);
      setParams(p, { replace: true });
    }
  }, [categorySlug, facets.data, params, setParams]);

  return (
    <div className={lang === "ar" ? "font-almarai" : ""} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6">
        <OdfBreadcrumb
          lang={lang}
          items={[...(hub ? [{ label: hub.label[lang], to: hub.path }] : []), { label: type.label[lang] }]}
        />
        <header className="mb-8 flex items-start gap-4">
          <span
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow"
            style={{ backgroundColor: type.color }}
          >
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{type.label[lang]}</h1>
            <p className="mt-1 max-w-3xl text-muted-foreground">{type.description[lang]}</p>
          </div>
        </header>
        <OdfDocumentList
          types={[typeKey]}
          lang={lang}
          layout={type.layout}
          sorts={type.sorts}
          filters={type.filters}
        />
      </div>
    </div>
  );
}
