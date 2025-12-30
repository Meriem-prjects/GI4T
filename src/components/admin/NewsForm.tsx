import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { News, NewsFormData, NEWS_CATEGORIES } from "@/types/news";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: NewsFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const NewsForm = ({ initialData, onSubmit, onCancel, isLoading }: NewsFormProps) => {
  const [formData, setFormData] = useState<NewsFormData>({
    title: initialData?.title || "",
    title_ar: initialData?.title_ar || "",
    excerpt: initialData?.excerpt || "",
    excerpt_ar: initialData?.excerpt_ar || "",
    content: initialData?.content || "",
    content_ar: initialData?.content_ar || "",
    category: initialData?.category || "odf",
    tags: initialData?.tags || [],
    tags_ar: initialData?.tags_ar || [],
    image_url: initialData?.image_url || "",
    read_time: initialData?.read_time || 5,
    is_featured: initialData?.is_featured || false,
    is_published: initialData?.is_published ?? true,
  });

  const [tagInput, setTagInput] = useState("");
  const [tagInputAr, setTagInputAr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = (isArabic: boolean = false) => {
    const input = isArabic ? tagInputAr : tagInput;
    if (input.trim()) {
      if (isArabic) {
        setFormData(prev => ({
          ...prev,
          tags_ar: [...(prev.tags_ar || []), input.trim()]
        }));
        setTagInputAr("");
      } else {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), input.trim()]
        }));
        setTagInput("");
      }
    }
  };

  const removeTag = (index: number, isArabic: boolean = false) => {
    if (isArabic) {
      setFormData(prev => ({
        ...prev,
        tags_ar: (prev.tags_ar || []).filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tags: (prev.tags || []).filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre (Français) *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Titre de l'actualité"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ar">Titre (Arabe)</Label>
              <Input
                id="title_ar"
                value={formData.title_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                placeholder="عنوان الخبر"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="excerpt">Extrait (Français) *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                required
                placeholder="Résumé court de l'actualité"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt_ar">Extrait (Arabe)</Label>
              <Textarea
                id="excerpt_ar"
                value={formData.excerpt_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt_ar: e.target.value }))}
                placeholder="ملخص قصير للخبر"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content">Contenu (Français)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenu détaillé de l'actualité"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_ar">Contenu (Arabe)</Label>
              <Textarea
                id="content_ar"
                value={formData.content_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, content_ar: e.target.value }))}
                placeholder="المحتوى التفصيلي للخبر"
                rows={6}
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catégorisation et médias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as News['category'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {NEWS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tags (Français)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ajouter un tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={() => addTag()}>
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(index)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags (Arabe)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInputAr}
                  onChange={(e) => setTagInputAr(e.target.value)}
                  placeholder="إضافة وسم"
                  dir="rtl"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(true))}
                />
                <Button type="button" variant="outline" onClick={() => addTag(true)}>
                  إضافة
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags_ar?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1" dir="rtl">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(index, true)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Article à la une</Label>
              <p className="text-sm text-muted-foreground">
                Afficher cet article en vedette sur la page d'accueil
              </p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Publié</Label>
              <p className="text-sm text-muted-foreground">
                Rendre l'article visible au public
              </p>
            </div>
            <Switch
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
};

export default NewsForm;
