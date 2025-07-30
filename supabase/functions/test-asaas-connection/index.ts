import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API Key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determinar se é API key de produção ou sandbox
    const isProduction = apiKey.startsWith('$aact_prod_');
    const baseUrl = isProduction 
      ? 'https://www.asaas.com/api/v3' 
      : 'https://sandbox.asaas.com/api/v3';

    console.log(`[TEST-ASAAS] Testing connection with ${isProduction ? 'production' : 'sandbox'} API`);

    // Teste básico da API - buscar 1 cliente
    const response = await fetch(`${baseUrl}/customers?limit=1`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[TEST-ASAAS] Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`[TEST-ASAAS] Connection successful`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Connection successful',
          environment: isProduction ? 'production' : 'sandbox'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      const errorText = await response.text();
      console.error(`[TEST-ASAAS] API Error: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API Error: ${response.status}`,
          details: errorText
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('[TEST-ASAAS] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});