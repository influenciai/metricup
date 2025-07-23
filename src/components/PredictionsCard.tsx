import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricsPrediction } from "@/types/startup-metrics";
import { formatCurrency } from "@/lib/startup-data";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface PredictionsCardProps {
  predictions: MetricsPrediction;
  className?: string;
}

export default function PredictionsCard({ predictions, className }: PredictionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Previsões para o Próximo Mês
        </CardTitle>
        <CardDescription>
          Projeções baseadas nas metas definidas e tendências atuais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>MRR Esperado</span>
            </div>
            <div className="text-xl font-semibold text-green-600">
              {formatCurrency(predictions.expectedMRR)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Novos Clientes Esperados</span>
            </div>
            <div className="text-xl font-semibold text-blue-600">
              {predictions.expectedNewCustomers}
            </div>
            <div className="text-xs text-muted-foreground">
              Total: {predictions.expectedTotalCustomers} clientes
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Caixa Atual</span>
            </div>
            <div className={`text-xl font-semibold ${
              predictions.currentCash >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(predictions.currentCash)}
            </div>
            <Badge variant={predictions.currentCash >= 0 ? "default" : "destructive"} className="text-xs">
              {predictions.currentCash >= 0 ? "Positivo" : "Negativo"}
            </Badge>
          </div>
        </div>

        {/* Status Summary */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status Geral</span>
            <Badge 
              variant={predictions.alerts.length === 0 ? "default" : 
                      predictions.alerts.some(a => a.type === 'danger') ? "destructive" : "secondary"}
            >
              {predictions.alerts.length === 0 ? "No Caminho Certo" :
               predictions.alerts.some(a => a.type === 'danger') ? "Atenção Necessária" : "Acompanhar de Perto"}
            </Badge>
          </div>
          
          {predictions.alerts.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {predictions.alerts.length} alerta{predictions.alerts.length > 1 ? 's' : ''} ativo{predictions.alerts.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}