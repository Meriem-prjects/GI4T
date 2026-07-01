import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Video, Eye, Loader2, Film, Headphones, Mic } from "lucide-react";

interface MediaItem {
    id: string;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    type: string;
    category: string;
    category_id: string;
    governorate: string;
    video_url: string;
    thumbnail_url: string;
    duration: string;
    views: number;
    likes: number;
    featured: boolean;
    published: boolean;
    created_at: string;
}

const TYPES = ["Vidéo", "Audio", "Webinaire"];
const CATEGORIES = [
    { id: "testimonials", name: "Témoignages" },
    { id: "tutorials", name: "Tutoriels" },
    { id: "podcasts", name: "Podcasts" },
    { id: "trainings", name: "Formations" },
    { id: "documentaries", name: "Documentaires" },
    { id: "interviews", name: "Interviews" },
    { id: "campaigns", name: "Campagnes terrain" },
];
const GOVERNORATES = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
    "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
    "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Médenine",
    "Tataouine", "Gafsa", "Tozeur", "Kébili"
];

const emptyItem = (): Partial<MediaItem> => ({
    title: "", title_ar: "", description: "", description_ar: "",
    type: "Vidéo", category: "Campagnes terrain", category_id: "campaigns",
    governorate: "", video_url: "", thumbnail_url: "", duration: "",
    featured: false, published: true,
});

const getTypeIcon = (type: string) => {
    if (type === "Audio") return Headphones;
    if (type === "Webinaire") return Mic;
    return Video;
};

