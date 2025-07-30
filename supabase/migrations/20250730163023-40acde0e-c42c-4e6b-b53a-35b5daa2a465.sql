-- Create policy for super admin to view all profiles
CREATE POLICY "Super admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.email() = 'ghenriquealm@gmail.com');

-- Create policy for super admin to view all startup metrics
CREATE POLICY "Super admin can view all metrics" 
ON public.startup_metrics 
FOR SELECT 
TO authenticated
USING (auth.email() = 'ghenriquealm@gmail.com');

-- Create policy for super admin to view all goals
CREATE POLICY "Super admin can view all goals" 
ON public.startup_goals 
FOR SELECT 
TO authenticated
USING (auth.email() = 'ghenriquealm@gmail.com');

-- Create policy for super admin to view all integrations
CREATE POLICY "Super admin can view all integrations" 
ON public.user_integrations 
FOR SELECT 
TO authenticated
USING (auth.email() = 'ghenriquealm@gmail.com');