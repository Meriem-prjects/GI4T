import { useState, useEffect, useRef } from "react";
import { Search, FileText, Building, Tag, Scale } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useCourtTypes } from "@/hooks/useCourtTypes";
import { useDocumentKeywords } from "@/hooks/useDocumentKeywords";
import { useJurisdictionLevels } from "@/hooks/useJurisdictionLevels";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  language?: 'fr' | 'ar';
}

interface Suggestion {
  id: string;
  text: string;
  type: 'category' | 'court' | 'keyword' | 'jurisdiction';
  icon: React.ReactNode;
}

export const SearchAutocomplete = ({
  value,
  onChange,
  onSearch,
  placeholder,
  language = 'fr'
}: SearchAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useCategories();
  const { data: courtTypes } = useCourtTypes();
  const { data: keywords } = useDocumentKeywords(language);
  const { data: jurisdictions } = useJurisdictionLevels();

  // Build suggestions based on input
  const suggestions: Suggestion[] = [];

  if (value.trim().length >= 2) {
    const searchTerm = value.toLowerCase();
    const nameField = language === 'ar' ? 'name_ar' : 'name';

    // Add categories
    categories?.slice(0, 3).forEach(cat => {
      const text = language === 'ar' ? (cat.name_ar || cat.name) : cat.name;
      if (text.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          id: `cat-${cat.id}`,
          text,
          type: 'category',
          icon: <FileText className="w-4 h-4" />
        });
      }
    });

    // Add court types
    courtTypes?.slice(0, 3).forEach(court => {
      const text = language === 'ar' ? (court.name_ar || court.name) : court.name;
      if (text.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          id: `court-${court.id}`,
          text,
          type: 'court',
          icon: <Building className="w-4 h-4" />
        });
      }
    });

    // Add jurisdiction levels
    jurisdictions?.slice(0, 2).forEach(jur => {
      const text = language === 'ar' ? (jur.name_ar || jur.name) : jur.name;
      if (text.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          id: `jur-${jur.id}`,
          text,
          type: 'jurisdiction',
          icon: <Scale className="w-4 h-4" />
        });
      }
    });

    // Add keywords
    keywords?.slice(0, 5).forEach(kw => {
      if (kw.keyword.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          id: `kw-${kw.keyword}`,
          text: kw.keyword,
          type: 'keyword',
          icon: <Tag className="w-4 h-4" />
        });
      }
    });
  }

  // Limit total suggestions
  const limitedSuggestions = suggestions.slice(0, 8);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || limitedSuggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < limitedSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onChange(limitedSuggestions[selectedIndex].text);
          setShowSuggestions(false);
          setTimeout(onSearch, 100);
        } else {
          onSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show suggestions when typing
  useEffect(() => {
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const typeLabels = {
    category: language === 'ar' ? 'فئات' : 'Catégories',
    court: language === 'ar' ? 'المحاكم' : 'Tribunaux',
    keyword: language === 'ar' ? 'الكلمات المفتاحية' : 'Mots-clés',
    jurisdiction: language === 'ar' ? 'الاختصاص' : 'Juridictions',
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim().length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn(
            "w-full h-14 sm:h-16 rounded-xl shadow-lg pl-12 sm:pl-14 pr-4 text-base sm:text-lg font-semibold",
            "bg-white text-foreground placeholder:text-muted-foreground/70",
            "border-2 border-yellow-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-yellow-500",
            "transition-all duration-200",
            language === 'ar' && "text-right arabic-text font-arabic"
          )}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && limitedSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border z-50 max-h-96 overflow-y-auto"
        >
          {limitedSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => {
                onChange(suggestion.text);
                setShowSuggestions(false);
                setTimeout(onSearch, 100);
              }}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                "hover:bg-accent border-b border-border/50 last:border-b-0",
                index === selectedIndex && "bg-accent",
                language === 'ar' && "flex-row-reverse text-right"
              )}
            >
              <div className={cn(
                "text-primary",
                index === selectedIndex && "text-primary"
              )}>
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "text-sm font-medium text-foreground",
                  language === 'ar' && "arabic-text font-arabic"
                )}>
                  {suggestion.text}
                </div>
                <div className="text-xs text-muted-foreground">
                  {typeLabels[suggestion.type]}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
