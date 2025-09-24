import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCourtType, useUpdateCourtType, type CourtType } from '@/hooks/useCourtTypes';

interface CourtTypeFormProps {
  courtType?: CourtType;
  onClose: () => void;
}

export function CourtTypeForm({ courtType, onClose }: CourtTypeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
  });

  const createCourtType = useCreateCourtType();
  const updateCourtType = useUpdateCourtType();

  useEffect(() => {
    if (courtType) {
      setFormData({
        name: courtType.name || '',
        name_ar: courtType.name_ar || '',
        description: courtType.description || '',
        description_ar: courtType.description_ar || '',
      });
    }
  }, [courtType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (courtType) {
        await updateCourtType.mutateAsync({
          id: courtType.id,
          ...formData,
        });
      } else {
        await createCourtType.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving court type:', error);
    }
  };

  const isLoading = createCourtType.isPending || updateCourtType.isPending;

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

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : (courtType ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}