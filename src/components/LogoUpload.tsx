import React, { useState } from 'react';
import { Upload, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function LogoUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase Storage
      const fileName = `metricup-logo-official.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      toast({
        title: "Sucesso!",
        description: "Logo oficial da MetricUp atualizada com sucesso.",
      });

      // Reload the page to show the new logo
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da logo. Tente novamente.",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Logo Oficial MetricUp
        </CardTitle>
        <CardDescription>
          Faça upload da logo oficial da empresa MetricUp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview && (
          <div className="border rounded-lg p-4 text-center">
            <img 
              src={preview} 
              alt="Preview da logo" 
              className="max-h-32 mx-auto object-contain"
            />
          </div>
        )}
        
        <div className="flex items-center justify-center w-full">
          <label htmlFor="logo-upload" className="w-full">
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Clique para enviar</span> ou arraste a imagem
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG ou SVG (máx. 5MB)
                </p>
              </div>
              <input 
                id="logo-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </label>
        </div>

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Enviando logo...
          </div>
        )}
      </CardContent>
    </Card>
  );
}