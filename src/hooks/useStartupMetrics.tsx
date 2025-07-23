import { useState, useEffect } from "react";
import { StartupMetrics, StartupGoals, MetricsPrediction, Alert } from "@/types/startup-metrics";
import { mockStartupMetrics, mockStartupGoals, getCurrentCash, calculateGrowthRate } from "@/lib/startup-data";

export function useStartupMetrics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<StartupMetrics[]>(mockStartupMetrics);
  const [goals, setGoals] = useState<StartupGoals>(mockStartupGoals);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setMetrics(mockStartupMetrics);
      setGoals(mockStartupGoals);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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