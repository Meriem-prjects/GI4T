import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Download, ExternalLink, Calendar, Building, User, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  color: string;
}

interface Document {
  id: string;
  title: string;
  title_ar?: string;
  summary?: string;
  summary_ar?: string;
  author?: string;
  court?: string;
  created_at: string;
  file_url?: string;
  pdf_url?: string;
  status: string;
  keywords?: string[];
  year?: number;
}

const getCategoryEmoji = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('santé') || name.includes('health')) return '❤️';
  if (name.includes('éducation') || name.includes('education')) return '🎓';
  if (name.includes('justice') || name.includes('judicial')) return '⚖️';
  if (name.includes('travail') || name.includes('work') || name.includes('emploi')) return '💼';
  if (name.includes('logement') || name.includes('housing')) return '🏠';
  if (name.includes('environnement') || name.includes('environment')) return '🌱';
  if (name.includes('famille') || name.includes('family')) return '👨‍👩‍👧‍👦';
  if (name.includes('femme') || name.includes('women')) return '👩';
  if (name.includes('enfant') || name.includes('child')) return '🧒';
  if (name.includes('handicap') || name.includes('disability')) return '♿';
  if (name.includes('privacy') || name.includes('privée')) return '🔒';
  if (name.includes('expression') || name.includes('opinion')) return '💬';
  if (name.includes('religion') || name.includes('belief')) return '🕊️';
  if (name.includes('civils') || name.includes('civiques') || name.includes('civil')) return '🏛️';
  return '📖';
};

const CategorieDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

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

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
          return;
        }

        setCategory(categoryData);

        // Fetch documents for this category
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('category_id', categoryId)
          .in('status', ['published', 'processed'])
          .order('created_at', { ascending: false });

        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
          return;
        }

        setDocuments(documentsData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndDocuments();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
            <Link to="/observatoire/textes-fondamentaux">
              <Button>Retour aux Textes Fondamentaux</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const emoji = getCategoryEmoji(category.name);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/observatoire">Observatoire</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/observatoire/textes-fondamentaux">Textes Fondamentaux</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section - Category Presentation */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{emoji}</div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: category.color }}>
              {category.name}
              {category.name_ar && (
                <span className="block text-2xl mt-2 text-muted-foreground">{category.name_ar}</span>
              )}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {category.description}
              </p>
            )}
            {category.description_ar && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-2" dir="rtl">
                {category.description_ar}
              </p>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-sm text-muted-foreground">Documents disponibles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Scale className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">
                  {documents.filter(doc => doc.court).length}
                </div>
                <p className="text-sm text-muted-foreground">Décisions judiciaires</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">
                  {documents.length > 0 ? new Date(documents[0].created_at).getFullYear() : '-'}
                </div>
                <p className="text-sm text-muted-foreground">Dernière publication</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Documents et Textes</h2>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun document disponible</h3>
              <p className="text-muted-foreground">
                Les documents pour cette catégorie seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {document.title}
                    </CardTitle>
                    {document.title_ar && (
                      <CardDescription dir="rtl" className="line-clamp-2">
                        {document.title_ar}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {document.summary && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {document.summary}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {document.author && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          {document.author}
                        </div>
                      )}
                      {document.court && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building className="h-4 w-4 mr-2" />
                          {document.court}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(document.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {document.keywords && document.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {document.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                      {(document.file_url || document.pdf_url) && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategorieDetail;