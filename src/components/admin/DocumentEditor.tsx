import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, FileText, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DocumentData {
  content: string;
  title: string;
  summary: string;
  keywords: string[];
  language: string;
  originalFileName: string;
  pages?: string[];
  pageCount?: number;
}

interface DocumentEditorProps {
  documentData: DocumentData;
  onSave: (data: DocumentData) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentData, onSave }) => {
  const [editedData, setEditedData] = useState<DocumentData>(documentData);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedData(documentData);
    setHasChanges(false);
  }, [documentData]);

  useEffect(() => {
    const isChanged = JSON.stringify(editedData) !== JSON.stringify(documentData);
    setHasChanges(isChanged);
  }, [editedData, documentData]);

  const handleSave = () => {
    onSave(editedData);
    setHasChanges(false);
    toast({
      title: "Document sauvegardé",
      description: "Les modifications ont été enregistrées avec succès.",
    });
  };

  const getLanguageLabel = (lang: string) => {
    const labels = {
      'ar': 'العربية',
      'fr': 'Français',
      'en': 'English'
    };
    return labels[lang as keyof typeof labels] || lang;
  };

  const formatContent = (content: string) => {
    // Enhanced formatting to preserve structure and handle multi-page content
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
  };

  const renderPageContent = () => {
    console.log('Rendering pages:', editedData.pages?.length, 'Page count:', editedData.pageCount);
    
    if (editedData.pages && editedData.pages.length > 1) {
      return editedData.pages.map((page, index) => (
        <div key={index} className="mb-8 border-b border-border pb-6 last:border-b-0">
          <div className="flex items-center mb-3">
            <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Page {index + 1} sur {editedData.pages!.length}
            </div>
          </div>
          <div 
            className="whitespace-pre-wrap text-sm leading-relaxed prose prose-sm max-w-none"
            style={{ 
              direction: editedData.language === 'ar' ? 'rtl' : 'ltr',
              textAlign: editedData.language === 'ar' ? 'right' : 'left'
            }}
          >
            {formatContent(page)}
          </div>
        </div>
      ));
    }
    
    // Single page or combined content
    return (
      <div 
        className="whitespace-pre-wrap prose prose-sm max-w-none"
        style={{ 
          direction: editedData.language === 'ar' ? 'rtl' : 'ltr',
          textAlign: editedData.language === 'ar' ? 'right' : 'left'
        }}
      >
        {formatContent(editedData.content)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Éditeur de Document
              </h2>
              <p className="text-sm text-muted-foreground">
                Fichier source: {editedData.originalFileName}
                {editedData.pageCount && editedData.pageCount > 1 && (
                  <span className="ml-2 text-primary">• {editedData.pageCount} pages</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Globe className="h-3 w-3" />
              <span>{getLanguageLabel(editedData.language)}</span>
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Édition' : 'Aperçu'}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Métadonnées</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  placeholder="Titre du document"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="language">Langue</Label>
                <select
                  id="language"
                  value={editedData.language}
                  onChange={(e) => setEditedData({ ...editedData, language: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ar">العربية (Arabe)</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="summary">Résumé</Label>
                <Textarea
                  id="summary"
                  value={editedData.summary}
                  onChange={(e) => setEditedData({ ...editedData, summary: e.target.value })}
                  placeholder="Résumé du document"
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="keywords">Mots-clés</Label>
                <Textarea
                  id="keywords"
                  value={editedData.keywords.join(' - ')}
                  onChange={(e) => setEditedData({ 
                    ...editedData, 
                    keywords: e.target.value.split(' - ').map(k => k.trim()).filter(k => k.length > 0)
                  })}
                  placeholder="Mot-clé1 - Mot-clé2 - Mot-clé3"
                  rows={3}
                  className="mt-1"
                  style={{ 
                    direction: editedData.language === 'ar' ? 'rtl' : 'ltr' 
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Séparez les mots-clés par " - "
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">
              {showPreview ? 'Aperçu du contenu' : 'Contenu du document'}
            </h3>
            
            {showPreview ? (
              <div 
                className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg min-h-[400px] overflow-y-auto"
                style={{ 
                  direction: editedData.language === 'ar' ? 'rtl' : 'ltr',
                  textAlign: editedData.language === 'ar' ? 'right' : 'left'
                }}
              >
                <h1>{editedData.title}</h1>
                
                {editedData.summary && (
                  <div className="bg-primary/10 p-3 rounded-md mb-4">
                    <h4 className="font-semibold mb-2">Résumé:</h4>
                    <p className="text-sm">{editedData.summary}</p>
                  </div>
                )}
                
                {editedData.keywords && editedData.keywords.length > 0 && (
                  <div className="bg-secondary/10 p-3 rounded-md mb-4">
                    <h4 className="font-semibold mb-2">الكلمات المفاتيح - Mots-clés:</h4>
                    <div className="flex flex-wrap gap-2">
                      {editedData.keywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs"
                          style={{ 
                            direction: editedData.language === 'ar' ? 'rtl' : 'ltr' 
                          }}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {renderPageContent()}
              </div>
            ) : (
              <Textarea
                value={editedData.content}
                onChange={(e) => setEditedData({ ...editedData, content: e.target.value })}
                placeholder="Contenu du document..."
                className="min-h-[400px] font-mono text-sm"
                style={{ 
                  direction: editedData.language === 'ar' ? 'rtl' : 'ltr' 
                }}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Status */}
      {hasChanges && (
        <Card className="p-3 bg-orange-50 border-orange-200">
          <p className="text-sm text-orange-800">
            ⚠️ Vous avez des modifications non sauvegardées
          </p>
        </Card>
      )}
    </div>
  );
};

export default DocumentEditor;