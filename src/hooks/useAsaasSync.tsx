import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAsaasSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const syncAsaasData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('asaas-sync');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Sincronização concluída",
        description: `${data.message}. Faturas atrasadas: R$ ${data.overdueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      });

      return data;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncAsaasData,
    isLoading
  };
};