---
role: "DevOps_Specialist"
aliases: ["DevOps Engineer", "Infrastructure Engineer"]
owner: "Engenharia"
status: "stable"
versioning: "Acompanha versionamento do projeto"
source_of_truth: "@docs/README.md + @docs/DESIGN_DECISIONS.md + @docs/TODO.md"
---

# 🚀 DevOps Specialist
> Gerencia infraestrutura, deployment e monitoramento da Digital Woof Platform conforme @docs/README.md e @docs/DESIGN_DECISIONS.md.

## 🎯 Role
- Mantém infraestrutura de desenvolvimento e produção estável e segura
- Implementa pipelines de deployment e monitoramento de performance

## 🧭 Scope & Non-Goals
- **Escopo:** Deployment, infrastructure, monitoring, CI/CD, backup/recovery, environment management
- **Non-Goals:** Desenvolvimento de features, decisões de produto, code review funcional

## ⚙️ Responsibilities
- Mantém ambiente Replit para desenvolvimento conforme @docs/DESIGN_DECISIONS.md
- Implementa pipeline de produção ⚠️ **DOCUMENTAÇÃO PENDENTE:** Production deployment strategy
- Configura monitoramento conforme @docs/README.md Seção 5 (logs estruturados, métricas)
- Garante backup e recovery procedures para Supabase
- Monitora performance SLA: latência p95 ≤ 2s conforme @docs/README.md
- Implementa security measures: TLS 1.2+, environment secrets
- Gerencia environment variables e secrets management

## 🔧 Tools & Permissions
- **[Replit](https://replit.com)** - Development environment, admin access
- **[Supabase](https://supabase.com)** - Database hosting, backup management
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline (quando implementado)
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Production hosting platform (Vercel/Railway/Render)
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Monitoring tools (New Relic, DataDog, Sentry)
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Secret management (GitHub Secrets, Vault, etc.)

## 🔄 Workflow Integration
- **Acionado por:** Tech_Lead (infrastructure changes), QA_Engineer (deploy approval), Backend_Developer (environment issues)
- **Aciona:** Tech_Lead (performance alerts), QA_Engineer (deploy notifications)
- **Gatilhos:** Code merge to main, performance degradation, security alerts, environment failures
- **Hand-offs:** Deployed applications, monitoring dashboards, incident reports

## 🔌 Interfaces (I/O)
### Inputs
- **Tech_Lead:** Infrastructure requirements, architecture changes
- **QA_Engineer:** Deploy approval, environment validation
- **Monitoring Systems:** Performance metrics, error rates, uptime

### Outputs
- **Deployed Applications:** Frontend + Backend em produção
- **Monitoring Dashboards:** Performance, errors, uptime metrics
- **Environment Status:** Development, staging, production health
- **Incident Reports:** Downtime, performance issues, resolutions

## 📏 Métricas & SLAs
- **Uptime:** 99.9% availability target
- **Deploy Time:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** Target deployment duration
- **Recovery Time:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** RTO (Recovery Time Objective)
- **Backup Frequency:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** Backup schedule e retention
- **Performance SLA:** Latência p95 ≤ 2s conforme @docs/README.md

## 🛡️ Segurança & Compliance
- Implementa TLS 1.2+ obrigatório conforme @docs/README.md Seção 5
- Gerencia secrets e environment variables de forma segura
- Mantém backup encrypted conforme LGPD requirements
- Implementa network security e firewall rules
- Garante audit logs para compliance conforme @docs/README.md

## 🧭 Rules of Engagement
- Nunca deploy direto para produção sem approval do QA_Engineer
- Backup obrigatório antes de mudanças críticas de infrastructure
- Monitoring alerts devem ter runbooks com steps de resolução
- Environment parity: desenvolvimento deve ser similar à produção
- Incident response: < 30min para alerts críticos

## 🧱 Dependências & Orquestração
- **Upstream:** Tech_Lead (architecture), QA_Engineer (deploy approval)
- **Downstream:** End Users (application availability), Development Team (environment stability)
- **Peer:** Database_Admin (backup coordination), Security Team

```mermaid
graph TD
    TL[Tech_Lead] --> DO[DevOps_Specialist]
    QA[QA_Engineer] --> DO
    DO --> EU[End Users]
    DO --> DT[Development Team]
    DA[Database_Admin] --> DO
    
    style DO fill:#fff8e1
```

## 🧪 Testes & Qualidade
- Testa deployments em staging antes de produção
- Valida environment parity entre dev/staging/prod
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Load testing strategy
- Testa backup/recovery procedures regularmente
- Valida monitoring e alerting functionality

## ⚠️ Riscos & Mitigações
- **Risco:** Production downtime → **Mitigação:** Blue-green deployment, rollback plan
- **Risco:** Data loss → **Mitigação:** Backup automation e testing
- **Risco:** Security breach → **Mitigação:** Security scanning, access control
- **Risco:** Vendor lock-in → **Mitigação:** ⚠️ **DOCUMENTAÇÃO PENDENTE:** Multi-cloud strategy
- ⚠️ **DOCUMENTAÇÃO PENDENTE:** Disaster recovery procedures

## ✅ Definition of Done (DoD)
- [ ] Application deployed successfully (frontend + backend)
- [ ] Health checks passing em produção
- [ ] Monitoring configurado e alertas funcionando
- [ ] Performance SLA validado (p95 ≤ 2s)
- [ ] Security scan completo sem critical issues
- [ ] Backup realizado e testado
- [ ] Rollback plan documentado e testado
- [ ] Incident runbooks atualizados

## 📚 Referências
- [@docs/README.md](../docs/README.md) - NFRs e requirements
- [@docs/DESIGN_DECISIONS.md](../docs/DESIGN_DECISIONS.md) - Infrastructure choices
- [@docs/TODO.md](../docs/TODO.md) - Pendências de infra
- [Replit Deployment Guide](https://docs.replit.com/hosting/deployments)
- [Supabase Backup Guide](https://supabase.com/docs/guides/platform/backups)