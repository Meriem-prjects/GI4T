import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, Edit, FileText, Globe, MoreVertical, Search, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryCombobox } from "@/components/admin/CategoryCombobox";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  title_ar?: string;
  summary?: string;
  summary_ar?: string;
  status: string;
  language: string;
  created_at: string;
  updated_at: string;
  keywords: string[];
  keywords_ar?: string[];
  category_id?: string;
  published?: boolean;
  document_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
      name_ar?: string;
      color: string;
    };
  }>;
  categories?: {
    id: string;
    name: string;
    name_ar?: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  color: string;
}

const AdminValidation = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories (
            category_id,
            categories (id, name, name_ar, color)
          ),
          categories (
            id,
            name,
            name_ar,
            color
          )
        `)
        .eq('status', 'pending_validation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents en validation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const publishDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'processed',
          published: true
        })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Succès",
        description: "Le document a été publié avec succès",
      });
    } catch (error) {
      console.error('Error publishing document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le document",
        variant: "destructive",
      });
    }
  };

  const rejectDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'draft',
          published: false
        })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Document remis en modification",
        description: "Le document a été remis en modification",
      });
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de remettre le document en modification",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_validation':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">En validation</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary_ar?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || doc.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Validation des Documents</h1>
          <p className="text-muted-foreground">
            Documents en attente de validation ({filteredDocuments.length})
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par titre, résumé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-[250px]">
          <CategoryCombobox
            categories={categories}
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            placeholder="Filtrer par catégorie"
            searchPlaceholder="Rechercher une catégorie..."
            emptyText="Aucune catégorie trouvée"
            showAllOption={true}
            allOptionText="Toutes les catégories"
            allOptionValue="all"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun document en validation</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedCategory !== "all" 
                ? "Aucun document ne correspond aux critères de recherche." 
                : "Il n'y a actuellement aucun document en attente de validation."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base leading-6 line-clamp-2">
                      {document.title}
                    </CardTitle>
                    {document.title_ar && (
                      <CardTitle className="text-sm text-muted-foreground leading-6 line-clamp-2" dir="rtl">
                        {document.title_ar}
                      </CardTitle>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border z-50">
                      <DropdownMenuItem onClick={() => navigate(`/admin/observatoire/editeur?doc=${document.id}&source=validation`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => publishDocument(document.id)}
                        className="text-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Publier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => rejectDocument(document.id)}
                        className="text-orange-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Remettre pour modification
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(document.status)}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {document.language === 'fr' ? 'Français' : document.language === 'ar' ? 'العربية' : document.language}
                  </Badge>
                  
                  {/* Multiple categories from document_categories */}
                  {document.document_categories?.map((docCat) => (
                    <Badge 
                      key={docCat.category_id}
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: docCat.categories.color,
                        color: docCat.categories.color 
                      }}
                    >
                      {docCat.categories.name}
                    </Badge>
                  ))}
                  
                  {/* Fallback to single category for backward compatibility */}
                  {!document.document_categories?.length && document.categories && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: document.categories.color,
                        color: document.categories.color 
                      }}
                    >
                      {document.categories.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-3">
                {document.summary && (
                  <CardDescription className="line-clamp-3">
                    {document.summary}
                  </CardDescription>
                )}
                
                {document.keywords && document.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {document.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {document.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{document.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground pt-2">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  Créé le {new Date(document.created_at).toLocaleDateString('fr-FR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminValidation;