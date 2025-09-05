# 🚀 Execução: Geração de Conteúdo IA

Execute #file:executar_plan.prompt.md com os seguintes parâmetros:

## 📋 Configuração de Execução

```json
{
  "PLAN_PATH": "plans/Geracao_Conteudo_IA_Plan.md",
  "REPO_ROOT": ".",
  "RUN_MODE": "dry-run",
  "OUTPUT_DIR": "./_agent_outputs/geracao_conteudo_ia/",
  "AGENT_ROLE": "Backend_Developer",
  "BRANCH_NAME": "feature/F06-geracao-conteudo-ia",
  "TIMEBOX_MIN": 20
}
```

## 🎯 Contexto do Plano

- **Feature:** F-6 Geração de Conteúdo IA
- **Fase:** 2 - Fábrica de Conteúdo
- **Prioridade:** P0 (Crítico)
- **Agente Principal:** Backend_Developer
- **Colaboradores:** Frontend_Developer, QA_Engineer
- **Dependências:** Brand_Voice_JSON_Plan.md, Biblioteca_Campanhas_Plan.md

## 📊 Inputs de Contexto

- **Plano Principal:** #file:plans/Geracao_Conteudo_IA_Plan.md
- **Documentação Base:** #file:docs/README.md
- **Feature Spec:** #file:docs/features/F06_GERACAO_CONTEUDO_IA.md
- **Agent Guidelines:** #file:agents/Backend_Developer.md
- **Dependencies:** Brand Voice APIs + Campaign Templates

## 🎛️ Parâmetros Específicos

- **Stack Principal:** Node.js + TypeScript + OpenAI GPT-4
- **AI Integration:** Prompts especializados para setor pet
- **Compliance:** Automated health claims checking
- **Content Types:** 5 tipos (educativo, promocional, recall, engajamento, awareness)
- **Approval Flow:** Interface de review e regeneração
- **Cost Control:** Budget tracking e rate limiting

## ✅ Critérios de Sucesso

- [ ] ≥ 50% taxa de aprovação sem edição
- [ ] Tempo de geração < 30s para 3 variações
- [ ] 100% de conteúdo usando Brand Voice JSON
- [ ] Zero claims de saúde animal não aprovados
- [ ] Interface de aprovação/edição funcional
- [ ] Sistema de feedback para melhoria da IA
- [ ] Cost monitoring e budget controls ativos

## 🎯 Comando de Execução

```bash
# Para dry-run (recomendado primeiro)
npx ai-agent execute --config .github/executions/exec_geracao_conteudo_ia.md

# Para execução completa
npx ai-agent execute --config .github/executions/exec_geracao_conteudo_ia.md --mode execute
```

## 📝 Notas

Engine core da Fase 2. Depende de Brand Voice para personalização e pode integrar com templates da Biblioteca de Campanhas. Crítico para automação de criação de conteúdo.