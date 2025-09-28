import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, useCategories, useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255, "Le nom ne peut pas dépasser 255 caractères"),
  name_ar: z.string().optional(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide (format: #RRGGBB)"),
  parent_id: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

const CategoryForm = ({ isOpen, onClose, category }: CategoryFormProps) => {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      name_ar: category?.name_ar || "",
      description: category?.description || "",
      description_ar: category?.description_ar || "",
      color: category?.color || "#3B82F6",
      parent_id: category?.parent_id || "none",
    },
  });

  const parentCategories = categories.filter(cat => 
    cat.id !== category?.id && !cat.parent_id
  );

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const categoryData: Omit<Category, "id" | "created_at" | "updated_at"> = {
        name: data.name,
        name_ar: data.name_ar || null,
        description: data.description || null,
        description_ar: data.description_ar || null,
        color: data.color,
        parent_id: data.parent_id === "none" ? null : (data.parent_id || null),
      };

      if (isEditing) {
        await updateCategory.mutateAsync({ id: category.id, ...categoryData });
      } else {
        await createCategory.mutateAsync(categoryData);
      }
      
      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les informations de la catégorie ci-dessous." 
              : "Remplissez les informations de la nouvelle catégorie."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom (FR) *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ex: Droits civils"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="name_ar">Nom (AR)</Label>
              <Input
                id="name_ar"
                {...register("name_ar")}
                placeholder="Ex: الحقوق المدنية"
                dir="rtl"
              />
              {errors.name_ar && (
                <p className="text-sm text-red-500 mt-1">{errors.name_ar.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">Description (FR)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Description en français"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description_ar">Description (AR)</Label>
              <Textarea
                id="description_ar"
                {...register("description_ar")}
                placeholder="الوصف بالعربية"
                dir="rtl"
                rows={3}
              />
              {errors.description_ar && (
                <p className="text-sm text-red-500 mt-1">{errors.description_ar.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Couleur</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  {...register("color")}
                  className="w-16 h-10 p-1"
                />
                <Input
                  {...register("color")}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              {errors.color && (
                <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="parent_id">Catégorie parente</Label>
              <Select 
                value={watch("parent_id") || "none"}
                onValueChange={(value) => setValue("parent_id", value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie parente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (isEditing ? "Modification..." : "Ajout...") 
                : (isEditing ? "Modifier" : "Ajouter")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;