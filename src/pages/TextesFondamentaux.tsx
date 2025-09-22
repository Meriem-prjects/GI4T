import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FileText, BookOpen, Scale, Users, Download, ExternalLink, Heart, ShieldCheck, GraduationCap, Search, ChevronLeft, ChevronRight, Calendar, Building, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
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

const TextesFondamentaux = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          return;
        }

        // Prioritize "Droit à la santé" by putting it first
        const sortedCategories = categoriesData?.sort((a, b) => {
          if (a.name.toLowerCase().includes('santé')) return -1;
          if (b.name.toLowerCase().includes('santé')) return 1;
          return a.name.localeCompare(b.name, 'fr');
        }) || [];

        setCategories(sortedCategories);

        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
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

    fetchData();
  }, []);

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('santé') || name.includes('health')) return Heart;
    if (name.includes('éducation') || name.includes('education')) return GraduationCap;
    if (name.includes('justice') || name.includes('judicial')) return Scale;
    if (name.includes('travail') || name.includes('work')) return Users;
    if (name.includes('sécurité') || name.includes('security')) return ShieldCheck;
    if (name.includes('civils') || name.includes('politiques')) return Users;
    return BookOpen;
  };

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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.name_ar && category.name_ar.includes(searchTerm)) ||
    (category.description_ar && category.description_ar.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic for documents
  const totalPages = Math.ceil(documents.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const endIndex = startIndex + documentsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



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
              <BreadcrumbPage>Textes fondamentaux</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Textes Fondamentaux</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez les textes juridiques fondamentaux qui garantissent vos droits et libertés en Tunisie. 
            Constitution, lois organiques et codes essentiels expliqués et analysés.
          </p>
        </section>

        {/* Droits par catégorie */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Droits par Catégorie</h2>
          
          {/* Barre de recherche */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie de droit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                slidesToScroll: 3,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredCategories.map((category) => {
                  const Icon = getIconForCategory(category.name);
                  const emoji = getCategoryEmoji(category.name);
                  return (
                    <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/3">
                      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-3 text-3xl">
                            {emoji}
                          </div>
                          <CardTitle className="text-lg" style={{ color: category.color }}>
                            {category.name}
                            {category.name_ar && (
                              <span className="block text-sm mt-1 text-muted-foreground">{category.name_ar}</span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {category.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 text-center">
                          <Link to={`/observatoire/categorie/${category.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              Explorer
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {filteredCategories.length > 3 && (
                <>
                  <CarouselPrevious className="hidden md:flex -left-12" />
                  <CarouselNext className="hidden md:flex -right-12" />
                </>
              )}
            </Carousel>
          )}
          
          {!loading && filteredCategories.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune catégorie trouvée pour "{searchTerm}"
            </div>
          )}
        </section>

        {/* Textes de Référence */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Textes de Référence</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun document disponible</h3>
              <p className="text-muted-foreground">
                Les documents seront bientôt publiés depuis l'administration.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentDocuments.map((document) => (
                  <Card key={document.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={document.status === "published" ? "default" : "secondary"}>
                          {document.status === "published" ? "Publié" : "Traité"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(document.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {document.title}
                      </CardTitle>
                      {document.title_ar && (
                        <CardDescription dir="rtl" className="line-clamp-2">
                          {document.title_ar}
                        </CardDescription>
                      )}
                      {document.summary && (
                        <CardDescription className="line-clamp-2">
                          {document.summary}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
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
                        {document.year && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {document.year}
                          </div>
                        )}
                      </div>
                      
                      {document.keywords && document.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {document.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isCurrentPage = page === currentPage;
                        
                        // Show first page, last page, current page, and pages around current page
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={isCurrentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>
      </div>
  );
};

export default TextesFondamentaux;