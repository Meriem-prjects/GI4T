import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GroupedView } from "@/lib/statisticsUtils";

interface ViewsTimelineChartProps {
  data: GroupedView[] | undefined;
}

const ViewsTimelineChart = ({ data }: ViewsTimelineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des vues</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des vues</CardTitle>
        <CardDescription>
          Vues et lectures complètes sur la période sélectionnée
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              labelFormatter={(value) => {
                const date = new Date(value as string);
                return date.toLocaleDateString('fr-FR');
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="hsl(221, 83%, 53%)" 
              strokeWidth={2}
              name="Vues"
              dot={{ fill: 'hsl(221, 83%, 53%)' }}
            />
            <Line 
              type="monotone" 
              dataKey="reads" 
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={2}
              name="Lectures"
              dot={{ fill: 'hsl(142, 76%, 36%)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ViewsTimelineChart;
