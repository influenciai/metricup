import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2, Calendar } from "lucide-react";
import { StartupMetrics } from "@/types/startup-metrics";
import { formatCurrency } from "@/lib/startup-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MetricsTableProps {
  metrics: StartupMetrics[];
  onEdit: (metrics: StartupMetrics) => void;
  onRefresh: () => void;
}

export default function MetricsTable({ metrics, onEdit, onRefresh }: MetricsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (metrics: StartupMetrics) => {
    if (!confirm(`Tem certeza que deseja excluir os dados de ${metrics.month}?`)) {
      return;
    }

    setDeletingId(metrics.id);

    try {
      const { error } = await supabase
        .from('startup_metrics')
        .delete()
        .eq('id', metrics.id);

      if (error) {
        console.error('Error deleting metrics:', error);
        toast.error("Erro ao excluir métricas: " + error.message);
        return;
      }

      toast.success("Métricas excluídas com sucesso!");
      onRefresh();
    } catch (error) {
      console.error('Error deleting metrics:', error);
      toast.error("Erro inesperado ao excluir métricas");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Métricas
        </CardTitle>
        <CardDescription>
          Visualize e edite todas as métricas inseridas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma métrica inserida ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Churn</TableHead>
                  <TableHead>Novos Clientes</TableHead>
                  <TableHead>Total Clientes</TableHead>
                  <TableHead>Burn Rate</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">
                      {formatDate(metric.month)}
                    </TableCell>
                    <TableCell>{formatCurrency(metric.mrr)}</TableCell>
                    <TableCell>
                      <Badge variant={metric.churn > 5 ? "destructive" : "secondary"}>
                        {metric.churn.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{metric.newCustomers}</TableCell>
                    <TableCell>{metric.totalCustomers}</TableCell>
                    <TableCell>{formatCurrency(metric.burnRate.total)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(metric)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === metric.id}
                          onClick={() => handleDelete(metric)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}