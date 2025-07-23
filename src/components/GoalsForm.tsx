import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GoalsFormProps {
  onSuccess?: () => void;
}

export default function GoalsForm({ onSuccess }: GoalsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mrrGrowthTarget: "20",
    newCustomersGrowthTarget: "15",
    maxChurnRate: "5",
  });

  useEffect(() => {
    loadExistingGoals();
  }, []);

  const loadExistingGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('startup_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading goals:', error);
        return;
      }

      if (data) {
        setFormData({
          mrrGrowthTarget: data.mrr_growth_target.toString(),
          newCustomersGrowthTarget: data.new_customers_growth_target.toString(),
          maxChurnRate: data.max_churn_rate.toString(),
        });
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const goalsData = {
        user_id: user.id,
        mrr_growth_target: parseFloat(formData.mrrGrowthTarget) || 20,
        new_customers_growth_target: parseFloat(formData.newCustomersGrowthTarget) || 15,
        max_churn_rate: parseFloat(formData.maxChurnRate) || 5,
      };

      const { error } = await supabase
        .from('startup_goals')
        .upsert(goalsData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving goals:', error);
        toast.error("Erro ao salvar metas: " + error.message);
        return;
      }

      toast.success("Metas salvas com sucesso!");
      onSuccess?.();
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error("Erro inesperado ao salvar metas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Metas</CardTitle>
        <CardDescription>
          Defina suas metas de crescimento mensais para acompanhar o progresso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mrrGrowthTarget">Meta de Crescimento MRR (%)</Label>
              <Input
                id="mrrGrowthTarget"
                type="number"
                step="0.1"
                value={formData.mrrGrowthTarget}
                onChange={(e) => handleInputChange("mrrGrowthTarget", e.target.value)}
                placeholder="Ex: 20"
                required
              />
              <p className="text-sm text-muted-foreground">
                Qual o percentual de crescimento mensal desejado para o MRR?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newCustomersGrowthTarget">Meta de Crescimento de Novos Clientes (%)</Label>
              <Input
                id="newCustomersGrowthTarget"
                type="number"
                step="0.1"
                value={formData.newCustomersGrowthTarget}
                onChange={(e) => handleInputChange("newCustomersGrowthTarget", e.target.value)}
                placeholder="Ex: 15"
                required
              />
              <p className="text-sm text-muted-foreground">
                Qual o percentual de crescimento mensal desejado para novos clientes?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChurnRate">Taxa Máxima de Churn Aceitável (%)</Label>
              <Input
                id="maxChurnRate"
                type="number"
                step="0.1"
                value={formData.maxChurnRate}
                onChange={(e) => handleInputChange("maxChurnRate", e.target.value)}
                placeholder="Ex: 5"
                required
              />
              <p className="text-sm text-muted-foreground">
                Qual a taxa máxima de churn que sua empresa pode aceitar?
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Metas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}