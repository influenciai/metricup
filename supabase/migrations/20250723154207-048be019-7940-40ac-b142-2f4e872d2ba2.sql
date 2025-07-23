-- Create startup_metrics table
CREATE TABLE public.startup_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month TEXT NOT NULL, -- formato: "YYYY-MM"
  mrr DECIMAL(12,2) NOT NULL DEFAULT 0,
  churn DECIMAL(5,2) NOT NULL DEFAULT 0,
  new_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  new_customers INTEGER NOT NULL DEFAULT 0,
  total_customers INTEGER NOT NULL DEFAULT 0,
  ltv DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_technology DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_salaries DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_prolabore DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_marketing DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_administrative DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_others DECIMAL(12,2) NOT NULL DEFAULT 0,
  burn_rate_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Create startup_goals table
CREATE TABLE public.startup_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  mrr_growth_target DECIMAL(5,2) NOT NULL DEFAULT 20,
  new_customers_growth_target DECIMAL(5,2) NOT NULL DEFAULT 15,
  max_churn_rate DECIMAL(5,2) NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.startup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for startup_metrics
CREATE POLICY "Users can view their own metrics" 
ON public.startup_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics" 
ON public.startup_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics" 
ON public.startup_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics" 
ON public.startup_metrics 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for startup_goals
CREATE POLICY "Users can view their own goals" 
ON public.startup_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.startup_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.startup_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.startup_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_startup_metrics_updated_at
  BEFORE UPDATE ON public.startup_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_startup_goals_updated_at
  BEFORE UPDATE ON public.startup_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_startup_metrics_user_id_month ON public.startup_metrics(user_id, month);
CREATE INDEX idx_startup_metrics_month ON public.startup_metrics(month);
CREATE INDEX idx_startup_goals_user_id ON public.startup_goals(user_id);