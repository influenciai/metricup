import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingDown, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Database
} from "lucide-react";
import AddMetricsForm from "./AddMetricsForm";
import IndividualMetricForm from "./IndividualMetricForm";

interface DynamicDataInsertProps {
  onSuccess: () => void;
}

interface MetricType {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  type: "currency" | "percentage" | "number";
}

const metricTypes: MetricType[] = [
  {
    id: "mrr",
    label: "MRR (Receita Recorrente)",
    description: "Receita recorrente mensal",
    icon: DollarSign,
    color: "bg-blue-500",
    type: "currency"
  },
  {
    id: "churn",
    label: "Taxa de Churn",
    description: "Percentual de cancelamentos",
    icon: TrendingDown,
    color: "bg-red-500",
    type: "percentage"
  },
  {
    id: "new_customers",
    label: "Novos Clientes",
    description: "Número de clientes novos",
    icon: Users,
    color: "bg-green-500",
    type: "number"
  },
  {
    id: "total_customers",
    label: "Total de Clientes",
    description: "Número total de clientes",
    icon: Users,
    color: "bg-blue-500",
    type: "number"
  },
  {
    id: "ltv",
    label: "LTV (Lifetime Value)",
    description: "Valor do tempo de vida do cliente",
    icon: Activity,
    color: "bg-purple-500",
    type: "currency"
  },
  {
    id: "new_revenue",
    label: "Nova Receita",
    description: "Receita de novos clientes",
    icon: TrendingUp,
    color: "bg-green-500",
    type: "currency"
  },
  {
    id: "total_revenue",
    label: "Receita Total",
    description: "Receita total do período",
    icon: TrendingUp,
    color: "bg-indigo-500",
    type: "currency"
  },
  {
    id: "burn_rate_total",
    label: "Burn Rate Total",
    description: "Gastos totais mensais",
    icon: AlertTriangle,
    color: "bg-red-500",
    type: "currency"
  }
];

export default function DynamicDataInsert({ onSuccess }: DynamicDataInsertProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("individual");

  const handleMetricSelect = (metricId: string) => {
    setSelectedMetric(metricId);
  };

  const handleBack = () => {
    setSelectedMetric(null);
  };

  const selectedMetricData = metricTypes.find(m => m.id === selectedMetric);

  if (selectedMetric && selectedMetricData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBack}>
            ← Voltar
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${selectedMetricData.color} flex items-center justify-center`}>
              <selectedMetricData.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{selectedMetricData.label}</h2>
              <p className="text-sm text-muted-foreground">{selectedMetricData.description}</p>
            </div>
          </div>
        </div>
        
        <IndividualMetricForm 
          metric={selectedMetricData}
          onSuccess={() => {
            onSuccess();
            setSelectedMetric(null);
          }}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Inserir Dados
          </CardTitle>
          <CardDescription>
            Escolha como deseja inserir os dados da sua startup
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Métrica Individual
          </TabsTrigger>
          <TabsTrigger value="complete" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Conjunto Completo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inserir Métrica Individual</CardTitle>
              <CardDescription>
                Selecione uma métrica específica para atualizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metricTypes.map((metric) => (
                  <Card 
                    key={metric.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50"
                    onClick={() => handleMetricSelect(metric.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center flex-shrink-0`}>
                          <metric.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{metric.label}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
                          <Badge variant="secondary" className="text-xs">
                            {metric.type === 'currency' ? 'Moeda' : 
                             metric.type === 'percentage' ? 'Percentual' : 'Número'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete">
          <AddMetricsForm onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}