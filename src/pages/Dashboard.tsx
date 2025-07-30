import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  LogOut,
  Home,
  Database,
  Settings,
  Bell,
  Search,
  RefreshCw
} from "lucide-react";
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
import EditMetricsForm from "@/components/EditMetricsForm";
import MetricsTable from "@/components/MetricsTable";
import GoalsForm from "@/components/GoalsForm";
import OverdueCustomersPanel from "@/components/OverdueCustomersPanel";
import { useStartupMetrics } from "@/hooks/useStartupMetrics";
import { calculateGrowthRate, formatCurrency } from "@/lib/startup-data";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { StartupMetrics } from "@/types/startup-metrics";
import AsaasSyncButton from "@/components/AsaasSyncButton";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [editingMetrics, setEditingMetrics] = useState<StartupMetrics | null>(null);
  const { loading, metrics, goals, latestMetrics, previousMetrics, predictions, refreshData } = useStartupMetrics();
  const { signOut, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "inserir-dados", label: "Inserir Dados", icon: Plus },
    { id: "gerenciar-dados", label: "Gerenciar Dados", icon: Database },
    { id: "metas", label: "Metas", icon: Target },
    { id: "alertas", label: "Alertas", icon: Bell },
    { id: "clientes-atraso", label: "Clientes em Atraso", icon: AlertTriangle },
  ];

  const renderMainContent = () => {
    if (editingMetrics) {
      return (
        <EditMetricsForm 
          metrics={editingMetrics}
          onSuccess={() => {
            setEditingMetrics(null);
            refreshData();
          }}
          onCancel={() => setEditingMetrics(null)}
        />
      );
    }

    switch (activeSection) {
      case "inserir-dados":
        return <AddMetricsForm onSuccess={refreshData} />;
      case "gerenciar-dados":
        return (
          <MetricsTable 
            metrics={metrics || []}
            onEdit={setEditingMetrics}
            onRefresh={refreshData}
          />
        );
      case "metas":
        return <GoalsForm onSuccess={refreshData} />;
      case "clientes-atraso":
        return <OverdueCustomersPanel />;
      case "alertas":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
                <CardDescription>Monitoramento de métricas críticas</CardDescription>
              </CardHeader>
              <CardContent>
                {predictions?.alerts && predictions.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {predictions.alerts.map((alert, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <div>
                            <span className="font-medium">{alert.title}</span>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum alerta no momento.</p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Título do Dashboard */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard de Métricas</h1>
        <p className="text-muted-foreground">Controle financeiro e indicadores de crescimento da sua startup</p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="MRR (Receita Recorrente)"
          value={formatCurrency(latestMetrics?.mrr || 0)}
          change={calculateGrowthRate(latestMetrics?.mrr || 0, previousMetrics?.mrr || 0)}
          icon={<TrendingUp size={20} />}
          colorClass="from-green-500/20 to-green-600/5"
        />
        <StatsCard
          title="Taxa de Churn"
          value={`${(latestMetrics?.churn || 0).toFixed(1)}%`}
          change={-calculateGrowthRate(latestMetrics?.churn || 0, previousMetrics?.churn || 0)}
          icon={<AlertTriangle size={20} />}
          colorClass="from-red-500/20 to-red-600/5"
        />
        <StatsCard
          title="Novos Clientes"
          value={String(latestMetrics?.newCustomers || 0)}
          change={calculateGrowthRate(latestMetrics?.newCustomers || 0, previousMetrics?.newCustomers || 0)}
          icon={<Users size={20} />}
          colorClass="from-blue-500/20 to-blue-600/5"
        />
        <StatsCard
          title="LTV (Lifetime Value)"
          value={formatCurrency(latestMetrics?.ltv || 0)}
          change={calculateGrowthRate(latestMetrics?.ltv || 0, previousMetrics?.ltv || 0)}
          icon={<DollarSign size={20} />}
          colorClass="from-purple-500/20 to-purple-600/5"
        />
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nova Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(latestMetrics?.newRevenue || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(latestMetrics?.totalRevenue || 0)}</div>
            <div className="text-sm text-green-500 mt-1">
              ↗ {calculateGrowthRate(latestMetrics?.totalRevenue || 0, previousMetrics?.totalRevenue || 0).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Burn Rate Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(latestMetrics?.burnRate?.total || 0)}</div>
            <div className="text-sm text-muted-foreground mt-1">Gastos mensais totais</div>
          </CardContent>
        </Card>
      </div>

      {/* Seções principais */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fluxo de Caixa */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fluxo de Caixa
            </CardTitle>
            <CardDescription>Análise do caixa atual e runway da startup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CashFlowIndicator 
              mrr={latestMetrics?.mrr || 0}
              burnRate={latestMetrics?.burnRate?.total || 0}
            />
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas e Indicadores
            </CardTitle>
            <CardDescription>{predictions?.alerts?.length || 0} alertas requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            {predictions?.alerts && predictions.alerts.length > 0 ? (
              <div className="space-y-3">
                {predictions.alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded border-l-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-orange-800 dark:text-orange-300">
                        {alert.type === 'danger' ? 'Alta' : alert.type === 'warning' ? 'Média' : 'Baixa'}
                      </div>
                      <div className="text-orange-700 dark:text-orange-400">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-green-500 mb-2">✓</div>
                <p className="text-sm text-muted-foreground">Nenhum alerta crítico</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previsões */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Previsões para o Próximo Mês
            </CardTitle>
            <CardDescription>Projeções baseadas nas metas definidas e tendências atuais</CardDescription>
          </CardHeader>
          <CardContent>
            {predictions && <PredictionsCard predictions={predictions} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">StartupFlow</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  activeSection === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium"
                    : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start text-sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-sidebar-background border-b border-sidebar-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={refreshData} className="text-xs">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <AsaasSyncButton onSyncComplete={refreshData} />
              <div className="text-xs text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })} • {new Date().toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-9 w-56 h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-background">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
