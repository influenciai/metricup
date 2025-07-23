import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building, Mail, Phone, User, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  onBack: () => void;
}

export default function SignupForm({ onBack }: SignupFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    document: "",
    responsibleName: "",
    whatsapp: "",
    email: "",
    businessType: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica
    if (!formData.companyName || !formData.email || !formData.responsibleName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Simular cadastro
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Em breve entraremos em contato para finalizar a configuração.",
      });
      
      // Reset form
      setFormData({
        companyName: "",
        document: "",
        responsibleName: "",
        whatsapp: "",
        email: "",
        businessType: ""
      });
      
    } catch (error) {
      toast({
        title: "Erro ao realizar cadastro",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MetricUp</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados da sua empresa para começar a usar o MetricUp
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Nome da Empresa *
                </Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Minha Startup Ltda"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CPF ou CNPJ
                </Label>
                <Input
                  id="document"
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  value={formData.document}
                  onChange={(e) => handleInputChange("document", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibleName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome do Responsável *
                </Label>
                <Input
                  id="responsibleName"
                  placeholder="Seu nome completo"
                  value={formData.responsibleName}
                  onChange={(e) => handleInputChange("responsibleName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@minhaempresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">O que a empresa faz?</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup-saas">Startup SaaS</SelectItem>
                    <SelectItem value="agencia-marketing">Agência de Marketing</SelectItem>
                    <SelectItem value="servicos-b2b">Serviços B2B</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao criar sua conta, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={onBack}>
              Fazer login
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}