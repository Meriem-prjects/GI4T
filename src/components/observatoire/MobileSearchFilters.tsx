import { useState } from "react";
import { Filter, Scale, Calendar, FileText, ChevronDown, ChevronUp, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface Category {
  id: string;
  name: string;
  name_ar?: string | null;
}

interface CourtType {
  id: string;
  name: string;
  name_ar?: string | null;
}

interface JurisdictionLevel {
  id: string;
  name: string;
  name_ar?: string | null;
}

interface DocumentType {
  id: string;
  name: string;
  name_ar?: string | null;
}

interface YearRange {
  minYear: number;
  maxYear: number;
}

interface MobileSearchFiltersProps {
  categories: Category[];
  courtTypes: CourtType[];
  jurisdictionLevels: JurisdictionLevel[];
  documentTypes: DocumentType[];
  yearRange: YearRange;
  selectedCourtType: string;
  setSelectedCourtType: (value: string) => void;
  yearFrom: string;
  setYearFrom: (value: string) => void;
  yearTo: string;
  setYearTo: (value: string) => void;
  selectedCategories: string[];
  toggleCategory: (id: string) => void;
  selectedJurisdictionLevel: string;
  setSelectedJurisdictionLevel: (value: string) => void;
  selectedDocumentType: string;
  setSelectedDocumentType: (value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const MobileSearchFilters = ({
  categories,
  courtTypes,
  jurisdictionLevels,
  documentTypes,
  yearRange,
  selectedCourtType,
  setSelectedCourtType,
  yearFrom,
  setYearFrom,
  yearTo,
  setYearTo,
  selectedCategories,
  toggleCategory,
  selectedJurisdictionLevel,
  setSelectedJurisdictionLevel,
  selectedDocumentType,
  setSelectedDocumentType,
  resetFilters,
  activeFilterCount,
}: MobileSearchFiltersProps) => {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [courtTypeOpen, setCourtTypeOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [jurisdictionOpen, setJurisdictionOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 relative"
          size="sm"
        >
          <Filter className="w-4 h-4" />
          <span>{t('filters')}</span>
          {activeFilterCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              {t('advancedFilters')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </DrawerTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary gap-1"
              onClick={resetFilters}
            >
              <RotateCcw className="w-4 h-4" />
              {t('reset')}
            </Button>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {/* Tribunal */}
          <Collapsible open={courtTypeOpen} onOpenChange={setCourtTypeOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg active:bg-muted">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t('courtType')}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedCourtType !== "all" && (
                  <Badge variant="secondary" className="text-xs">1</Badge>
                )}
                {courtTypeOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-3">
              <RadioGroup value={selectedCourtType} onValueChange={setSelectedCourtType}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                    <RadioGroupItem value="all" id="mobile-court-all" />
                    <Label htmlFor="mobile-court-all" className="text-sm flex-1">{t('allCourts')}</Label>
                  </div>
                  {courtTypes.map((court) => (
                    <div key={court.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <RadioGroupItem value={court.name} id={`mobile-court-${court.id}`} />
                      <Label htmlFor={`mobile-court-${court.id}`} className="text-sm flex-1">
                        {language === 'ar' ? court.name_ar || court.name : court.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>

          {/* Période */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t('period')}</span>
            </div>
            <div className="flex gap-3">
              <Select value={yearFrom} onValueChange={setYearFrom}>
                <SelectTrigger className="flex-1 h-11">
                  <SelectValue placeholder={t('from')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: yearRange.maxYear - yearRange.minYear + 1 },
                    (_, i) => yearRange.minYear + i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearTo} onValueChange={setYearTo}>
                <SelectTrigger className="flex-1 h-11">
                  <SelectValue placeholder={t('to')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: yearRange.maxYear - yearRange.minYear + 1 },
                    (_, i) => yearRange.minYear + i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Droits Fondamentaux */}
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg active:bg-muted">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t('fundamentalRights')}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{selectedCategories.length}</Badge>
                )}
                {categoriesOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-3">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 active:bg-muted/50"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox 
                      id={`mobile-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`mobile-${category.id}`} className="text-sm flex-1">
                      {language === 'ar' ? category.name_ar || category.name : category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Niveau de Juridiction */}
          <Collapsible open={jurisdictionOpen} onOpenChange={setJurisdictionOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg active:bg-muted">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t('jurisdictionLevel')}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedJurisdictionLevel !== "all" && (
                  <Badge variant="secondary" className="text-xs">1</Badge>
                )}
                {jurisdictionOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-3">
              <RadioGroup value={selectedJurisdictionLevel} onValueChange={setSelectedJurisdictionLevel}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                    <RadioGroupItem value="all" id="mobile-jurisdiction-all" />
                    <Label htmlFor="mobile-jurisdiction-all" className="text-sm flex-1">{t('allLevels')}</Label>
                  </div>
                  {jurisdictionLevels.map((level) => (
                    <div key={level.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <RadioGroupItem value={level.id} id={`mobile-jurisdiction-${level.id}`} />
                      <Label htmlFor={`mobile-jurisdiction-${level.id}`} className="text-sm flex-1">
                        {language === 'ar' ? level.name_ar || level.name : level.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>

          {/* Type de Document */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t('documentType')}</span>
              {selectedDocumentType !== "all" && (
                <Badge variant="secondary" className="text-xs ml-auto">1</Badge>
              )}
            </div>
            <RadioGroup value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value="all" id="mobile-doc-all" />
                  <Label htmlFor="mobile-doc-all" className="text-sm flex-1">{t('all')}</Label>
                </div>
                {documentTypes.map((type) => (
                  <div key={type.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                    <RadioGroupItem value={type.id} id={`mobile-doc-${type.id}`} />
                    <Label htmlFor={`mobile-doc-${type.id}`} className="text-sm flex-1">
                      {language === 'ar' ? type.name_ar || type.name : type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button className="w-full h-12 text-base">
              {t('applyFilters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSearchFilters;
