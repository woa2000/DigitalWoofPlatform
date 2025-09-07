# DigitalWoof Platform - Deployment Guide

## Visão Geral

Este guia fornece instruções completas para deploy da plataforma DigitalWoof em ambiente de produção usando Docker e Docker Compose.

## Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git** para versionamento
- **Servidor Linux** com pelo menos 2GB RAM e 20GB disco
- **Domínio** configurado (opcional para HTTPS)

## Estrutura de Deploy

```
deployment/
├── docker-compose.yml    # Configuração dos serviços
├── Dockerfile           # Build da aplicação
├── nginx.conf          # Configuração do proxy reverso
├── deploy.sh           # Script de deploy automatizado
├── .env.example        # Template de variáveis de ambiente
└── README.md           # Este arquivo
```

## Configuração Inicial

### 1. Clonagem do Repositório

```bash
git clone https://github.com/your-org/digitalwoof-platform.git
cd digitalwoof-platform
```

### 2. Configuração do Ambiente

```bash
# Copie o template de ambiente
cp deployment/.env.example .env

# Edite as variáveis de produção
nano .env
```

**Variáveis obrigatórias:**
- `DATABASE_URL`: URL de conexão PostgreSQL
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `OPENAI_API_KEY`: Chave da API OpenAI
- `JWT_SECRET`: Segredo para JWT (mínimo 32 caracteres)

### 3. Configuração do Banco de Dados

Certifique-se de que o PostgreSQL está configurado com:
- Usuário: `digitalwoof`
- Banco: `digitalwoof`
- Permissões adequadas

## Deploy Automatizado

### Deploy Completo

```bash
# Torne o script executável
chmod +x deployment/deploy.sh

# Execute o deploy
./deployment/deploy.sh production
```

### Deploy em Staging

```bash
./deployment/deploy.sh staging
```

### Rollback (em caso de problemas)

```bash
./deployment/deploy.sh production rollback
```

## Deploy Manual

### 1. Build das Imagens

```bash
docker-compose build --no-cache
```

### 2. Iniciar Serviços

```bash
docker-compose up -d
```

### 3. Executar Migrações

```bash
# Aguardar banco de dados
sleep 30

# Executar migrações
docker-compose exec digitalwoof-app npm run db:migrate
```

### 4. Verificar Health Check

```bash
curl http://localhost:3000/health
```

## Configuração de Produção

### SSL/HTTPS (Recomendado)

1. **Obter certificado SSL** (Let's Encrypt ou similar)
2. **Configurar nginx** para HTTPS
3. **Atualizar variáveis de ambiente** com URLs HTTPS

### Domínio Personalizado

1. **Configurar DNS** para apontar para seu servidor
2. **Atualizar nginx.conf** com o domínio correto
3. **Configurar CORS** no arquivo .env

### Monitoramento

```bash
# Verificar status dos serviços
docker-compose ps

# Ver logs da aplicação
docker-compose logs digitalwoof-app

# Ver logs do nginx
docker-compose logs nginx

# Ver logs do banco
docker-compose logs postgres
```

## Backup e Recuperação

### Backup Automático

O script de deploy cria backups automáticos em `/opt/digitalwoof/backups/`.

### Backup Manual

```bash
# Backup do banco
docker exec digitalwoof_postgres_1 pg_dump -U digitalwoof digitalwoof > backup.sql

# Backup de uploads
docker cp digitalwoof-app:/app/uploads ./uploads_backup
```

### Restauração

```bash
# Restaurar banco
docker exec -i digitalwoof_postgres_1 psql -U digitalwoof digitalwoof < backup.sql

# Restaurar uploads
docker cp ./uploads_backup digitalwoof-app:/app/uploads
```

## Otimização de Performance

### Configurações Recomendadas

1. **Redis Cache**: Configurado automaticamente
2. **Nginx Gzip**: Habilitado para compressão
3. **Rate Limiting**: Configurado para APIs
4. **Connection Pooling**: Otimizado para PostgreSQL

### Monitoramento de Recursos

```bash
# Uso de CPU/Memória
docker stats

# Logs de performance
docker-compose logs | grep "performance"

# Health checks
curl http://localhost:3000/api/health
```

## Troubleshooting

### Problemas Comuns

#### Serviço não inicia
```bash
# Verificar logs
docker-compose logs

# Verificar variáveis de ambiente
docker-compose exec digitalwoof-app env | grep -E "(DATABASE|SUPABASE|OPENAI)"
```

#### Erro de conexão com banco
```bash
# Testar conexão
docker-compose exec postgres psql -U digitalwoof -d digitalwoof -c "SELECT 1"

# Verificar credenciais
cat .env | grep DATABASE_URL
```

#### Aplicação lenta
```bash
# Verificar uso de recursos
docker stats

# Limpar cache
docker-compose exec digitalwoof-app curl -X POST http://localhost:3000/api/cache/clear
```

### Logs Importantes

- **Aplicação**: `/app/logs/digitalwoof.log`
- **Nginx**: `/var/log/nginx/`
- **PostgreSQL**: Logs do container postgres
- **Redis**: Logs do container redis

## Segurança

### Checklist de Segurança

- [ ] SSL/HTTPS configurado
- [ ] Variáveis sensíveis não em logs
- [ ] Firewall configurado
- [ ] Backups automáticos ativos
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Headers de segurança ativos

### Atualizações de Segurança

```bash
# Atualizar imagens
docker-compose pull

# Rebuild e redeploy
docker-compose up -d --build
```

## Suporte

Para suporte técnico:
- **Documentação**: `/docs/` na aplicação
- **Logs**: Verificar logs dos containers
- **Monitoramento**: Configurar alertas para erros
- **Backup**: Testar restauração regularmente

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0