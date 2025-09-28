import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Search } from 'lucide-react';
import { CategoryCombobox } from './CategoryCombobox';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  color: string;
}

interface MultiCategorySelectorProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onCategoryIdsChange: (categoryIds: string[]) => void;
  showArabic?: boolean;
  maxCategories?: number;
}

export const MultiCategorySelector: React.FC<MultiCategorySelectorProps> = ({
  categories,
  selectedCategoryIds,
  onCategoryIdsChange,
  showArabic = false,
  maxCategories = 5
}) => {
  const [newCategoryId, setNewCategoryId] = useState('');

  const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));
  const availableCategories = categories.filter(cat => !selectedCategoryIds.includes(cat.id));

  const handleAddCategory = () => {
    if (newCategoryId && !selectedCategoryIds.includes(newCategoryId) && selectedCategoryIds.length < maxCategories) {
      onCategoryIdsChange([...selectedCategoryIds, newCategoryId]);
      setNewCategoryId('');
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onCategoryIdsChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Catégories ({selectedCategoryIds.length}/{maxCategories})
      </Label>

      {/* Selected categories */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm">
                {showArabic && category.name_ar ? category.name_ar : category.name}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                onClick={() => handleRemoveCategory(category.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Add new category */}
      {selectedCategoryIds.length < maxCategories && availableCategories.length > 0 && (
        <div className="flex gap-2">
          <div className="flex-1">
            <CategoryCombobox
              categories={availableCategories}
              value={newCategoryId}
              onValueChange={setNewCategoryId}
              placeholder="Sélectionner une catégorie à ajouter"
              searchPlaceholder="Rechercher une catégorie..."
              emptyText="Aucune catégorie disponible"
              showArabic={showArabic}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCategoryId}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        {selectedCategoryIds.length === 0 && 'Aucune catégorie sélectionnée'}
        {selectedCategoryIds.length >= maxCategories && 'Limite maximum atteinte'}
        {selectedCategoryIds.length > 0 && selectedCategoryIds.length < maxCategories && 
          `${maxCategories - selectedCategoryIds.length} catégorie(s) supplémentaire(s) possible(s)`}
      </div>
    </div>
  );
};