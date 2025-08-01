import { useState, useEffect } from "react";
import { StartupMetrics, StartupGoals, MetricsPrediction, Alert } from "@/types/startup-metrics";
import { mockStartupGoals, getCurrentCash, calculateGrowthRate } from "@/lib/startup-data";
import { supabase } from "@/integrations/supabase/client";

interface OverdueData {
  totalValue: number;
  totalCustomers: number;
  criticalCount: number;
}

export function useStartupMetrics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<StartupMetrics[]>([]);
  const [goals, setGoals] = useState<StartupGoals>(mockStartupGoals);
  const [error, setError] = useState<string | null>(null);
  const [overdueData, setOverdueData] = useState<OverdueData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadMetrics(), loadGoals(), loadOverdueData()]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('startup_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: true });

    if (error) {
      console.error('Error loading metrics:', error);
      setError('Erro ao carregar métricas');
      return;
    }

    const formattedMetrics: StartupMetrics[] = (data || []).map(item => ({
      id: item.id,
      month: item.month,
      mrr: Number(item.mrr),
      churn: Number(item.churn),
      newRevenue: Number(item.new_revenue),
      totalRevenue: Number(item.total_revenue),
      newCustomers: item.new_customers,
      totalCustomers: item.total_customers,
      ltv: Number(item.ltv),
      burnRate: {
        technology: Number(item.burn_rate_technology),
        salaries: Number(item.burn_rate_salaries),
        prolabore: Number(item.burn_rate_prolabore),
        marketing: Number(item.burn_rate_marketing),
        administrative: Number(item.burn_rate_administrative),
        others: Number(item.burn_rate_others),
        total: Number(item.burn_rate_total)
      },
      createdAt: new Date(item.created_at)
    }));

    setMetrics(formattedMetrics);
  };

  const loadGoals = async () => {
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
      setGoals({
        mrrGrowthTarget: Number(data.mrr_growth_target),
        newCustomersGrowthTarget: Number(data.new_customers_growth_target),
        maxChurnRate: Number(data.max_churn_rate)
      });
    }
  };

  const loadOverdueData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-overdue-customers');
      
      if (error) {
        console.error('Error loading overdue data:', error);
        return;
      }
      
      setOverdueData(data);
    } catch (error) {
      console.error('Error loading overdue data:', error);
    }
  };

  const getLatestMetrics = (): StartupMetrics | null => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1];
  };

  const getPreviousMetrics = (): StartupMetrics | null => {
    if (metrics.length < 2) return null;
    return metrics[metrics.length - 2];
  };

  const generatePredictions = (): MetricsPrediction => {
    const latest = getLatestMetrics();
    const previous = getPreviousMetrics();
    
    if (!latest || !previous) {
      return {
        expectedMRR: 0,
        expectedNewCustomers: 0,
        expectedTotalCustomers: 0,
        currentCash: 0,
        alerts: []
      };
    }

    const mrrGrowth = calculateGrowthRate(latest.mrr, previous.mrr);
    const customerGrowth = calculateGrowthRate(latest.newCustomers, previous.newCustomers);
    
    const expectedMRR = latest.mrr * (1 + goals.mrrGrowthTarget / 100);
    const expectedNewCustomers = Math.round(latest.newCustomers * (1 + goals.newCustomersGrowthTarget / 100));
    const expectedTotalCustomers = latest.totalCustomers + expectedNewCustomers;
    const currentCash = getCurrentCash(latest.mrr, latest.burnRate.total);

    const alerts: Alert[] = [];

    // Check MRR growth
    if (mrrGrowth < goals.mrrGrowthTarget) {
      alerts.push({
        id: "mrr-below-target",
        type: "warning",
        title: "MRR abaixo da meta",
        message: `Crescimento atual de ${mrrGrowth.toFixed(1)}% está abaixo da meta de ${goals.mrrGrowthTarget}%`,
        priority: "high"
      });
    }

    // Check churn rate
    if (latest.churn > goals.maxChurnRate) {
      alerts.push({
        id: "high-churn",
        type: "danger", 
        title: "Taxa de Churn elevada",
        message: `Churn de ${latest.churn.toFixed(1)}% excede o limite máximo de ${goals.maxChurnRate}%`,
        priority: "high"
      });
    }

    // Check cash flow
    if (currentCash < 0) {
      alerts.push({
        id: "negative-cash",
        type: "danger",
        title: "Fluxo de caixa negativo",
        message: "Burn rate superior ao MRR. Situação crítica!",
        priority: "high"
      });
    }

    // Check customer growth
    if (customerGrowth < goals.newCustomersGrowthTarget) {
      alerts.push({
        id: "customers-below-target",
        type: "warning",
        title: "Crescimento de clientes abaixo da meta",
        message: `Crescimento de ${customerGrowth.toFixed(1)}% está abaixo da meta de ${goals.newCustomersGrowthTarget}%`,
        priority: "medium"
      });
    }

    // Check overdue payments
    if (overdueData) {
      if (overdueData.totalValue > 0) {
        const formatCurrency = (value: number) => 
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        
        alerts.push({
          id: "overdue-payments",
          type: overdueData.criticalCount > 5 ? "danger" : "warning",
          title: "Faturas em atraso",
          message: `${overdueData.totalCustomers} clientes com ${formatCurrency(overdueData.totalValue)} em atraso. ${overdueData.criticalCount} críticos (+15 dias)`,
          priority: overdueData.criticalCount > 5 ? "high" : "medium"
        });
      }
      
      if (overdueData.criticalCount > 10) {
        alerts.push({
          id: "critical-overdue",
          type: "danger",
          title: "Alto risco de churn",
          message: `${overdueData.criticalCount} clientes com atraso crítico. Ação imediata necessária!`,
          priority: "high"
        });
      }
    }

    return {
      expectedMRR,
      expectedNewCustomers,
      expectedTotalCustomers,
      currentCash,
      alerts
    };
  };

  const addMetrics = (newMetrics: Omit<StartupMetrics, 'id' | 'createdAt'>) => {
    const metrics: StartupMetrics = {
      ...newMetrics,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setMetrics(prev => [...prev, metrics]);
  };

  const updateGoals = (newGoals: StartupGoals) => {
    setGoals(newGoals);
  };

  const refreshData = async () => {
    await loadData();
  };

  return {
    loading,
    error,
    metrics,
    goals,
    latestMetrics: getLatestMetrics(),
    previousMetrics: getPreviousMetrics(),
    predictions: generatePredictions(),
    addMetrics,
    updateGoals,
    refreshData
  };
}