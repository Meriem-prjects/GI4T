import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Download, Loader2, FileText, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PracticalResource {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  category_ar?: string;
  downloads: number;
  display_order: number;
  is_published: boolean;
}

const emptyForm: Partial<PracticalResource> = {
  title: "",
  title_ar: "",
  description: "",
  description_ar: "",
  file_url: "",
  category: "",
  display_order: 0,
  is_published: true,
};

const AdminPracticalResources = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<PracticalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PracticalResource> | null>(null);
  const [deleting, setDeleting] = useState<PracticalResource | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("practical_resources")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setItems((data as PracticalResource[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const { data, error } = await supabase.storage.from("documents").upload(file.name, file);
      if (error) throw error;
      const publicUrl = (data as { publicUrl?: string })?.publicUrl ?? "";
      setEditing((prev) => ({
        ...(prev ?? {}),
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
      }));
      toast({ title: "Fichier uploadé" });
    } catch (e) {
      toast({ title: "Échec upload", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing || !editing.title) {
      toast({ title: "Champ requis", description: "Le titre est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...editing };
    delete (payload as { id?: string }).id;
    const op = editing.id
      ? supabase.from("practical_resources").update(payload).eq("id", editing.id)
      : supabase.from("practical_resources").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) {
      toast({ title: "Échec", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing.id ? "Ressource modifiée" : "Ressource créée" });
      setEditing(null);
      load();
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("practical_resources").delete().eq("id", deleting.id);
    if (error) {
      toast({ title: "Échec suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ressource supprimée" });
      setDeleting(null);
      load();
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ressources pratiques</h2>
          <p className="text-sm text-muted-foreground">Modèles, formulaires et documents téléchargeables</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyForm })}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une ressource
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Aucune ressource. Cliquez sur « Ajouter une ressource » pour en créer une.
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    {!item.is_published && <Badge variant="outline">Brouillon</Badge>}
                    {item.category && <Badge variant="secondary">{item.category}</Badge>}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.file_url && (
                      <a href={item.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <Download className="h-3 w-3" />
                        Télécharger
                      </a>
                    )}
                    <span>{item.downloads} téléchargement(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(item)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Titre (FR) *</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Titre (AR)</Label>
                  <Input dir="rtl" value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Fichier</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                    }}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {editing.file_url && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    {editing.file_url}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Description (FR)</Label>
                  <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (AR)</Label>
                  <Textarea rows={3} dir="rtl" value={editing.description_ar ?? ""} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Modèles, Formulaires..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie (AR)</Label>
                  <Input dir="rtl" value={editing.category_ar ?? ""} onChange={(e) => setEditing({ ...editing, category_ar: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ordre</Label>
                  <Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_published ?? true} onCheckedChange={(c) => setEditing({ ...editing, is_published: c })} />
                <Label>Publié</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing?.id ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleting?.title} » sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPracticalResources;
