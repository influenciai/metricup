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
  RefreshCw,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Activity
} from "lucide-react";
import metricupLogo from "/lovable-uploads/da5e7f09-9c4b-43d3-bfdf-4f9a003ee925.png";
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
import DynamicDataInsert from "@/components/DynamicDataInsert";
import EditMetricsForm from "@/components/EditMetricsForm";
import MetricsTable from "@/components/MetricsTable";
import GoalsForm from "@/components/GoalsForm";
import OverdueCustomersPanel from "@/components/OverdueCustomersPanel";
import IntegrationsPanel from "@/components/IntegrationsPanel";
import { useStartupMetrics } from "@/hooks/useStartupMetrics";
import { calculateGrowthRate, formatCurrency } from "@/lib/startup-data";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { StartupMetrics } from "@/types/startup-metrics";


export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [editingMetrics, setEditingMetrics] = useState<StartupMetrics | null>(null);
  const [metricsMenuOpen, setMetricsMenuOpen] = useState(false);
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
    { id: "gerenciar-dados", label: "Gerenciar Dados", icon: Database },
    { id: "inserir-dados", label: "Inserir Dados", icon: Plus },
    { id: "alertas", label: "Alertas", icon: Bell },
    { id: "clientes-atraso", label: "Clientes em Atraso", icon: AlertTriangle },
    { id: "metas", label: "Metas", icon: Target },
    { id: "integracoes", label: "Integrações", icon: Settings },
  ];

  const metricsItems = [
    { id: "metrica-mrr", label: "MRR", icon: DollarSign },
    { id: "metrica-churn", label: "Taxa de Churn", icon: TrendingDown },
    { id: "metrica-clientes", label: "Novos Clientes", icon: Users },
    { id: "metrica-ltv", label: "LTV", icon: Activity },
    { id: "metrica-receita", label: "Receita Total", icon: TrendingUp },
    { id: "metrica-burnrate", label: "Burn Rate", icon: AlertTriangle },
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
        return <DynamicDataInsert onSuccess={refreshData} />;
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
      case "metrica-mrr":
        return renderMetricaIndividual("MRR", "DollarSign");
      case "metrica-churn":
        return renderMetricaIndividual("Churn", "TrendingDown");
      case "metrica-clientes":
        return renderMetricaIndividual("Clientes", "Users");
      case "metrica-ltv":
        return renderMetricaIndividual("LTV", "Activity");
      case "metrica-receita":
        return renderMetricaIndividual("Receita", "TrendingUp");
      case "metrica-burnrate":
        return renderMetricaIndividual("BurnRate", "AlertTriangle");
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
      case "integracoes":
        return <IntegrationsPanel />;
      default:
        return renderDashboard();
    }
  };

  const renderMetricaIndividual = (metricType: string, iconType: string) => {
    const getMetricData = () => {
      switch (metricType) {
        case "MRR":
          return {
            title: "MRR (Monthly Recurring Revenue)",
            value: formatCurrency(latestMetrics?.mrr || 0),
            change: calculateGrowthRate(latestMetrics?.mrr || 0, previousMetrics?.mrr || 0),
            description: "Receita recorrente mensal da sua startup",
            metricKey: "mrr" as keyof StartupMetrics,
            isCurrency: true
          };
        case "Churn":
          return {
            title: "Taxa de Churn",
            value: `${(latestMetrics?.churn || 0).toFixed(1)}%`,
            change: -calculateGrowthRate(latestMetrics?.churn || 0, previousMetrics?.churn || 0),
            description: "Porcentagem de clientes que cancelaram no período",
            metricKey: "churn" as keyof StartupMetrics,
            isPercentage: true
          };
        case "Clientes":
          return {
            title: "Novos Clientes",
            value: String(latestMetrics?.newCustomers || 0),
            change: calculateGrowthRate(latestMetrics?.newCustomers || 0, previousMetrics?.newCustomers || 0),
            description: "Número de novos clientes adquiridos no mês",
            metricKey: "newCustomers" as keyof StartupMetrics
          };
        case "LTV":
          return {
            title: "LTV (Lifetime Value)",
            value: formatCurrency(latestMetrics?.ltv || 0),
            change: calculateGrowthRate(latestMetrics?.ltv || 0, previousMetrics?.ltv || 0),
            description: "Valor médio que cada cliente gera durante sua permanência",
            metricKey: "ltv" as keyof StartupMetrics,
            isCurrency: true
          };
        case "Receita":
          return {
            title: "Receita Total",
            value: formatCurrency(latestMetrics?.totalRevenue || 0),
            change: calculateGrowthRate(latestMetrics?.totalRevenue || 0, previousMetrics?.totalRevenue || 0),
            description: "Receita total incluindo MRR e pagamentos únicos",
            metricKey: "totalRevenue" as keyof StartupMetrics,
            isCurrency: true
          };
        case "BurnRate":
          return {
            title: "Burn Rate Total",
            value: formatCurrency(latestMetrics?.burnRate?.total || 0),
            change: calculateGrowthRate(latestMetrics?.burnRate?.total || 0, previousMetrics?.burnRate?.total || 0),
            description: "Total de gastos mensais da startup",
            metricKey: "burnRate" as keyof StartupMetrics,
            isCurrency: true
          };
        default:
          return null;
      }
    };

    const metricData = getMetricData();
    if (!metricData) return null;

    return (
      <div className="space-y-6">
        {/* Header da métrica */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{metricData.title}</h1>
          <p className="text-muted-foreground">{metricData.description}</p>
        </div>

        {/* Card principal da métrica */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Valor Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{metricData.value}</div>
              <div className={`flex items-center gap-2 text-sm ${
                metricData.change >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {metricData.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(Math.min(999, metricData.change)).toFixed(1)}% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meta vs Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Meta mensal:</span>
                  <span className="text-sm font-medium">
                    {metricType === "MRR" && `${goals.mrrGrowthTarget}%`}
                    {metricType === "Churn" && `${goals.maxChurnRate}%`}
                    {metricType === "Clientes" && `${goals.newCustomersGrowthTarget}%`}
                    {!["MRR", "Churn", "Clientes"].includes(metricType) && "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Resultado:</span>
                  <span className={`text-sm font-medium ${
                    metricData.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {Math.abs(Math.min(999, metricData.change)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de evolução */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Últimos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsEvolutionChart
              data={metrics || []}
              metric={metricData.metricKey as "mrr" | "churn" | "newRevenue" | "totalRevenue" | "newCustomers" | "totalCustomers" | "ltv"}
              title={metricData.title}
              color="#3b82f6"
              isCurrency={metricData.isCurrency}
              isPercentage={metricData.isPercentage}
            />
          </CardContent>
        </Card>

        {/* Análises e insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricData.change > 10 && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      📈 Excelente crescimento! A métrica está {metricData.change.toFixed(1)}% acima do mês anterior.
                    </p>
                  </div>
                )}
                {metricData.change >= 0 && metricData.change <= 10 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      📊 Crescimento moderado de {metricData.change.toFixed(1)}%. Considere estratégias para acelerar.
                    </p>
                  </div>
                )}
                {metricData.change < 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-red-800 dark:text-red-300">
                      📉 Atenção! Queda de {Math.abs(metricData.change).toFixed(1)}%. Investigar causas e implementar ações corretivas.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {metricType === "MRR" && (
                  <>
                    <p>• Foque em retenção de clientes existentes</p>
                    <p>• Implemente upsell e cross-sell</p>
                    <p>• Monitore churn rate constantemente</p>
                  </>
                )}
                {metricType === "Churn" && (
                  <>
                    <p>• Melhore o onboarding de novos clientes</p>
                    <p>• Implemente pesquisas de satisfação</p>
                    <p>• Desenvolva programa de fidelidade</p>
                  </>
                )}
                {metricType === "Clientes" && (
                  <>
                    <p>• Otimize canais de aquisição</p>
                    <p>• Implemente programa de referência</p>
                    <p>• Melhore conversão do funil</p>
                  </>
                )}
                {metricType === "LTV" && (
                  <>
                    <p>• Aumente o tempo de vida do cliente</p>
                    <p>• Implemente estratégias de upsell</p>
                    <p>• Reduza custos de churn</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="MRR (Receita Recorrente)"
          value={formatCurrency(latestMetrics?.mrr || 0)}
          change={calculateGrowthRate(latestMetrics?.mrr || 0, previousMetrics?.mrr || 0)}
          icon={<TrendingUp size={20} />}
          colorClass="from-blue-500/20 to-blue-600/5"
          valueColor="text-blue-600"
        />
        <StatsCard
          title="Taxa de Churn"
          value={`${(latestMetrics?.churn || 0).toFixed(1)}%`}
          change={-calculateGrowthRate(latestMetrics?.churn || 0, previousMetrics?.churn || 0)}
          icon={<AlertTriangle size={20} />}
          colorClass={(() => {
            const churnRate = latestMetrics?.churn || 0;
            const churnTarget = 5; // Meta de 5%
            return churnRate <= churnTarget ? "from-green-500/20 to-green-600/5" : "from-red-500/20 to-red-600/5";
          })()}
          valueColor={(() => {
            const churnRate = latestMetrics?.churn || 0;
            const churnTarget = 5; // Meta de 5%
            return churnRate <= churnTarget ? "text-green-600" : "text-red-600";
          })()}
        />
        <StatsCard
          title="Novos Clientes"
          value={String(latestMetrics?.newCustomers || 0)}
          change={calculateGrowthRate(latestMetrics?.newCustomers || 0, previousMetrics?.newCustomers || 0)}
          icon={<Users size={20} />}
          colorClass={(() => {
            const newCustomers = latestMetrics?.newCustomers || 0;
            const target = 10; // Meta exemplo
            if (newCustomers < target * 0.8) return "from-red-500/20 to-red-600/5";
            if (newCustomers >= target * 1.2) return "from-green-500/20 to-green-600/5";
            return "from-blue-500/20 to-blue-600/5";
          })()}
          valueColor={(() => {
            const newCustomers = latestMetrics?.newCustomers || 0;
            const target = 10; // Meta exemplo
            if (newCustomers < target * 0.8) return "text-red-600";
            if (newCustomers >= target * 1.2) return "text-green-600";
            return "text-blue-600";
          })()}
        />
        <StatsCard
          title="Clientes Ativos"
          value={String(latestMetrics?.totalCustomers || 0)}
          change={calculateGrowthRate(latestMetrics?.totalCustomers || 0, previousMetrics?.totalCustomers || 0)}
          icon={<Users size={20} />}
          colorClass="from-blue-500/20 to-blue-600/5"
          valueColor="text-blue-600"
        />
        <StatsCard
          title="LTV (Lifetime Value)"
          value={formatCurrency(latestMetrics?.ltv || 0)}
          change={calculateGrowthRate(latestMetrics?.ltv || 0, previousMetrics?.ltv || 0)}
          icon={<DollarSign size={20} />}
          colorClass="from-purple-500/20 to-purple-600/5"
          valueColor="text-blue-600"
        />
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nova Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(latestMetrics?.newRevenue || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(latestMetrics?.totalRevenue || 0)}</div>
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
            <div className="text-2xl font-bold text-red-600">{formatCurrency(latestMetrics?.burnRate?.total || 0)}</div>
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
            <img src={metricupLogo} alt="MetricUp" className="h-8" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {/* Dashboard - posição 1 */}
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                activeSection === "dashboard"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium"
                  : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50"
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </button>

            {/* Métricas - posição 2 (Menu expansível principal) */}
            <div>
              <button
                onClick={() => setMetricsMenuOpen(!metricsMenuOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4" />
                  Métricas
                </div>
                {metricsMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* Submenu de métricas */}
              {metricsMenuOpen && (
                <div className="ml-4 mt-2 space-y-1 border-l border-sidebar-border pl-4">
                  {metricsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                        activeSection === item.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium"
                          : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Demais itens nas posições 3-8 */}
            {sidebarItems.slice(1).map((item) => (
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
