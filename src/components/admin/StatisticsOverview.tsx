import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { formatDuration } from "@/lib/statisticsUtils";
import { GlobalStatistics } from "@/hooks/useStatistics";

interface StatisticsOverviewProps {
  stats: GlobalStatistics | undefined;
}

const StatisticsOverview = ({ stats }: StatisticsOverviewProps) => {
  const cards = [
    {
      title: "Total des vues",
      value: stats?.total_views?.toLocaleString() || "0",
      icon: Eye,
      subtitle: `${stats?.unique_sessions || 0} sessions uniques`,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Temps moyen de lecture",
      value: formatDuration(stats?.avg_read_duration || 0),
      icon: Clock,
      subtitle: `${stats?.total_reads || 0} lectures complètes`,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Articles populaires",
      value: stats?.top_articles_count?.toString() || "0",
      icon: TrendingUp,
      subtitle: "> 100 vues",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Commentaires",
      value: stats?.total_comments?.toString() || "0",
      icon: MessageSquare,
      subtitle: `${stats?.pending_comments || 0} en attente`,
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsOverview;
