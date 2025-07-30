import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, Users, Calendar, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/startup-data';

interface OverdueCustomer {
  id: string;
  name: string;
  email?: string;
  totalOverdue: number;
  overdueCount: number;
  oldestOverdueDate: string;
  payments: OverduePayment[];
}

interface OverduePayment {
  id: string;
  value: number;
  dueDate: string;
  billingType: string;
  status: string;
  daysOverdue: number;
}

interface OverdueData {
  customers: OverdueCustomer[];
  totalValue: number;
  totalCustomers: number;
  criticalCount: number; // mais de 15 dias
}

export default function OverdueCustomersPanel() {
  const [overdueData, setOverdueData] = useState<OverdueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchOverdueData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-overdue-customers');
      
      if (error) throw error;
      
      setOverdueData(data);
    } catch (error) {
      console.error('Erro ao buscar dados de atraso:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueData();
  }, []);

  const getBillingTypeLabel = (type: string) => {
    switch (type) {
      case 'BOLETO': return 'Boleto';
      case 'CREDIT_CARD': return 'Cartão';
      case 'PIX': return 'PIX';
      case 'DEBIT_CARD': return 'Débito';
      default: return type;
    }
  };

  const getDaysOverdueColor = (days: number) => {
    if (days <= 5) return 'bg-yellow-500';
    if (days <= 15) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Carregando dados de atraso...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!overdueData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Faturas em Atraso
          </CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchOverdueData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos atrasos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Total em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(overdueData.totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overdueData.totalCustomers}
            </div>
            <div className="text-sm text-muted-foreground">
              {overdueData.criticalCount} críticos (+15 dias)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Status de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={overdueData.criticalCount > 5 ? "destructive" : overdueData.totalCustomers > 10 ? "secondary" : "default"}
              className="text-sm"
            >
              {overdueData.criticalCount > 5 
                ? "Alto Risco" 
                : overdueData.totalCustomers > 10 
                ? "Médio Risco" 
                : "Baixo Risco"
              }
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Lista detalhada de clientes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Clientes com Faturas em Atraso
              </CardTitle>
              <CardDescription>
                Clientes com faturas vencidas há mais de 5 dias (risco de churn)
              </CardDescription>
            </div>
            <Button onClick={fetchOverdueData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {overdueData.customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-green-500 mb-2 text-2xl">✓</div>
              <p className="text-muted-foreground">Nenhum cliente com atraso crítico!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdueData.customers.map((customer) => (
                <div 
                  key={customer.id} 
                  className="border rounded-lg p-4 space-y-3 bg-muted/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-foreground">{customer.name}</h4>
                      {customer.email && (
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(customer.totalOverdue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.overdueCount} fatura{customer.overdueCount > 1 ? 's' : ''} em atraso
                      </div>
                    </div>
                  </div>

                  {/* Faturas em atraso */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">Faturas em atraso:</h5>
                    {customer.payments.map((payment) => (
                      <div 
                        key={payment.id}
                        className="flex justify-between items-center p-2 bg-background rounded border-l-4"
                        style={{ borderLeftColor: getDaysOverdueColor(payment.daysOverdue) }}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {getBillingTypeLabel(payment.billingType)}
                          </Badge>
                          <span className="text-sm">
                            Venceu em {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge 
                            variant={payment.daysOverdue > 15 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {payment.daysOverdue} dias
                          </Badge>
                        </div>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(payment.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}