# 🗄️ Sistema de Migrations - PostgreSQL

Sistema centralizado de migrations para o DigitalWoof Platform, usando PostgreSQL standalone com tracking automático.

## 📁 Estrutura

```
db/
├── 📋 README.md                    # Esta documentação
├── 🔧 config.js                    # Configuração PostgreSQL
├── 📝 migrations/                  # Arquivos SQL das migrations
│   ├── 000_migration_tracking.sql  # Sistema de tracking
│   ├── 001_initial_schema.sql      # Schema inicial + tenants
│   ├── 002_brand_voice_json.sql    # Brand Voice JSON
│   └── 003_campaigns.sql           # (exemplo de próxima)
├── 🛠️ scripts/                     # Scripts utilitários
│   ├── run-migrations.js           # Executar migrations
│   ├── create-migration.js         # Criar nova migration
│   └── check-status.js             # Status do sistema
└── 🌱 seeds/                       # Dados de seed (futuro)
    └── initial-data.sql
```

## 🚀 Como Usar

### **Executar Migrations**
```bash
# Executar todas as migrations pendentes
npm run db:migrate

# Ver histórico de migrations executadas
npm run db:migrate:history
```

### **Criar Nova Migration**
```bash
# Criar nova migration
npm run db:migrate:create "add campaigns table"

# Listar migrations existentes
node db/scripts/create-migration.js --list
```

### **Verificar Status**
```bash
# Status das migrations
npm run db:migrate:status

# Testar conexão
npm run db:test
```

## 📝 Criando Migrations

### **1. Gerar arquivo**
```bash
npm run db:migrate:create "descrição da migration"
```

### **2. Editar SQL**
```sql
-- Migration: add campaigns table
-- Created: 2025-09-07 15:30:00
-- 
-- Description:
-- Criar tabela de campanhas de marketing

-- =============================================
-- UP Migration
-- =============================================

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
```

### **3. Executar**
```bash
npm run db:migrate
```

## 🎯 Sistema de Tracking

### **Recursos**
- ✅ **Tracking automático** de migrations executadas
- ✅ **Checksum validation** para detectar mudanças
- ✅ **Rollback seguro** (em desenvolvimento)
- ✅ **Histórico completo** com timestamps
- ✅ **Performance monitoring** (tempo de execução)

### **Tabela `migration_history`**
```sql
id              SERIAL PRIMARY KEY
filename        VARCHAR(255) UNIQUE  -- Nome do arquivo
executed_at     TIMESTAMP            -- Quando foi executada
checksum        VARCHAR(64)          -- Hash do conteúdo
execution_time  INTEGER              -- Tempo em ms
status          VARCHAR(20)          -- success, skipped, error
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
# PostgreSQL (obrigatório)
DATABASE_URL=postgres://user:pass@host:port/db?sslmode=disable

# Opcional
NODE_ENV=development
```

### **Conexão PostgreSQL**
```javascript
// db/config.js
export const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60,
  ssl: false // ou 'require' conforme DATABASE_URL
});
```

## 🏗️ Estrutura das Migrations

### **Padrão de Nomenclatura**
```
000_migration_tracking.sql      # Sistema base
001_initial_schema.sql          # Schema inicial
002_feature_name.sql            # Features específicas
003_add_indexes.sql             # Melhorias
999_cleanup.sql                 # Limpezas finais
```

### **Template Padrão**
```sql
-- Migration: [Descrição]
-- Created: [Data]
-- 
-- Description:
-- Explicação detalhada do que a migration faz

-- =============================================
-- UP Migration
-- =============================================

-- SQL statements here
CREATE TABLE IF NOT EXISTS...

-- =============================================
-- Notes
-- =============================================
-- 
-- - Use IF NOT EXISTS quando possível
-- - Adicione índices para performance  
-- - Considere foreign keys e constraints
-- - Teste localmente antes de aplicar
```

## 🎛️ Comandos Disponíveis

### **NPM Scripts**
```bash
npm run db:migrate          # Executar migrations
npm run db:migrate:create   # Criar nova migration
npm run db:migrate:history  # Ver histórico
npm run db:migrate:status   # Status do sistema
npm run db:test            # Testar conexão
```

### **Scripts Diretos**
```bash
# Criar migration
node db/scripts/create-migration.js "add new table"

# Executar migrations
node db/scripts/run-migrations.js

# Ver histórico
node db/scripts/run-migrations.js history

# Listar migrations
node db/scripts/create-migration.js --list
```

## 🔍 Troubleshooting

### **Conexão Failed**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
npm run db:test

# Verificar PostgreSQL
psql $DATABASE_URL -c "SELECT version();"
```

### **Migration Failed**
```bash
# Ver log detalhado
npm run db:migrate

# Verificar histórico
npm run db:migrate:history

# Status das tabelas
psql $DATABASE_URL -c "\dt"
```

### **Erro de Sintaxe**
- Verificar se SQL é compatível com PostgreSQL
- Usar `IF NOT EXISTS` para evitar erros de duplicação
- Testar SQL manualmente antes de migration

## 📊 Migração do Sistema Antigo

### **De Supabase para PostgreSQL**
- ✅ Removido dependências `@supabase/supabase-js`
- ✅ Substituído `auth.users` por tabela `profiles`
- ✅ Adaptado RLS policies para foreign keys
- ✅ Convertido para PostgreSQL standalone

### **Consolidação de Arquivos**
```bash
# Antigo (espalhado)
migrations/0005_tenant_system.sql
scripts/run-migrations.js
scripts/manual-migration.js

# Novo (centralizado)
db/migrations/001_initial_schema.sql
db/scripts/run-migrations.js
db/config.js
```

## 🎯 Próximos Passos

### **Roadmap**
- [ ] Sistema de rollback automático
- [ ] Dry-run mode para testar migrations
- [ ] Integration com CI/CD
- [ ] Backup automático antes de migrations
- [ ] Web UI para gerenciar migrations

### **Features Planejadas**
- [ ] `npm run db:rollback` - Rollback última migration
- [ ] `npm run db:reset` - Reset completo do banco
- [ ] `npm run db:seed` - Popular dados iniciais
- [ ] `npm run db:backup` - Backup antes de migrations

## 📚 Exemplos

### **Migration Simples**
```sql
-- Migration: add user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Migration com Foreign Key**
```sql
-- Migration: add foreign key to existing table
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS fk_profiles_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### **Migration com Índices**
```sql
-- Migration: add performance indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
```

---

## 🛡️ Segurança

- ✅ **Validação de conexão** antes de executar
- ✅ **Transações automáticas** para consistency
- ✅ **Logging completo** de todas as operações
- ✅ **Backup de tracking** para rollback futuro

## 💡 Dicas

1. **Sempre testar** migrations localmente primeiro
2. **Usar transactions** para operações complexas
3. **Adicionar índices** para performance
4. **Documentar** mudanças no código
5. **Fazer backup** antes de migrations em produção

---

*Sistema criado para PostgreSQL standalone, sem dependências Supabase.*