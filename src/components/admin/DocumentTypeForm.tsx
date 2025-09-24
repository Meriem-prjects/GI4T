import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateDocumentType, useUpdateDocumentType, type DocumentType } from "@/hooks/useDocumentTypes";

interface DocumentTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: DocumentType | null;
}

export const DocumentTypeForm = ({ isOpen, onClose, documentType }: DocumentTypeFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: ""
  });

  const createDocumentType = useCreateDocumentType();
  const updateDocumentType = useUpdateDocumentType();

  useEffect(() => {
    if (documentType) {
      setFormData({
        name: documentType.name || "",
        name_ar: documentType.name_ar || "",
        description: documentType.description || "",
        description_ar: documentType.description_ar || ""
      });
    } else {
      setFormData({
        name: "",
        name_ar: "",
        description: "",
        description_ar: ""
      });
    }
  }, [documentType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      if (documentType) {
        await updateDocumentType.mutateAsync({
          id: documentType.id,
          ...formData
        });
      } else {
        await createDocumentType.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const isLoading = createDocumentType.isPending || updateDocumentType.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {documentType ? "Modifier le type de fiche" : "Ajouter un type de fiche"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom (FR) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Fiche d'analyse juridique"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_ar">Nom (AR)</Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder="مثال: بطاقة تحليل قانوني"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (FR)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du type de fiche..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ar">Description (AR)</Label>
            <Textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              placeholder="وصف نوع البطاقة..."
              rows={3}
              dir="rtl"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Sauvegarde..." : documentType ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};