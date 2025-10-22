import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/statisticsUtils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { DocumentStatistics } from "@/hooks/useDocumentStatistics";

interface ArticleStatisticsTableProps {
  data: DocumentStatistics[] | undefined;
}

const ArticleStatisticsTable = ({ data }: ArticleStatisticsTableProps) => {
  const [sortColumn, setSortColumn] = useState<keyof DocumentStatistics>('total_views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof DocumentStatistics) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedData = data ? [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par article</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune statistique disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques par article</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('total_views')}>
                  <div className="flex items-center gap-1">
                    Vues
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('total_reads')}>
                  <div className="flex items-center gap-1">
                    Lectures
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('avg_read_duration')}>
                  <div className="flex items-center gap-1">
                    Temps moyen
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Commentaires</TableHead>
                <TableHead>Dernière vue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((stat) => (
                <TableRow key={stat.document_id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{stat.title}</p>
                      {stat.title_ar && (
                        <p className="text-sm text-muted-foreground truncate">{stat.title_ar}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{stat.total_views}</Badge>
                  </TableCell>
                  <TableCell>{stat.total_reads}</TableCell>
                  <TableCell>{formatDuration(stat.avg_read_duration)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{stat.total_comments}</span>
                      {stat.pending_comments > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stat.pending_comments} en attente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {stat.last_viewed_at 
                      ? formatDistanceToNow(new Date(stat.last_viewed_at), { 
                          locale: fr,
                          addSuffix: true 
                        })
                      : 'Jamais'
                    }
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => window.open(`/document/${stat.document_id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleStatisticsTable;
