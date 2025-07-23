import { Alert } from "@/types/startup-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Status das Métricas
          </CardTitle>
          <CardDescription>Todas as métricas estão dentro dos parâmetros esperados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Nenhum alerta ativo</p>
            <p className="text-sm">Sua startup está no caminho certo!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas e Indicadores
        </CardTitle>
        <CardDescription>
          {alerts.length} alerta{alerts.length > 1 ? 's' : ''} requer{alerts.length === 1 ? '' : 'em'} atenção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 ${getPriorityColor(alert.priority)} bg-card p-4 rounded-lg`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`mt-0.5 ${
                  alert.type === 'danger' ? 'text-red-500' :
                  alert.type === 'warning' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </div>
              <Badge variant={getVariant(alert.type)} className="text-xs">
                {alert.priority === 'high' ? 'Alta' : 
                 alert.priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}