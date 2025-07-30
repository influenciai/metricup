import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plug, CheckCircle, XCircle, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isConnected: boolean;
  lastSync?: Date;
}

export default function IntegrationsPanel() {
  const [loading, setLoading] = useState(false);
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    checkExistingApiKey();
  }, []);

  const checkExistingApiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se o usuário já tem uma API key configurada
      // Aqui podemos criar uma tabela para armazenar as configurações de integração por usuário
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'asaas')
        .single();

      if (data && !error) {
        setHasApiKey(true);
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    }
  };

  const testAsaasConnection = async () => {
    if (!asaasApiKey.trim()) {
      toast.error("Por favor, insira a API Key do Asaas");
      return;
    }

    setTestingConnection(true);
    
    try {
      // Teste básico da API do Asaas
      const response = await fetch('https://sandbox.asaas.com/api/v3/customers?limit=1', {
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success("Conexão com Asaas testada com sucesso!");
        return true;
      } else {
        toast.error("Falha ao conectar com Asaas. Verifique sua API Key.");
        return false;
      }
    } catch (error) {
      console.error('Error testing Asaas connection:', error);
      toast.error("Erro ao testar conexão com Asaas");
      return false;
    } finally {
      setTestingConnection(false);
    }
  };

  const saveAsaasIntegration = async () => {
    if (!asaasApiKey.trim()) {
      toast.error("Por favor, insira a API Key do Asaas");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Salvar a configuração da integração
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          integration_type: 'asaas',
          api_key: asaasApiKey, // Em produção, isso deveria ser criptografado
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving integration:', error);
        toast.error("Erro ao salvar integração");
        return;
      }

      setHasApiKey(true);
      setAsaasApiKey("");
      toast.success("Integração com Asaas configurada com sucesso!");
    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error("Erro inesperado ao salvar integração");
    } finally {
      setLoading(false);
    }
  };

  const removeAsaasIntegration = async () => {
    if (!confirm("Tem certeza que deseja remover a integração com Asaas?")) {
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_type', 'asaas');

      if (error) {
        console.error('Error removing integration:', error);
        toast.error("Erro ao remover integração");
        return;
      }

      setHasApiKey(false);
      toast.success("Integração removida com sucesso!");
    } catch (error) {
      console.error('Error removing integration:', error);
      toast.error("Erro inesperado ao remover integração");
    } finally {
      setLoading(false);
    }
  };

  const integrations: Integration[] = [
    {
      id: "asaas",
      name: "Asaas",
      description: "Plataforma de pagamentos e gestão financeira",
      icon: Plug,
      isConnected: hasApiKey,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground">Configure suas integrações com serviços externos</p>
      </div>

      <Alert>
        <Plug className="h-4 w-4" />
        <AlertDescription>
          Configure suas integrações para sincronizar dados automaticamente com seus sistemas externos.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <integration.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {integration.name}
                      <Badge variant={integration.isConnected ? "default" : "secondary"}>
                        {integration.isConnected ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Conectado
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Não conectado
                          </>
                        )}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.id === "asaas" && (
                <div className="space-y-4">
                  {!hasApiKey ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="asaas-api-key">API Key do Asaas</Label>
                        <div className="relative">
                          <Input
                            id="asaas-api-key"
                            type={showApiKey ? "text" : "password"}
                            value={asaasApiKey}
                            onChange={(e) => setAsaasApiKey(e.target.value)}
                            placeholder="Cole sua API Key do Asaas aqui"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Você pode encontrar sua API Key no{" "}
                          <a 
                            href="https://www.asaas.com/api" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            painel do Asaas
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={testAsaasConnection}
                          variant="outline"
                          disabled={testingConnection || !asaasApiKey.trim()}
                        >
                          {testingConnection ? "Testando..." : "Testar Conexão"}
                        </Button>
                        <Button
                          onClick={saveAsaasIntegration}
                          disabled={loading || !asaasApiKey.trim()}
                        >
                          {loading ? "Salvando..." : "Salvar Integração"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Integração configurada e ativa
                      </div>
                      <Button
                        onClick={removeAsaasIntegration}
                        variant="destructive"
                        disabled={loading}
                      >
                        {loading ? "Removendo..." : "Remover Integração"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}