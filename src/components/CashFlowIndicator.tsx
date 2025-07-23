import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/startup-data";
import { cn } from "@/lib/utils";

interface CashFlowIndicatorProps {
  mrr: number;
  burnRate: number;
  className?: string;
}

export default function CashFlowIndicator({ mrr, burnRate, className }: CashFlowIndicatorProps) {
  const currentCash = mrr - burnRate;
  const isPositive = currentCash >= 0;
  const efficiency = (mrr / burnRate) * 100;
  const progressValue = Math.min(efficiency, 200); // Cap at 200% for display
  
  const runwayMonths = burnRate > 0 ? Math.max(0, mrr / burnRate) : 0;
  
  const getStatusColor = () => {
    if (currentCash >= 0) return "text-green-500";
    return "text-red-500";
  };

  const getStatusIcon = () => {
    if (currentCash >= 0) return <TrendingUp className="h-5 w-5" />;
    return <TrendingDown className="h-5 w-5" />;
  };

  const getRunwayStatus = () => {
    if (runwayMonths >= 12) return { text: "Excelente", color: "text-green-500" };
    if (runwayMonths >= 6) return { text: "Bom", color: "text-yellow-500" };
    if (runwayMonths >= 3) return { text: "Atenção", color: "text-orange-500" };
    return { text: "Crítico", color: "text-red-500" };
  };

  const runwayStatus = getRunwayStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Fluxo de Caixa
        </CardTitle>
        <CardDescription>
          Análise do caixa atual e runway da startup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Cash Flow */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Caixa Atual</span>
            <div className={cn("flex items-center gap-1", getStatusColor())}>
              {getStatusIcon()}
              <span className="font-semibold">{formatCurrency(currentCash)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">MRR: </span>
              <span className="font-medium text-green-600">{formatCurrency(mrr)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Burn Rate: </span>
              <span className="font-medium text-red-600">{formatCurrency(burnRate)}</span>
            </div>
          </div>
        </div>

        {/* Efficiency Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Eficiência (MRR/Burn)</span>
            <span className="font-semibold">{efficiency.toFixed(0)}%</span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-2"
            max={200}
          />
          <div className="text-xs text-muted-foreground">
            {efficiency >= 100 ? 'Sustentável' : 'Precisa melhorar'}
          </div>
        </div>

        {/* Runway */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Runway</span>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", runwayStatus.color)}>
                {runwayMonths.toFixed(1)} meses
              </span>
              <span className={cn("text-xs px-2 py-1 rounded-full", runwayStatus.color, "bg-opacity-10")}>
                {runwayStatus.text}
              </span>
            </div>
          </div>
          
          {runwayMonths < 6 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-600 dark:text-red-400">
                Runway baixo! É necessário aumentar MRR ou reduzir custos.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}