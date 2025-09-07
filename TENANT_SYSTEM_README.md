# Sistema de Tenants - Digital Woof Platform

## 🎯 Visão Geral

Este documento explica como criar e gerenciar tenants (organizações) no sistema Digital Woof Platform, incluindo a associação de usuários aos tenants.

## 📋 Estrutura do Sistema

### Tabelas Principais

1. **`tenants`** - Organizações/empresas
   - `id` - UUID único
   - `name` - Nome da organização
   - `slug` - Slug único para URLs
   - `business_type` - Tipo de negócio (veterinaria, petshop, etc.)
   - `owner_id` - ID do usuário proprietário
   - `subscription_plan` - Plano (free, basic, premium)
   - `status` - Status (active, suspended, archived)

2. **`tenant_users`** - Relacionamento usuário-tenant
   - `tenant_id` - ID do tenant
   - `user_id` - ID do usuário
   - `role` - Papel (owner, admin, member, viewer)
   - `status` - Status (active, invited, suspended)

3. **`profiles`** - Perfis dos usuários
   - `id` - Mesmo ID do usuário no Supabase Auth
   - `tenant_id` - Tenant associado
   - `full_name` - Nome completo
   - `business_name` - Nome da empresa
   - `business_type` - Tipo de negócio

## 🚀 Como Criar um Tenant

### Método 1: Script Automático (Recomendado)

```bash
# Criar tenant para usuário teste@exemplo.com
node create-tenant-for-user.js
```

Este script irá:
- ✅ Criar um tenant "Clínica Veterinária Teste"
- ✅ Associar ao usuário teste@exemplo.com
- ✅ Criar perfil do usuário
- ✅ Configurar permissões básicas

### Método 2: Verificar Tenants Existentes

```bash
# Verificar tenants criados
node verify-tenant-setup.js
```

## 🔧 Atualizar User ID (Importante!)

Após criar o tenant, você precisa atualizar o `user_id` com o ID real do Supabase Auth:

```bash
# 1. Obter o User ID do Supabase
# Vá para: https://supabase.com/dashboard > Authentication > Users
# Encontre teste@exemplo.com e copie o UUID

# 2. Atualizar o tenant
node update-tenant-user-id.js <user-id-do-supabase>

# Exemplo:
node update-tenant-user-id.js 123e4567-e89b-12d3-a456-426614174000
```

## 🎨 Acessar TenantSettings no Frontend

### URLs Disponíveis

1. **Página principal de configurações:**
   ```
   http://localhost:5173/settings
   ```

2. **Via navegação:**
   - Sidebar → "Configurações" (seção Recursos)

3. **Via botão configurações:**
   - Rodapé do sidebar → Ícone ⚙️ Settings

### Funcionalidades Disponíveis

#### Aba Geral
- ✅ Nome da organização
- ✅ Tipo de negócio
- ✅ Descrição
- ✅ Salvamento automático

#### Aba Marca
- ✅ Cores primária/secundária
- ✅ Família de fontes
- ✅ Diretrizes da marca

#### Aba Equipe
- 🚧 Em desenvolvimento

#### Aba Assinatura
- ✅ Plano atual
- ✅ Status da assinatura

## 🔗 APIs Utilizadas

### Backend APIs

```javascript
// Buscar tenant atual
GET /api/tenants/current

// Atualizar tenant
PUT /api/tenants/{tenantId}

// Buscar usuários do tenant
GET /api/tenants/{tenantId}/users
```

### Estrutura de Resposta

```json
{
  "success": true,
  "data": {
    "id": "0752c8bc-ca49-45b6-a5cd-280e1aa2b425",
    "name": "Clínica Veterinária Teste",
    "slug": "clinica-veterinaria-teste",
    "businessType": "veterinaria",
    "subscriptionPlan": "free",
    "status": "active",
    "settings": {
      "description": "Clínica veterinária para testes"
    },
    "brandGuidelines": {
      "primaryColor": "#1E40AF",
      "secondaryColor": "#EF4444",
      "fontFamily": "Inter"
    }
  }
}
```

## 🛠️ Scripts Disponíveis

### `create-tenant-for-user.js`
Cria um tenant completo e associa a um usuário.

### `verify-tenant-setup.js`
Verifica tenants, usuários e perfis criados.

### `update-tenant-user-id.js`
Atualiza o user_id com ID real do Supabase Auth.

### `test-tenant-system.js`
Testa todo o sistema de tenants (usado em desenvolvimento).

## ⚠️ Considerações Importantes

### 1. User ID do Supabase
- O `user_id` deve ser o UUID real do Supabase Auth
- Não use IDs fictícios em produção
- Sempre atualize após criar usuários no Supabase

### 2. Permissões RLS
Se usar Row Level Security (RLS):
```sql
-- Habilitar RLS nas tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view tenant users" ON tenant_users
  FOR SELECT USING (user_id = auth.uid());
```

### 3. Multi-tenancy
- Cada usuário pode pertencer a apenas um tenant
- O `tenant_id` é usado para isolar dados
- Configure índices apropriados para performance

## 🔍 Troubleshooting

### Erro: "Tenant não encontrado"
- Verifique se o usuário está logado
- Confirme se o `user_id` está correto
- Execute `node verify-tenant-setup.js`

### Erro: "Usuário não associado ao tenant"
- Execute `node update-tenant-user-id.js <user-id>`
- Verifique se o usuário existe no Supabase Auth

### Erro: "DATABASE_URL não configurada"
- Verifique se o arquivo `.env` existe
- Confirme se `DATABASE_URL` está definida
- Exemplo: `DATABASE_URL=postgresql://user:pass@host:5432/db`

## 📊 Verificar Estado Atual

```bash
# Ver tenants criados
node verify-tenant-setup.js

# Ver estrutura do banco
psql $DATABASE_URL -c "SELECT * FROM tenants;"
psql $DATABASE_URL -c "SELECT * FROM tenant_users;"
psql $DATABASE_URL -c "SELECT * FROM profiles;"
```

## 🎉 Próximos Passos

1. ✅ Criar tenant e associar usuário
2. ✅ Configurar User ID do Supabase
3. ✅ Testar acesso ao TenantSettings
4. 🔄 Implementar funcionalidades de equipe
5. 🔄 Configurar notificações
6. 🔄 Implementar upgrade de planos

---

**📞 Suporte:** Em caso de dúvidas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.