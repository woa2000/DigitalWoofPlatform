# ✅ TODO - Lacunas Pendentes de Definição

**Versão:** 1.0  
**Baseado em:** Análise do PRD, Roadmap e codebase atual  
**Objetivo:** Listar lacunas identificadas que precisam de clarificação/implementação

---

## 🎯 Por que este TODO existe?

Durante a criação da documentação, identificamos áreas onde o **PRD ou código atual não especificam detalhes suficientes** para documentação técnica completa. Este documento lista essas lacunas para **revisão humana e definição pela equipe**.

**⚠️ Importante:** Não são "bugs" ou "features faltando" - são **decisões pendentes** que precisam ser tomadas antes da implementação.

---

## 🔍 Como Usar

**Status dos items:**
- 🔴 **Crítico** - Bloqueia desenvolvimento
- 🟡 **Importante** - Deve ser resolvido antes da próxima fase
- 🟢 **Nice-to-have** - Pode aguardar fases futuras

**Ações:**
- 👥 **Team Decision** - Precisa discussão com equipe
- 📋 **Product Owner** - Decisão de produto
- 🛠️ **Tech Lead** - Decisão técnica
- 🔍 **Research** - Precisa investigação/estudo

---

## 🔴 Críticos (Bloqueia Desenvolvimento)

### 1. Estratégia de Testes Automatizados

**Lacuna identificada:** PRD não especifica estratégia de testes. Código atual não tem testes.
R. 
# Stack sugerida baseada no projeto atual:
- Unit: Vitest (compatibilidade com Vite)
- Integration: Supertest (API endpoints)
- E2E: Playwright (browser automation)
- Coverage: 80% services, 60% components, 100% validation


---

### 2. Configuração de Observabilidade (Logs/Métricas)

**Lacuna identificada:** PRD menciona "logs estruturados; métricas; traces" mas não especifica ferramentas.

R.
# Stack sugerida para MVP:
- Error Tracking: Sentry (free tier 5k events/month)
- Structured Logs: console.log JSON + aggregation tool TBD
- Metrics: Custom endpoint /api/metrics + simple dashboard
- Alerting: Email notifications para errors críticos


---

### 3. Deploy Strategy & Environment Management

**Lacuna identificada:** DESIGN_DECISIONS.md lista "Production TBD" para deployment.

**Questões pendentes:**
- Plataforma de produção? 
R: Vercel
- Ambientes: 
R: dev/prod
- Database migrations strategy em produção?
R: migrations
- Secrets management (JWT_SECRET, API keys)?
R:JWT_SECRET




---

## 🟡 Importantes (Próxima Fase)

### 4. Real AI Integration (substituir mock)

**Lacuna identificada:** F-1 Anamnese está com mock. PRD não detalha prompts ou fine-tuning.

**Questões pendentes:**
- Prompts finais para cada seção da anamnese?
- Stratégia de rate limiting com OpenAI?
- Error handling para failures da API?
- Backup strategy se OpenAI fica indisponível?
- Cost optimization - caching de respostas?

**Impacto:**
- **M1 Marco** (Roadmap) - "Agente mock end-to-end" vs "Agente real"
- **User Experience** - Mock não entrega valor real
- **Cost Management** - Sem otimização, custos podem explodir

**Ação:** 📋 **Product Owner** (prompts) + 🛠️ **Tech Lead** (integration)

---

### 5. WhatsApp BSP Selection & Integration

**Lacuna identificada:** PRD menciona "BSP de WhatsApp" mas não especifica qual homologar.

**Questões pendentes:**
- Qual BSP escolher primeiro? (360Dialog, Twilio, MessageBird)
- Pricing model - por mensagem ou subscription?
- Compliance LGPD - como implementar opt-out?
- Templates de mensagem - quem cria e aprova?
- Integration testing - como testar sem enviar mensagens reais?

**Impacto:**
- **F-10 Jornadas** não pode ser implementada
- **M8 Marco** (Roadmap) - "Jornadas com upload CSV"
- **Legal compliance** - LGPD requer opt-out fácil

**Ação:** 📋 **Product Owner** + 👥 **Team** (research BSPs)

---

### 6. Meta/Google APIs Integration Details

**Lacuna identificada:** PRD menciona Meta Graph API + Google Business Profile mas não detalha scope/permissions.

**Questões pendentes:**
- Quais permissões OAuth solicitar? (publish_pages, manage_pages, etc.)
- Rate limits e quotas - como gerenciar?
- Multi-account support - usuário pode conectar várias páginas?
- Error handling - token expirado, página deletada, etc.?
- Webhook setup para notificações?

**Impacto:**
- **F-9 Publicação** requer design detalhado
- **User Experience** - Setup complexo pode frustrar usuários
- **Compliance** - Apps em produção requerem review do Meta/Google

**Ação:** 🛠️ **Tech Lead** + 📋 **Product Owner** (UX flows)

---

### 7. Content Generation Compliance Rules

**Lacuna identificada:** PRD menciona "compliance checks" mas não lista regras específicas do setor pet.

**Questões pendentes:**
- Lista exaustiva de termos proibidos?
- Regras sobre promessas médicas - onde está a linha?
- Compliance score calculation - qual algoritmo?
- Human review triggers - quando obrigar revisão manual?
- Legal disclaimers - texto padrão obrigatório?

**Impacto:**
- **F-6 Geração de Conteúdo** não pode ser implementada corretamente
- **Legal risk** - Conteúdo inadequado pode gerar problemas legais
- **User experience** - Muitas reprovações frustram usuários

