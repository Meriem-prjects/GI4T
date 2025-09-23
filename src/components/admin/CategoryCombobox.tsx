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
      <PopoverContent className="w-80 p-0 bg-popover border border-border shadow-lg" align="start">
        <Command className="bg-popover">
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-b border-border bg-popover text-popover-foreground"
          />
          <CommandList className="bg-popover">
            <CommandEmpty className="text-muted-foreground">{emptyText}</CommandEmpty>
            <CommandGroup className="bg-popover">
              {showAllOption && (
                <CommandItem
                  key={allOptionValue}
                  value={allOptionValue}
                  onSelect={() => {
                    onValueChange(allOptionValue);
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isAllSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {allOptionText}
                </CommandItem>
              )}
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};