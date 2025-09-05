# 🚀 Execução: Calendário Editorial

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Calendario_Editorial_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "dry-run",
  "OUTPUT_DIR": "./_agent_outputs/calendario_editorial/",
  "AGENT_ROLE": "Frontend_Developer",
  "BRANCH_NAME": "feature/F07-calendario-editorial",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-7 Calendário Editorial
- **Fase:** 2 - Fábrica de Conteúdo
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Frontend_Developer
- **Colaboradores:** Backend_Developer, QA_Engineer
- **Dependências:** Geracao_Conteudo_IA_Plan.md, Biblioteca_Campanhas_Plan.md

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Calendario_Editorial_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F07_CALENDARIO_EDITORIAL.md
- **Agent Guidelines:** #file:agents/Frontend_Developer.md
- **Dependencies:** Content Generation APIs + Campaign Templates

## 🎛️ Parâmetros Específicos

- **Stack Principal:** React 18 + TypeScript + React Beautiful DnD
- **Calendar Library:** React Big Calendar ou FullCalendar
- **Intelligent Suggestions:** Sazonalidades pet + performance histórica
- **Drag-and-Drop:** Reorganização fluida de conteúdo
- **Views:** Semana, mês, quarter
- **Real-time:** WebSocket para colaboração

## ✅ Critérios de Sucesso

- [ ] Criar 2 semanas de pauta em ≤ 5 minutos
- [ ] Calendar load time < 2s para mês completo
- [ ] Drag operations < 100ms de latência
- [ ] 100% dos posts alinhados com sazonalidades pet
- [ ] Interface responsiva para desktop e tablet
- [ ] Integration completa com geração de conteúdo
- [ ] Performance com 500+ calendar items

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_calendario_editorial.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_calendario_editorial.md --mode execute
```

## 📝 Notas

Último plano da Fase 2. Integra todas as capacidades anteriores em uma interface de planejamento intuitiva. Completa o ciclo de criação automatizada de estratégias editoriais.