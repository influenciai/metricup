import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddMetricsFormProps {
  onSuccess: () => void;
}

export default function AddMetricsForm({ onSuccess }: AddMetricsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: "",
    mrr: "",
    churn: "",
    newRevenue: "",
    totalRevenue: "",
    newCustomers: "",
    totalCustomers: "",
    ltv: "",
    burnRateTechnology: "",
    burnRateSalaries: "",
    burnRateProlabore: "",
    burnRateMarketing: "",
    burnRateAdministrative: "",
    burnRateOthers: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBurnRateTotal = () => {
    const values = [
      parseFloat(formData.burnRateTechnology) || 0,
      parseFloat(formData.burnRateSalaries) || 0,
      parseFloat(formData.burnRateProlabore) || 0,
      parseFloat(formData.burnRateMarketing) || 0,
      parseFloat(formData.burnRateAdministrative) || 0,
      parseFloat(formData.burnRateOthers) || 0,
    ];
    return values.reduce((sum, val) => sum + val, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.month) {
      toast.error("Por favor, selecione um mês");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const burnRateTotal = calculateBurnRateTotal();

      const { error } = await supabase
        .from('startup_metrics')
        .insert({
          user_id: user.id,
          month: formData.month,
          mrr: parseFloat(formData.mrr) || 0,
          churn: parseFloat(formData.churn) || 0,
          new_revenue: parseFloat(formData.newRevenue) || 0,
          total_revenue: parseFloat(formData.totalRevenue) || 0,
          new_customers: parseInt(formData.newCustomers) || 0,
          total_customers: parseInt(formData.totalCustomers) || 0,
          ltv: parseFloat(formData.ltv) || 0,
          burn_rate_technology: parseFloat(formData.burnRateTechnology) || 0,
          burn_rate_salaries: parseFloat(formData.burnRateSalaries) || 0,
          burn_rate_prolabore: parseFloat(formData.burnRateProlabore) || 0,
          burn_rate_marketing: parseFloat(formData.burnRateMarketing) || 0,
          burn_rate_administrative: parseFloat(formData.burnRateAdministrative) || 0,
          burn_rate_others: parseFloat(formData.burnRateOthers) || 0,
          burn_rate_total: burnRateTotal,
        });

      if (error) {
        console.error('Error inserting metrics:', error);
        toast.error("Erro ao salvar métricas: " + error.message);
        return;
      }

      toast.success("Métricas salvas com sucesso!");
      setFormData({
        month: "",
        mrr: "",
        churn: "",
        newRevenue: "",
        totalRevenue: "",
        newCustomers: "",
        totalCustomers: "",
        ltv: "",
        burnRateTechnology: "",
        burnRateSalaries: "",
        burnRateProlabore: "",
        burnRateMarketing: "",
        burnRateAdministrative: "",
        burnRateOthers: "",
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error("Erro inesperado ao salvar métricas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Métricas Mensais</CardTitle>
        <CardDescription>
          Insira as métricas da sua startup para o mês selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Mês</Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => handleInputChange("month", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Métricas Principais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrr">MRR (R$)</Label>
                <Input
                  id="mrr"
                  type="number"
                  step="0.01"
                  value={formData.mrr}
                  onChange={(e) => handleInputChange("mrr", e.target.value)}
                  placeholder="Ex: 50000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churn">Churn (%)</Label>
                <Input
                  id="churn"
                  type="number"
                  step="0.01"
                  value={formData.churn}
                  onChange={(e) => handleInputChange("churn", e.target.value)}
                  placeholder="Ex: 3.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRevenue">Nova Receita (R$)</Label>
                <Input
                  id="newRevenue"
                  type="number"
                  step="0.01"
                  value={formData.newRevenue}
                  onChange={(e) => handleInputChange("newRevenue", e.target.value)}
                  placeholder="Ex: 15000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRevenue">Receita Total (R$)</Label>
                <Input
                  id="totalRevenue"
                  type="number"
                  step="0.01"
                  value={formData.totalRevenue}
                  onChange={(e) => handleInputChange("totalRevenue", e.target.value)}
                  placeholder="Ex: 65000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCustomers">Novos Clientes</Label>
                <Input
                  id="newCustomers"
                  type="number"
                  value={formData.newCustomers}
                  onChange={(e) => handleInputChange("newCustomers", e.target.value)}
                  placeholder="Ex: 25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalCustomers">Total de Clientes</Label>
                <Input
                  id="totalCustomers"
                  type="number"
                  value={formData.totalCustomers}
                  onChange={(e) => handleInputChange("totalCustomers", e.target.value)}
                  placeholder="Ex: 180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ltv">LTV (R$)</Label>
                <Input
                  id="ltv"
                  type="number"
                  step="0.01"
                  value={formData.ltv}
                  onChange={(e) => handleInputChange("ltv", e.target.value)}
                  placeholder="Ex: 3500.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Burn Rate por Categoria (R$)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="burnRateTechnology">Tecnologia</Label>
                <Input
                  id="burnRateTechnology"
                  type="number"
                  step="0.01"
                  value={formData.burnRateTechnology}
                  onChange={(e) => handleInputChange("burnRateTechnology", e.target.value)}
                  placeholder="Ex: 8000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRateSalaries">Salários</Label>
                <Input
                  id="burnRateSalaries"
                  type="number"
                  step="0.01"
                  value={formData.burnRateSalaries}
                  onChange={(e) => handleInputChange("burnRateSalaries", e.target.value)}
                  placeholder="Ex: 25000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRateProlabore">Pró-labore</Label>
                <Input
                  id="burnRateProlabore"
                  type="number"
                  step="0.01"
                  value={formData.burnRateProlabore}
                  onChange={(e) => handleInputChange("burnRateProlabore", e.target.value)}
                  placeholder="Ex: 7000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRateMarketing">Marketing</Label>
                <Input
                  id="burnRateMarketing"
                  type="number"
                  step="0.01"
                  value={formData.burnRateMarketing}
                  onChange={(e) => handleInputChange("burnRateMarketing", e.target.value)}
                  placeholder="Ex: 12000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRateAdministrative">Administrativo</Label>
                <Input
                  id="burnRateAdministrative"
                  type="number"
                  step="0.01"
                  value={formData.burnRateAdministrative}
                  onChange={(e) => handleInputChange("burnRateAdministrative", e.target.value)}
                  placeholder="Ex: 3000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRateOthers">Outros</Label>
                <Input
                  id="burnRateOthers"
                  type="number"
                  step="0.01"
                  value={formData.burnRateOthers}
                  onChange={(e) => handleInputChange("burnRateOthers", e.target.value)}
                  placeholder="Ex: 2000.00"
                />
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">
                Total Burn Rate: R$ {calculateBurnRateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Métricas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}