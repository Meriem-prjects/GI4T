import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, Library, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CommentSection } from "@/components/CommentSection";
import DocumentBookViewer from "@/components/observatoire/DocumentBookViewer";
import OdfBreadcrumb from "@/components/observatoire/OdfBreadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOdfDocuments } from "@/hooks/useOdf";
import { createCategorySlug } from "@/lib/urlUtils";
import { renderFormattedContent } from "@/utils/contentFormatter";
import { cn } from "@/lib/utils";
import {
  ODF_HUBS,
  docRights,
  documentPath,
  formatOdfDate,
  odfDocDate,
  odfTypeByDbName,
  pick,
  pickList,
  textFor,
  type Lang,
  type OdfDoc,
} from "@/lib/odf";

const L = {
  fr: {
    infos: "Informations",
    type: "Type",
    validated: "Date de validation",
    year: "Année",
    court: "Juridiction",
    decision: "Décision",
    parties: "Parties",
    reference: "Référence",
    author: "Auteur",
    keywords: "Mots-clés",
    rights: "Droits fondamentaux",
    pages: (n: number) => `${n} pages`,
    fullText: "Texte intégral",
    fullTextHint: "Le texte du document, pour la lecture d'écran et le copier-coller.",
    sameType: "Dans la même rubrique",
    cited: "Fiches citées dans ce recueil",
    recueil: (y: number) => `Recueil ${y}`,
    recueilHint: "Toutes les décisions de la même année",
    decisionOf: (n: string, d: string) => (d ? `n° ${n} du ${d}` : `n° ${n}`),
    versus: " c/ ",
  },
  ar: {
    infos: "معلومات",
    type: "النوع",
    validated: "تاريخ المصادقة",
    year: "السنة",
    court: "المحكمة",
    decision: "القرار",
    parties: "الأطراف",
    reference: "المرجع",
    author: "المؤلف",
    keywords: "الكلمات المفاتيح",
    rights: "الحقوق الأساسية",
    pages: (n: number) => (n === 1 ? "صفحة واحدة" : n === 2 ? "صفحتان" : n <= 10 ? `${n} صفحات` : `${n} صفحة`),
    fullText: "النص الكامل",
    fullTextHint: "نصّ الوثيقة، للقراءة الآلية والنسخ.",
    sameType: "في نفس الركن",
    cited: "الجذاذات المذكورة في هذه المجموعة",
    recueil: (y: number) => `مجموعة ${y}`,
    recueilHint: "كلّ قرارات السنة نفسها",
    decisionOf: (n: string, d: string) => (d ? `عدد ${n} بتاريخ ${d}` : `عدد ${n}`),
    versus: " / ",
  },
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-2.5 border-b last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default function OdfBookDocument({ doc }: { doc: OdfDoc }) {
  const { language } = useLanguage();
  const lang = (language === "ar" ? "ar" : "fr") as Lang;
  const t = L[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const type = odfTypeByDbName(doc.document_types?.name);
  const hub = type ? (type.hub ? ODF_HUBS[type.hub] : undefined) : ODF_HUBS.analyses;
  const title = pick(lang, doc.title, doc.title_ar);
  const subtitle = pick(lang, doc.subtitle, doc.subtitle_ar);
  const author = pick(lang, doc.author, doc.author_ar);
  const keywords = pickList(lang, doc.keywords, doc.keywords_ar);
  const rights = docRights(doc);
  const court = [pick(lang, doc.court, doc.court_ar), pick(lang, doc.court_level, doc.court_level_ar)].filter(Boolean).join(lang === "ar" ? "، " : ", ");
  const plaintiff = pick(lang, doc.plaintiff, doc.plaintiff_ar);
  const defendant = pick(lang, doc.defendant, doc.defendant_ar);
  const reference = pickList(lang, doc.legal_references, doc.legal_references_ar)[0];
  const decisionDate = formatOdfDate(doc.dates?.[0], lang);
  const [textOpen, setTextOpen] = useState(false);

  useEffect(() => {
    const previous = window.document.title;
    window.document.title = `${title}${doc.case_number ? ` — n° ${doc.case_number}` : ""} | ODF`;
    return () => {
      window.document.title = previous;
    };
  }, [title, doc.case_number]);

  const sameType = useOdfDocuments(
    { types: type ? [type.key] : [], sort: type?.sorts[0], pageSize: 4, excludeId: doc.id, categoryId: type?.key === "fiches" ? rights[0]?.id : undefined },
    !!type,
  );
  const refs = doc.book?.refs ?? [];
  const cited = useOdfDocuments({ importKeys: refs, pageSize: 80, sort: "number" }, type?.key === "recueils" && refs.length > 0);
  const recueil = useOdfDocuments({ importKeys: [`recueils/${doc.year}`], pageSize: 1 }, type?.key === "fiches" && !!doc.year);
  const recueilDoc = recueil.data?.items[0];

  const text = textFor(doc, lang);

  return (
    <div className={cn("container mx-auto px-4 py-6", lang === "ar" && "font-almarai")} dir={dir}>
      <OdfBreadcrumb
        lang={lang}
        items={[
          ...(hub ? [{ label: hub.label[lang], to: hub.path }] : []),
          ...(type ? [{ label: type.label[lang], to: type.path }] : []),
          { label: title },
        ]}
      />

      {/* En-tête */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {type && (
            <Link to={type.path}>
              <Badge style={{ backgroundColor: type.color }} className="text-white hover:opacity-90">
                {type.singular[lang]}
              </Badge>
            </Link>
          )}
          {rights.map((r) => (
            <Link key={r.id} to={`/observatoire/droits-fondamentaux/${createCategorySlug(r.name)}`}>
              <Badge variant="outline" className="hover:bg-muted">
                {pick(lang, r.name, r.name_ar)}
              </Badge>
            </Link>
          ))}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold leading-snug">{title}</h1>
        {subtitle && <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>}
        <p className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          {author && <span>{author}</span>}
          {odfDocDate(doc, lang) && <span>{odfDocDate(doc, lang)}</span>}
          {doc.book?.[lang]?.pages && <span>{t.pages(doc.book[lang]!.pages)}</span>}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {doc.book && <DocumentBookViewer book={doc.book} title={title} uiLang={lang} />}

          {text && (
            <Collapsible open={textOpen} onOpenChange={setTextOpen} className="rounded-xl border bg-card">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start">
                <span>
                  <span className="block font-semibold">{t.fullText}</span>
                  <span className="block text-xs text-muted-foreground">{t.fullTextHint}</span>
                </span>
                <ChevronDown className={cn("h-5 w-5 transition-transform", textOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div
                  className="prose prose-sm max-w-none px-4 pb-6 dark:prose-invert"
                  dir={dir}
                  dangerouslySetInnerHTML={{ __html: renderFormattedContent(text) }}
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          <CommentSection documentId={doc.id} documentTitle={title} />
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t.infos}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                {type && <Row label={t.type}>{type.singular[lang]}</Row>}
                {doc.validation_date && <Row label={t.validated}>{formatOdfDate(doc.validation_date, lang)}</Row>}
                {!doc.validation_date && doc.year && <Row label={t.year}>{doc.year}</Row>}
                {court && <Row label={t.court}>{court}</Row>}
                {doc.case_number && <Row label={t.decision}>{t.decisionOf(doc.case_number, decisionDate)}</Row>}
                {(plaintiff || defendant) && (
                  <Row label={t.parties}>
                    {plaintiff}
                    {plaintiff && defendant ? t.versus : ""}
                    {defendant}
                  </Row>
                )}
                {reference && <Row label={t.reference}>{reference}</Row>}
                {author && <Row label={t.author}>{author}</Row>}
                {keywords.length > 0 && (
                  <Row label={t.keywords}>
                    <span className="flex flex-wrap gap-1.5">
                      {keywords.map((k) => (
                        <Badge key={k} variant="secondary" className="font-normal">
                          {k}
                        </Badge>
                      ))}
                    </span>
                  </Row>
                )}
              </dl>
            </CardContent>
          </Card>

          {recueilDoc && (
            <Link to={documentPath(recueilDoc.id)} className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 transition">
              <Library className="h-8 w-8 text-teal-700 flex-shrink-0" />
              <span>
                <span className="block font-semibold">{t.recueil(doc.year!)}</span>
                <span className="block text-xs text-muted-foreground">{t.recueilHint}</span>
              </span>
            </Link>
          )}

          {type?.key === "recueils" && (cited.data?.items.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.cited}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cited.data!.items.map((d) => (
                    <li key={d.id}>
                      <Link to={documentPath(d.id)} className="group flex gap-2 text-sm">
                        <Scale className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                        <span>
                          <span className="block group-hover:underline">{pick(lang, d.title, d.title_ar)}</span>
                          <span className="block text-xs text-muted-foreground">{pick(lang, d.subtitle, d.subtitle_ar)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(sameType.data?.items.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.sameType}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {sameType.data!.items.map((d) => (
                    <li key={d.id}>
                      <Link to={documentPath(d.id)} className="group flex gap-2 text-sm">
                        <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <span>
                          <span className="block font-medium group-hover:underline line-clamp-2">{pick(lang, d.title, d.title_ar)}</span>
                          <span className="block text-xs text-muted-foreground line-clamp-1">
                            {pick(lang, d.subtitle, d.subtitle_ar) || pick(lang, d.author, d.author_ar)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
