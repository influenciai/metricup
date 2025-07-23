
import { useState } from "react";
import { useStartupMetrics } from "@/hooks/useStartupMetrics";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricsCard from "@/components/MetricsCard";
import BurnRateChart from "@/components/BurnRateChart";
import MetricsEvolutionChart from "@/components/MetricsEvolutionChart";
import AlertsPanel from "@/components/AlertsPanel";
import CashFlowIndicator from "@/components/CashFlowIndicator";
import PredictionsCard from "@/components/PredictionsCard";
import { TrendingUp, Users, DollarSign, Target, Repeat, ArrowUpDown } from "lucide-react";
import { formatCurrency, calculateGrowthRate } from "@/lib/startup-data";

export default function Index() {
  const { 
    loading, 
    metrics,
    latestMetrics,
    previousMetrics,
    predictions,
    refreshData 
  } = useStartupMetrics();
  
  if (!latestMetrics || !previousMetrics) {
    return <div>Carregando...</div>;
  }

  const mrrGrowth = calculateGrowthRate(latestMetrics.mrr, previousMetrics.mrr);
  const customerGrowth = calculateGrowthRate(latestMetrics.newCustomers, previousMetrics.newCustomers);
  const revenueGrowth = calculateGrowthRate(latestMetrics.totalRevenue, previousMetrics.totalRevenue);
  const churnChange = latestMetrics.churn - previousMetrics.churn;
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onRefresh={refreshData} isLoading={loading} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            {/* Header com título */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Dashboard de Métricas</h1>
              <p className="text-muted-foreground">
                Controle financeiro e indicadores de crescimento da sua startup
              </p>
            </div>

            {/* Cards principais de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <MetricsCard 
                title="MRR (Receita Recorrente)" 
                value={formatCurrency(latestMetrics.mrr)} 
                change={mrrGrowth} 
                icon={<TrendingUp size={20} className="text-green-500" />}
                colorClass="from-green-500/20 to-green-600/5"
                animationDelay="0ms"
              />
              
              <MetricsCard 
                title="Taxa de Churn" 
                value={`${latestMetrics.churn.toFixed(1)}%`} 
                change={churnChange} 
                icon={<Repeat size={20} className="text-red-500" />}
                colorClass="from-red-500/20 to-red-600/5"
                animationDelay="50ms"
                trend={churnChange < 0 ? 'up' : 'down'} // Invertido: menos churn é melhor
              />
              
              <MetricsCard 
                title="Novos Clientes" 
                value={latestMetrics.newCustomers.toString()} 
                change={customerGrowth} 
                icon={<Users size={20} className="text-blue-500" />}
                colorClass="from-blue-500/20 to-blue-600/5"
                animationDelay="100ms"
                subtitle={`Total: ${latestMetrics.totalCustomers} clientes`}
              />
              
              <MetricsCard 
                title="LTV (Lifetime Value)" 
                value={formatCurrency(latestMetrics.ltv)} 
                icon={<Target size={20} className="text-purple-500" />}
                colorClass="from-purple-500/20 to-purple-600/5"
                animationDelay="150ms"
              />
            </div>
            
            {/* Segunda linha com métricas de receita */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <MetricsCard 
                title="Nova Receita" 
                value={formatCurrency(latestMetrics.newRevenue)} 
                icon={<ArrowUpDown size={20} className="text-emerald-500" />}
                colorClass="from-emerald-500/20 to-emerald-600/5"
              />
              
              <MetricsCard 
                title="Receita Total" 
                value={formatCurrency(latestMetrics.totalRevenue)} 
                change={revenueGrowth}
                icon={<DollarSign size={20} className="text-yellow-500" />}
                colorClass="from-yellow-500/20 to-yellow-600/5"
              />
              
              <MetricsCard 
                title="Burn Rate Total" 
                value={formatCurrency(latestMetrics.burnRate.total)} 
                icon={<TrendingUp size={20} className="text-orange-500" />}
                colorClass="from-orange-500/20 to-orange-600/5"
                subtitle="Gastos mensais totais"
              />
            </div>

            {/* Análise de fluxo de caixa, alertas e previsões */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CashFlowIndicator 
                mrr={latestMetrics.mrr}
                burnRate={latestMetrics.burnRate.total}
              />
              
              <AlertsPanel alerts={predictions.alerts} />
              
              <PredictionsCard predictions={predictions} />
            </div>
            
            {/* Gráfico de distribuição do Burn Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BurnRateChart burnRate={latestMetrics.burnRate} />
              
              <MetricsEvolutionChart
                data={metrics}
                metric="mrr"
                title="Evolução do MRR"
                description="Receita recorrente mensal ao longo do tempo"
                color="hsl(var(--primary))"
                isCurrency={true}
              />
            </div>

            {/* Gráficos de evolução das métricas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricsEvolutionChart
                data={metrics}
                metric="churn"
                title="Taxa de Churn"
                description="Percentual de cancelamentos mensais"
                color="hsl(var(--destructive))"
                isPercentage={true}
              />
              
              <MetricsEvolutionChart
                data={metrics}
                metric="totalCustomers"
                title="Total de Clientes"
                description="Base de clientes acumulada"
                color="hsl(var(--chart-2))"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricsEvolutionChart
                data={metrics}
                metric="totalRevenue"
                title="Receita Total"
                description="Receita acumulada ao longo do tempo"
                color="hsl(var(--chart-3))"
                isCurrency={true}
              />
              
              <MetricsEvolutionChart
                data={metrics}
                metric="ltv"
                title="LTV (Lifetime Value)"
                description="Valor médio do tempo de vida do cliente"
                color="hsl(var(--chart-4))"
                isCurrency={true}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
