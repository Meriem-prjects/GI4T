import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryCombobox } from '@/components/admin/CategoryCombobox';
import { 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag,
  Globe,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  title_ar?: string;
  summary?: string;
  summary_ar?: string;
  status: string;
  language: string;
  original_filename: string;
  created_at: string;
  updated_at: string;
  keywords: string[];
  keywords_ar: string[];
  category_id?: string;
  document_type_id?: string;
  translated_content?: string;
  categories?: {
    name: string;
    color: string;
  };
  document_types?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface DocumentType {
  id: string;
  name: string;
}

const AdminContenus = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    loadCategories();
    loadDocumentTypes();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          categories (name, color),
          document_types (name)
        `)
        .neq('status', 'pending_validation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
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

  const loadDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('Error loading document types:', error);
    }
  };

  const updateDocumentStatus = async (documentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: newStatus } : doc
        )
      );

      toast({
        title: "Statut mis à jour",
        description: `Le document a été ${newStatus === 'processed' ? 'publié' : 'mis en brouillon'}`,
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const submitForValidation = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'pending_validation' })
        .eq('id', documentId);

      if (error) throw error;

      // Remove document from current list since it's no longer visible in contents
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document soumis pour validation",
        description: "Le document a été envoyé en validation avec succès",
      });
    } catch (error) {
      console.error('Error submitting document for validation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le document pour validation",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Brouillon</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Publié</Badge>;
      case 'pending_validation':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><AlertCircle className="w-3 h-3 mr-1" />En validation</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><AlertCircle className="w-3 h-3 mr-1" />En traitement</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Chargement des contenus...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Contenus</h1>
          <p className="text-muted-foreground">
            Gérez vos documents, brouillons et publications
          </p>
        </div>
        <Link to="/admin/observatoire/editeur">
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Nouveau Document
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par titre, résumé ou nom de fichier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="processed">Publiés</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
              </SelectContent>
            </Select>
            <CategoryCombobox
              categories={categories}
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              placeholder="Catégorie"
              searchPlaceholder="Rechercher une catégorie..."
              emptyText="Aucune catégorie trouvée."
              showAllOption={true}
              allOptionText="Toutes les catégories"
              allOptionValue="all"
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {document.title}
                  </CardTitle>
                  {document.title_ar && (
                    <p className="text-sm text-muted-foreground line-clamp-1" dir="rtl">
                      {document.title_ar}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/admin/observatoire/editeur?doc=${document.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
                      </Link>
                    </DropdownMenuItem>
                    {document.status === 'draft' && (
                      <DropdownMenuItem onClick={() => submitForValidation(document.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Faire valider
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => updateDocumentStatus(
                        document.id, 
                        document.status === 'processed' ? 'draft' : 'processed'
                      )}
                    >
                      {document.status === 'processed' ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Mettre en brouillon
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Publier
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDocumentToDelete(document.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Status and Language */}
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(document.status)}
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  {document.language.toUpperCase()}
                </Badge>
                {document.translated_content && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    Traduit
                  </Badge>
                )}
              </div>

              {/* Summary */}
              {document.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {document.summary}
                </p>
              )}

              {/* Category and Type */}
              <div className="flex flex-wrap gap-2">
                {document.categories && (
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${document.categories.color}20`,
                      borderColor: document.categories.color,
                      color: document.categories.color 
                    }}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {document.categories.name}
                  </Badge>
                )}
                {document.document_types && (
                  <Badge variant="outline" className="text-xs">
                    {document.document_types.name}
                  </Badge>
                )}
              </div>

              {/* Keywords */}
              {document.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.keywords.slice(0, 3).map((keyword, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {document.keywords.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{document.keywords.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(document.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="truncate ml-2 max-w-32" title={document.original_filename}>
                  {document.original_filename}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun contenu trouvé
            </h3>
            <p className="text-muted-foreground mb-4">
              {documents.length === 0 
                ? "Vous n'avez pas encore créé de documents. Commencez par télécharger et traiter votre premier document."
                : "Aucun document ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              }
            </p>
            {documents.length === 0 && (
              <Link to="/admin/observatoire/editeur">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Créer votre premier document
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  deleteDocument(documentToDelete);
                  setDocumentToDelete(null);
                  setDeleteDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContenus;