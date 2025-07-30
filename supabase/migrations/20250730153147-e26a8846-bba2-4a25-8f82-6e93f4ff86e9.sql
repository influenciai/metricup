-- Limpar todas as integrações do Asaas de todas as contas
DELETE FROM public.user_integrations 
WHERE integration_type = 'asaas';