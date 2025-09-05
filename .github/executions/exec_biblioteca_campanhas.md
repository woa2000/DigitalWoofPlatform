# 🚀 Execução: Biblioteca de Campanhas

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Biblioteca_Campanhas_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "dry-run",
  "OUTPUT_DIR": "./_agent_outputs/biblioteca_campanhas/",
  "AGENT_ROLE": "Backend_Developer",
  "BRANCH_NAME": "feature/F05-biblioteca-campanhas",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-5 Biblioteca de Campanhas
- **Fase:** 2 - Fábrica de Conteúdo
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Backend_Developer
- **Colaboradores:** Frontend_Developer, QA_Engineer
- **Dependências:** Brand_Voice_JSON_Plan.md, Manual_Marca_Digital_Plan.md

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Biblioteca_Campanhas_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F05_BIBLIOTECA_CAMPANHAS.md
- **Agent Guidelines:** #file:agents/Backend_Developer.md
- **Dependencies:** Brand Voice JSON APIs e Manual de Marca

## 🎛️ Parâmetros Específicos

- **Stack Principal:** Node.js + TypeScript + PostgreSQL + Drizzle ORM
- **Content Library:** 50+ templates específicos para setor pet
- **Personalization:** Engine baseada em Brand Voice JSON
- **Performance Tracking:** Métricas de engagement por template
- **Visual Assets:** Biblioteca de 500+ assets pet-friendly
- **Search & Discovery:** Filtros avançados e busca semântica

## ✅ Critérios de Sucesso

- [ ] Catálogo com 50+ templates de alta performance
- [ ] Engine de personalização baseada em Brand Voice
- [ ] Sistema de performance tracking funcionando
- [ ] Interface de discovery com filtros avançados
- [ ] Biblioteca de assets visuais implementada
- [ ] APIs completas para frontend consumption
- [ ] Template personalization < 5s por template

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_biblioteca_campanhas.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_biblioteca_campanhas.md --mode execute
```

## 📝 Notas

Primeiro plano da Fase 2. Depende do Brand Voice JSON para personalização de templates. Base crítica para as features de geração de conteúdo e calendário editorial.