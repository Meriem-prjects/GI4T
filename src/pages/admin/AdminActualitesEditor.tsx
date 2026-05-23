import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface NewsFormData {
  title: string;
  title_ar: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  category: string;
  image_url: string;
  tags: string[];
  tags_ar: string[];
  read_time: number;
  is_featured: boolean;
  is_published: boolean;
}

const CATEGORIES = [
  { value: "jurisprudence", label: "Jurisprudence" },
  { value: "odf", label: "ODF" },
  { value: "event", label: "Événement" },
  { value: "publication", label: "Publication" },
  { value: "acces_droits", label: "Accès aux Droits" },
];

type Section = "observatoire" | "acces_droits";

interface AdminActualitesEditorProps {
  /**
   * Which admin section is rendering this editor. Sets the `section`
   * column on save and decides the URL we navigate back to.
   */
  section?: Section;
}

const AdminActualitesEditor = ({ section = "observatoire" }: AdminActualitesEditorProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;
  const listUrl =
    section === "acces_droits"
      ? "/admin/acces-aux-droits/actualites"
      : "/admin/observatoire/actualites";
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagInputAr, setTagInputAr] = useState("");
  
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    title_ar: "",
    excerpt: "",
    excerpt_ar: "",
    content: "",
    content_ar: "",
    category: "odf",
    image_url: "",
    tags: [],
    tags_ar: [],
    read_time: 5,
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    if (isEditing) {
      loadNews();
    }
  }, [id]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          title: data.title || "",
          title_ar: data.title_ar || "",
          excerpt: data.excerpt || "",
          excerpt_ar: data.excerpt_ar || "",
          content: data.content || "",
          content_ar: data.content_ar || "",
          category: data.category || "odf",
          image_url: data.image_url || "",
          tags: data.tags || [],
          tags_ar: data.tags_ar || [],
          read_time: data.read_time || 5,
          is_featured: data.is_featured || false,
          is_published: data.is_published || false,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement de l'actualité");
      navigate(listUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const addTag = (lang: "fr" | "ar") => {
    const input = lang === "fr" ? tagInput : tagInputAr;
    const field = lang === "fr" ? "tags" : "tags_ar";
    
    if (input.trim()) {
      const newTags = [...formData[field], input.trim()];
      setFormData(prev => ({ ...prev, [field]: newTags }));
      if (lang === "fr") {
        setTagInput("");
      } else {
        setTagInputAr("");
      }
    }
  };

  const removeTag = (index: number, lang: "fr" | "ar") => {
    const field = lang === "fr" ? "tags" : "tags_ar";
    const newTags = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newTags }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error("L'extrait est obligatoire");
      return;
    }
    if (!formData.category) {
      toast.error("La catégorie est obligatoire");
      return;
    }

    setSaving(true);
    try {
      const newsData = {
        title: formData.title,
        title_ar: formData.title_ar || null,
        excerpt: formData.excerpt,
        excerpt_ar: formData.excerpt_ar || null,
        content: formData.content || null,
        content_ar: formData.content_ar || null,
        category: formData.category,
        image_url: formData.image_url || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        tags_ar: formData.tags_ar.length > 0 ? formData.tags_ar : null,
        read_time: formData.read_time,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
        created_by: user?.id || null,
        // Tag the news with the section that's editing it so each
        // admin space only sees its own actualités.
        section,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", id);
        
        if (error) throw error;
        toast.success("Actualité mise à jour avec succès");
      } else {
        const { error } = await supabase
          .from("news")
          .insert([newsData]);
        
        if (error) throw error;
        toast.success("Actualité créée avec succès");
      }

      navigate(listUrl);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(listUrl)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Modifier l'actualité" : "Nouvelle actualité"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Modifiez les informations de l'actualité" : "Créez une nouvelle actualité"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(listUrl)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="fr" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>

            <TabsContent value="fr" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu en français</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de l'actualité"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Extrait *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Court résumé de l'actualité"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu</Label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Contenu complet de l'actualité..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Ajouter un tag"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag("fr"))}
                      />
                      <Button type="button" variant="outline" onClick={() => addTag("fr")}>
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => removeTag(index, "fr")}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>المحتوى بالعربية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" dir="rtl">
                  <div className="space-y-2">
                    <Label htmlFor="title_ar">العنوان</Label>
                    <Input
                      id="title_ar"
                      value={formData.title_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                      placeholder="عنوان الخبر"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt_ar">الملخص</Label>
                    <Textarea
                      id="excerpt_ar"
                      value={formData.excerpt_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt_ar: e.target.value }))}
                      placeholder="ملخص قصير للخبر"
                      rows={3}
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المحتوى</Label>
                    <RichTextEditor
                      content={formData.content_ar}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_ar: content }))}
                      placeholder="المحتوى الكامل للخبر..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الكلمات المفتاحية</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInputAr}
                        onChange={(e) => setTagInputAr(e.target.value)}
                        placeholder="أضف كلمة مفتاحية"
                        className="text-right"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag("ar"))}
                      />
                      <Button type="button" variant="outline" onClick={() => addTag("ar")}>
                        إضافة
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags_ar.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => removeTag(index, "ar")}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Publication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_published">Publier</Label>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">À la une</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category & Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="read_time">Temps de lecture (min)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min={1}
                  value={formData.read_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Image de couverture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.image_url ? (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Couverture"
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Aucune image sélectionnée
                  </p>
                </div>
              )}
              
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? "Téléchargement..." : "Télécharger une image"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminActualitesEditor;
