import { useState } from "react";
import { useStatistics } from "@/hooks/useStatistics";
import StatisticsOverview from "@/components/admin/StatisticsOverview";
import ViewsTimelineChart from "@/components/admin/ViewsTimelineChart";
import ArticleStatisticsTable from "@/components/admin/ArticleStatisticsTable";
import StatisticsFilters from "@/components/admin/StatisticsFilters";
import { Skeleton } from "@/components/ui/skeleton";

const AdminStatistiques = () => {
  const [period, setPeriod] = useState('30j');
  const [sortBy, setSortBy] = useState('total_views');

  const { globalStats, articleStats, timelineData, isLoading } = useStatistics(period, { sortBy });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="ltr">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="ltr">
      <div>
        <h2 className="text-2xl font-bold mb-2">Statistiques des articles</h2>
        <p className="text-muted-foreground">
          Analyse détaillée des vues, lectures et commentaires
        </p>
      </div>

      <StatisticsFilters
        period={period}
        setPeriod={setPeriod}
        sortBy={sortBy}
        setSortBy={setSortBy}
        data={articleStats}
      />

      <StatisticsOverview stats={globalStats} />

      <ViewsTimelineChart data={timelineData} />

      <ArticleStatisticsTable data={articleStats} />
    </div>
  );
};

export default AdminStatistiques;
