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
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dashboard em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Adicione suas métricas e configure suas metas para visualizar os dados
              </p>
            </div>
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