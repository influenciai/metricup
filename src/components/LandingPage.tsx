import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Repeat, 
  ArrowUpDown, 
  BarChart3,
  CheckCircle,
  Phone,
  Mail,
  Zap,
  Shield,
  Clock,
  CreditCard,
  Building
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import metricupLogo from "@/assets/metricup-logo-official.png";

const mockMrrData = [
  { month: "Jan", mrr: 15000 },
  { month: "Fev", mrr: 18000 },
  { month: "Mar", mrr: 22000 },
  { month: "Abr", mrr: 28000 },
  { month: "Mai", mrr: 35000 },
  { month: "Jun", mrr: 42000 },
];

const mockBurnRateData = [
  { name: "Tecnologia", value: 25000, fill: "hsl(var(--chart-1))" },
  { name: "Marketing", value: 18000, fill: "hsl(var(--chart-2))" },
  { name: "Salários", value: 35000, fill: "hsl(var(--chart-3))" },
  { name: "Administrativo", value: 12000, fill: "hsl(var(--chart-4))" },
];

const chartConfig = {
  mrr: {
    label: "MRR",
    color: "hsl(var(--chart-1))",
  },
};

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function LandingPage({ onLogin, onSignup }: LandingPageProps) {

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Dashboard Completo",
      description: "Visualize todas as métricas importantes da sua startup em um só lugar"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: "Análise de Crescimento", 
      description: "Acompanhe MRR, churn rate, LTV e outras métricas essenciais"
    },
    {
      icon: <Target className="h-8 w-8 text-blue-500" />,
      title: "Metas e Alertas",
      description: "Defina objetivos e receba alertas quando se desviar do planejado"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Integrações",
      description: "Em breve: dados em tempo real via Asaas, Iugu e Pagar.me"
    }
  ];

  const benefits = [
    "Controle total sobre as finanças da startup",
    "Previsões baseadas em dados históricos",
    "Alertas inteligentes de performance",
    "Análise detalhada do burn rate",
    "Acompanhamento de metas de crescimento",
    "Interface intuitiva e responsiva"
  ];

  const steps = [
    {
      step: "1",
      title: "Cadastre-se",
      description: "Crie sua conta informando os dados da sua empresa"
    },
    {
      step: "2", 
      title: "Configure suas metas",
      description: "Defina objetivos de crescimento e limites de churn"
    },
    {
      step: "3",
      title: "Adicione suas métricas",
      description: "Insira dados mensais de receita, clientes e gastos"
    },
    {
      step: "4",
      title: "Monitore e cresça",
      description: "Acompanhe dashboards e tome decisões baseadas em dados"
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={metricupLogo} alt="MetricUp" className="h-8" />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Contato
            </Button>
            <Button variant="outline" onClick={onLogin} size="sm">
              Entrar
            </Button>
            <Button onClick={onSignup} size="sm">
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Controle financeiro para startups
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            Domine as métricas da sua startup
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            O MetricUp é a plataforma definitiva para acompanhar MRR, churn rate, LTV, burn rate e outras métricas essenciais para o crescimento da sua startup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onSignup} className="text-lg px-8">
              <TrendingUp className="mr-2 h-5 w-5" />
              Começar Gratuitamente
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Phone className="mr-2 h-5 w-5" />
              Falar com Especialista
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={onLogin}>
                Fazer login
              </Button>
            </p>
          </div>
        </div>
      </section>

      {/* Demo Charts Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Veja seus dados ganharem vida</h2>
            <p className="text-muted-foreground text-lg">
              Dashboards intuitivos que transformam números em insights acionáveis
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Evolução do MRR
                </CardTitle>
                <CardDescription>
                  Acompanhe o crescimento da sua receita recorrente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockMrrData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`R$ ${value.toLocaleString()}`, 'MRR']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mrr" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                  Distribuição do Burn Rate
                </CardTitle>
                <CardDescription>
                  Visualize onde seu dinheiro está sendo investido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockBurnRateData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockBurnRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades poderosas</h2>
            <p className="text-muted-foreground text-lg">
              Tudo que você precisa para acompanhar o crescimento da sua startup
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg">
              Em 4 passos simples, você terá controle total das suas métricas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Por que usar o MetricUp?</h2>
              <p className="text-muted-foreground mb-6">
                Startups que acompanham suas métricas de perto têm 3x mais chances de atingir seus objetivos de crescimento. 
                O MetricUp foi criado especificamente para founders que querem:
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Dados Seguros</h4>
                    <p className="text-sm text-muted-foreground">Suas informações protegidas com criptografia</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Economia de Tempo</h4>
                    <p className="text-sm text-muted-foreground">Automatize o controle de métricas</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <h4 className="font-semibold">Decisões Rápidas</h4>
                    <p className="text-sm text-muted-foreground">Insights em tempo real para agir rápido</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Plano simples e transparente</h2>
            <p className="text-muted-foreground text-lg">
              Sem surpresas, sem taxas ocultas. Tudo que você precisa por um preço justo.
            </p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Plano Único</CardTitle>
              <CardDescription>Para startups em crescimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">R$ 107,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <ul className="space-y-3 text-sm text-left mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Dashboard completo de métricas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Análise de burn rate detalhada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Previsões e alertas inteligentes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Configuração de metas personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>
                    <strong>Em breve:</strong> Integração com Asaas, Iugu e Pagar.me
                  </span>
                </li>
              </ul>
              
              <Button onClick={onSignup} className="w-full" size="lg">
                Começar Agora
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                * As integrações com gateways de pagamento trarão dados em tempo real para o dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para dominar suas métricas?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de founders que já estão usando dados para acelerar o crescimento das suas startups.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onSignup} className="text-lg px-8">
              <Building className="mr-2 h-5 w-5" />
              Criar Conta Grátis
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Mail className="mr-2 h-5 w-5" />
              Falar com Vendas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src={metricupLogo} alt="MetricUp" className="h-6" />
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Contato</a>
              <a href="#" className="hover:text-primary">Termos</a>
              <a href="#" className="hover:text-primary">Privacidade</a>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            © 2024 MetricUp. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}