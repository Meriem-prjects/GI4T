import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Download, ExternalLink, Share2, Printer, ArrowLeft, Calendar, MapPin, User, Building2, Scale, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { createSlug, createCategorySlug, createDocumentPath } from "@/lib/urlUtils";
import { renderFormattedContent } from "@/utils/contentFormatter";

interface Document {
  id: string;
  title: string;
  title_ar: string;
  summary: string;
  summary_ar: string;
  content: string;
  translated_content: string;
  author: string;
  author_ar: string;
  court: string;
  court_ar: string;
  court_level: string;
  court_level_ar: string;
  court_category: string;
  court_category_ar: string;
  court_category_type: string;
  court_category_type_ar: string;
  document_type: string;
  created_at: string;
  status: string;
  file_url: string;
  pdf_url: string;
  page_count: number;
  keywords: string[];
  keywords_ar: string[];
  legal_domains: string[];
  year: number;
  language: string;
  category_id: string;
  case_number: string;
  jurisdiction: string;
  plaintiff?: string;
  plaintiff_ar?: string;
  defendant?: string;
  defendant_ar?: string;
}

interface Category {
  id: string;
  name: string;
  name_ar: string;
  color: string;
}

interface SuggestedDocument {
  id: string;
  title: string;
  title_ar: string;
  summary: string;
  document_type: string;
  created_at: string;
  page_count: number;
  categories?: {
    name: string;
    name_ar: string;
  };
}

