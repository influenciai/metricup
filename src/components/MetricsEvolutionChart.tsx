import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { StartupMetrics } from "@/types/startup-metrics";
import { formatCurrency, formatPercentage } from "@/lib/startup-data";

interface MetricsEvolutionChartProps {
  data: StartupMetrics[];
  metric: 'mrr' | 'churn' | 'newRevenue' | 'totalRevenue' | 'newCustomers' | 'totalCustomers' | 'ltv';
  title: string;
  description?: string;
  color?: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
};

export default function MetricsEvolutionChart({ 
  data, 
  metric, 
  title, 
  description,
  color = "hsl(var(--primary))",
  isCurrency = false,
  isPercentage = false
}: MetricsEvolutionChartProps) {
  const chartData = data.map(item => {
    // Parse the month string correctly (YYYY-MM format)
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    return {
      month: date.toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: '2-digit' 
      }),
      value: item[metric] as number,
      fullMonth: item.month
    };
  });

  const formatValue = (value: number) => {
    if (isCurrency) return formatCurrency(value);
    if (isPercentage) return formatPercentage(value);
    return value.toLocaleString('pt-BR');
  };

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const change = previous ? ((latest[metric] as number - previous[metric] as number) / previous[metric] as number) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Atual:</span>
          <span className="font-semibold">{formatValue(latest[metric] as number)}</span>
          {previous && (
            <>
              <span className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value) => [formatValue(value as number), title]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}