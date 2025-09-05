# 🚀 Execução: Anamnese Digital

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Anamnese_Digital_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "dry-run",
  "OUTPUT_DIR": "./_agent_outputs/anamnese_digital/",
  "AGENT_ROLE": "Backend_Developer",
  "BRANCH_NAME": "feature/F01-anamnese-digital",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-1 Anamnese Digital
- **Fase:** 1 - Cérebro da Marca
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Backend_Developer
- **Colaboradores:** QA_Engineer, DevOps_Specialist
- **Dependências:** Nenhuma (feature inicial)

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Anamnese_Digital_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F01_ANAMNESE_DIGITAL.md
- **Agent Guidelines:** #file:agents/Backend_Developer.md
- **Database Schema:** #file:shared/schema.ts
- **Project Structure:** #file:docs/PROJECT_STRUCTURE.md

## 🎛️ Parâmetros Específicos

- **Stack Principal:** Node.js + Express + TypeScript + Supabase
- **Database:** PostgreSQL via Drizzle ORM
- **APIs Externas:** Instagram Basic Display API, Facebook Graph API
- **Authentication:** Supabase Auth + JWT
- **Observabilidade:** Structured logging + performance metrics

## ✅ Critérios de Sucesso

- [ ] Database schema implementado e migrated
- [ ] APIs de análise funcionais com mocks
- [ ] Sistema de validação e normalização de URLs
- [ ] Dashboard básico de insights
- [ ] Testes unitários > 80% coverage
- [ ] Performance: análise completa < 30s

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_anamnese_digital.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_anamnese_digital.md --mode execute
```

## 📝 Notas

Este é o primeiro plano da Fase 1 e não possui dependências. É crítico para estabelecer a base de dados e análise automática de presença digital das marcas pet.