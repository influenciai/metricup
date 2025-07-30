import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ASAAS-SYNC] ${step}${detailsStr}`);
};

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  dateCreated: string;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: string;
  status: string;
  value: number;
  dateCreated: string;
  nextDueDate?: string;
  deletedDate?: string;
}

interface AsaasPayment {
  id: string;
  customer: string;
  subscription?: string;
  billingType: string;
  status: string;
  value: number;
  netValue: number;
  dueDate: string;
  paymentDate?: string;
  dateCreated: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Iniciando sincronização com Asaas");

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasApiKey) {
      throw new Error("ASAAS_API_KEY não configurada");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header não fornecido");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Usuário não autenticado");

    logStep("Usuário autenticado", { userId: user.id });

    // Calcular data de 12 meses atrás
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const startDate = twelveMonthsAgo.toISOString().split('T')[0];

    logStep("Buscando dados dos últimos 12 meses", { startDate });

    // Headers para API do Asaas
    const asaasHeaders = {
      "access_token": asaasApiKey,
      "Content-Type": "application/json"
    };

    // Buscar clientes
    const customersResponse = await fetch(
      `https://www.asaas.com/api/v3/customers?limit=100&dateCreated[ge]=${startDate}`,
      { headers: asaasHeaders }
    );
    
    if (!customersResponse.ok) {
      throw new Error(`Erro ao buscar clientes: ${customersResponse.status}`);
    }

    const customersData = await customersResponse.json();
    const customers: AsaasCustomer[] = customersData.data || [];
    logStep("Clientes encontrados", { count: customers.length });

    // Buscar assinaturas ativas
    const subscriptionsResponse = await fetch(
      `https://www.asaas.com/api/v3/subscriptions?limit=100&dateCreated[ge]=${startDate}`,
      { headers: asaasHeaders }
    );
    
    if (!subscriptionsResponse.ok) {
      throw new Error(`Erro ao buscar assinaturas: ${subscriptionsResponse.status}`);
    }

    const subscriptionsData = await subscriptionsResponse.json();
    const activeSubscriptions: AsaasSubscription[] = subscriptionsData.data || [];
    logStep("Assinaturas ativas encontradas", { count: activeSubscriptions.length });

    // Buscar assinaturas removidas/canceladas para calcular churn real
    const deletedSubscriptionsResponse = await fetch(
      `https://www.asaas.com/api/v3/subscriptions?status=INACTIVE&limit=100&dateCreated[ge]=${startDate}`,
      { headers: asaasHeaders }
    );

    let deletedSubscriptions: AsaasSubscription[] = [];
    if (deletedSubscriptionsResponse.ok) {
      const deletedData = await deletedSubscriptionsResponse.json();
      deletedSubscriptions = deletedData.data || [];
      logStep("Assinaturas canceladas encontradas", { count: deletedSubscriptions.length });
    }

    // Combinar todas as assinaturas para análise histórica
    const allSubscriptions = [...activeSubscriptions, ...deletedSubscriptions];

    // Buscar todos os pagamentos recebidos dos últimos 12 meses
    let allPayments: AsaasPayment[] = [];
    let offset = 0;
    const limit = 100;
    
    logStep("Iniciando busca de pagamentos recebidos");
    
    // Buscar pagamentos em lotes
    while (true) {
      const paymentsResponse = await fetch(
        `https://www.asaas.com/api/v3/payments?status=RECEIVED&limit=${limit}&offset=${offset}&paymentDate[ge]=${startDate}`,
        { headers: asaasHeaders }
      );
      
      if (!paymentsResponse.ok) {
        throw new Error(`Erro ao buscar pagamentos: ${paymentsResponse.status}`);
      }

      const paymentsData = await paymentsResponse.json();
      const batchPayments: AsaasPayment[] = paymentsData.data || [];
      
      if (batchPayments.length === 0) break;
      
      allPayments = allPayments.concat(batchPayments);
      offset += limit;
      
      logStep(`Lote de pagamentos obtido`, { 
        batchSize: batchPayments.length, 
        totalSoFar: allPayments.length,
        offset 
      });
      
      // Parar se retornou menos que o limite (último lote)
      if (batchPayments.length < limit) break;
    }
    
    logStep("Todos os pagamentos recebidos encontrados", { total: allPayments.length });

    // Processar métricas mês a mês
    const metrics = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = monthDate.toISOString().slice(0, 7); // YYYY-MM
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      // Filtrar pagamentos do mês usando os dados corretos
      const monthPayments = allPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate || p.dateCreated);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      // Filtrar clientes novos do mês
      const newCustomers = customers.filter(c => {
        const customerDate = new Date(c.dateCreated);
        return customerDate >= monthStart && customerDate <= monthEnd;
      });

      // Calcular MRR (pagamentos de assinaturas)
      const subscriptionPayments = monthPayments.filter(p => p.subscription);
      const mrr = subscriptionPayments.reduce((sum, p) => sum + p.value, 0);

      // Calcular pagamentos únicos (não recorrentes) - PIX, boleto único, etc.
      const oneTimePayments = monthPayments.filter(p => !p.subscription);
      const oneTimeRevenue = oneTimePayments.reduce((sum, p) => sum + p.value, 0);

      // Calcular receita total (MRR + pagamentos únicos)
      const totalRevenue = monthPayments.reduce((sum, p) => sum + p.value, 0);
      
      // Log detalhado para debug
      if (i === 0) { // Log apenas do mês atual
        logStep("Detalhes do mês atual", {
          month: monthStr,
          totalPayments: monthPayments.length,
          subscriptionPayments: subscriptionPayments.length,
          oneTimePayments: oneTimePayments.length,
          mrr,
          oneTimeRevenue,
          totalRevenue,
          paymentTypes: monthPayments.reduce((acc, p) => {
            acc[p.billingType] = (acc[p.billingType] || 0) + p.value;
            return acc;
          }, {} as Record<string, number>)
        });
      }

      // Calcular nova receita (pagamentos de clientes novos)
      const newCustomerIds = newCustomers.map(c => c.id);
      const newRevenue = monthPayments
        .filter(p => newCustomerIds.includes(p.customer))
        .reduce((sum, p) => sum + p.value, 0);

      // Contar total de clientes com assinaturas ativas no final do mês
      const activeSubscriptionsEndOfMonth = allSubscriptions.filter(s => {
        const createdDate = new Date(s.dateCreated);
        const isCreatedBeforeOrDuringMonth = createdDate <= monthEnd;
        
        // Verificar se a assinatura estava ativa no final do mês
        if (s.status === 'ACTIVE') {
          return isCreatedBeforeOrDuringMonth;
        } else {
          // Para assinaturas inativas, verificar se foram canceladas após o final do mês
          // Isso significa que estavam ativas durante o mês
          return isCreatedBeforeOrDuringMonth;
        }
      });
      
      const totalCustomers = activeSubscriptionsEndOfMonth.length;

      // Calcular LTV (simplificado como tempo médio * MRR médio)
      const avgSubscriptionValue = activeSubscriptionsEndOfMonth.length > 0 
        ? activeSubscriptionsEndOfMonth.reduce((sum, s) => sum + s.value, 0) / activeSubscriptionsEndOfMonth.length 
        : 0;
      const ltv = avgSubscriptionValue * 12; // Estimativa de 12 meses

      // Calcular churn real baseado em assinaturas canceladas no mês
      const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
      const previousMonthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0);
      
      // Assinaturas ativas no início do mês
      const activeSubscriptionsStartOfMonth = allSubscriptions.filter(s => {
        const createdDate = new Date(s.dateCreated);
        return createdDate <= previousMonthEnd && 
               (s.status === 'ACTIVE' || 
                (s.status === 'INACTIVE' && createdDate <= monthEnd));
      });

      // Assinaturas canceladas especificamente neste mês
      const subscriptionsCanceledThisMonth = deletedSubscriptions.filter(s => {
        if (s.status !== 'INACTIVE') return false;
        
        // Assumir que foi cancelada neste mês se foi criada antes e está inativa
        const createdDate = new Date(s.dateCreated);
        return createdDate <= previousMonthEnd;
      });

      const churn = activeSubscriptionsStartOfMonth.length > 0 
        ? (subscriptionsCanceledThisMonth.length / activeSubscriptionsStartOfMonth.length) * 100
        : 0;

      // Log detalhado do cálculo de churn para o mês atual
      if (i === 0) {
        logStep("Cálculo de churn detalhado", {
          month: monthStr,
          activeStartOfMonth: activeSubscriptionsStartOfMonth.length,
          canceledThisMonth: subscriptionsCanceledThisMonth.length,
          churnRate: churn,
          totalActiveEndOfMonth: totalCustomers
        });
      }

      const monthMetric = {
        month: monthStr,
        mrr,
        churn,
        newRevenue,
        totalRevenue,
        newCustomers: newCustomers.length,
        totalCustomers,
        ltv,
        burnRate: {
          technology: 0,
          salaries: 0,
          prolabore: 0,
          marketing: 0,
          administrative: 0,
          others: 0,
          total: 0
        }
      };

      metrics.unshift(monthMetric);
    }

    // Buscar faturas atrasadas
    const overduePaymentsResponse = await fetch(
      `https://www.asaas.com/api/v3/payments?status=OVERDUE&limit=100`,
      { headers: asaasHeaders }
    );

    let overduePayments: AsaasPayment[] = [];
    let overdueValue = 0;
    let overdueCustomers: string[] = [];

    if (overduePaymentsResponse.ok) {
      const overdueData = await overduePaymentsResponse.json();
      overduePayments = overdueData.data || [];
      
      // Filtrar atrasadas há mais de 5 dias
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      const criticalOverdue = overduePayments.filter(p => {
        const dueDate = new Date(p.dueDate);
        return dueDate < fiveDaysAgo;
      });

      overdueValue = criticalOverdue.reduce((sum, p) => sum + p.value, 0);
      overdueCustomers = [...new Set(criticalOverdue.map(p => p.customer))];
    }

    // Salvar métricas no Supabase
    for (const metric of metrics) {
      await supabaseClient.from("startup_metrics").upsert({
        user_id: user.id,
        month: metric.month,
        mrr: metric.mrr,
        churn: metric.churn,
        new_revenue: metric.newRevenue,
        total_revenue: metric.totalRevenue,
        new_customers: metric.newCustomers,
        total_customers: metric.totalCustomers,
        ltv: metric.ltv,
        burn_rate_technology: metric.burnRate.technology,
        burn_rate_salaries: metric.burnRate.salaries,
        burn_rate_prolabore: metric.burnRate.prolabore,
        burn_rate_marketing: metric.burnRate.marketing,
        burn_rate_administrative: metric.burnRate.administrative,
        burn_rate_others: metric.burnRate.others,
        burn_rate_total: metric.burnRate.total,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,month',
        ignoreDuplicates: false 
      });
    }

    logStep("Métricas salvas com sucesso", { 
      metricsCount: metrics.length,
      overdueValue,
      overdueCustomersCount: overdueCustomers.length 
    });

    return new Response(JSON.stringify({
      success: true,
      metrics: metrics.length,
      overdueValue,
      overdueCustomers: overdueCustomers.length,
      message: `Sincronizados ${metrics.length} meses de dados`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO na sincronização", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});