import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BurnRateCategories } from "@/types/startup-metrics";
import { formatCurrency } from "@/lib/startup-data";

interface BurnRateChartProps {
  burnRate: BurnRateCategories;
}

const COLORS = {
  technology: "hsl(var(--chart-1))",
  salaries: "hsl(var(--chart-2))", 
  prolabore: "hsl(var(--chart-3))",
  marketing: "hsl(var(--chart-4))",
  administrative: "hsl(var(--chart-5))",
  others: "hsl(var(--primary))"
};

const CATEGORY_LABELS = {
  technology: "Tecnologia",
  salaries: "Salários",
  prolabore: "Pró-labore", 
  marketing: "Marketing",
  administrative: "Administrativo",
  others: "Outros"
};

export default function BurnRateChart({ burnRate }: BurnRateChartProps) {
  const data = Object.entries(burnRate)
    .filter(([key]) => key !== 'total')
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
      value,
      percentage: ((value / burnRate.total) * 100),
      color: COLORS[key as keyof typeof COLORS]
    }))
    .filter(item => item.value > 0);

  const chartConfig = {
    technology: {
      label: "Tecnologia",
      color: COLORS.technology,
    },
    salaries: {
      label: "Salários", 
      color: COLORS.salaries,
    },
    prolabore: {
      label: "Pró-labore",
      color: COLORS.prolabore,
    },
    marketing: {
      label: "Marketing",
      color: COLORS.marketing,
    },
    administrative: {
      label: "Administrativo",
      color: COLORS.administrative,
    },
    others: {
      label: "Outros",
      color: COLORS.others,
    },
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribuição do Burn Rate</CardTitle>
        <CardDescription>
          Total: {formatCurrency(burnRate.total)} mensal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex gap-3 text-right">
                <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                <span className="font-medium min-w-[80px]">{formatCurrency(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}