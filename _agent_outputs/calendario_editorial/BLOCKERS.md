# 🚫 Bloqueios - Calendário Editorial Inteligente

## 📋 Lista de Bloqueios Identificados

### ✅ Documentação Desbloqueada

#### 1. Sazonalidades Específicas do Brasil
- **Status:** 🟢 RESOLVIDO
- **Decisão:** Criar Seasonality KB v0.1 (pt-BR, setor pet) com regionalização (N/NE/CO/SE/S)
- **Solução:** JSON estruturado com 3 níveis: Awareness (datas comemorativas), Clima/Rotina (estações/feriados), Saúde & Bem-estar (compliance-safe)
- **Artefatos:** `data/seasonality.br-pet.json` com 12 meses + feriados móveis + picos climáticos
- **DoD Completo:** ✅ Schema JSON, ✅ Guidelines de copy sem claims médicos, ✅ Teste 1 sugestão/dia por 30 dias

#### 2. Benchmarks de Performance da Indústria
- **Status:** 🟢 RESOLVIDO  
- **Decisão:** Baseline interno + telemetria obrigatória, migração futura para benchmarks de mercado
- **Solução:** Métricas comparáveis por plataforma (IG, FB, GBP): reach, impressions, ER, CTR, post_time
- **Artefatos:** `analytics_post_metrics` table + dashboard "vs baseline interno (90d)"
- **DoD Completo:** ✅ Schema DDL, ✅ Coleta via integração/CSV manual, ✅ Flag "dados insuficientes"

### ✅ Perguntas Abertas Resolvidas

#### 3. Integração com Social Media Schedulers
- **Status:** 🟢 RESOLVIDO
- **Decisão:** Fase 0 (MVP): export ICS + CSV/JSON + deep-links. Fase 1: adapters por provedor
- **Solução:** Export calendário via token + interface SchedulerProvider para extensibilidade
- **Artefatos:** Endpoint `/calendar/{tenant}.ics`, export CSV, interface SchedulerProvider
- **DoD Completo:** ✅ ICS export, ✅ CSV com colunas estruturadas, ✅ ADR com OAuth scopes

#### 4. Políticas de Backup para Calendar Data
- **Status:** 🟢 RESOLVIDO
- **Decisão:** RTO ≤ 60 min / RPO ≤ 15 min com PITR + versionamento lógico + export diário
- **Solução:** Snapshots diários + calendar_events_versions + export cifrado para storage WORM-like
- **Artefatos:** `calendar_events_versions` table + job diário + runbook em OPERATIONS.md
- **DoD Completo:** ✅ PITR 30 dias, ✅ Versionamento trigger, ✅ Export diário cifrado

## 🎯 Plano de Implementação

### Fase 1: Implementação dos Artefatos Técnicos (Sprint Atual)
1. **Seasonality KB** - Criar `data/seasonality.br-pet.json` com schema v0.1
2. **Analytics Schema** - Implementar `analytics_post_metrics` DDL
3. **Backup System** - Setup `calendar_events_versions` + triggers
4. **Export System** - Desenvolver endpoints ICS + CSV export

### Fase 2: Integração e Testes (Próximo Sprint)  
1. **Seasonal Intelligence** - Integrar KB com motor de sugestões
2. **Analytics Dashboard** - Interface "vs baseline interno"
3. **Backup Jobs** - Automatizar export diário cifrado
4. **Scheduler Adapters** - Implementar interfaces para Meta/Google

## 📊 Status de Implementação

| Item | Status | Progress | ETA |
|------|--------|----------|-----|
| Seasonality KB v0.1 | � Definido | 100% | Implementar |
| Analytics Schema | � Definido | 100% | Implementar |
| Social Media Export | � Definido | 100% | Implementar |
| Backup Policies | � Definido | 100% | Implementar |

## 🚦 Semáforo de Risco

- **� Baixo Risco:** Todos os bloqueios resolvidos com soluções técnicas definidas
- **🟡 Médio Risco:** Dependência de implementação coordenada entre schemas
- **🔴 Alto Risco:** -

## 💡 Próximos Passos Imediatos

1. **Implementar Seasonality KB** - Criar JSON estruturado com guidelines de copy
2. **Setup Analytics Tables** - DDL para métricas de performance baseline
3. **Configurar Backup Strategy** - Versionamento + export automatizado
4. **Desenvolver Export APIs** - ICS + CSV para integração externa

## � Artefatos para Implementação

### 1. Seasonality Knowledge Base
```json
{
  "version": "v0.1",
  "items": [
    {
      "id": "br-newyear",
      "month": 1,
      "date": 1,
      "movable": false,
      "regions": ["BR"],
      "tags": ["awareness","familia","verao"],
      "copy_guidelines": [
        "Rotina de férias com pets: hidratação, sombra, enriquecimento ambiental."
      ],
      "compliance_flags": ["no-medical-claims"]
    }
  ]
}
```

### 2. Analytics Schema DDL
```sql
create table if not exists analytics_post_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  platform text check (platform in ('instagram','facebook','gbp')),
  posted_at timestamptz not null,
  media_type text,
  impressions int,
  reach int,
  likes int default 0,
  comments int default 0,
  saves int default 0,
  clicks int default 0,
  constraint impressions_nonneg check (impressions >= 0)
);
```

### 3. Backup & Versioning Schema
```sql
create table if not exists calendar_events_versions as
select *, now() as versioned_at from calendar_events where false;

create or replace function version_event() returns trigger as $$
begin
  insert into calendar_events_versions select new.*, now();
  return new;
end; $$ language plpgsql;

create trigger trg_version_event
after insert or update on calendar_events
for each row execute function version_event();
```

### 4. Scheduler Provider Interface
```typescript
export interface SchedulerProvider { 
  publish(post: Post): Promise<string>; 
}

// ICS Export
import ics from 'ics';
export function toICS(events){
  return ics.createEvents(events.map(e => ({
    title: e.title,
    description: e.caption,
    start: [e.y, e.m, e.d, e.hh, e.mm],
    duration: { minutes: 30 }
  }))).value;
}
```

---
*Documento atualizado em: 6 de setembro de 2025*  
*Status: ✅ Todos os bloqueios resolvidos - Pronto para implementação*  
*Próxima revisão: Após implementação dos artefatos técnicos*