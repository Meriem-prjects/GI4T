import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type ItemKind = "useful_links" | "practical_resources" | "practical_guides";

interface BaseItem {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  category?: string;
  category_ar?: string;
  display_order: number;
  is_published: boolean;
}

interface UsefulLinkItem extends BaseItem {
  url: string;
}

interface PracticalResourceItem extends BaseItem {
  file_url?: string;
  file_size?: number;
  file_type?: string;
}

const formatFileSize = (bytes: number, isRTL: boolean) => {
  const mb = bytes / (1024 * 1024);
  const value = mb >= 1 ? mb.toFixed(1) : String(Math.max(1, Math.round(bytes / 1024)));
  const unit = mb >= 1 ? (isRTL ? "م.ب" : "Mo") : isRTL ? "ك.ب" : "Ko";
  return `${value.replace(".", ",")} ${unit}`;
};

// "application/pdf" → "PDF"; falls back to the URL extension. Long MIME
// subtypes (e.g. vnd.openxmlformats-…) are not worth showing.
const fileTypeLabel = (fileType?: string, url?: string) => {
  const ext = (fileType?.split("/").pop() || url?.split("?")[0].split(".").pop() || "").toUpperCase();
  return ext.length <= 4 ? ext : "";
};

interface PracticalGuideItem extends BaseItem {
  estimated_time?: string;
  difficulty?: string;
}

type AnyItem = UsefulLinkItem | PracticalResourceItem | PracticalGuideItem;

interface AdminManagedSectionProps {
  kind: ItemKind;
  /** Section heading shown above the cards. */
  title: { fr: string; ar: string };
  /** Shown instead of nothing when there are no published items. */
  emptyMessage?: { fr: string; ar: string };
}

/**
 * Renders a list of admin-curated items at the top of an Accès-aux-Droits
 * public page. When the DB has no entries yet, the component renders
 * nothing — so the legacy hardcoded sections below are the only thing
 * the user sees. As soon as an admin adds entries via the back-office,
 * they appear here automatically.
 */
const AdminManagedSection = ({ kind, title, emptyMessage }: AdminManagedSectionProps) => {
  const { isRTL } = useLanguage();
  const [items, setItems] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from(kind)
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error(`Failed to load ${kind}:`, error);
        setItems([]);
      } else {
        setItems((data as AnyItem[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (loading) {
    return (
      <Card className="p-6 mb-8 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Card>
    );
  }
  if (items.length === 0) {
    if (!emptyMessage) return null;
    return (
      <Card className="p-10 mb-10 text-center text-muted-foreground" dir={isRTL ? "rtl" : "ltr"}>
        {isRTL ? emptyMessage.ar : emptyMessage.fr}
      </Card>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4" dir={isRTL ? "rtl" : "ltr"}>
        {isRTL ? title.ar : title.fr}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const displayTitle = isRTL && item.title_ar ? item.title_ar : item.title;
          const displayDesc = isRTL && item.description_ar ? item.description_ar : item.description;
          const displayCat = isRTL && item.category_ar ? item.category_ar : item.category;
          return (
            <Card key={item.id} className="p-4 flex flex-col gap-2 hover:shadow-md transition-shadow" dir={isRTL ? "rtl" : "ltr"}>
              {displayCat && (
                <Badge variant="secondary" className="self-start text-xs">
                  {displayCat}
                </Badge>
              )}
              <h3 className="font-semibold text-base line-clamp-2">{displayTitle}</h3>
              {displayDesc && (
                <p className="text-sm text-muted-foreground line-clamp-3">{displayDesc}</p>
              )}
              {/* Specific actions per kind */}
              {kind === "useful_links" && (
                <Button asChild variant="outline" size="sm" className="mt-auto self-start">
                  <a href={(item as UsefulLinkItem).url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    {isRTL ? "زيارة الموقع" : "Visiter le site"}
                  </a>
                </Button>
              )}
              {kind === "practical_resources" && (item as PracticalResourceItem).file_url && (() => {
                const resource = item as PracticalResourceItem;
                const typeLabel = fileTypeLabel(resource.file_type, resource.file_url);
                return (
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={resource.file_url!} target="_blank" rel="noreferrer">
                        <Download className={`h-3.5 w-3.5 ${isRTL ? "ml-1.5" : "mr-1.5"}`} />
                        {isRTL ? "تحميل" : "Télécharger"}
                      </a>
                    </Button>
                    {(typeLabel || resource.file_size) && (
                      <span className="text-xs text-muted-foreground">
                        {[typeLabel, resource.file_size ? formatFileSize(resource.file_size, isRTL) : ""]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                );
              })()}
              {kind === "practical_guides" && (
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {(item as PracticalGuideItem).estimated_time && (
                      <span>⏱ {(item as PracticalGuideItem).estimated_time}</span>
                    )}
                    {(item as PracticalGuideItem).difficulty && (
                      <Badge variant="outline" className="text-[10px]">
                        {(item as PracticalGuideItem).difficulty}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    {isRTL ? "اقرأ" : "Lire"}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default AdminManagedSection;
