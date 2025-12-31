import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Newspaper,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  title_ar: string | null;
  excerpt: string;
  excerpt_ar: string | null;
  content: string | null;
  content_ar: string | null;
  category: string;
  image_url: string | null;
  tags: string[] | null;
  tags_ar: string[] | null;
  read_time: number | null;
  views: number | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  created_by: string | null;
}

const CATEGORIES = [
  { value: "jurisprudence", label: "Jurisprudence", color: "bg-blue-500" },
  { value: "odf", label: "ODF", color: "bg-purple-500" },
  { value: "event", label: "Événement", color: "bg-green-500" },
  { value: "publication", label: "Publication", color: "bg-orange-500" },
  { value: "acces_droits", label: "Accès aux Droits", color: "bg-yellow-500" },
];

const AdminActualites = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error);
      toast.error("Erreur lors du chargement des actualités");
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("news")
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq("id", id);

      if (error) throw error;
      
      setNews(prev => prev.map(item => 
        item.id === id 
          ? { ...item, is_published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null }
          : item
      ));
      
      toast.success(!currentStatus ? "Actualité publiée" : "Actualité dépubliée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("news")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      setNews(prev => prev.map(item => 
        item.id === id ? { ...item, is_featured: !currentStatus } : item
      ));
      
      toast.success(!currentStatus ? "Marqué à la une" : "Retiré de la une");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", itemToDelete);

      if (error) throw error;
      
      setNews(prev => prev.filter(item => item.id !== itemToDelete));
      toast.success("Actualité supprimée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || { label: category, color: "bg-gray-500" };
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "published" && item.is_published) ||
      (statusFilter === "draft" && !item.is_published) ||
      (statusFilter === "featured" && item.is_featured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Actualités</h1>
          <p className="text-muted-foreground">
            {news.length} actualité{news.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button onClick={() => navigate("/admin/observatoire/actualites/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle actualité
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="featured">À la une</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Aucune actualité trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Modifiez vos filtres pour voir plus de résultats"
                : "Commencez par créer votre première actualité"}
            </p>
            {!searchTerm && categoryFilter === "all" && statusFilter === "all" && (
              <Button onClick={() => navigate("/admin/observatoire/actualites/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une actualité
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => {
            const categoryInfo = getCategoryInfo(item.category);
            
            return (
              <Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                {/* Image de couverture */}
                <div className="relative aspect-video">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Badge À la une superposé */}
                  {item.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      À la une
                    </Badge>
                  )}
                  
                  {/* Menu actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/observatoire/actualites/edit/${item.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => togglePublished(item.id, item.is_published)}
                      >
                        {item.is_published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleFeatured(item.id, item.is_featured)}
                      >
                        {item.is_featured ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Retirer de la une
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Mettre à la une
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setItemToDelete(item.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Contenu */}
                <CardContent className="flex-1 flex flex-col p-4">
                  {/* Badges catégorie et statut */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${categoryInfo.color} text-white text-xs`}>
                      {categoryInfo.label}
                    </Badge>
                    {item.is_published ? (
                      <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                        Publié
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-400 text-gray-500 text-xs">
                        Brouillon
                      </Badge>
                    )}
                  </div>
                  
                  {/* Titre */}
                  <h3 className="font-semibold text-base mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {/* Extrait */}
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {item.excerpt}
                  </p>
                  
                  {/* Métadonnées */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t">
                    {item.published_at && (
                      <span>{format(new Date(item.published_at), "d MMM yyyy", { locale: fr })}</span>
                    )}
                    {item.views !== null && <span>{item.views} vues</span>}
                    {item.read_time && <span>{item.read_time} min</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette actualité ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminActualites;
