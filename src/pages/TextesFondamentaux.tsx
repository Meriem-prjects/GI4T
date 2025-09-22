import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FileText, BookOpen, Scale, Users, Download, ExternalLink, Heart, ShieldCheck, GraduationCap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  color: string;
}

const TextesFondamentaux = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Put "Droit à la santé" first, then sort the rest
        const sortedCategories = data?.sort((a, b) => {
          if (a.name === "Droit à la santé") return -1;
          if (b.name === "Droit à la santé") return 1;
          return a.name.localeCompare(b.name);
        }) || [];
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('santé') || name.includes('health')) return Heart;
    if (name.includes('justice') || name.includes('legal')) return Scale;
    if (name.includes('enseignement') || name.includes('éducation') || name.includes('education')) return GraduationCap;
    if (name.includes('protection') || name.includes('sécurité')) return ShieldCheck;
    if (name.includes('civils') || name.includes('politiques')) return Users;
    return BookOpen;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.name_ar && category.name_ar.includes(searchTerm)) ||
    (category.description_ar && category.description_ar.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fundamentalTexts = [
    {
      id: 1,
      title: "Constitution de la République Tunisienne",
      description: "Texte constitutionnel adopté le 27 janvier 2014, garantissant les droits et libertés fondamentaux",
      category: "Constitution",
      date: "27 janvier 2014",
      status: "En vigueur",
      articles: 149,
      tags: ["Droits fondamentaux", "Constitution", "République"]
    },
    {
      id: 2,
      title: "Code des Droits de l'Homme",
      description: "Ensemble des dispositions relatives à la protection des droits de l'homme en Tunisie",
      category: "Code",
      date: "15 mars 2022", 
      status: "En vigueur",
      articles: 245,
      tags: ["Droits de l'homme", "Protection", "Libertés"]
    },
    {
      id: 3,
      title: "Loi Organique sur l'Accès à l'Information",
      description: "Loi garantissant le droit d'accès à l'information publique pour tous les citoyens",
      category: "Loi Organique",
      date: "24 mars 2016",
      status: "En vigueur", 
      articles: 89,
      tags: ["Information", "Transparence", "Accès public"]
    }
  ];


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
                  return (
                    <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/3">
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: category.color + '20' }}
                            >
                              <Icon className="w-5 h-5" style={{ color: category.color }} />
                            </div>
                            <Badge variant="secondary">Droit fondamental</Badge>
                          </div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {category.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Explorer
                          </Button>
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

        {/* Textes fondamentaux */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Textes de Référence</h2>
          <div className="space-y-6">
            {fundamentalTexts.map((text) => (
              <Card key={text.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <Badge variant="outline">{text.category}</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {text.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{text.title}</CardTitle>
                      <CardDescription className="text-base mb-3">
                        {text.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>Adopté le {text.date}</span>
                        <span>• {text.articles} articles</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {text.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Consulter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </div>
  );
};

export default TextesFondamentaux;