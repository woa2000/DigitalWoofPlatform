# Configuração do Supabase

Este projeto utiliza Supabase como banco de dados PostgreSQL e Drizzle ORM para gerenciamento do schema.

## Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Project Name**: DigitalWoof Platform
   - **Database Password**: Anote essa senha, você precisará dela
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
6. Clique em "Create new project"

### 2. Obter Credenciais do Banco

1. No painel do Supabase, vá em **Settings** → **Database**
2. Na seção **Connection string**, copie a **URI**
3. Substitua `[YOUR-PASSWORD]` pela senha que você definiu

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e atualize as seguintes variáveis:
   ```bash
   # OBRIGATÓRIO: URL de conexão do banco
   DATABASE_URL=postgresql://postgres:SUA-SENHA@db.SEU-PROJECT-REF.supabase.co:5432/postgres
   
   # OPCIONAL: Para features que usam Supabase no frontend
   VITE_SUPABASE_URL=https://SEU-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

### 4. Aplicar Schema no Banco

Execute as migrações para criar as tabelas:

```bash
npm run db:push
```

### 5. Verificar Conexão

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Se não houver erros de conexão, o banco está configurado corretamente!

## Comandos Úteis

```bash
# Aplicar mudanças no schema
npm run db:push

# Gerar nova migração (se necessário)
npx drizzle-kit generate

# Visualizar o banco no Drizzle Studio (opcional)
npx drizzle-kit studio
```

## Troubleshooting

### Erro de Conexão
- Verifique se a `DATABASE_URL` está correta
- Verifique se a senha está correta
- Verifique se o projeto Supabase está ativo

### Erro de SSL
- Supabase requer conexão SSL, certifique-se de que `ssl: 'require'` está na configuração

### Tabelas não criadas
- Execute `npm run db:push` para aplicar o schema
- Verifique os logs para erros específicos

## Schema do Banco

O schema está definido em `shared/schema.ts` e inclui:

- **users**: Usuários da plataforma
- **brand_onboarding**: Dados do wizard de onboarding
- **brand_voice_jsons**: Perfis de voz da marca (v1.0)
- **campaigns**: Campanhas de marketing
- **ai_content**: Conteúdo gerado por IA
- **compliance_checks**: Verificações de compliance
- **brand_assets**: Assets da marca
- **anamnesis_analysis**: Análises de presença digital
- E outras tabelas relacionadas...