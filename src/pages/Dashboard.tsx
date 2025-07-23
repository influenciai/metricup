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
import { useStats } from "@/hooks/useStats";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, metrics } = useStartupMetrics();
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Receita Total"
                value={latestMetrics?.totalRevenue || 0}
                change={calculateGrowthRate(latestMetrics?.totalRevenue || 0, previousMetrics?.totalRevenue || 0)}
                icon={DollarSign}
              />
              <StatsCard
                title="MRR"
                value={latestMetrics?.mrr || 0}
                change={calculateGrowthRate(latestMetrics?.mrr || 0, previousMetrics?.mrr || 0)}
                icon={TrendingUp}
              />
              <StatsCard
                title="Clientes Novos"
                value={latestMetrics?.newCustomers || 0}
                change={calculateGrowthRate(latestMetrics?.newCustomers || 0, previousMetrics?.newCustomers || 0)}
                icon={Users}
              />
              <StatsCard
                title="Churn Rate"
                value={latestMetrics?.churn || 0}
                change={calculateGrowthRate(latestMetrics?.churn || 0, previousMetrics?.churn || 0)}
                icon={AlertTriangle}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Evolução das Métricas</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <MetricsEvolutionChart data={metrics} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Queima de Caixa (Burn Rate)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BurnRateChart data={latestMetrics?.burnRate} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Previsões e Alertas</CardTitle>
                  <CardDescription>Baseado nas suas metas e métricas atuais.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PredictionsCard predictions={predictions} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Indicador de Fluxo de Caixa</CardTitle>
                  <CardDescription>MRR vs. Burn Rate Total</CardDescription>
                </CardHeader>
                <CardContent>
                  <CashFlowIndicator mrr={latestMetrics?.mrr || 0} burnRateTotal={latestMetrics?.burnRate.total || 0} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Índice de Medo e Ganância</CardTitle>
                  <CardDescription>Sentimento do mercado (exemplo).</CardDescription>
                </CardHeader>
                <CardContent>
                  <FearGreedIndex />
                </CardContent>
              </Card>
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Projetos Ativos</CardTitle>
                  <CardDescription>Visão geral dos seus projetos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectsTable />
                </CardContent>
              </Card>
            </div>

            <AlertsPanel alerts={predictions.alerts} />
            <TrendingSection />
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

