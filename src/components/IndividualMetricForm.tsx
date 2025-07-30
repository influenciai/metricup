import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface MetricType {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  type: "currency" | "percentage" | "number";
}

interface IndividualMetricFormProps {
  metric: MetricType;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IndividualMetricForm({ metric, onSuccess, onCancel }: IndividualMetricFormProps) {
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState("");
  const [value, setValue] = useState("");
  const [existingData, setExistingData] = useState<any>(null);

  // Buscar dados existentes quando o mês é selecionado
  useEffect(() => {
    if (month) {
      fetchExistingData();
    }
  }, [month]);

  const fetchExistingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('startup_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching existing data:', error);
        return;
      }

      setExistingData(data);
      
      // Pré-preencher com valor existente se disponível
      if (data && data[metric.id] !== undefined) {
        setValue(data[metric.id].toString());
      } else {
        setValue("");
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!month) {
      toast.error("Por favor, selecione um mês");
      return;
    }

    if (!value) {
      toast.error("Por favor, insira um valor");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Converter valor baseado no tipo
      let parsedValue;
      switch (metric.type) {
        case 'currency':
          parsedValue = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
          break;
        case 'percentage':
          parsedValue = parseFloat(value) || 0;
          break;
        case 'number':
          parsedValue = parseInt(value) || 0;
          break;
        default:
          parsedValue = parseFloat(value) || 0;
      }

      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('startup_metrics')
          .update({
            [metric.id]: parsedValue,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('month', month);

        if (error) {
          console.error('Error updating metric:', error);
          toast.error("Erro ao atualizar métrica: " + error.message);
          return;
        }

        toast.success(`${metric.label} atualizada com sucesso!`);
      } else {
        // Criar novo registro com valores padrão
        const { error } = await supabase
          .from('startup_metrics')
          .insert({
            user_id: user.id,
            month: month,
            [metric.id]: parsedValue,
            // Valores padrão para outros campos obrigatórios
            mrr: metric.id === 'mrr' ? parsedValue : 0,
            churn: metric.id === 'churn' ? parsedValue : 0,
            new_revenue: metric.id === 'new_revenue' ? parsedValue : 0,
            total_revenue: metric.id === 'total_revenue' ? parsedValue : 0,
            new_customers: metric.id === 'new_customers' ? parsedValue : 0,
            total_customers: metric.id === 'total_customers' ? parsedValue : 0,
            ltv: metric.id === 'ltv' ? parsedValue : 0,
            burn_rate_technology: 0,
            burn_rate_salaries: 0,
            burn_rate_prolabore: 0,
            burn_rate_marketing: 0,
            burn_rate_administrative: 0,
            burn_rate_others: 0,
            burn_rate_total: metric.id === 'burn_rate_total' ? parsedValue : 0,
          });

        if (error) {
          console.error('Error inserting metric:', error);
          toast.error("Erro ao salvar métrica: " + error.message);
          return;
        }

        toast.success(`${metric.label} salva com sucesso!`);
      }

      setValue("");
      setMonth("");
      onSuccess();
    } catch (error) {
      console.error('Error saving metric:', error);
      toast.error("Erro inesperado ao salvar métrica");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    switch (metric.type) {
      case 'currency':
        return (
          <CurrencyInput
            value={value}
            onChange={setValue}
            placeholder="Ex: 50.000,00"
            className="text-lg"
          />
        );
      case 'percentage':
        return (
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 3.5"
            className="text-lg"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 25"
            className="text-lg"
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite o valor"
            className="text-lg"
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <metric.icon className="h-5 w-5" />
          Inserir {metric.label}
        </CardTitle>
        <CardDescription>
          {metric.description}
          {existingData && (
            <Badge variant="outline" className="ml-2">
              Atualizando dados existentes
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="month">Mês de Referência</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
              {existingData && (
                <p className="text-xs text-muted-foreground">
                  Dados existentes encontrados para este mês
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                Valor {metric.type === 'percentage' ? '(%)' : 
                       metric.type === 'currency' ? '(R$)' : ''}
              </Label>
              {renderInput()}
              {existingData && existingData[metric.id] && (
                <p className="text-xs text-muted-foreground">
                  Valor atual: {
                    metric.type === 'currency' 
                      ? `R$ ${existingData[metric.id].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : metric.type === 'percentage'
                      ? `${existingData[metric.id]}%`
                      : existingData[metric.id]
                  }
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : existingData ? "Atualizar" : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}