import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Building, Scale, FileText, Globe, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { useCourtTypes, useDeleteCourtType } from "@/hooks/useCourtTypes";
import { useJurisdictionLevels, useDeleteJurisdictionLevel } from "@/hooks/useJurisdictionLevels";
import CategoryForm from "@/components/admin/CategoryForm";

const AdminParametres = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("court-types");
  
  // Real data from Supabase
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  
  const { data: courtTypes = [], isLoading: courtTypesLoading } = useCourtTypes();
  const deleteCourtType = useDeleteCourtType();
  
  const { data: jurisdictionLevels = [], isLoading: jurisdictionLevelsLoading } = useJurisdictionLevels();
  const deleteJurisdictionLevel = useDeleteJurisdictionLevel();

  // Category form state
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Mock data for other sections (will be replaced with real data later)
  const [documentTypes] = useState([
    { id: "1", name: "Décision judiciaire", name_ar: "قرار قضائي", description: "Décisions rendues par les tribunaux", description_ar: "القرارات الصادرة عن المحاكم" },
    { id: "2", name: "Loi", name_ar: "قانون", description: "Textes législatifs", description_ar: "النصوص التشريعية" }
  ]);

  const [languages] = useState([
    { id: "1", code: "fr", name: "Français", name_native: "Français", is_default: true, is_active: true },
    { id: "2", code: "ar", name: "Arabe", name_native: "العربية", is_default: false, is_active: true }
  ]);

  const [users] = useState([
    { id: "1", first_name: "Ahmed", last_name: "Ben Ali", email: "ahmed@example.com", role: "admin" },
    { id: "2", first_name: "Fatma", last_name: "Trabelsi", email: "fatma@example.com", role: "editor" }
  ]);

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  // Generic handlers for other sections (temporary)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = (type: string) => {
    setCurrentForm({});
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (type: string, id: string) => {
    setCurrentForm({});
    setEditingId(id);
    setIsDialogOpen(true);
  };

  const handleDelete = (type: string, id: string) => {
    if (type === 'court-type') {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type de tribunal ?")) {
        deleteCourtType.mutate(id);
      }
    } else if (type === 'jurisdiction-level') {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce niveau de juridiction ?")) {
        deleteJurisdictionLevel.mutate(id);
      }
    } else {
      toast({
        title: "Supprimé",
        description: "L'élément a été supprimé avec succès."
      });
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    toast({
      title: editingId ? "Modifié" : "Ajouté",
      description: `L'élément a été ${editingId ? "modifié" : "ajouté"} avec succès.`
    });
  };

  const renderCourtTypesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Types de Tribunaux
            </CardTitle>
            <CardDescription>
              Gérer les différents types de tribunaux du système judiciaire
            </CardDescription>
          </div>
          <Button onClick={() => handleAdd("court-type")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {courtTypesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom (FR)</TableHead>
                <TableHead>Nom (AR)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courtTypes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell dir="rtl">{item.name_ar}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'civil' ? 'default' : 'secondary'}>
                      {item.type === 'civil' ? 'Civil' : 'Administratif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit('court-type', item.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete('court-type', item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderCategoriesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Catégories de Droits
            </CardTitle>
            <CardDescription>
              Gérer la classification des droits fondamentaux ({categories.length} catégories)
            </CardDescription>
          </div>
          <Button onClick={handleAddCategory} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categoriesLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement des catégories...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom (FR)</TableHead>
                <TableHead>Nom (AR)</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((item) => {
                const parentCategory = categories.find(cat => cat.id === item.parent_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell dir="rtl">{item.name_ar || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground font-mono">{item.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parentCategory ? parentCategory.name : "Racine"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCategory(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(item.id)}
                          disabled={deleteCategory.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderDocumentTypesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Types de Fiches
            </CardTitle>
            <CardDescription>
              Gérer les différents types de documents juridiques
            </CardDescription>
          </div>
          <Button onClick={() => handleAdd("document-types")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom (FR)</TableHead>
              <TableHead>Nom (AR)</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentTypes.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell dir="rtl">{item.name_ar}</TableCell>
                <TableCell className="text-muted-foreground">{item.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit('document-type', item.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete('document-type', item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderLanguagesTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langues
            </CardTitle>
            <CardDescription>
              Configurer les langues supportées par le système
            </CardDescription>
          </div>
          <Button onClick={() => handleAdd("languages")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Nom natif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languages.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.name_native}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {item.is_default && <Badge variant="default">Par défaut</Badge>}
                    {item.is_active && <Badge variant="secondary">Active</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit('language', item.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete('language', item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderUsersTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs & Rôles
            </CardTitle>
            <CardDescription>
              Gérer les utilisateurs et leurs rôles (Admin, Éditeur, Validateur)
            </CardDescription>
          </div>
          <Button onClick={() => handleAdd("users")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Inviter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.first_name} {item.last_name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <Badge variant={
                    item.role === "admin" ? "default" : 
                    item.role === "editor" ? "secondary" : "outline"
                  }>
                    {item.role === "admin" ? "Admin" : 
                     item.role === "editor" ? "Éditeur" : "Validateur"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit('user', item.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete('user', item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderJurisdictionLevelsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Niveaux de Juridiction
            </CardTitle>
            <CardDescription>
              Configurer la hiérarchie des juridictions
            </CardDescription>
          </div>
          <Button onClick={() => handleAdd("jurisdiction-level")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jurisdictionLevelsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordre</TableHead>
                <TableHead>Nom (FR)</TableHead>
                <TableHead>Nom (AR)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jurisdictionLevels.sort((a, b) => a.level_order - b.level_order).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{item.level_order}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell dir="rtl">{item.name_ar}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'civil' ? 'default' : 'secondary'}>
                      {item.type === 'civil' ? 'Civil' : 'Administratif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.value}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit('jurisdiction-level', item.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete('jurisdiction-level', item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres de Configuration</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres système de l'Observatoire des Droits Fondamentaux
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="court-types">Tribunaux</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="document-types">Types Fiches</TabsTrigger>
          <TabsTrigger value="languages">Langues</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="jurisdiction-levels">Juridictions</TabsTrigger>
        </TabsList>

        <TabsContent value="court-types" className="space-y-4">
          {renderCourtTypesTab()}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {renderCategoriesTab()}
        </TabsContent>

        <TabsContent value="document-types" className="space-y-4">
          {renderDocumentTypesTab()}
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          {renderLanguagesTab()}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {renderUsersTab()}
        </TabsContent>

        <TabsContent value="jurisdiction-levels" className="space-y-4">
          {renderJurisdictionLevelsTab()}
        </TabsContent>
      </Tabs>

      {/* Category Form Dialog */}
      <CategoryForm
        isOpen={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        category={editingCategory}
      />

      {/* Generic Dialog for other sections (will be replaced with specific forms) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier" : "Ajouter"} un élément
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom (FR)</Label>
              <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_ar" className="text-right">Nom (AR)</Label>
              <Input id="name_ar" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave}>
              {editingId ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminParametres;