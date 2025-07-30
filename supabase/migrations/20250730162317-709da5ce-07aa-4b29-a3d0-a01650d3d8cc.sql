-- Create the company-assets bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true);

-- Create policies for the bucket - only super admin can upload
CREATE POLICY "Only super admin can upload company assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'company-assets' 
  AND auth.email() = 'ghenriquealm@gmail.com'
);

CREATE POLICY "Only super admin can update company assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'company-assets' 
  AND auth.email() = 'ghenriquealm@gmail.com'
);

CREATE POLICY "Only super admin can delete company assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'company-assets' 
  AND auth.email() = 'ghenriquealm@gmail.com'
);

CREATE POLICY "Everyone can view company assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-assets');