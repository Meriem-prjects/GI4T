import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CommentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  documentFilter: string;
  onDocumentFilterChange: (value: string) => void;
  documents: Array<{ id: string; title: string }>;
}

export function CommentFilters({
  searchQuery,
  onSearchChange,
  documentFilter,
  onDocumentFilterChange,
  documents,
}: CommentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un commentaire..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={documentFilter} onValueChange={onDocumentFilterChange}>
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue placeholder="Tous les articles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les articles</SelectItem>
          {documents.map((doc) => (
            <SelectItem key={doc.id} value={doc.id}>
              {doc.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
