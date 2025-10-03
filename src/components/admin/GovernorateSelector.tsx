import { useGovernorates } from "@/hooks/useGovernorates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GovernorateSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export const GovernorateSelector = ({ value, onChange }: GovernorateSelectorProps) => {
  const { governorates, isLoading } = useGovernorates();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner un gouvernorat" />
      </SelectTrigger>
      <SelectContent>
        {governorates.map((gov) => (
          <SelectItem key={gov.id} value={gov.id}>
            {gov.name} ({gov.name_ar})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
