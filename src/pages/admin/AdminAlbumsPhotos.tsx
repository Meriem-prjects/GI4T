import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Camera, Eye, X, ImagePlus, Loader2 } from "lucide-react";

interface PhotoAlbum {
    id: string;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    date: string;
    location: string;
    location_ar: string;
    governorate: string;
    category: string;
    cover_image_url: string;
    photo_urls: string[];
    photo_count: number;
    views: number;
    featured: boolean;
    published: boolean;
    created_at: string;
}

const CATEGORIES = ["Événements", "Formations", "Campagnes", "Conférences", "Ateliers", "Cérémonies"];
const GOVERNORATES = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
    "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
    "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Médenine",
    "Tataouine", "Gafsa", "Tozeur", "Kébili"
];

const emptyAlbum = (): Partial<PhotoAlbum> => ({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    date: "",
    location: "",
    location_ar: "",
    governorate: "",
    category: "Campagnes",
    cover_image_url: "",
    photo_urls: [],
    featured: false,
    published: true,
});

const AdminAlbumsPhotos = () => {
    const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
    const [editingAlbum, setEditingAlbum] = useState<Partial<PhotoAlbum>>(emptyAlbum());
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [saving, setSaving] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const photosInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("photo_albums")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            setAlbums(data || []);
        }
        setLoading(false);
    };

    // Client-side compression to keep the multipart body small — phone
    // photos are routinely 5-10 MB. We convert everything to WebP and
    // iteratively step quality + dimensions down until the encoded
    // blob fits under TARGET_MAX_BYTES. Non-images or files already
    // under target are shipped as-is.
    const TARGET_MAX_BYTES = 80 * 1024; // 80 KB
    const compressImage = async (
        file: File,
    ): Promise<{ blob: Blob; extension: string }> => {
        if (!file.type.startsWith("image/")) {
            return { blob: file, extension: "" };
        }
        try {
            const bitmap = await createImageBitmap(file);
            // Grid of (maxDim, quality) attempts, sorted by "best quality first".
            // The loop stops at the first attempt that fits under 80 KB — so a
            // small file lands on the very first, high-quality tier and we
            // avoid unnecessary re-encodes.
            const maxDims = [1920, 1600, 1280, 1024, 800];
            const qualities = [0.85, 0.75, 0.65, 0.55, 0.45];
            let bestBlob: Blob | null = null;
            for (const maxDim of maxDims) {
                const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
                const w = Math.round(bitmap.width * scale);
                const h = Math.round(bitmap.height * scale);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                if (!ctx) continue;
                ctx.drawImage(bitmap, 0, 0, w, h);
                for (const quality of qualities) {
                    const blob: Blob | null = await new Promise((resolve) =>
                        canvas.toBlob((b) => resolve(b), "image/webp", quality),
                    );
                    if (!blob) continue;
                    bestBlob = blob; // remember the smallest we've made so far
                    if (blob.size <= TARGET_MAX_BYTES) {
                        return { blob, extension: "webp" };
                    }
                }
            }
            // Never reached target — return the smallest attempt anyway so
            // upload still works. Upstream saw this as "compressed image
            // could not hit target" but shipping the smallest WebP is
            // still much better than the original.
            if (bestBlob) return { blob: bestBlob, extension: "webp" };
            return { blob: file, extension: "" };
        } catch {
            return { blob: file, extension: "" };
        }
    };

    const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
        const { blob, extension } = await compressImage(file);
        // If compression rewrote the extension (jpg → webp), replace it
        // on the target key so the file lands with the correct suffix.
        const finalPath = extension
            ? `${path.replace(/\.[a-z0-9]+$/i, "")}.${extension}`
            : path;
        // The backend renames the file with a UUID prefix at save time,
        // so we MUST build the public URL from the key it returns
        // (`uploadData.path`) rather than the path we submitted — the
        // submitted name never lands on disk.
        const { data: uploadData, error } = await supabase.storage
            .from(bucket)
            .upload(finalPath, blob, { upsert: true });
        if (error || !uploadData) {
            toast({ title: "Erreur upload", description: error?.message ?? "Upload failed", variant: "destructive" });
            return null;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
        return data.publicUrl;
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCover(true);
        const path = `covers/${Date.now()}-${file.name}`;
        const url = await uploadFile(file, "album-photos", path);
        if (url) setEditingAlbum(prev => ({ ...prev, cover_image_url: url }));
        setUploadingCover(false);
    };

    const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploadingPhotos(true);
        // Upload in parallel — the sequential loop turned N photos into
        // N × round-trip latency. The backend and browser both cope with
        // concurrent multipart POSTs just fine.
        const results = await Promise.all(
            files.map((file, i) => {
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const path = `photos/${Date.now()}-${i}-${safeName}`;
                return uploadFile(file, "album-photos", path);
            }),
        );
        const urls = results.filter((u): u is string => !!u);
        setEditingAlbum(prev => ({
            ...prev,
            photo_urls: [...(prev.photo_urls || []), ...urls],
            photo_count: (prev.photo_count || 0) + urls.length,
        }));
        setUploadingPhotos(false);
    };

    const removePhoto = (index: number) => {
        setEditingAlbum(prev => {
            const newUrls = [...(prev.photo_urls || [])];
            newUrls.splice(index, 1);
            return { ...prev, photo_urls: newUrls, photo_count: newUrls.length };
        });
    };

    const handleSave = async () => {
        if (!editingAlbum.title) {
            toast({ title: "Champ requis", description: "Le titre est obligatoire", variant: "destructive" });
            return;
        }
        setSaving(true);
        const payload = { ...editingAlbum, photo_count: editingAlbum.photo_urls?.length || 0, updated_at: new Date().toISOString() };

        let error;
        if (isEditing && editingAlbum.id) {
            ({ error } = await (supabase as any).from("photo_albums").update(payload).eq("id", editingAlbum.id));
        } else {
            ({ error } = await (supabase as any).from("photo_albums").insert(payload));
        }

        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Succès", description: isEditing ? "Album mis à jour" : "Album créé" });
            setDialogOpen(false);
            fetchAlbums();
        }
        setSaving(false);
    };

    const handleEdit = (album: PhotoAlbum) => {
        setEditingAlbum(album);
        setIsEditing(true);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setEditingAlbum(emptyAlbum());
        setIsEditing(false);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!albumToDelete) return;
        const { error } = await (supabase as any).from("photo_albums").delete().eq("id", albumToDelete);
        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Album supprimé" });
            fetchAlbums();
        }
        setDeleteDialogOpen(false);
        setAlbumToDelete(null);
    };

    const confirmDelete = (id: string) => {
        setAlbumToDelete(id);
        setDeleteDialogOpen(true);
    };

    const togglePublished = async (album: PhotoAlbum) => {
        const { error } = await (supabase as any).from("photo_albums").update({ published: !album.published }).eq("id", album.id);
        if (!error) fetchAlbums();
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Albums Photos</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérer la galerie d'événements et de campagnes</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleNew} className="gap-2">
                            <Plus className="w-4 h-4" /> Ajouter un album
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Modifier l'album" : "Ajouter un album"}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Titre */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Titre (FR) *</Label>
                                    <Input value={editingAlbum.title || ""} onChange={e => setEditingAlbum(p => ({ ...p, title: e.target.value }))} placeholder="Titre de l'album" />
                                </div>
                                <div>
                                    <Label>Titre (AR)</Label>
                                    <Input value={editingAlbum.title_ar || ""} onChange={e => setEditingAlbum(p => ({ ...p, title_ar: e.target.value }))} placeholder="عنوان الألبوم" dir="rtl" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Description (FR)</Label>
                                    <Textarea value={editingAlbum.description || ""} onChange={e => setEditingAlbum(p => ({ ...p, description: e.target.value }))} rows={3} />
                                </div>
                                <div>
                                    <Label>Description (AR)</Label>
                                    <Textarea value={editingAlbum.description_ar || ""} onChange={e => setEditingAlbum(p => ({ ...p, description_ar: e.target.value }))} rows={3} dir="rtl" />
                                </div>
                            </div>

                            {/* Catégorie / Gouvernorat / Date */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label>Catégorie</Label>
                                    <Select value={editingAlbum.category || "Campagnes"} onValueChange={v => setEditingAlbum(p => ({ ...p, category: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Gouvernorat</Label>
                                    <Select value={editingAlbum.governorate || ""} onValueChange={v => setEditingAlbum(p => ({ ...p, governorate: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                        <SelectContent>{GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" value={editingAlbum.date || ""} onChange={e => setEditingAlbum(p => ({ ...p, date: e.target.value }))} />
                                </div>
                            </div>

                            {/* Localisation */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Lieu (FR)</Label>
                                    <Input value={editingAlbum.location || ""} onChange={e => setEditingAlbum(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Centre-ville de Tunis" />
                                </div>
                                <div>
                                    <Label>Lieu (AR)</Label>
                                    <Input value={editingAlbum.location_ar || ""} onChange={e => setEditingAlbum(p => ({ ...p, location_ar: e.target.value }))} placeholder="مدينة تونس" dir="rtl" />
                                </div>
                            </div>

                            {/* Image de couverture */}
                            <div>
                                <Label>Image de couverture</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    {editingAlbum.cover_image_url ? (
                                        <div className="relative">
                                            <img src={editingAlbum.cover_image_url} alt="Cover" className="w-24 h-16 object-cover rounded border" />
                                            <button onClick={() => setEditingAlbum(p => ({ ...p, cover_image_url: "" }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                        </div>
                                    ) : null}
                                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                                    <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                                        {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                                        {uploadingCover ? "Upload..." : "Choisir une image"}
                                    </Button>
                                </div>
                            </div>

                            {/* Photos de l'album */}
                            <div>
                                <Label>Photos de l'album ({editingAlbum.photo_urls?.length || 0} images)</Label>
                                <div className="mt-2">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {editingAlbum.photo_urls?.map((url, i) => (
                                            <div key={i} className="relative">
                                                <img src={url} alt={`Photo ${i + 1}`} className="w-20 h-14 object-cover rounded border" />
                                                <button onClick={() => removePhoto(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <input ref={photosInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosUpload} />
                                    <Button variant="outline" size="sm" onClick={() => photosInputRef.current?.click()} disabled={uploadingPhotos}>
                                        {uploadingPhotos ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ImagePlus className="w-4 h-4 mr-1" />}
                                        {uploadingPhotos ? "Upload en cours..." : "Ajouter des photos"}
                                    </Button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch checked={editingAlbum.featured || false} onCheckedChange={v => setEditingAlbum(p => ({ ...p, featured: v }))} />
                                    <Label>À la une</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={editingAlbum.published !== false} onCheckedChange={v => setEditingAlbum(p => ({ ...p, published: v }))} />
                                    <Label>Publié</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                    {isEditing ? "Mettre à jour" : "Créer l'album"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total albums", value: albums.length, icon: Camera },
                    { label: "Publiés", value: albums.filter(a => a.published).length, icon: Eye },
                    { label: "À la une", value: albums.filter(a => a.featured).length, icon: Camera },
                    { label: "Total photos", value: albums.reduce((s, a) => s + (a.photo_count || 0), 0), icon: ImagePlus },
                ].map(stat => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Albums List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : albums.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-slate-400">
                        <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Aucun album pour le moment. Cliquez sur « Ajouter un album » pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {albums.map(album => (
                        <Card key={album.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-slate-100 relative">
                                {album.cover_image_url ? (
                                    <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Camera className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {album.featured && <Badge className="bg-yellow-500 text-white text-xs">À la une</Badge>}
                                    <Badge className={album.published ? "bg-green-500 text-white text-xs" : "bg-slate-400 text-white text-xs"}>
                                        {album.published ? "Publié" : "Brouillon"}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{album.title}</h3>
                                        <p className="text-xs text-slate-400">{album.governorate} · {album.date}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs ml-2 whitespace-nowrap">{album.category}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                                    <span>{album.photo_count || 0} photos</span>
                                    <span>{album.views || 0} vues</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleEdit(album)}>
                                        <Pencil className="w-3 h-3 mr-1" /> Modifier
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs" onClick={() => togglePublished(album)}>
                                        {album.published ? "Dépublier" : "Publier"}
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700 text-xs" onClick={() => confirmDelete(album.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement l'album et tous ses liens de la base de données.
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

export default AdminAlbumsPhotos;

