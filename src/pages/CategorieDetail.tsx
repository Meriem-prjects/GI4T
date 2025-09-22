import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Download, ExternalLink, Heart, ShieldCheck, GraduationCap, BookOpen, Scale, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createCategorySlug, createDocumentSlug } from "@/lib/urlUtils";

interface Category {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  color: string;
}

interface Document {
  id: string;
  title: string;
  title_ar: string;
  summary: string;
  summary_ar: string;
  created_at: string;
  status: string;
  file_url: string;
  pdf_url: string;
  page_count: number;
  keywords: string[];
  document_type: string;
  year: number;
}

const CategorieDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsCount, setDocumentsCount] = useState(0);

  useEffect(() => {
    const fetchCategoryAndDocuments = async () => {
      if (!categoryId) return;
      
      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        
        if (categoryError) throw categoryError;
        setCategory(categoryData);

        // Fetch documents for this category
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('category_id', categoryId)
          .in('status', ['published', 'processed'])
          .order('created_at', { ascending: false });
        
        if (documentsError) throw documentsError;
        setDocuments(documentsData || []);
        setDocumentsCount(documentsData?.length || 0);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndDocuments();
  }, [categoryId]);


  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('santé') || name.includes('health')) return Heart;
    if (name.includes('justice') || name.includes('legal')) return Scale;
    if (name.includes('enseignement') || name.includes('éducation') || name.includes('education')) return GraduationCap;
    if (name.includes('protection') || name.includes('sécurité')) return ShieldCheck;
    if (name.includes('civils') || name.includes('politiques')) return Users;
    return BookOpen;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-6 w-96 mb-6" />
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Catégorie introuvable</h1>
          <p className="text-muted-foreground mb-6">
            La catégorie que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link to="/observatoire/textes-fondamentaux">
            <Button>Retour aux textes fondamentaux</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getIconForCategory(category.name);

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
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header - Style boutique */}
      <section className="mb-12">
        <div 
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 mb-8 relative overflow-hidden"
          style={{
            backgroundImage: 'url(/src/assets/justice-background.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-background/60 rounded-lg"></div>
          <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.color + '20' }}
            >
              <Icon className="w-6 h-6" style={{ color: category.color }} />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
            {category.description}
          </p>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              {documentsCount} document{documentsCount > 1 ? 's' : ''} disponible{documentsCount > 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Droit fondamental
            </Badge>
          </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Documents disponibles</h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun document disponible</h3>
            <p className="text-muted-foreground">
              Il n'y a actuellement aucun document publié dans cette catégorie.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {document.document_type && (
                          <Badge variant="outline">{document.document_type}</Badge>
                        )}
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Publié
                        </Badge>
                        {document.year && (
                          <Badge variant="outline">{document.year}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{document.title}</CardTitle>
                      {document.summary && (
                        <CardDescription className="text-base mb-3">
                          {document.summary}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>Publié le {formatDate(document.created_at)}</span>
                        {document.page_count && (
                          <span>• {document.page_count} page{document.page_count > 1 ? 's' : ''}</span>
                        )}
                      </div>
                      {document.keywords && document.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {document.keywords.slice(0, 5).map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" asChild>
                        <Link to={`/observatoire/${createCategorySlug(category?.name || '')}/${createDocumentSlug(document.title)}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Consulter
                        </Link>
                      </Button>
                      {document.pdf_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={document.pdf_url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategorieDetail;