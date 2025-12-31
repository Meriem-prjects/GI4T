import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateLanguage, useUpdateLanguage, type Language } from '@/hooks/useLanguages';

interface LanguageFormProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language | null;
}

export function LanguageForm({ isOpen, onClose, language }: LanguageFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_native: '',
    is_default: false,
    is_active: true,
  });

  const createLanguage = useCreateLanguage();
  const updateLanguage = useUpdateLanguage();

  // Reset form when language prop changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (language) {
        setFormData({
          code: language.code || '',
          name: language.name || '',
          name_native: language.name_native || '',
          is_default: language.is_default ?? false,
          is_active: language.is_active ?? true,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          name_native: '',
          is_default: false,
          is_active: true,
        });
      }
    }
  }, [language, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (language) {
        await updateLanguage.mutateAsync({
          id: language.id,
          ...formData,
        });
      } else {
        await createLanguage.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const isLoading = createLanguage.isPending || updateLanguage.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language ? 'Modifier la langue' : 'Ajouter une langue'}
          </DialogTitle>
          <DialogDescription>
            {language 
              ? 'Modifiez les informations de la langue.' 
              : 'Ajoutez une nouvelle langue au système.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="fr, en, ar..."
                required
                disabled={isLoading}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Français"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_native">Nom natif</Label>
            <Input
              id="name_native"
              value={formData.name_native}
              onChange={(e) => setFormData(prev => ({ ...prev, name_native: e.target.value }))}
              placeholder="Français, العربية..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                disabled={isLoading}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                disabled={isLoading}
              />
              <Label htmlFor="is_default">Par défaut</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : (language ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
