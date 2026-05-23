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
import { Plus, Pencil, Trash2, Loader2, BookOpen, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PracticalGuide {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  category?: string;
  category_ar?: string;
  cover_image_url?: string;
  estimated_time?: string;
  difficulty?: string;
  views: number;
  display_order: number;
  is_published: boolean;
}

const emptyForm: Partial<PracticalGuide> = {
  title: "",
  title_ar: "",
  description: "",
  description_ar: "",
  content: "",
  content_ar: "",
  category: "",
  estimated_time: "",
  difficulty: "facile",
  display_order: 0,
  is_published: true,
};

const AdminPracticalGuides = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<PracticalGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PracticalGuide> | null>(null);
  const [deleting, setDeleting] = useState<PracticalGuide | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("practical_guides")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setItems((data as PracticalGuide[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!editing || !editing.title) {
      toast({ title: "Champ requis", description: "Le titre est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...editing };
    delete (payload as { id?: string }).id;
    const op = editing.id
      ? supabase.from("practical_guides").update(payload).eq("id", editing.id)
      : supabase.from("practical_guides").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) {
      toast({ title: "Échec", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing.id ? "Guide modifié" : "Guide créé" });
      setEditing(null);
      load();
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("practical_guides").delete().eq("id", deleting.id);
    if (error) {
      toast({ title: "Échec suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Guide supprimé" });
      setDeleting(null);
      load();
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Guides pratiques</h2>
          <p className="text-sm text-muted-foreground">Guides pas à pas affichés sur l'espace Accès aux Droits</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyForm })}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau guide
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Aucun guide. Cliquez sur « Nouveau guide » pour en ajouter.
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <BookOpen className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    {!item.is_published && <Badge variant="outline">Brouillon</Badge>}
                    {item.category && <Badge variant="secondary">{item.category}</Badge>}
                    {item.difficulty && <Badge variant="outline">{item.difficulty}</Badge>}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.estimated_time && <span>⏱ {item.estimated_time}</span>}
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.views} vue(s)</span>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le guide" : "Nouveau guide pratique"}</DialogTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Description (FR)</Label>
                  <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (AR)</Label>
                  <Textarea rows={2} dir="rtl" value={editing.description_ar ?? ""} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Contenu (FR) — Markdown supporté</Label>
                  <Textarea
                    rows={10}
                    value={editing.content ?? ""}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    className="font-mono text-sm"
                    placeholder="# Étape 1&#10;Description de la première étape..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contenu (AR)</Label>
                  <Textarea
                    rows={10}
                    dir="rtl"
                    value={editing.content_ar ?? ""}
                    onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Temps estimé</Label>
                  <Input value={editing.estimated_time ?? ""} onChange={(e) => setEditing({ ...editing, estimated_time: e.target.value })} placeholder="10 min" />
                </div>
                <div className="space-y-1.5">
                  <Label>Difficulté</Label>
                  <Input value={editing.difficulty ?? ""} onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })} placeholder="facile / moyen / difficile" />
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
            <AlertDialogTitle>Supprimer ce guide ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleting?.title} » sera supprimé définitivement.
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

export default AdminPracticalGuides;
