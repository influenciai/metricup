-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.email() IN ('ghenriquealm@gmail.com', 'run4salesbr@gmail.com');
$$;

-- Update profiles policies
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
CREATE POLICY "Super admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_super_admin());

-- Update startup_goals policies  
DROP POLICY IF EXISTS "Super admin can view all goals" ON public.startup_goals;
CREATE POLICY "Super admin can view all goals" 
ON public.startup_goals 
FOR SELECT 
USING (public.is_super_admin());

-- Update startup_metrics policies
DROP POLICY IF EXISTS "Super admin can view all metrics" ON public.startup_metrics;
CREATE POLICY "Super admin can view all metrics" 
ON public.startup_metrics 
FOR SELECT 
USING (public.is_super_admin());

-- Update user_integrations policies
DROP POLICY IF EXISTS "Super admin can view all integrations" ON public.user_integrations;
CREATE POLICY "Super admin can view all integrations" 
ON public.user_integrations 
FOR SELECT 
USING (public.is_super_admin());