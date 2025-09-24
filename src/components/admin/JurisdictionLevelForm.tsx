import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJurisdictionLevel, useUpdateJurisdictionLevel, type JurisdictionLevel } from '@/hooks/useJurisdictionLevels';

interface JurisdictionLevelFormProps {
  jurisdictionLevel?: JurisdictionLevel;
  onClose: () => void;
}

export function JurisdictionLevelForm({ jurisdictionLevel, onClose }: JurisdictionLevelFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    level_order: 1,
  });

  const createJurisdictionLevel = useCreateJurisdictionLevel();
  const updateJurisdictionLevel = useUpdateJurisdictionLevel();

  useEffect(() => {
    if (jurisdictionLevel) {
      setFormData({
        name: jurisdictionLevel.name || '',
        name_ar: jurisdictionLevel.name_ar || '',
        description: jurisdictionLevel.description || '',
        description_ar: jurisdictionLevel.description_ar || '',
        level_order: jurisdictionLevel.level_order || 1,
      });
    }
  }, [jurisdictionLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (jurisdictionLevel) {
        await updateJurisdictionLevel.mutateAsync({
          id: jurisdictionLevel.id,
          ...formData,
        });
      } else {
        await createJurisdictionLevel.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving jurisdiction level:', error);
    }
  };

  const isLoading = createJurisdictionLevel.isPending || updateJurisdictionLevel.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom (FR)</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="name_ar">Nom (AR)</Label>
          <Input
            id="name_ar"
            value={formData.name_ar}
            onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
            dir="rtl"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="description">Description (FR)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="description_ar">Description (AR)</Label>
          <Textarea
            id="description_ar"
            value={formData.description_ar}
            onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
            dir="rtl"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="level_order">Ordre</Label>
        <Input
          id="level_order"
          type="number"
          min="1"
          value={formData.level_order}
          onChange={(e) => setFormData(prev => ({ ...prev, level_order: parseInt(e.target.value) || 1 }))}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : (jurisdictionLevel ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}