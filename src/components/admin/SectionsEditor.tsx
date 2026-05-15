import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronsRight } from 'lucide-react';
import CKEditorWrapper from './CKEditorWrapper';
import { renderFormattedContent } from '@/utils/contentFormatter';

export interface AnalysisSection {
  title?: string;
  titleAr?: string;
  level?: 1 | 2;
  content?: string;
  contentAr?: string;
}

interface SectionsEditorProps {
  sections: AnalysisSection[];
  onChange: (next: AnalysisSection[]) => void;
  currentLanguage: 'fr' | 'ar';
  primaryLanguage?: string;
}

const SectionsEditor: React.FC<SectionsEditorProps> = ({
  sections,
  onChange,
  currentLanguage,
  primaryLanguage,
}) => {
  const isPrimary = currentLanguage === (primaryLanguage ?? 'ar');
  const isArabicTab = currentLanguage === 'ar';

  const update = (i: number, patch: Partial<AnalysisSection>) => {
    const next = sections.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const move = (i: number, delta: -1 | 1) => {
    const j = i + delta;
    if (j < 0 || j >= sections.length) return;
    const next = sections.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(sections.filter((_, k) => k !== i));
  };

  const addSection = (level: 1 | 2 = 1) => {
    onChange([
      ...sections,
      { title: '', titleAr: '', level, content: '', contentAr: '' },
    ]);
  };

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          {isArabicTab
            ? 'لا توجد أقسام بعد. أضف الجزء الأول لبدء التحرير.'
            : "Aucune section pour l'instant. Ajoutez une partie pour commencer."}
        </p>
      )}

      {sections.map((section, i) => {
        const titleField = isArabicTab ? section.titleAr ?? '' : section.title ?? '';
        const contentField = isPrimary
          ? section.content ?? ''
          : section.contentAr ?? '';
        const level = section.level ?? 1;

        return (
          <Card key={i} className={`p-4 ${level === 2 ? 'ml-6 border-l-4 border-primary/40' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-muted-foreground">
                {level === 1 ? (isArabicTab ? 'جزء' : 'Partie') : isArabicTab ? 'فرع' : 'Section'}
              </span>
              <Input
                value={titleField}
                onChange={(e) =>
                  update(i, isArabicTab ? { titleAr: e.target.value } : { title: e.target.value })
                }
                placeholder={
                  isArabicTab
                    ? level === 1
                      ? 'مثال: الجزء الأول'
                      : 'مثال: الفرع الأول'
                    : level === 1
                    ? 'ex : Première partie'
                    : 'ex : Section A'
                }
                dir={isArabicTab ? 'rtl' : 'ltr'}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => update(i, { level: level === 1 ? 2 : 1 })}
                title={level === 1 ? 'Convertir en section' : 'Convertir en partie'}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(i, 1)}
                disabled={i === sections.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <Label className="text-xs text-muted-foreground">
              {isArabicTab ? 'المحتوى' : 'Contenu'}
            </Label>
            <CKEditorWrapper
              content={renderFormattedContent(contentField)}
              onChange={(html) =>
                update(i, isPrimary ? { content: html } : { contentAr: html })
              }
              language={isArabicTab ? 'ar' : 'fr'}
              placeholder={isArabicTab ? 'محتوى القسم...' : 'Contenu de la section...'}
              className="min-h-[200px]"
            />
          </Card>
        );
      })}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => addSection(1)}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabicTab ? 'إضافة جزء' : 'Ajouter une partie'}
        </Button>
        <Button type="button" variant="outline" onClick={() => addSection(2)}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabicTab ? 'إضافة فرع' : 'Ajouter une section'}
        </Button>
      </div>
    </div>
  );
};

export default SectionsEditor;
