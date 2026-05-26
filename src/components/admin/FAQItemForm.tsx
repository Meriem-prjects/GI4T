import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFAQItems, FAQItem } from "@/hooks/useFAQItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItemFormProps {
  item?: FAQItem;
  onSubmit: (data: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const FAQItemForm = ({ item, onSubmit, onCancel }: FAQItemFormProps) => {
  const [formData, setFormData] = useState({
    question: item?.question || "",
    question_ar: item?.question_ar || "",
    answer: item?.answer || "",
    answer_ar: item?.answer_ar || "",
    category: item?.category || "",
    category_ar: item?.category_ar || "",
    display_order: item?.display_order || 0,
    is_active: item?.is_active ?? true,
  });

  // Suggestions de catégories : on récupère toutes les catégories
  // existantes pour éviter les fautes de frappe et garder la cohérence.
  const { data: allItems } = useFAQItems(false);
  const existingCategories = Array.from(
    new Map(
      (allItems ?? []).map((i) => [i.category, { fr: i.category, ar: i.category_ar }]),
    ).values(),
  ).sort((a, b) => a.fr.localeCompare(b.fr));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Modifier" : "Ajouter"} une question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question (FR) *</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question_ar">Question (AR)</Label>
              <Textarea
                id="question_ar"
                value={formData.question_ar || ""}
                onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="answer">Réponse (FR) *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer_ar">Réponse (AR)</Label>
              <Textarea
                id="answer_ar"
                value={formData.answer_ar || ""}
                onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })}
                rows={5}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie (FR) *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                list="faq-existing-categories"
                placeholder="Tapez ou choisissez une catégorie existante"
              />
              <datalist id="faq-existing-categories">
                {existingCategories.map((c) => (
                  <option key={c.fr} value={c.fr} />
                ))}
              </datalist>
              {existingCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {existingCategories.slice(0, 12).map((c) => (
                    <button
                      key={c.fr}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: c.fr, category_ar: c.ar || "" })
                      }
                      className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                        formData.category === c.fr
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {c.fr}
                    </button>
                  ))}
                  {existingCategories.length > 12 && (
                    <span className="text-[11px] text-muted-foreground py-0.5">
                      +{existingCategories.length - 12} autres
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_ar">Catégorie (AR)</Label>
              <Input
                id="category_ar"
                value={formData.category_ar || ""}
                onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })}
                dir="rtl"
                placeholder="الفئة بالعربية"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_order">Ordre d'affichage</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active" className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                Active
              </Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {item ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
