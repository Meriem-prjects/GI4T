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
import { createSlug, createDocumentPath } from "@/lib/urlUtils";

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
      if (!categorySlug || !documentSlug) return;

      try {
        // First, find the category by slug
        const { data: categories, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, name_ar, color');

        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
          return;
        }

        const matchingCategory = categories?.find(cat => 
          createSlug(cat.name) === categorySlug
        );

        if (!matchingCategory) {
          console.error('Category not found for slug:', categorySlug);
          return;
        }

        // Then, find the document by title slug and category
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('category_id', matchingCategory.id);

        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
          return;
        }

        const matchingDocument = documents?.find(doc => 
          createSlug(doc.title) === documentSlug
        );

        if (!matchingDocument) {
          console.error('Document not found for slug:', documentSlug);
          return;
        }

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

  const parseContent = (content: string) => {
    if (!content) return [];
    
    // Check if content contains HTML tags (rich text from editor)
    const hasHtmlTags = /<[^>]+>/g.test(content);
    
    if (hasHtmlTags) {
      // Content is HTML from rich text editor, return as single HTML element
      return [{ type: 'html', content: content }];
    }
    
    // Legacy: Simple content parsing to identify headings for plain text
    const lines = content.split('\n').filter(line => line.trim());
    const parsedContent = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Detect headings based on patterns (uppercase, short lines, etc.)
      if (trimmed.length < 100 && trimmed === trimmed.toUpperCase() && trimmed.length > 5) {
        parsedContent.push({ type: 'h1', content: trimmed });
      } else if (trimmed.startsWith('Article') || trimmed.startsWith('ARTICLE')) {
        parsedContent.push({ type: 'h2', content: trimmed });
      } else if (trimmed.match(/^\d+\.|\d+\)\s/)) {
        parsedContent.push({ type: 'h3', content: trimmed });
      } else {
        parsedContent.push({ type: 'p', content: trimmed });
      }
    }
    
    return parsedContent;
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
          <Link to="/observatoire/textes-fondamentaux">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux textes fondamentaux
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use translated content by default, original if showOriginal is true
  const displayContent = showOriginal ? document.content : (document.translated_content || document.content);
  const contentElements = parseContent(displayContent);
  const currentTitle = document.title;
  const currentSummary = document.summary;
  const currentAuthor = document.author;
  const currentCourt = document.court;
  const currentCourtLevel = document.court_level;

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
              <Link to="/observatoire/textes-fondamentaux">Textes fondamentaux</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/observatoire/categorie/${category.id}`}>{category.name}</Link>
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
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {currentTitle}
            </h1>
            
            {currentSummary && (
              <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
                {currentSummary}
              </p>
            )}

            {/* Metadata */}
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {document.created_at && (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Date de publication:</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  )}
                  
                  {category && (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <Scale className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Catégorie de jurisprudence:</span>
                      <Badge variant="secondary" style={{ backgroundColor: category.color + '20', color: category.color }}>
                        {category.name}
                      </Badge>
                    </div>
                  )}

                  {currentAuthor && (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Auteur:</span>
                      <span>{currentAuthor}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {currentCourt && (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Type de tribunal:</span>
                      <span>{currentCourt}</span>
                    </div>
                  )}

                  {currentCourtLevel && (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Niveau du tribunal:</span>
                      <span>{currentCourtLevel}</span>
                    </div>
                  )}

                  {document.case_number && (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Numéro d'affaire:</span>
                      <span>{document.case_number}</span>
                    </div>
                  )}
                </div>
              </div>
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
                <Button asChild>
                  <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Consulter le document
                  </a>
                </Button>
              )}
              
              {document.pdf_url && (
                <Button variant="outline" asChild>
                  <a href={document.pdf_url} download>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </a>
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
                  {showOriginal ? "Version originale" : "Version traduite en français"}
                </Badge>
              </div>
            )}
          </div>

          {/* Document Content */}
          <div className="prose prose-lg max-w-none">
            {contentElements.length > 0 ? (
              <div className="space-y-6">
                {contentElements.map((element, index) => {
                  if (element.type === 'html') {
                    // Render HTML content from rich text editor with proper styling
                    return (
                      <div 
                        key={index} 
                        className="prose prose-lg max-w-none [&_p]:mb-4 [&_p]:leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-3 [&_ul]:mb-4 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-4"
                        dangerouslySetInnerHTML={{ __html: element.content }}
                      />
                    );
                  } else if (element.type === 'h1') {
                    return (
                      <h1 key={index} className="text-2xl font-bold text-foreground border-b pb-2 mb-4">
                        {element.content}
                      </h1>
                    );
                  } else if (element.type === 'h2') {
                    return (
                      <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4">
                        {element.content}
                      </h2>
                    );
                  } else if (element.type === 'h3') {
                    return (
                      <h3 key={index} className="text-lg font-medium text-foreground mt-6 mb-3">
                        {element.content}
                      </h3>
                    );
                  } else {
                    return (
                      <p key={index} className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                        {element.content}
                      </p>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Le contenu du document n'est pas disponible pour l'affichage en ligne.
                </p>
                {document.file_url && (
                  <Button className="mt-4" asChild>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      Consulter le document complet
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Keywords */}
          {document.keywords && document.keywords.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Mots-clés</h3>
              <div className="flex flex-wrap gap-2">
                {document.keywords.map((keyword) => (
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