import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-OVERDUE-CUSTOMERS] ${step}${detailsStr}`);
};

interface AsaasCustomer {
  id: string;
  name: string;
  email?: string;
}

interface AsaasPayment {
  id: string;
  customer: string;
  billingType: string;
  status: string;
  value: number;
  dueDate: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Iniciando busca de clientes em atraso");

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

    // Headers para API do Asaas
    const asaasHeaders = {
      "access_token": asaasApiKey,
      "Content-Type": "application/json"
    };

    // Calcular data de 5 dias atrás
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0];

    logStep("Buscando pagamentos em atraso", { dateLimitStr: fiveDaysAgoStr });

    // Buscar pagamentos em atraso há mais de 5 dias
    const overduePaymentsResponse = await fetch(
      `https://www.asaas.com/api/v3/payments?status=OVERDUE&dueDate[le]=${fiveDaysAgoStr}&limit=100`,
      { headers: asaasHeaders }
    );

    if (!overduePaymentsResponse.ok) {
      throw new Error(`Erro ao buscar pagamentos: ${overduePaymentsResponse.status}`);
    }

    const overduePaymentsData = await overduePaymentsResponse.json();
    const overduePayments: AsaasPayment[] = overduePaymentsData.data || [];
    logStep("Pagamentos em atraso encontrados", { count: overduePayments.length });

    if (overduePayments.length === 0) {
      return new Response(JSON.stringify({
        customers: [],
        totalValue: 0,
        totalCustomers: 0,
        criticalCount: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Agrupar pagamentos por cliente
    const customerPayments = new Map<string, AsaasPayment[]>();
    let totalValue = 0;

    for (const payment of overduePayments) {
      if (!customerPayments.has(payment.customer)) {
        customerPayments.set(payment.customer, []);
      }
      customerPayments.get(payment.customer)!.push(payment);
      totalValue += payment.value;
    }

    logStep("Pagamentos agrupados por cliente", { 
      uniqueCustomers: customerPayments.size,
      totalValue 
    });

    // Buscar dados dos clientes
    const customerIds = Array.from(customerPayments.keys());
    const customers: AsaasCustomer[] = [];

    // Buscar clientes em lotes (máximo 100 por requisição)
    for (let i = 0; i < customerIds.length; i += 100) {
      const batch = customerIds.slice(i, i + 100);
      
      for (const customerId of batch) {
        try {
          const customerResponse = await fetch(
            `https://www.asaas.com/api/v3/customers/${customerId}`,
            { headers: asaasHeaders }
          );
          
          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            customers.push(customerData);
          }
        } catch (error) {
          logStep("Erro ao buscar cliente", { customerId, error: error.message });
        }
      }
    }

    logStep("Dados dos clientes obtidos", { count: customers.length });

    // Montar dados finais
    const today = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const overdueCustomers = customers.map(customer => {
      const payments = customerPayments.get(customer.id) || [];
      const customerTotalOverdue = payments.reduce((sum, p) => sum + p.value, 0);
      
      const paymentsWithDays = payments.map(payment => {
        const dueDate = new Date(payment.dueDate);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...payment,
          daysOverdue
        };
      });

      const oldestPayment = paymentsWithDays.reduce((oldest, current) => 
        current.daysOverdue > oldest.daysOverdue ? current : oldest
      );

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalOverdue: customerTotalOverdue,
        overdueCount: payments.length,
        oldestOverdueDate: oldestPayment.dueDate,
        payments: paymentsWithDays.sort((a, b) => b.daysOverdue - a.daysOverdue)
      };
    }).sort((a, b) => b.totalOverdue - a.totalOverdue);

    // Contar clientes críticos (mais de 15 dias)
    const criticalCount = overdueCustomers.filter(customer => 
      customer.payments.some(payment => payment.daysOverdue > 15)
    ).length;

    const result = {
      customers: overdueCustomers,
      totalValue,
      totalCustomers: overdueCustomers.length,
      criticalCount
    };

    logStep("Dados processados com sucesso", {
      totalCustomers: result.totalCustomers,
      totalValue: result.totalValue,
      criticalCount: result.criticalCount
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO na busca de clientes em atraso", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});