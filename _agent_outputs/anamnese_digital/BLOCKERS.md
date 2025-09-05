# 🚫 Bloqueios Identificados - Anamnese Digital

## ⚠️ Bloqueios Críticos

### 1. ✅ RESOLVIDO: Estratégia de Observabilidade definida
- **Decisão:** Sem ferramenta de APM externa - usar logging estruturado + métricas básicas
- **Implementação:**
  - **Logs:** JSON estruturado via console.log
  - **Métricas:** Endpoint /api/health com métricas básicas
  - **Alertas:** Logs de erro com níveis (ERROR, WARN, INFO)
  - **Monitoring:** Supabase dashboard nativo para database
- **Status:** ✅ Desbloqueado - T-011 pode prosseguir

### 2. ✅ RESOLVIDO: Estratégia de Testes definida
- **Ferramentas confirmadas:**
  - **Unit:** Vitest (compatibilidade com Vite)
  - **Integration:** Supertest (API endpoints) 
  - **E2E:** Playwright (browser automation)
  - **Coverage:** 80% services, 60% components, 100% validation
- **Setup:** Configuração integrada ao Vite existing
- **Status:** ✅ Desbloqueado - T-008 e T-009 podem prosseguir

### 3. Processo de Rollback não documentado
- **Impacto:** Risco operacional para deployment e migrations
- **Owner:** Database_Admin  
- **Descrição:** Procedimento para rollback de schema changes não existe
- **Componentes Necessários:**
  - Migration rollback scripts automáticos
  - Data preservation strategy
  - Service downtime procedures
  - Health check automation
- **Next Step:** Criar runbook de rollback com scenarios de teste
- **Deadline Sugerido:** 3 dias úteis

## 📋 Bloqueios Não-Críticos

### 4. Timeline de Integração IA não definido
- **Impacto:** Arquitetura mock pode precisar refactoring futuro
- **Owner:** Tech_Lead
- **Descrição:** Quando substituir mock engine por OpenAI integration
- **Considerações:**
  - Budget para API calls OpenAI
  - Performance requirements reais
  - Volume de processamento esperado
- **Next Step:** Roadmap meeting com Product Owner
- **Deadline Sugerido:** 1 semana

## 🎯 Plano de Desbloqueio

### Prioridade 1 (Críticos para execução)
1. **APM Decision** → DevOps meeting (2 dias)
2. **Test Strategy** → QA documentation (1 dia)  
3. **Rollback Procedures** → Database runbook (3 dias)

### Prioridade 2 (Planejamento futuro)
4. **AI Integration Timeline** → Product roadmap (1 semana)

## ✅ Critérios de Desbloqueio

### APM Tool
- [ ] Ferramenta selecionada e aprovada pelo budget
- [ ] Documentação de setup disponível
- [ ] Credentials/access configurados
- [ ] Integration example implementado

### Test Strategy  
- [ ] Percentual de cobertura definido
- [ ] Ferramentas e setup documentado
- [ ] CI/CD integration planejado
- [ ] Exclusions e exceptions listadas

### Rollback Procedures
- [ ] Scripts de rollback testados
- [ ] Runbook documentado e revisado
- [ ] Emergency contacts definidos
- [ ] Rollback testing completed

## 🚨 Alternativas de Contorno

### Para APM (se decisão demorar)
- **Workaround:** Usar logging estruturado + console metrics inicialmente
- **Timeline:** Implementar APM real em sprint subsequente
- **Risk:** Observabilidade limitada em produção inicial

### Para Test Strategy (se documentação demorar)  
- **Workaround:** Usar defaults da indústria (80% cobertura, Jest setup)
- **Timeline:** Refinar strategy durante implementação
- **Risk:** Pode requerer refactoring de testes

### Para Rollback (se runbook demorar)
- **Workaround:** Manual rollback apenas, deployment mais conservador
- **Timeline:** Implementar automation posteriormente  
- **Risk:** Downtime maior em caso de problemas

---
**Status:** 3 bloqueios críticos, 1 não-crítico  
**Tempo estimado de desbloqueio:** 3-5 dias úteis  
**Recomendação:** Priorizar APM decision para permitir execução de T-011