# TODO — Onboarding de Marca

## Legenda
- [ ] todo • [~] in_progress • [/] review • [x] done • [!] blocked • [>] deferred

## Backlog

### Foundation & Setup
- [ ] T-001 — Implementar Database Schema para Onboarding (owner: Database_Admin)
  - deps: —
  - aceitação: schema valida com drizzle-kit; JSONB fields funcionando; unique constraint por userId; migration executa sem conflitos
  - effort: 2 SP

- [ ] T-002 — Implementar Infrastructure de Upload (owner: Backend_Developer)
  - deps: T-001
  - aceitação: aceita SVG/PNG/JPG até 5MB; validação MIME type stricta; antivírus scan integrado; storage seguro no Supabase; error handling completo
  - effort: 4 SP

- [ ] T-003 — Implementar Processamento de Imagem (owner: Backend_Developer)
  - deps: T-002
  - aceitação: compressão quality=80; redimensionamento se > 2000px; detecção transparência; processing time < 30s para 5MB
  - effort: 3 SP

- [ ] T-004 — Implementar Extração de Paleta de Cores (owner: Backend_Developer)
  - deps: T-003
  - aceitação: extrai 3-6 cores dominantes; cores em hex válido; fallback para paleta padrão; processing time < 5s
  - effort: 3 SP

### Frontend Core
- [ ] T-005 — Criar Wizard Structure e Navigation (owner: Frontend_Developer)
  - deps: T-001
  - aceitação: 5 steps com progress indicator; navegação next/previous; progress persistence localStorage; loading states; responsive design
  - effort: 4 SP

- [ ] T-006 — Implementar Logo Upload Step (owner: Frontend_Developer)
  - deps: T-002, T-005
  - aceitação: drag & drop e click upload; preview instantâneo; progress bar; validation feedback; error messages claras
  - effort: 4 SP

- [ ] T-007 — Implementar Tone Configuration Step (owner: Frontend_Developer)
  - deps: T-005
  - aceitação: 4 sliders (confiança, acolhimento, humor, especialização); exemplos dinâmicos tempo real; labels descritivos; valores persistidos
  - effort: 5 SP

- [ ] T-008 — Implementar Language Configuration Step (owner: Frontend_Developer)
  - deps: T-005
  - aceitação: tags input add/remove; validation max 20/15/5; no overlap preferidos/evitados; autocomplete setor pet
  - effort: 4 SP

- [ ] T-009 — Implementar Brand Values Step (owner: Frontend_Developer)
  - deps: T-005
  - aceitação: mission field 20-200 chars opcional; values list max 5; pre-selected pet values; disclaimer compliance validation
  - effort: 3 SP

### Integration & Flow
- [ ] T-010 — Implementar Preview e Brand Voice Generation (owner: Frontend_Developer)
  - deps: T-006, T-007, T-008, T-009
  - aceitação: preview visual da marca; 3 exemplos conteúdo (educativo, promocional, humanizado); botão regenerar; Brand Voice JSON válido
  - effort: 4 SP

- [ ] T-011 — Implementar State Persistence (owner: Frontend_Developer)
  - deps: T-010
  - aceitação: auto-save após step completion; recovery após refresh; backup localStorage se API falha; clear state após completion
  - effort: 3 SP

### Testing & Quality
- [ ] T-012 — Implementar Component Testing (owner: QA_Engineer)
  - deps: T-006, T-007, T-008, T-009, T-010
  - aceitação: cada step testado isoladamente; upload mock file handling; form validation testada; navigation flow; error states
  - effort: 4 SP

- [ ] T-013 — Implementar E2E Wizard Testing (owner: QA_Engineer)
  - deps: T-011
  - aceitação: fluxo completo upload→config→preview→generation; mobile responsiveness; arquivos reais; performance targets validados
  - effort: 3 SP

## Em Execução
_(nenhuma task iniciada - modo dry-run)_

## Em Review
_(nenhuma task em review - modo dry-run)_

## Concluídas
_(nenhuma task concluída - modo dry-run)_

---

**Total Tasks:** 13  
**Total Effort:** 44 Story Points  
**Critical Path:** T-001 → T-002 → T-003 → T-004 (Backend) || T-005 → T-006...T-009 → T-010 → T-011 (Frontend) → T-012 → T-013 (QA)  
**Ready for Execution:** ✅ Todas tasks têm deps claras, critérios testáveis e outputs específicos