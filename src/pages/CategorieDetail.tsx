import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Heart, Scale, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import OdfBreadcrumb from "@/components/observatoire/OdfBreadcrumb";
import OdfDocumentList from "@/components/observatoire/OdfDocumentList";
import { api } from "@/api/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOdfFacets } from "@/hooks/useOdf";
import { createCategorySlug } from "@/lib/urlUtils";
import { ODF_HUBS, ODF_TYPES, docCount, pick, type Lang } from "@/lib/odf";

interface Category {
  id: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  color?: string | null;
}

const ALL_TYPES = ODF_TYPES.map((t) => t.key);

function iconFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("santé")) return Heart;
  if (n.includes("justice") || n.includes("défense") || n.includes("procès")) return Scale;
  if (n.includes("enseignement") || n.includes("éducation")) return GraduationCap;
  if (n.includes("protection") || n.includes("sécurité")) return ShieldCheck;
  if (n.includes("syndical") || n.includes("associations") || n.includes("partis")) return Users;
  return BookOpen;
}

// Page d'un droit fondamental : tous les documents de l'ODF qui s'y rattachent
// (fiches, analyses, blogs…), avec filtres et pagination.
const CategorieDetail = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { language } = useLanguage();
  const lang = (language === "ar" ? "ar" : "fr") as Lang;

  const { data: category, isLoading } = useQuery({
    queryKey: ["category-by-slug", categorySlug],
    enabled: !!categorySlug,
    queryFn: async () => {
      const res = await api.get<{ items: Category[] }>("/api/categories", { query: { limit: 500 } });
      return (
        res.items.find(
          (c) =>
            createCategorySlug(c.name) === categorySlug ||
            createCategorySlug(c.name_ar ?? "") === categorySlug ||
            c.id === categorySlug,
        ) ?? null
      );
    },
  });
  const facets = useOdfFacets({ types: ALL_TYPES, categoryId: category?.id }, !!category);
  const name = category ? pick(lang, category.name, category.name_ar) : "";

  useEffect(() => {
    if (name) document.title = `${name} | ODF`;
  }, [name]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-5 w-80 mb-6" />
        <Skeleton className="h-24 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" dir={lang === "ar" ? "rtl" : "ltr"}>
        <h1 className="text-2xl font-bold mb-4">{lang === "ar" ? "الحق غير موجود" : "Droit introuvable"}</h1>
        <Button asChild>
          <Link to={ODF_HUBS.droits.path}>{lang === "ar" ? "العودة إلى الحقوق الأساسية" : "Retour aux droits fondamentaux"}</Link>
        </Button>
      </div>
    );
  }

  const Icon = iconFor(category.name);
  const color = category.color || "#4F46E5";
  const total = facets.data?.total;

  return (
    <div className={lang === "ar" ? "font-almarai" : ""} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6">
        <OdfBreadcrumb lang={lang} items={[{ label: ODF_HUBS.droits.label[lang], to: ODF_HUBS.droits.path }, { label: name }]} />
        <header className="mb-8 flex items-start gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow" style={{ backgroundColor: color }}>
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
            {pick(lang, category.description, category.description_ar) && (
              <p className="mt-1 max-w-3xl text-muted-foreground">{pick(lang, category.description, category.description_ar)}</p>
            )}
            {total !== undefined && (
              <p className="mt-2 text-sm font-medium" style={{ color }}>
                {lang === "ar" ? `${docCount(total, "ar")} في المرصد` : `${docCount(total, "fr")} dans l'Observatoire`}
              </p>
            )}
          </div>
        </header>
        <OdfDocumentList
          types={ALL_TYPES}
          lang={lang}
          layout="list"
          sorts={["year_desc", "recent", "title"]}
          filters={{ type: true, year: true }}
          fixedCategoryId={category.id}
          showType
        />
      </div>
    </div>
  );
};

export default CategorieDetail;
