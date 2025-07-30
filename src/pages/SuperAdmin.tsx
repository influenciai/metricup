import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Search, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  Calendar,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  company_name: string;
  responsible_name: string;
  document: string;
  whatsapp: string;
  business_type: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_users: number;
  users_with_metrics: number;
  users_with_goals: number;
  users_with_integrations: number;
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar se é super admin
  const isSuperAdmin = user?.email === 'ghenriquealm@gmail.com';

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Acesso negado. Apenas o super administrador pode acessar esta página.");
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
  }, [isSuperAdmin, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Buscar todos os perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar estatísticas
      const { data: metricsCount } = await supabase
        .from('startup_metrics')
        .select('user_id', { count: 'estimated' });

      const { data: goalsCount } = await supabase
        .from('startup_goals')
        .select('user_id', { count: 'estimated' });

      const { data: integrationsCount } = await supabase
        .from('user_integrations')
        .select('user_id', { count: 'estimated' });

      setProfiles(profilesData || []);
      setStats({
        total_users: profilesData?.length || 0,
        users_with_metrics: metricsCount?.length || 0,
        users_with_goals: goalsCount?.length || 0,
        users_with_integrations: integrationsCount?.length || 0,
      });

    } catch (error) {
      console.error('Erro ao buscar dados do admin:', error);
      toast.error("Erro ao carregar dados administrativos");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar perfis baseado na pesquisa
  const filteredProfiles = profiles.filter(profile =>
    profile.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.responsible_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.business_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-red-500" />
                Painel Super Admin
              </h1>
              <p className="text-muted-foreground">
                Acesso exclusivo para visualizar todas as contas da plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Métricas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users_with_metrics}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Metas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users_with_goals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Integrações</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users_with_integrations}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contas Cadastradas</CardTitle>
            <CardDescription>
              Lista completa de todas as empresas cadastradas na plataforma
            </CardDescription>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por empresa, responsável, documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid gap-4">
                {filteredProfiles.map((profile) => (
                  <Card key={profile.id} className="p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">EMPRESA</span>
                        </div>
                        <p className="font-medium">{profile.company_name}</p>
                        {profile.business_type && (
                          <Badge variant="secondary" className="mt-1">
                            {profile.business_type}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">RESPONSÁVEL</span>
                        </div>
                        <p className="font-medium">{profile.responsible_name}</p>
                        {profile.document && (
                          <p className="text-sm text-muted-foreground">Doc: {profile.document}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">CONTATO</span>
                        </div>
                        {profile.whatsapp && (
                          <p className="text-sm">{profile.whatsapp}</p>
                        )}
                        <p className="text-sm text-muted-foreground">ID: {profile.user_id.slice(0, 8)}...</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-muted-foreground">CADASTRADO</span>
                        </div>
                        <p className="text-sm">
                          {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredProfiles.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Nenhuma conta encontrada</p>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Tente ajustar os filtros de pesquisa" : "Ainda não há contas cadastradas"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}