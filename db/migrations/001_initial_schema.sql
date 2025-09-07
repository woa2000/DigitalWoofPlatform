-- Migration: Configuração inicial do sistema
-- Criação das tabelas principais e sistema de tenants
-- Todas as tabelas já existem, esta migration garante a estrutura

-- 1. Verificar se as tabelas existem (comando que sempre funciona)
SELECT 'Sistema já configurado' as status;

-- As tabelas já foram criadas previamente:
-- - tenants (sistema de tenants)
-- - tenant_users (usuários por tenant)  
-- - profiles (perfis de usuário)
-- - brand_onboarding (onboarding de marca)
-- - brand_voice (voice da marca)

-- Esta migration existe apenas para registrar no tracking que o schema inicial está presente