**Ação:** 📋 **Product Owner** + 👥 **Legal/Compliance** (se disponível)

---

### 8. Calendar/Editorial UI Library

**Lacuna identificada:** F-5 Calendário Editorial requer componente drag-and-drop mas não especifica biblioteca.

**Questões pendentes:**
- react-big-calendar vs react-calendar vs custom?
- Qual granularidade? (hora, meio-dia, dia completo)
- Multi-timezone support necessário?
- Mobile experience - como adaptar drag-and-drop?
- Integration com scheduling real - como sincronizar?

**Impacto:**
- **M4 Marco** - "Calendário funcional"
- **Developer velocity** - Biblioteca errada = retrabalho
- **User experience** - UX complexa para não-experts

**Ação:** 🛠️ **Tech Lead** + 📋 **Product Owner** (UX requirements)

---

## 🟢 Nice-to-Have (Futuras Fases)

### 9. I18N/L10N Strategy

**Lacuna identificada:** PRD menciona "pt-BR (MVP); EN/ES em backlog" mas não especifica como implementar.

**Questões pendentes:**
- Biblioteca de internalização? (react-i18next, next-intl)
- Onde armazenar traduções? (JSON files, CMS, database)
- Locale detection - browser vs user preference?
- Date/number formatting por locale?
- Right-to-left support futuro?

**Ação:** 🛠️ **Tech Lead** (quando relevante para expansão)

---

### 10. Advanced Analytics & BI

**Lacuna identificada:** F-11 Dashboard menciona "métricas" mas não especifica quais.

**Questões pendentes:**
- Business Intelligence tool integration?
- Custom metrics vs standard social media metrics?
- Data retention policy - quanto tempo manter?
- GDPR/LGPD compliance em analytics?
- Real-time vs batch processing?

**Ação:** 📋 **Product Owner** (quando tiver dados suficientes)

---

### 11. Mobile App Strategy

**Lacuna identificada:** PRD menciona "mobile responsivo" mas não especifica se native app é necessário.

**Questões pendentes:**
- PWA suficiente ou native app necessário?
- Push notifications strategy?
- Offline support requirements?
- App store deployment strategy?

**Ação:** 📋 **Product Owner** (baseado em feedback de usuários)

---

### 12. Security Audit & Penetration Testing

**Lacuna identificada:** PRD lista requirements de segurança mas não menciona auditing process.

**Questões pendentes:**
- Third-party security audit antes do launch?
- Penetration testing scope e frequency?
- Vulnerability disclosure policy?
- SOC compliance requirements?

**Ação:** 🛠️ **Tech Lead** + 📋 **Product Owner** (antes do scale)

---

## 📋 Pós-Definição - Atualizações Necessárias

**Quando um item for resolvido, atualizar:**

### Documentação Técnica
- [ ] **CODE_GUIDELINES.md** - Adicionar seções faltantes
- [ ] **PROJECT_STRUCTURE.md** - Documentação de novos módulos
- [ ] **DESIGN_DECISIONS.md** - Justificar decisões tomadas
- [ ] **TROUBLESHOOTING.md** - Adicionar novos problemas conhecidos

### Especificações de Features
- [ ] **docs/features/FXX_NOME.md** - Completar especificações técnicas
- [ ] **docs/architecture/API_CONTRACTS.md** - Documentação de endpoints
- [ ] **docs/architecture/DATABASE_SCHEMA.md** - Schema changes

### Process Documentation
- [ ] **CONTRIBUTING.md** - Atualizar fluxo conforme decisões
- [ ] **README.md** - Links para novos documentos
- [ ] **TODO.md** - Remover items resolvidos

---

## 🔄 Como Contribuir com este TODO

### ➕ Adicionar Nova Lacuna

**Quando adicionar:**
- Encontrou inconsistência entre PRD e implementação
- Precisa implementar algo mas especificação é vaga
- Decisão técnica impacta múltiplos documentos

**Template:**
```markdown
### N. Título da Lacuna

**Lacuna identificada:** O que não está especificado

**Questões pendentes:**
- Pergunta específica 1?
- Pergunta específica 2?

**Impacto:**
- Que documentos/features são afetados
- Qual o risco de não resolver

**Ação:** 👥 Quem deve decidir
```

### ✅ Resolver Item Existente

**Processo:**
1. **Pesquisar/discutir** solução com equipe
2. **Implementar** mudanças necessárias
3. **Atualizar** documentação afetada
4. **Mover** item para seção "Resolvidos" (criar se necessário)
5. **Mencionar** resolução no PR

### 🔄 Priorizar Items

**Critérios de priorização:**
1. **Bloqueia desenvolvimento atual?** → 🔴 Crítico
2. **Necessário para próxima fase?** → 🟡 Importante  
3. **Melhoria incremental?** → 🟢 Nice-to-have

---

## 📊 Metrics de Sucesso deste TODO

**Objetivos:**
- ✅ **Resolver 80%** dos items críticos antes do fim da Fase 1
- ✅ **Zero items** críticos bloqueando desenvolvimento
- ✅ **100%** das features documentadas completamente
- ✅ **Equipe alinhada** em todas as decisões arquiteturais

**Como medir:**
- Items resolvidos vs items total por categoria
- Frequency de "não sei como implementar isso"
- Time para onboarding de novos desenvolvedores
- Consistência entre documentação e implementação

---

*📚 Esta é a última página da documentação base. Volte ao [README principal](README.md) para navegar por outros documentos.*