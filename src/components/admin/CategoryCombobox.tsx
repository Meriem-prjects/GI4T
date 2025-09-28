import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(cat => cat.id === value);
  const isAllSelected = value === allOptionValue;

  const filteredCategories = useMemo(() => {
    if (!searchValue) return categories;
    
    const searchLower = searchValue.toLowerCase();
    
    return categories.filter(category => {
      const frenchMatch = category.name.toLowerCase().includes(searchLower);
      const arabicMatch = category.name_ar && 
        category.name_ar.toLowerCase().includes(searchLower);
      
      return frenchMatch || arabicMatch;
    });
  }, [categories, searchValue]);

  // Update input value when category is selected
  useEffect(() => {
    if (isAllSelected && showAllOption) {
      setInputValue(allOptionText);
    } else if (selectedCategory) {
      const displayText = showArabic && selectedCategory.name_ar ? selectedCategory.name_ar : selectedCategory.name;
      setInputValue(displayText);
    } else {
      setInputValue('');
    }
  }, [selectedCategory, isAllSelected, showAllOption, allOptionText, showArabic]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        inputRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchValue(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchValue(inputValue);
  };

  const handleCategorySelect = (categoryId: string) => {
    onValueChange(categoryId);
    setIsOpen(false);
    setSearchValue('');
  };

  const handleClear = () => {
    const resetValue = showAllOption ? (allOptionValue as string) : '';
    onValueChange(resetValue);
    setInputValue(showAllOption ? allOptionText : '');
    setSearchValue('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="flex items-center">
          {selectedCategory && (
            <div
              className="absolute left-3 w-3 h-3 rounded-full z-10"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={cn(
              "pr-8",
              selectedCategory && "pl-8"
            )}
          />
          <div className="absolute right-2 flex items-center space-x-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-[100] w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto",
            className?.includes('dropdown-up') ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="p-2">
            {showAllOption && (
              <div
                onClick={() => handleCategorySelect(allOptionValue)}
                className={cn(
                  "flex items-center space-x-2 p-2 cursor-pointer rounded hover:bg-muted",
                  isAllSelected && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    isAllSelected ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{allOptionText}</span>
              </div>
            )}

            {filteredCategories.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={cn(
                    "flex items-center space-x-2 p-2 cursor-pointer rounded hover:bg-muted",
                    value === category.id && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm truncate">
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};