const AdminMediatheque = () => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<Partial<MediaItem>>(emptyItem());
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [saving, setSaving] = useState(false);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("media_items")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
        else setItems(data || []);
        setLoading(false);
    };

    const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingThumb(true);
        const path = `thumbnails/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
        if (error) {
            toast({ title: "Erreur upload", description: error.message, variant: "destructive" });
        } else {
            const { data } = supabase.storage.from("media").getPublicUrl(path);
            setEditingItem(p => ({ ...p, thumbnail_url: data.publicUrl }));
        }
        setUploadingThumb(false);
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingVideo(true);
        const folder = editingItem.type === "Audio" ? "audios" : "videos";
        const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
        if (error) {
            toast({ title: "Erreur d'envoi", description: error.message, variant: "destructive" });
        } else {
            const { data } = supabase.storage.from("media").getPublicUrl(path);
            setEditingItem(p => ({ ...p, video_url: data.publicUrl }));
            toast({ title: "Envoi réussi", description: "Le fichier média a été mis en ligne" });
        }
        setUploadingVideo(false);
    };

    const handleSave = async () => {
        if (!editingItem.title) {
            toast({ title: "Champ requis", description: "Le titre est obligatoire", variant: "destructive" });
            return;
        }
        setSaving(true);
        const payload = { ...editingItem, updated_at: new Date().toISOString() };
        let error;
        if (isEditing && editingItem.id) {
            ({ error } = await (supabase as any).from("media_items").update(payload).eq("id", editingItem.id));
        } else {
            ({ error } = await (supabase as any).from("media_items").insert(payload));
        }
        if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Succès", description: isEditing ? "Média mis à jour" : "Média créé" });
            setDialogOpen(false);
            fetchItems();
        }
        setSaving(false);
    };

    const handleEdit = (item: MediaItem) => { setEditingItem(item); setIsEditing(true); setDialogOpen(true); };
    const handleNew = () => { setEditingItem(emptyItem()); setIsEditing(false); setDialogOpen(true); };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        const { error } = await (supabase as any).from("media_items").delete().eq("id", itemToDelete);
        if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
        else { toast({ title: "Média supprimé" }); fetchItems(); }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const togglePublished = async (item: MediaItem) => {
        await (supabase as any).from("media_items").update({ published: !item.published }).eq("id", item.id);
        fetchItems();
    };

    const handleCategoryChange = (name: string) => {
        const cat = CATEGORIES.find(c => c.name === name);
        setEditingItem(p => ({ ...p, category: name, category_id: cat?.id || "" }));
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Médiathèque</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérer les vidéos, audios et témoignages</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleNew} className="gap-2">
                            <Plus className="w-4 h-4" /> Ajouter un média
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Modifier le média" : "Ajouter un média"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">

                            {/* Titres */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Titre (FR) *</Label>
                                    <Input value={editingItem.title || ""} onChange={e => setEditingItem(p => ({ ...p, title: e.target.value }))} placeholder="Titre du média" />
                                </div>
                                <div>
                                    <Label>Titre (AR)</Label>
                                    <Input value={editingItem.title_ar || ""} onChange={e => setEditingItem(p => ({ ...p, title_ar: e.target.value }))} dir="rtl" placeholder="عنوان الوسائط" />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Description (FR)</Label>
                                    <Textarea value={editingItem.description || ""} onChange={e => setEditingItem(p => ({ ...p, description: e.target.value }))} rows={3} />
                                </div>
                                <div>
                                    <Label>Description (AR)</Label>
                                    <Textarea value={editingItem.description_ar || ""} onChange={e => setEditingItem(p => ({ ...p, description_ar: e.target.value }))} rows={3} dir="rtl" />
                                </div>
                            </div>

                            {/* Type / Catégorie / Gouvernorat */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label>Type</Label>
                                    <Select value={editingItem.type || "Vidéo"} onValueChange={v => setEditingItem(p => ({ ...p, type: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Catégorie</Label>
                                    <Select value={editingItem.category || "Campagnes terrain"} onValueChange={handleCategoryChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Gouvernorat</Label>
                                    <Select value={editingItem.governorate || ""} onValueChange={v => setEditingItem(p => ({ ...p, governorate: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                        <SelectContent>{GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* URL Vidéo / Durée */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <Label>URL de la vidéo / audio</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input value={editingItem.video_url || ""} onChange={e => setEditingItem(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/... ou lien direct" />
                                        <input ref={videoInputRef} type="file" accept="video/*,audio/*" className="hidden" onChange={handleVideoUpload} />
                                        <Button variant="outline" size="icon" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo} title="Uploader un fichier">
                                            {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Vous pouvez coller un lien YouTube/Vimeo ou uploader un fichier directement.</p>
                                </div>
                                <div>
                                    <Label>Durée</Label>
                                    <Input value={editingItem.duration || ""} onChange={e => setEditingItem(p => ({ ...p, duration: e.target.value }))} placeholder="Ex: 12:35" className="mt-1" />
                                </div>
                            </div>

                            {/* Miniature */}
                            <div>
                                <Label>Image miniature</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    {editingItem.thumbnail_url && (
                                        <img src={editingItem.thumbnail_url} alt="Thumb" className="w-24 h-16 object-cover rounded border" />
                                    )}
                                    <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
                                    <Button variant="outline" size="sm" onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb}>
                                        {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                                        {uploadingThumb ? "Upload..." : "Choisir une miniature"}
                                    </Button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch checked={editingItem.featured || false} onCheckedChange={v => setEditingItem(p => ({ ...p, featured: v }))} />
                                    <Label>À la une</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={editingItem.published !== false} onCheckedChange={v => setEditingItem(p => ({ ...p, published: v }))} />
                                    <Label>Publié</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                    {isEditing ? "Mettre à jour" : "Créer le média"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total médias", value: items.length, icon: Film },
                    { label: "Publiés", value: items.filter(i => i.published).length, icon: Eye },
                    { label: "Vidéos", value: items.filter(i => i.type === "Vidéo").length, icon: Video },
                    { label: "À la une", value: items.filter(i => i.featured).length, icon: Film },
                ].map(stat => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className="w-8 h-8 text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Items list */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : items.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-slate-400">
                        <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Aucun média pour le moment. Cliquez sur « Ajouter un média » pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(item => {
                        const Icon = getTypeIcon(item.type);
                        return (
                            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-slate-100 relative flex items-center justify-center">
                                    {item.thumbnail_url ? (
                                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon className="w-10 h-10 text-slate-300" />
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {item.featured && <Badge className="bg-yellow-500 text-white text-xs">À la une</Badge>}
                                        <Badge className={item.published ? "bg-green-500 text-white text-xs" : "bg-slate-400 text-white text-xs"}>
                                            {item.published ? "Publié" : "Brouillon"}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-2 left-2">
                                        <Badge variant="outline" className="bg-black/60 text-white border-none text-xs">{item.type}</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                                            <p className="text-xs text-slate-400">{item.governorate} · {item.duration}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs ml-2 whitespace-nowrap">{item.category}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(item)}>
                                            <Pencil className="w-3 h-3 mr-1" /> Modifier
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-xs" onClick={() => togglePublished(item)}>
                                            {item.published ? "Dépublier" : "Publier"}
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700 text-xs" onClick={() => confirmDelete(item.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
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
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement le média de la base de données.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminMediatheque;

