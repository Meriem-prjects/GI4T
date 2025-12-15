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
import { normalizeArabicText } from "@/lib/arabicUtils";
import { ArticleStatistics } from "@/components/ArticleStatistics";
import { CommentSection } from "@/components/CommentSection";
import { useDocumentView } from "@/hooks/useDocumentView";
import { useLanguage } from "@/contexts/LanguageContext";
import PageCarousel, { hasPageBreaks } from "@/components/PageCarousel";

interface PageContent {
  pageNumber: number;
  content: string;
  translated_content?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonPageContents = any;

interface Document {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
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
  document_type_id: string;
  document_types?: {
    id: string;
    name: string;
    name_ar: string;
  };
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
  bibliography?: string;
  bibliography_ar?: string;
  page_contents?: JsonPageContents;
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
  const { categorySlug, documentSlug, documentId } = useParams<{ 
    categorySlug?: string; 
    documentSlug?: string; 
    documentId?: string;
  }>();
  const { isRTL, language } = useLanguage();
  const [document, setDocument] = useState<Document | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [suggestedDocuments, setSuggestedDocuments] = useState<SuggestedDocument[]>([]);
  const [relatedDocuments, setRelatedDocuments] = useState<SuggestedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Track document view
  useDocumentView(document?.id);

  useEffect(() => {
    const fetchDocument = async () => {
      // Handle direct document ID route (for analyses juridiques, commentaires, blogs)
      if (documentId) {
        console.log('Fetching document by ID:', documentId);
        
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            categories (
              id,
              name,
              name_ar,
              color
            ),
            document_types (
              id,
              name,
              name_ar
            )
          `)
          .eq('id', documentId)
          .eq('published', true)
          .single();

        if (error) {
          console.error('Error fetching document by ID:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setDocument(data as any);
          if (data.categories) {
            setCategory(data.categories as Category);
          }
          
          // Fetch suggested documents based on document type
          if (data.document_type_id) {
            const { data: suggested } = await supabase
              .from('documents')
              .select(`
                id,
                title,
                title_ar,
                summary,
                document_type,
                created_at,
                page_count,
                categories (name, name_ar)
              `)
              .eq('document_type_id', data.document_type_id)
              .eq('published', true)
              .neq('id', documentId)
              .limit(3);
            
            if (suggested) {
              setSuggestedDocuments(suggested as SuggestedDocument[]);
            }
          }
        }
        
        setLoading(false);
        return;
      }
      
      // Original logic for categorySlug/documentSlug route
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

        // Then, find the document by title slug and category using document_categories junction table
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select(`
            *,
            document_categories!inner(category_id),
            document_types (
              id,
              name,
              name_ar
            )
          `)
          .eq('document_categories.category_id', matchingCategory.id);

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

        // Fetch suggested documents (same category, excluding current) using document_categories junction table
        const { data: suggestedData } = await supabase
          .from('documents')
          .select(`
            id, title, title_ar, summary, document_type, created_at, page_count,
            document_categories!inner(category_id)
          `)
          .eq('document_categories.category_id', matchingCategory.id)
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
  }, [categorySlug, documentSlug, documentId]);

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

  // Choose content based on interface language and original language
  const prefersArabic = language === 'ar';
  let displayContent: string;

  if (prefersArabic) {
    if (showOriginal) {
      displayContent = document.content;
    } else {
      displayContent = document.language === 'ar' ? document.content : (document.translated_content || document.content);
    }
  } else {
    if (showOriginal) {
      displayContent = document.content;
    } else {
      displayContent = document.language === 'fr' ? document.content : (document.translated_content || document.content);
    }
  }

  // Build paginated content from page_contents if available and has multiple pages
  const buildPaginatedContent = (): string => {
    const rawPageContents = document.page_contents;
    
    // Validate and parse page_contents from JSON
    if (!rawPageContents || !Array.isArray(rawPageContents) || rawPageContents.length <= 1) {
      return displayContent;
    }
    
    const pageContents = rawPageContents as PageContent[];
    
    // Sort pages by page number
    const sortedPages = [...pageContents].sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
    
    return sortedPages.map(page => {
      // Choose appropriate content based on language preference
      let pageContent: string;
      if (prefersArabic) {
        if (showOriginal) {
          pageContent = page.content || '';
        } else {
          pageContent = document.language === 'ar' ? (page.content || '') : (page.translated_content || page.content || '');
        }
      } else {
        if (showOriginal) {
          pageContent = page.content || '';
        } else {
          pageContent = document.language === 'fr' ? (page.content || '') : (page.translated_content || page.content || '');
        }
      }
      
      return `<div class="page-break" data-page="${page.pageNumber}">
        ${pageContent}
      </div>`;
    }).join('\n');
  };

  const paginatedContent = buildPaginatedContent();
  const formattedContent = renderFormattedContent(paginatedContent);
  const isShowingTranslated = !!document.translated_content && displayContent === document.translated_content;
  
  // Use Arabic fields based on interface language
  const currentTitle = language === 'ar' && document.title_ar ? document.title_ar : document.title;
  const currentSubtitle = language === 'ar' && document.subtitle_ar ? document.subtitle_ar : document.subtitle;
  const currentSummary = language === 'ar' && document.summary_ar ? document.summary_ar : document.summary;
  const currentAuthor = language === 'ar' && document.author_ar ? document.author_ar : document.author;
  const currentCourt = language === 'ar' && document.court_ar ? document.court_ar : document.court;
  const currentPlaintiff = language === 'ar' && document.plaintiff_ar ? document.plaintiff_ar : document.plaintiff;
  const currentDefendant = language === 'ar' && document.defendant_ar ? document.defendant_ar : document.defendant;
  const currentKeywords = language === 'ar' && document.keywords_ar ? document.keywords_ar : document.keywords;
  const currentBibliography = language === 'ar' && document.bibliography_ar ? document.bibliography_ar : document.bibliography;
  
  // Detect if this is an analysis document (not jurisprudence)
  const isAnalysisDocument = () => {
    const typeName = document.document_types?.name;
    return ['Analyses juridiques', 'Commentaires', 'Blogs'].includes(typeName || '');
  };
  
  // Format court level: replace underscores with spaces and translate for Arabic
  const formatCourtLevel = (level: string | null) => {
    if (!level) return null;
    
    const formatted = level.replace(/_/g, ' ');
    
    if (language === 'ar') {
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
  
  const currentCourtLevel = formatCourtLevel(language === 'ar' && document.court_level_ar ? document.court_level_ar : document.court_level);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6 w-full flex justify-start">
        <Breadcrumb>
          <BreadcrumbList className={isRTL ? 'flex-row-reverse' : ''}>
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
          {documentId ? (
            // For direct document access (analyses juridiques, commentaires, blogs)
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/observatoire/analyses-opinions">Analyses & Opinions</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : (
            // For category-based documents
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/observatoire/droits-fondamentaux">Droits fondamentaux</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {category && !documentId && (
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
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Document Header */}
          <div className={`text-center mb-12`}>
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${language === 'ar' ? 'dir-rtl' : ''}`}>
              {currentTitle}
            </h1>
            
            {currentSubtitle && (
              <h2 className={`text-xl md:text-2xl font-semibold mb-6 text-muted-foreground max-w-4xl mx-auto ${language === 'ar' ? 'dir-rtl' : ''}`}>
                {currentSubtitle}
              </h2>
            )}

            {currentSummary && (
              <p className={`text-lg text-muted-foreground mb-8 max-w-4xl mx-auto ${language === 'ar' ? 'dir-rtl' : ''}`}>
                {currentSummary}
              </p>
            )}

            {/* Metadata */}
            <div className={`bg-muted/30 rounded-lg p-6 mb-8 ${language === 'ar' ? 'dir-rtl' : ''}`}>
              {isAnalysisDocument() ? (
                // Format pour Analyses juridiques, Commentaires, Blogs
                <>
                  <div className={`grid md:grid-cols-2 gap-6 ${language === 'ar' ? 'text-right' : ''}`}>
                    <div className="space-y-3">
                      {document.created_at && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">تاريخ النشر:</span> {formatDate(document.created_at)}</span>
                          ) : (
                            <>
                              <span className="font-medium">Date de publication:</span>
                              <span>{formatDate(document.created_at)}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {category && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Scale className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span>
                              <span className="font-medium">فئة الحق الأساسي:</span>{' '}
                              <Badge className="font-normal" style={{ backgroundColor: category.color, color: '#ffffff' }}>
                                {category.name_ar || category.name}
                              </Badge>
                            </span>
                          ) : (
                            <>
                              <span className="font-medium">Catégorie de droit fondamental:</span>
                              <Badge className="font-normal" style={{ backgroundColor: category.color, color: '#ffffff' }}>
                                {category.name}
                              </Badge>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {currentAuthor && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <User className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">المؤلف:</span> {currentAuthor}</span>
                          ) : (
                            <>
                              <span className="font-medium">Auteur:</span>
                              <span>{currentAuthor}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Bibliographie - intégrée dans les métadonnées */}
                  {currentBibliography && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className={`font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <BookOpen className="w-4 h-4" />
                        {language === 'ar' ? 'المراجع / الببليوغرافيا' : 'Références / Bibliographie'}
                      </h4>
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${language === 'ar' ? 'text-right' : ''}`}>
                        {currentBibliography}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Format pour Fiches de jurisprudence
                <>
                  <div className={`grid md:grid-cols-2 gap-6 ${language === 'ar' ? 'text-right' : ''}`}>
                    <div className="space-y-3">
                      {document.created_at && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">تاريخ النشر:</span> {formatDate(document.created_at)}</span>
                          ) : (
                            <>
                              <span className="font-medium">Date de publication:</span>
                              <span>{formatDate(document.created_at)}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {category && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Scale className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span>
                              <span className="font-medium">فئة الحق الأساسي:</span>{' '}
                              <Badge className="font-normal" style={{ backgroundColor: category.color, color: '#ffffff' }}>
                                {category.name_ar || category.name}
                              </Badge>
                            </span>
                          ) : (
                            <>
                              <span className="font-medium">Catégorie de droit fondamental:</span>
                              <Badge className="font-normal" style={{ backgroundColor: category.color, color: '#ffffff' }}>
                                {category.name}
                              </Badge>
                            </>
                          )}
                        </div>
                      )}

                      {currentAuthor && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <User className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">المؤلف:</span> {currentAuthor}</span>
                          ) : (
                            <>
                              <span className="font-medium">Auteur:</span>
                              <span>{currentAuthor}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {currentCourt && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">نوع المحكمة:</span> {currentCourt}</span>
                          ) : (
                            <>
                              <span className="font-medium">Type de tribunal:</span>
                              <span>{currentCourt}</span>
                            </>
                          )}
                        </div>
                      )}

                      {(document.court_category_type || document.court_category_type_ar) && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Scale className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">فئة المحكمة:</span> {capitalizeFirstLetter(document.court_category_type_ar || document.court_category_type || "غير محدد")}</span>
                          ) : (
                            <>
                              <span className="font-medium">Catégorie du tribunal:</span>
                              <span>{capitalizeFirstLetter(document.court_category_type || "Non spécifié")}</span>
                            </>
                          )}
                        </div>
                      )}

                      {currentCourtLevel && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">مستوى القضاء:</span> {currentCourtLevel}</span>
                          ) : (
                            <>
                              <span className="font-medium">Niveau de juridiction:</span>
                              <span>{currentCourtLevel}</span>
                            </>
                          )}
                        </div>
                      )}

                      {document.year && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">السنة:</span> {document.year}</span>
                          ) : (
                            <>
                              <span className="font-medium">Année:</span>
                              <span>{document.year}</span>
                            </>
                          )}
                        </div>
                      )}

                      {document.case_number && (
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse justify-start' : 'justify-center md:justify-start'}`}>
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          {language === 'ar' ? (
                            <span><span className="font-medium">رقم القضية:</span> {document.case_number}</span>
                          ) : (
                            <>
                              <span className="font-medium">Numéro d'affaire:</span>
                              <span>{document.case_number}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parties Section - 4 lines, 2 columns */}
                  {(currentPlaintiff || currentDefendant) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className={`grid md:grid-cols-2 gap-6 ${language === 'ar' ? 'md:grid-cols-2' : ''}`}>
                        {/* First column - Plaintiff for French, Defendant for Arabic */}
                        <div className={`space-y-2 ${language === 'ar' ? 'text-right md:order-2' : ''}`}>
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            {language === 'ar' ? 'المدعى عليه' : 'Demandeur / Plaignant'}
                          </h4>
                          <div className="space-y-1">
                            {language === 'ar' ? (
                              currentDefendant && (
                                <div className="text-sm">{currentDefendant}</div>
                              )
                            ) : (
                              currentPlaintiff && (
                                <div className="text-sm">{currentPlaintiff}</div>
                              )
                            )}
                          </div>
                        </div>
                        
                        {/* Second column - Defendant for French, Plaintiff for Arabic */}
                        <div className={`space-y-2 ${language === 'ar' ? 'text-right md:order-1' : ''}`}>
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            {language === 'ar' ? 'المدعي' : 'Défendeur'}
                          </h4>
                          <div className="space-y-1">
                            {language === 'ar' ? (
                              currentPlaintiff && (
                                <div className="text-sm">{currentPlaintiff}</div>
                              )
                            ) : (
                              currentDefendant && (
                                <div className="text-sm">{currentDefendant}</div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
             </div>

            {/* Article Statistics */}
            <div className="w-full my-8">
              <ArticleStatistics 
                documentId={document.id} 
                contentLength={document.content?.length || 0}
              />
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
                  {isShowingTranslated ? "Version traduite par l'IA" : "Version originale"}
                </Badge>
              </div>
            )}
          </div>


          {/* Document Content */}
          <div className={`w-full ${language === 'ar' ? 'dir-rtl' : ''}`}>
            {formattedContent ? (
              hasPageBreaks(formattedContent) ? (
                <PageCarousel 
                  content={formattedContent} 
                  language={language as 'fr' | 'ar'} 
                />
              ) : (
                <div 
                  className={`document-content space-y-6 w-full ${language === 'ar' ? 'text-right' : ''}`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
              )
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'محتوى الوثيقة غير متاح للعرض عبر الإنترنت.' : 'Le contenu du document n\'est pas disponible pour l\'affichage en ligne.'}
                </p>
                {document.file_url && (
                  <Button className="mt-4" asChild>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      {language === 'ar' ? 'استشارة الوثيقة كاملة' : 'Consulter le document complet'}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Keywords */}
          {currentKeywords?.length > 0 && (
            <div className={`mt-12 pt-6 border-t ${language === 'ar' ? 'text-right' : ''}`}>
              <h3 className="text-lg font-semibold mb-4">{language === 'ar' ? 'الكلمات المفاتيح' : 'Mots-clés'}</h3>
              <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-end' : ''}`}>
                {currentKeywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className="mt-12">
            <CommentSection 
              documentId={document.id} 
              documentTitle={currentTitle}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Documents à consulter */}
            <Card className={isRTL ? 'text-right' : ''}>
              <CardHeader className={isRTL ? 'flex-row-reverse' : ''}>
                <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <BookOpen className="w-5 h-5" />
                  {language === 'ar' ? 'وثائق للاطلاع' : 'Documents à consulter'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="border-b pb-3 last:border-b-0">
                    <Link 
                      to={doc.categories ? createDocumentPath(
                        language === 'ar' ? (doc.categories.name_ar || doc.categories.name) : doc.categories.name, 
                        language === 'ar' ? (doc.title_ar || doc.title) : doc.title
                      ) : '#'}
                      className="block hover:text-primary transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {language === 'ar' ? (doc.title_ar || doc.title) : doc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {doc.document_type} • {language === 'ar' 
                          ? new Date(doc.created_at).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
                          : formatDate(doc.created_at)}
                      </p>
                    </Link>
                  </div>
                ))}
                {relatedDocuments.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'لا توجد وثائق ذات صلة' : 'Aucun document connexe'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className={isRTL ? 'text-right' : ''}>
              <CardHeader className={isRTL ? 'flex-row-reverse' : ''}>
                <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FileText className="w-5 h-5" />
                  {language === 'ar' ? 'اقتراحات' : 'Suggestions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="border-b pb-3 last:border-b-0">
                    <Link 
                      to={doc.categories ? createDocumentPath(
                        language === 'ar' ? (doc.categories.name_ar || doc.categories.name) : doc.categories.name, 
                        language === 'ar' ? (doc.title_ar || doc.title) : doc.title
                      ) : '#'}
                      className="block hover:text-primary transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {language === 'ar' ? (doc.title_ar || doc.title) : doc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {doc.document_type} • {language === 'ar' 
                          ? new Date(doc.created_at).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
                          : formatDate(doc.created_at)}
                      </p>
                    </Link>
                  </div>
                ))}
                {suggestedDocuments.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'لا توجد اقتراحات' : 'Aucune suggestion'}
                  </p>
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