const DocumentDetail = () => {
  const { categorySlug, documentSlug } = useParams<{ categorySlug: string; documentSlug: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [suggestedDocuments, setSuggestedDocuments] = useState<SuggestedDocument[]>([]);
  const [relatedDocuments, setRelatedDocuments] = useState<SuggestedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!categorySlug || !documentSlug) {
        console.log('Missing categorySlug or documentSlug:', { categorySlug, documentSlug });
        return;
      }

      console.log('Attempting to fetch document with:', { categorySlug, documentSlug });

      try {
        // First, find the category by slug
        const { data: categories, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, name_ar, color');

        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
          return;
        }

        console.log('Available categories:', categories);

        const matchingCategory = categories?.find(cat => {
          const slugName = createSlug(cat.name || '');
          const slugNameAr = createSlug(cat.name_ar || '');
          const match = slugName === categorySlug || slugNameAr === categorySlug || cat.id === categorySlug;
          console.log('Checking category:', cat.name, 'slugs:', { slugName, slugNameAr }, 'match:', match);
          return match;
        });

        if (!matchingCategory) {
          console.error('Category not found for slug:', categorySlug);
          setLoading(false);
          return;
        }

        console.log('Found matching category:', matchingCategory);

        // Then, find the document by title slug and category
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('category_id', matchingCategory.id);

        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
          return;
        }

        console.log('Available documents in category:', documents);

        const matchingDocument = documents?.find(doc => {
          const docSlug = createSlug(doc.title);
          const match = docSlug === documentSlug;
          console.log('Checking document:', doc.title, 'slug:', docSlug, 'match:', match);
          return match;
        });

        if (!matchingDocument) {
          console.error('Document not found for slug:', documentSlug);
          setLoading(false);
          return;
        }

        console.log('Found matching document:', matchingDocument);

        setDocument(matchingDocument);
        setCategory(matchingCategory);

        // Fetch suggested documents (same category, excluding current)
        const { data: suggestedData } = await supabase
          .from('documents')
          .select(`
            id, title, title_ar, summary, document_type, created_at, page_count,
            categories (
              name, name_ar
            )
          `)
          .eq('category_id', matchingCategory.id)
          .neq('id', matchingDocument.id)
          .in('status', ['published', 'processed'])
          .limit(5);
        
        setSuggestedDocuments(suggestedData || []);

        // Fetch related documents (similar keywords/legal domains)
        if (matchingDocument.keywords?.length > 0 || matchingDocument.legal_domains?.length > 0) {
          let query = supabase
            .from('documents')
            .select(`
              id, title, title_ar, summary, document_type, created_at, page_count,
              categories (
                name, name_ar
              )
            `)
            .neq('id', matchingDocument.id)
            .in('status', ['published', 'processed']);

          if (matchingDocument.keywords?.length > 0) {
            query = query.overlaps('keywords', matchingDocument.keywords);
          }

          const { data: relatedData } = await query.limit(5);
          setRelatedDocuments(relatedData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [categorySlug, documentSlug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'document.pdf';
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback to direct link
      window.open(url, '_blank');
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-6 w-96 mb-6" />
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Document introuvable</h1>
          <p className="text-muted-foreground mb-6">
            Le document que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link to="/observatoire/droits-fondamentaux">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux droits fondamentaux
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use translated content by default, original if showOriginal is true
  const displayContent = showOriginal ? document.content : (document.translated_content || document.content);
  const formattedContent = renderFormattedContent(displayContent);
  
  // Detect if we're displaying Arabic content
  const isArabicContent = showOriginal && document.language === 'ar';
  
  // Use Arabic fields when displaying Arabic content
  const currentTitle = isArabicContent && document.title_ar ? document.title_ar : document.title;
  const currentSummary = isArabicContent && document.summary_ar ? document.summary_ar : document.summary;
  const currentAuthor = isArabicContent && document.author_ar ? document.author_ar : document.author;
  const currentCourt = isArabicContent && document.court_ar ? document.court_ar : document.court;
  
  // Format court level: replace underscores with spaces and translate for Arabic
  const formatCourtLevel = (level: string | null) => {
    if (!level) return null;
    
    const formatted = level.replace(/_/g, ' ');
    
    if (isArabicContent) {
      // Translate common court levels to Arabic
      const translations: { [key: string]: string } = {
        'premiere instance': 'الدرجة الأولى',
        'première instance': 'الدرجة الأولى',
        'appel': 'الاستئناف',
        'cassation': 'التعقيب',
        'cour suprême': 'المحكمة العليا',
        'cour supreme': 'المحكمة العليا'
      };
      
      const lowerCaseFormatted = formatted.toLowerCase();
      return translations[lowerCaseFormatted] || formatted;
    }
    
    return formatted;
  };
  
  const currentCourtLevel = formatCourtLevel(isArabicContent && document.court_level_ar ? document.court_level_ar : document.court_level);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/observatoire">Observatoire</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/observatoire/droits-fondamentaux">Droits fondamentaux</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/observatoire/droits-fondamentaux/${createCategorySlug(category.name)}`}>{category.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">{currentTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Document Header */}
          <div className={`text-center mb-12 ${isArabicContent ? 'text-right' : ''}`}>
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${isArabicContent ? 'dir-rtl text-right' : ''}`}>
              {currentTitle}
            </h1>
            
            {currentSummary && (
              <p className={`text-lg text-muted-foreground mb-8 max-w-4xl mx-auto ${isArabicContent ? 'dir-rtl text-right' : ''}`}>
                {currentSummary}
              </p>
            )}

            {/* Metadata */}
            <div className={`bg-muted/30 rounded-lg p-6 mb-8 ${isArabicContent ? 'dir-rtl text-right' : ''}`}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {document.created_at && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'تاريخ النشر:' : 'Date de publication:'}</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  )}
                  
                  {category && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <Scale className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'فئة الحق الأساسي:' : 'Catégorie de droit fondamental:'}</span>
                      <Badge variant="secondary" style={{ backgroundColor: category.color + '20', color: category.color }}>
                        {isArabicContent && category.name_ar ? category.name_ar : category.name}
                      </Badge>
                    </div>
                  )}

                  {currentAuthor && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'المؤلف:' : 'Auteur:'}</span>
                      <span>{currentAuthor}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {currentCourt && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'نوع المحكمة:' : 'Type de tribunal:'}</span>
                      <span>{currentCourt}</span>
                    </div>
                  )}

                  {(document.court_category_type || document.court_category_type_ar) && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <Scale className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'فئة المحكمة:' : 'Catégorie du tribunal:'}</span>
                      <span>{capitalizeFirstLetter((isArabicContent ? document.court_category_type_ar : document.court_category_type) || (isArabicContent ? "غير محدد" : "Non spécifié"))}</span>
                    </div>
                  )}

                  {currentCourtLevel && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'مستوى القضاء:' : 'Niveau de juridiction:'}</span>
                      <span>{currentCourtLevel}</span>
                    </div>
                  )}

                  {document.case_number && (
                    <div className={`flex items-center gap-3 ${isArabicContent ? 'justify-end flex-row-reverse' : 'justify-center md:justify-start'}`}>
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{isArabicContent ? 'رقم القضية:' : 'Numéro d\'affaire:'}</span>
                      <span>{document.case_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parties Section - 4 lines, 2 columns */}
              {(document.plaintiff || document.defendant || document.plaintiff_ar || document.defendant_ar) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className={`space-y-2 ${isArabicContent ? 'text-right' : ''}`}>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {isArabicContent ? 'المدعي' : 'Demandeur / Plaignant'}
                      </h4>
                      <div className="space-y-1">
                        {(isArabicContent ? document.plaintiff_ar : document.plaintiff) && (
                          <div className="text-sm">{isArabicContent ? document.plaintiff_ar : document.plaintiff}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`space-y-2 ${isArabicContent ? 'text-right' : ''}`}>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {isArabicContent ? 'المدعى عليه' : 'Défendeur'}
                      </h4>
                      <div className="space-y-1">
                        {(isArabicContent ? document.defendant_ar : document.defendant) && (
                          <div className="text-sm">{isArabicContent ? document.defendant_ar : document.defendant}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {/* Toggle between original and translated */}
              {document.translated_content && document.translated_content !== document.content && (
                <Button 
                  variant={showOriginal ? "default" : "outline"}
                  onClick={() => setShowOriginal(!showOriginal)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showOriginal ? "Version traduite" : "Version originale"}
                </Button>
              )}
              
              {document.file_url && (
                <Button onClick={() => handleDownload(document.file_url, `${document.title}.pdf`)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le document original
                </Button>
              )}
              
              {document.pdf_url && (
                <Button variant="outline" onClick={() => handleDownload(document.pdf_url, `${document.title}_pdf.pdf`)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              )}

              <Button variant="ghost" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>

              <Button variant="ghost" onClick={() => navigator.share?.({ 
                title: currentTitle, 
                url: window.location.href 
              }).catch(() => navigator.clipboard.writeText(window.location.href))}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>

            {/* Content Type Indicator */}
            {document.translated_content && document.translated_content !== document.content && (
              <div className="text-center mb-6">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {showOriginal ? "Version originale" : "Version traduite par l'IA"}
                </Badge>
              </div>
            )}
          </div>

          {/* Document Content */}
          <div className={`max-w-none ${isArabicContent ? 'dir-rtl' : ''}`}>
            {formattedContent ? (
              <div 
                className={`document-content space-y-6 ${isArabicContent ? 'text-right' : ''}`}
                dir={isArabicContent ? 'rtl' : 'ltr'}
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabicContent ? 'محتوى الوثيقة غير متاح للعرض عبر الإنترنت.' : 'Le contenu du document n\'est pas disponible pour l\'affichage en ligne.'}
                </p>
                {document.file_url && (
                  <Button className="mt-4" asChild>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      {isArabicContent ? 'استشارة الوثيقة كاملة' : 'Consulter le document complet'}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Keywords */}
          {((isArabicContent ? document.keywords_ar : document.keywords) || document.keywords)?.length > 0 && (
            <div className={`mt-12 pt-6 border-t ${isArabicContent ? 'text-right' : ''}`}>
              <h3 className="text-lg font-semibold mb-4">{isArabicContent ? 'الكلمات المفتاحية' : 'Mots-clés'}</h3>
              <div className={`flex flex-wrap gap-2 ${isArabicContent ? 'justify-end' : ''}`}>
                {(isArabicContent && document.keywords_ar ? document.keywords_ar : document.keywords || []).map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - French (right side) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Documents à consulter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Documents à consulter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="border-b pb-3 last:border-b-0">
                    <Link 
                      to={doc.categories ? createDocumentPath(doc.categories.name, doc.title) : '#'}
                      className="block hover:text-primary transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {doc.document_type} • {formatDate(doc.created_at)}
                      </p>
                    </Link>
                  </div>
                ))}
                {relatedDocuments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun document connexe</p>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="border-b pb-3 last:border-b-0">
                    <Link 
                      to={doc.categories ? createDocumentPath(doc.categories.name, doc.title) : '#'}
                      className="block hover:text-primary transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {doc.document_type} • {formatDate(doc.created_at)}
                      </p>
                    </Link>
                  </div>
                ))}
                {suggestedDocuments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune suggestion</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;