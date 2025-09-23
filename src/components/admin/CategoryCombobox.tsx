import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  color: string;
}

interface CategoryComboboxProps {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  showAllOption?: boolean;
  allOptionText?: string;
  allOptionValue?: string;
  className?: string;
  showArabic?: boolean;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  categories,
  value,
  onValueChange,
  placeholder = "Sélectionner une catégorie",
  searchPlaceholder = "Rechercher une catégorie...",
  emptyText = "Aucune catégorie trouvée.",
  showAllOption = false,
  allOptionText = "Toutes les catégories",
  allOptionValue = "all",
  className,
  showArabic = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchValue) return categories;
    
    const searchLower = searchValue.toLowerCase();
    const searchArabic = searchValue.trim();
    
    return categories.filter(category => {
      // Search in French name (case insensitive)
      const frenchMatch = category.name.toLowerCase().includes(searchLower);
      
      // Search in Arabic name (case insensitive and trimmed)
      const arabicMatch = category.name_ar && 
        category.name_ar.toLowerCase().includes(searchArabic.toLowerCase());
      
      return frenchMatch || arabicMatch;
    });
  }, [categories, searchValue]);

  const selectedCategory = categories.find(cat => cat.id === value);
  const isAllSelected = value === allOptionValue;

  const getDisplayText = () => {
    if (isAllSelected && showAllOption) {
      return allOptionText;
    }
    if (selectedCategory) {
      if (showArabic && selectedCategory.name_ar) {
        return selectedCategory.name_ar;
      }
      return selectedCategory.name;
    }
    return placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {selectedCategory && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
            )}
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-popover border border-border shadow-lg" align="start">
        <Command className="bg-popover">
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-b border-border bg-popover text-popover-foreground px-4 py-3"
          />
          <CommandList className="bg-popover max-h-80 overflow-y-auto">
            <CommandEmpty className="text-muted-foreground py-6 text-center">{emptyText}</CommandEmpty>
            <CommandGroup className="bg-popover p-4">
              <div className="grid grid-cols-2 gap-2">
                {showAllOption && (
                  <div 
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => {
                      onValueChange(allOptionValue);
                      setOpen(false);
                      setSearchValue('');
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm font-medium">{allOptionText}</span>
                  </div>
                )}
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => {
                      onValueChange(category.id === value ? "" : category.id);
                      setOpen(false);
                      setSearchValue('');
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={value === category.id}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border"
                    />
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {showArabic && category.name_ar ? category.name_ar : category.name}
                      </span>
                      {showArabic && category.name_ar && (
                        <span className="text-xs text-muted-foreground truncate">
                          {category.name}
                        </span>
                      )}
                      {!showArabic && category.name_ar && (
                        <span className="text-xs text-muted-foreground truncate" dir="rtl">
                          {category.name_ar}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};