# 🚀 Execução: Brand Voice JSON

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Brand_Voice_JSON_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "dry-run",
  "OUTPUT_DIR": "./_agent_outputs/brand_voice_json/",
  "AGENT_ROLE": "Backend_Developer",
  "BRANCH_NAME": "feature/F03-brand-voice-json",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-3 Brand Voice JSON
- **Fase:** 1 - Cérebro da Marca
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Backend_Developer
- **Colaboradores:** Frontend_Developer, QA_Engineer
- **Dependências:** Anamnese_Digital_Plan.md, Onboarding_Marca_Plan.md

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Brand_Voice_JSON_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F03_BRAND_VOICE_JSON.md
- **Agent Guidelines:** #file:agents/Backend_Developer.md
- **Schema Base:** #file:shared/schema.ts
- **Dependencies:** Outputs dos planos Anamnese e Onboarding

## 🎛️ Parâmetros Específicos

- **Stack Principal:** Node.js + TypeScript + Zod + Drizzle ORM
- **Core Artifact:** JSON Schema v1.0 para Brand Voice
- **Data Sources:** Anamnese Digital + Onboarding Manual
- **AI Integration:** OpenAI para análise e geração
- **Validation:** Zod schemas + quality scoring
- **Storage:** Supabase PostgreSQL + versionamento

## ✅ Critérios de Sucesso

- [ ] Schema JSON v1.0 implementado e validado
- [ ] Engine de geração com IA funcionando
- [ ] Sistema de merge de fontes múltiplas
- [ ] Quality scoring automático > 0.8
- [ ] APIs CRUD completas para Brand Voice
- [ ] Versionamento e auditoria implementados
- [ ] Integration testing com dependências

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_brand_voice_json.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_brand_voice_json.md --mode execute
```

## 📝 Notas

Este é o artefato central da Fase 1. Depende dos outputs de Anamnese Digital e Onboarding de Marca. É crítico para todas as features da Fase 2 que dependem de personalização de conteúdo.