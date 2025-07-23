import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Users, DollarSign, AlertTriangle, Plus, LogOut } from "lucide-react";
import MetricsCard from "@/components/MetricsCard";
import StatsCard from "@/components/StatsCard";
import BurnRateChart from "@/components/BurnRateChart";
import MetricsEvolutionChart from "@/components/MetricsEvolutionChart";
import FearGreedIndex from "@/components/FearGreedIndex";
import PredictionsCard from "@/components/PredictionsCard";
import ProjectsTable from "@/components/ProjectsTable";
import AlertsPanel from "@/components/AlertsPanel";
import CashFlowIndicator from "@/components/CashFlowIndicator";
import TrendingSection from "@/components/TrendingSection";
import AddMetricsForm from "@/components/AddMetricsForm";
import GoalsForm from "@/components/GoalsForm";
import { useStartupMetrics } from "@/hooks/useStartupMetrics";
import { calculateGrowthRate } from "@/lib/startup-data";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, metrics, goals, latestMetrics, previousMetrics, predictions } = useStartupMetrics();
  const { signOut, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">MetricUp</h1>
              <p className="text-muted-foreground text-sm">Bem-vindo, {user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              Crescimento: +12%
            </Badge>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Acompanhe as métricas da sua startup em tempo real
              </p>
            </div>
            
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 size={16} />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="add-metrics" className="flex items-center gap-2">
                <Plus size={16} />
                Adicionar Métricas
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target size={16} />
                Configurar Metas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {metrics && metrics.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Receita Total"
                    value={`R$ ${(latestMetrics?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change={calculateGrowthRate(latestMetrics?.totalRevenue || 0, previousMetrics?.totalRevenue || 0)}
                    icon={<DollarSign size={20} />}
                  />
                  <StatsCard
                    title="MRR"
                    value={`R$ ${(latestMetrics?.mrr || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change={calculateGrowthRate(latestMetrics?.mrr || 0, previousMetrics?.mrr || 0)}
                    icon={<TrendingUp size={20} />}
                  />
                  <StatsCard
                    title="Clientes Novos"
                    value={String(latestMetrics?.newCustomers || 0)}
                    change={calculateGrowthRate(latestMetrics?.newCustomers || 0, previousMetrics?.newCustomers || 0)}
                    icon={<Users size={20} />}
                  />
                  <StatsCard
                    title="Churn Rate"
                    value={`${(latestMetrics?.churn || 0).toFixed(1)}%`}
                    change={calculateGrowthRate(latestMetrics?.churn || 0, previousMetrics?.churn || 0)}
                    icon={<AlertTriangle size={20} />}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Métricas</CardTitle>
                      <CardDescription>Dados inseridos ao longo do tempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.map((metric, index) => (
                          <div key={metric.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <p className="font-medium">{metric.month}</p>
                              <p className="text-sm text-muted-foreground">
                                MRR: R$ {metric.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Clientes: {metric.totalCustomers}</p>
                              <p className="text-sm text-muted-foreground">Churn: {metric.churn}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Suas Metas</CardTitle>
                      <CardDescription>Objetivos configurados para sua startup</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {goals ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Meta de Crescimento MRR:</span>
                            <span className="font-medium">{goals.mrrGrowthTarget}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Meta de Novos Clientes:</span>
                            <span className="font-medium">{goals.newCustomersGrowthTarget}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Churn Máximo Aceitável:</span>
                            <span className="font-medium">{goals.maxChurnRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhuma meta configurada ainda.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dashboard em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Adicione suas métricas e configure suas metas para visualizar os dados
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add-metrics" className="space-y-6">
            <AddMetricsForm onSuccess={() => {}} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsForm onSuccess={() => {}} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
