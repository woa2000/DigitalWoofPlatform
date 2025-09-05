# 🚀 Execução: Onboarding de Marca

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Onboarding_Marca_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "dry-run",
  "OUTPUT_DIR": "./_agent_outputs/onboarding_marca/",
  "AGENT_ROLE": "Frontend_Developer",
  "BRANCH_NAME": "feature/F02-onboarding-marca",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-2 Onboarding de Marca
- **Fase:** 1 - Cérebro da Marca
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Frontend_Developer
- **Colaboradores:** Backend_Developer, QA_Engineer
- **Dependências:** Opcional - Anamnese_Digital_Plan.md (para pré-preenchimento)

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Onboarding_Marca_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F02_ONBOARDING_MARCA.md
- **Agent Guidelines:** #file:agents/Frontend_Developer.md
- **UI Components:** #file:client/src/components/ui/
- **Design System:** #file:components.json

## 🎛️ Parâmetros Específicos

- **Stack Principal:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **File Handling:** Upload de logo + extração de paleta de cores
- **Form Management:** React Hook Form + Zod validation
- **State Management:** React Query + Zustand
- **Integration:** APIs do Backend_Developer (Anamnese Digital)

## ✅ Critérios de Sucesso

- [ ] Wizard de 4 steps implementado e funcional
- [ ] Upload de logo com preview e validação
- [ ] Extração automática de paleta de cores
- [ ] Configuração de tom de voz via sliders
- [ ] Integração opcional com dados da Anamnese
- [ ] Interface responsiva e acessível
- [ ] Validação robusta em todos os steps

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_onboarding_marca.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_onboarding_marca.md --mode execute
```

## 📝 Notas

Este plano pode ser executado em paralelo com Anamnese Digital, mas se beneficia dos dados de análise para pré-preenchimento. É a interface principal para configuração inicial da identidade de marca.