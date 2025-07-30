-- Adicionar coluna para categoria "Ferramentas" do burn rate
ALTER TABLE public.startup_metrics 
ADD COLUMN IF NOT EXISTS burn_rate_ferramentas NUMERIC NOT NULL DEFAULT 0;