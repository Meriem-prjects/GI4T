import React, { useState, useEffect } from 'react';
import { stripFormattedContent } from '@/utils/contentFormatter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertCircle,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { logActivity } from '@/hooks/useActivityLog';

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
  name_ar?: string;
  color: string;
}

interface AdminContentByTypeProps {
  documentTypeName: string;
  documentTypeId: string;
  title: string;
  description: string;
}

const AdminContentByType: React.FC<AdminContentByTypeProps> = ({ 
  documentTypeName, 
  documentTypeId, 
  title, 
  description 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, [documentTypeId]);

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
          categories (name, color),
          document_types (name)
        `)
        .eq('document_type_id', documentTypeId)
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

  const updateDocumentStatus = async (documentId: string, newStatus: string) => {
    try {
      if (newStatus === 'processed') {
        toast({
          title: "Publication impossible",
          description: "Les documents doivent d'abord être validés. Utilisez 'Faire valider' puis attendez la validation.",
          variant: "destructive",
        });
        return;
      }

      const currentDoc = documents.find(d => d.id === documentId);
      const oldStatus = currentDoc?.status || 'draft';

      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', documentId);

      if (error) throw error;

      await logActivity({
        entityType: 'document',
        entityId: documentId,
        action: 'status_change',
        details: {
          old_status: oldStatus,
          new_status: newStatus,
          changed_at: new Date().toISOString()
        }
      });

      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: newStatus } : doc
        )
      );

      const statusText = newStatus === 'draft' ? 'brouillon' : 
                         newStatus === 'processed' ? 'publié' : 
                         newStatus === 'pending_validation' ? 'en validation' : newStatus;
      toast({
        title: "Statut mis à jour",
        description: `Le document a été mis en ${statusText}`,
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
      const currentDoc = documents.find(d => d.id === documentId);
      const oldStatus = currentDoc?.status || 'draft';

      const { error } = await supabase
        .from('documents')
        .update({ status: 'pending_validation' })
        .eq('id', documentId);

      if (error) throw error;

      await logActivity({
        entityType: 'document',
        entityId: documentId,
        action: 'status_change',
        details: {
          old_status: oldStatus,
          new_status: 'pending_validation',
          changed_at: new Date().toISOString()
        }
      });

      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: 'pending_validation' } : doc
        )
      );
      
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

  const bulkDeleteDocuments = async () => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .in('id', selectedDocuments);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
      setSelectedDocuments([]);
      toast({
        title: "Documents supprimés",
        description: `${selectedDocuments.length} document(s) supprimé(s) avec succès`,
      });
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les documents",
        variant: "destructive",
      });
    }
  };

  const bulkSubmitForValidation = async () => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'pending_validation' })
        .in('id', selectedDocuments);

      if (error) throw error;

      // Log activity for each document
      for (const docId of selectedDocuments) {
        const doc = documents.find(d => d.id === docId);
        await logActivity({
          entityType: 'document',
          entityId: docId,
          action: 'status_change',
          details: {
            old_status: doc?.status || 'draft',
            new_status: 'pending_validation',
            changed_at: new Date().toISOString()
          }
        });
      }

      setDocuments(prev =>
        prev.map(doc =>
          selectedDocuments.includes(doc.id)
            ? { ...doc, status: 'pending_validation' }
            : doc
        )
      );
      setSelectedDocuments([]);
      toast({
        title: "Documents soumis pour validation",
        description: `${selectedDocuments.length} document(s) soumis avec succès`,
      });
    } catch (error) {
      console.error('Error submitting documents for validation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre les documents pour validation",
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const toggleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Brouillon</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Traité</Badge>;
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
    <div className="p-6 space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Link to={`/admin/observatoire/editeur?type=${documentTypeId}`}>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Nouveau {documentTypeName}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer"
              >
                Tout sélectionner ({filteredDocuments.length})
              </label>
            </div>
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
                  <SelectItem value="pending_validation">En validation</SelectItem>
                  <SelectItem value="processed">Publiés</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedDocuments.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedDocuments.length} document(s) sélectionné(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocuments([])}
                >
                  <X className="w-4 h-4 mr-1" />
                  Désélectionner
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkSubmitForValidation}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Soumettre à validation
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={() => toggleSelectDocument(document.id)}
                  />
                  <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                    {/* Faire valider - uniquement pour les brouillons */}
                    {document.status === 'draft' && (
                      <DropdownMenuItem onClick={() => submitForValidation(document.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Faire valider
                      </DropdownMenuItem>
                    )}
                    {/* Retour à l'édition - pour les documents en validation */}
                    {document.status === 'pending_validation' && (
                      <DropdownMenuItem onClick={() => updateDocumentStatus(document.id, 'draft')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Retour à l'édition
                      </DropdownMenuItem>
                    )}
                    {/* Mettre en brouillon - pour les documents publiés */}
                    {document.status === 'processed' && (
                      <DropdownMenuItem onClick={() => updateDocumentStatus(document.id, 'draft')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Mettre en brouillon
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setDocumentToDelete(document.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Badge */}
              <div className="mb-3">
                {getStatusBadge(document.status)}
              </div>

              {/* Summary */}
              {document.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {stripFormattedContent(document.summary)}
                </p>
              )}

              {/* Categories */}
              {document.document_categories && document.document_categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {document.document_categories.slice(0, 3).map((dc) => (
                    <Badge 
                      key={dc.category_id} 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: dc.categories?.color ? `${dc.categories.color}20` : undefined,
                        borderColor: dc.categories?.color 
                      }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {dc.categories?.name}
                    </Badge>
                  ))}
                  {document.document_categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.document_categories.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(document.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {document.language === 'ar' ? 'Arabe' : 'Français'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground text-center">Aucun {documentTypeName.toLowerCase()} trouvé</h3>
          <p className="text-muted-foreground text-center">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? "Essayez de modifier vos filtres de recherche" 
              : `Commencez par créer un nouveau ${documentTypeName.toLowerCase()}`}
          </p>
        </div>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (documentToDelete) {
                  deleteDocument(documentToDelete);
                  setDocumentToDelete(null);
                }
                setDeleteDialogOpen(false);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedDocuments.length} document(s) ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                bulkDeleteDocuments();
                setBulkDeleteDialogOpen(false);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContentByType;
