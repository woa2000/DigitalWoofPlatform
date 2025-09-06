# 🚀 Execução: Manual de Marca Digital

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Manual_Marca_Digital_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "execute",
  "OUTPUT_DIR": "./_agent_outputs/manual_marca_digital/",
  "AGENT_ROLE": "Frontend_Developer",
  "BRANCH_NAME": "feature/F04-manual-marca-digital",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-4 Manual de Marca Digital
- **Fase:** 1 - Cérebro da Marca
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Frontend_Developer
- **Colaboradores:** Backend_Developer, QA_Engineer
- **Dependências:** Brand_Voice_JSON_Plan.md

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Manual_Marca_Digital_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F04_MANUAL_MARCA_DIGITAL.md
- **Agent Guidelines:** #file:agents/Frontend_Developer.md
- **UI Components:** #file:client/src/components/ui/
- **Dependencies:** Brand Voice JSON APIs

## 🎛️ Parâmetros Específicos

- **Stack Principal:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Data Source:** Brand Voice JSON via APIs
- **Visualization:** Recharts para radar charts
- **PDF Export:** jsPDF + html2canvas
- **Sharing:** URLs públicas + controle de acesso
- **Responsive:** Mobile-first design

## ✅ Critérios de Sucesso

- [ ] Interface navegável com todas as seções do Brand Voice
- [ ] Radar charts para visualização de tom de voz
- [ ] Sistema de export para PDF funcional
- [ ] URLs de compartilhamento públicas
- [ ] Design responsivo e acessível
- [ ] Performance: renderização < 2s
- [ ] Integration completa com Brand Voice APIs

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_manual_marca_digital.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_manual_marca_digital.md --mode execute
```

## 📝 Notas

Este plano depende diretamente do Brand Voice JSON. É a interface visual que apresenta a identidade de marca de forma consumível para humanos. Completa a Fase 1 do projeto.