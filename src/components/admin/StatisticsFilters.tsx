import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/statisticsUtils";
import { DocumentStatistics } from "@/hooks/useDocumentStatistics";

interface StatisticsFiltersProps {
  period: string;
  setPeriod: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  data: DocumentStatistics[] | undefined;
}

const StatisticsFilters = ({ period, setPeriod, sortBy, setSortBy, data }: StatisticsFiltersProps) => {
  const handleExport = () => {
    if (!data || data.length === 0) return;
    
    const exportData = data.map(stat => ({
      'Titre': stat.title,
      'Titre AR': stat.title_ar || '',
      'Vues': stat.total_views,
      'Lectures': stat.total_reads,
      'Temps moyen (s)': stat.avg_read_duration,
      'Commentaires': stat.total_comments,
      'Commentaires en attente': stat.pending_comments,
      'Dernière vue': stat.last_viewed_at || ''
    }));

    exportToCSV(exportData, `statistiques-articles-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7j">7 derniers jours</SelectItem>
          <SelectItem value="30j">30 derniers jours</SelectItem>
          <SelectItem value="90j">90 derniers jours</SelectItem>
          <SelectItem value="all">Toutes les données</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="total_views">Plus de vues</SelectItem>
          <SelectItem value="total_reads">Plus de lectures</SelectItem>
          <SelectItem value="avg_read_duration">Temps de lecture</SelectItem>
          <SelectItem value="total_comments">Plus de commentaires</SelectItem>
          <SelectItem value="last_viewed_at">Plus récent</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        onClick={handleExport}
        disabled={!data || data.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Exporter CSV
      </Button>
    </div>
  );
};

export default StatisticsFilters;
