import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import { useAsaasSync } from "@/hooks/useAsaasSync";

interface AsaasSyncButtonProps {
  onSyncComplete?: () => void;
}

export default function AsaasSyncButton({ onSyncComplete }: AsaasSyncButtonProps) {
  const { syncAsaasData, isLoading } = useAsaasSync();

  const handleSync = async () => {
    try {
      await syncAsaasData();
      onSyncComplete?.();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {isLoading ? "Sincronizando..." : "Sincronizar Asaas"}
    </Button>
  );
}