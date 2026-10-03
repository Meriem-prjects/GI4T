import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, BookOpen, ChevronRight, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Publication {
  id: string;
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
  typeFr: string;
  typeAr: string;
  pages: number;
  sizeFr: string;
  sizeAr: string;
  date?: string;
  coverUrl: string;
  fileUrl: string;
}

// Publications of the national campaign for access to administrative
// justice. Files are static assets in public/docs/.
const PUBLICATIONS: Publication[] = [
  {
    id: "guide-citoyen",
    titleFr: "Guide du citoyen pour l'accès à la justice administrative",
    titleAr: "دليل المواطن للنفاذ إلى القضاء الإداري",
    descFr:
      "Le guide de la Campagne nationale pour l'accès à la justice administrative, rédigé en arabe tunisien : organisation judiciaire, Tribunal administratif et ses chambres régionales, recours, délais, avocat, aide judiciaire et Médiateur administratif.",
    descAr:
      "دليل الحملة الوطنية للنفاذ إلى القضاء الإداري، بالدارجة التونسية : التنظيم القضائي، المحكمة الإدارية ودوائرها الجهوية، الطعون، الآجال، المحامي، الإعانة القضائية والموفّق الإداري.",
    typeFr: "Guide",
    typeAr: "دليل",
    pages: 48,
    sizeFr: "2,3 Mo",
    sizeAr: "2,3 م.ب",
    date: "2025-05-26",
    coverUrl: "/docs/guide-citoyen-couverture.webp",
    fileUrl: "/docs/guide-citoyen-justice-administrative.pdf",
  },
  {
    id: "planche-refere-suspension",
    titleFr: "BD Taktouk : suspendre un arrêté de démolition",
    titleAr: "قصة مصوّرة مع طقطوق : دعوى في إيقاف تنفيذ قرار هدم",
    descFr:
      "Taktouk explique à Ali qu'un recours en annulation ne suspend pas l'arrêté de démolition pris par le président de la municipalité : il faut déposer auprès du Tribunal administratif une demande distincte de sursis à exécution — avant, avec ou même après le recours en annulation.",
    descAr:
      "طقطوق يشرح لعلي أنّ قضية الإلغاء لا توقف تنفيذ قرار الهدم الصادر عن رئيس البلدية، ويلزم تقديم مطلب مستقل في إيقاف التنفيذ إلى المحكمة الإدارية، قبل دعوى الإلغاء أو معها أو حتى بعدها.",
    typeFr: "Bande dessinée",
    typeAr: "قصة مصوّرة",
    pages: 1,
    sizeFr: "124 Ko",
    sizeAr: "124 ك.ب",
    coverUrl: "/docs/planche-bd-refere-suspension.webp",
    fileUrl: "/docs/planche-bd-refere-suspension.pdf",
  },
];

const PublicationsContent = () => {
  const { isRTL } = useLanguage();

  return (
    <main className={`flex-1 ${isRTL ? "font-almarai" : ""}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span>{isRTL ? "الرئيسية" : "Accueil"}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{isRTL ? "النفاذ إلى الحقوق" : "Accès aux droits"}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{isRTL ? "منشورات" : "Publications"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{isRTL ? "منشورات" : "Publications"}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "منشورات الحملة الوطنية للنفاذ إلى القضاء الإداري، للمطالعة أو التحميل مجانا."
              : "Les publications de la Campagne nationale pour l'accès à la justice administrative, à lire ou télécharger gratuitement."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-fade-in">
          {PUBLICATIONS.map((pub) => (
            <Card key={pub.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                <a
                  href={pub.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:w-48 flex-shrink-0 bg-muted"
                >
                  <img
                    src={pub.coverUrl}
                    alt={isRTL ? pub.titleAr : pub.titleFr}
                    loading="lazy"
                    className="w-full h-64 sm:h-full object-cover object-top"
                  />
                </a>
                <div className="flex-1 p-5 flex flex-col">
                  <Badge variant="outline" className="self-start mb-2 text-xs">
                    {isRTL ? pub.typeAr : pub.typeFr}
                  </Badge>
                  <h2 className="text-lg font-semibold mb-2 leading-snug">{isRTL ? pub.titleAr : pub.titleFr}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{isRTL ? pub.descAr : pub.descFr}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {pub.pages} {isRTL ? "صفحة" : pub.pages > 1 ? "pages" : "page"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Languages className="h-3 w-3" />
                      {isRTL ? "عربية" : "Arabe"}
                    </span>
                    {pub.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(pub.date).toLocaleDateString(isRTL ? "ar-TN" : "fr-FR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    <span>PDF · {isRTL ? pub.sizeAr : pub.sizeFr}</span>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <a href={pub.fileUrl} target="_blank" rel="noreferrer">
                        <BookOpen className={`h-3.5 w-3.5 ${isRTL ? "ml-1.5" : "mr-1.5"}`} />
                        {isRTL ? "قراءة" : "Lire"}
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href={pub.fileUrl} download>
                        <Download className={`h-3.5 w-3.5 ${isRTL ? "ml-1.5" : "mr-1.5"}`} />
                        {isRTL ? "تحميل" : "Télécharger"}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PublicationsContent;
