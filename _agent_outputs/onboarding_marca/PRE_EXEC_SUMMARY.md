# PRE_EXEC_SUMMARY - Onboarding de Marca

## 📋 Identificação do Plano

- **Título:** Onboarding de Marca - Execution Plan
- **Versão:** 1.0
- **Status:** 📅 Pronto para execução por agente
- **Agente Responsável:** Frontend_Developer
- **Data de Análise:** 5 de setembro de 2025
- **Modo de Execução:** dry-run
- **Branch Target:** feature/F02-onboarding-marca

## 🎯 Escopo em Bullets Operacionais

- **Upload de Logo:** Sistema permite upload de SVG/PNG/JPG (máx 5MB) com validação MIME type, preview em tempo real e antivírus scan obrigatório
- **Extração Automática de Paleta:** Processamento server-side extrai 3-6 cores dominantes da logo usando Sharp.js em < 5s com fallback para paleta padrão
- **Wizard de 5 Steps:** Interface responsiva com navegação linear, progress indicator, state persistence e recovery após reload
- **Configuração de Tom:** 4 sliders de personalidade (confiança, acolhimento, humor, especialização) com exemplos dinâmicos atualizando em tempo real
- **Configuração de Linguagem:** Input de termos preferidos (max 20), evitados (max 15), CTAs padrão (max 5) com validation e autocomplete
- **Valores e Missão:** Configuração opcional de missão (20-200 chars), valores da marca (max 5) e disclaimer compliance obrigatório
- **Preview Final:** Geração de 3 exemplos de conteúdo (educativo, promocional, humanizado) com opção de regenerar
- **Brand Voice JSON:** Artefato final válido conforme schema v1.0 com todos dados coletados do wizard
- **Performance Target:** Wizard completo em < 15min com completion rate > 80% e upload+processing < 30s
- **Mobile-First:** Interface responsiva testada em dispositivos móveis com touch-friendly components
- **State Management:** React Query para server state, localStorage backup, auto-save após cada step
- **Security Compliance:** File validation, antivirus scan, SSRF protection, XSS prevention, rate limiting (10 uploads/min)

## ✅ Critérios de Aceitação Testáveis

1. **Upload de Logo Funcional:** Aceita apenas SVG/PNG/JPG até 5MB, valida MIME type e magic bytes, executa antivírus scan, mostra preview instantâneo
2. **Extração de Paleta Automática:** Extrai 3-6 cores em formato hex válido, processa em < 5s, tem fallback para paleta padrão em caso de falha
3. **Wizard Navigation Completa:** 5 steps navegáveis (Logo → Paleta → Tom → Linguagem → Preview), progress indicator funcional, botões next/previous ativos
4. **Sliders de Tom Responsivos:** 4 sliders com range 0.0-1.0, exemplos de copy atualizando em < 200ms, validação de valores persistidos
5. **Configuração de Linguagem Validada:** Tags input funcionais, validation de limites (20/15/5), no overlap entre preferidos e evitados, autocomplete do setor pet
6. **State Persistence Ativa:** Auto-save após cada step, recovery completa após reload, backup em localStorage se API falha, clear após completion
7. **Brand Voice JSON Válido:** Geração conforme schema v1.0, todos campos obrigatórios preenchidos, validação Zod passando 100%
8. **Performance Within Targets:** Upload+processing < 30s, slider responsiveness < 200ms, wizard completion < 15min média
9. **Mobile Responsiveness:** Interface funcional em viewport móvel, touch interactions, keyboard navigation acessível
10. **Security Controls Active:** File validation stricta, antivirus integration, rate limiting (10/min), input sanitization, XSS prevention
11. **Component Tests 100%:** Todos components testados isoladamente, mock file handling, form validation, error states cobertas
12. **E2E Flow Validated:** Jornada completa testada, mobile responsiveness, file upload real, performance targets validados

## 🔌 Interfaces & Dados (Visão 1 Tela)

### APIs REST
- **POST /api/brand/upload-logo** → multipart upload → {logoUrl, palette, metadata}
- **PUT /api/brand/onboarding** → wizard data → Brand Voice JSON generation

### React Components Tree
```
OnboardingWizard
├── LogoUploadStep (FileUpload component)
├── ToneConfigStep (4 sliders + dynamic examples)
├── LanguageConfigStep (tags input + validation)
├── BrandValuesStep (mission + values + disclaimer)
└── PreviewStep (3 content examples + JSON generation)
```

### Database Schema
```sql
brand_onboarding: {
  id, userId, logoUrl, palette[], toneConfig{}, 
  languageConfig{}, brandValues{}, stepCompleted,
  createdAt, updatedAt, completedAt
}
```

### State Management
- **React Query:** Server state (upload, save, generation)
- **useState:** Local wizard navigation, form inputs
- **localStorage:** Backup persistence, recovery

## 🛠️ Stack & Padrões

### Runtime & Libraries
- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + TypeScript + Sharp.js + Supabase Storage
- **Validation:** Zod schemas client+server, React Hook Form
- **Testing:** Jest + React Testing Library + Playwright/Cypress E2E
- **Image Processing:** Sharp.js server-side, Colorthief para palette extraction

### Padrões de Erro & Log
- **Error Handling:** Try/catch com typed errors, user-friendly messages, retry mechanisms
- **Logging:** Structured events (upload.started, step.completed, wizard.abandoned) com userId, timestamps
- **Monitoring:** Upload success rate, processing time, wizard completion metrics

### Autenticação & Segurança
- **Auth:** JWT token para identificação de usuário
- **File Security:** MIME validation + magic bytes + antivírus scan + size limits
- **Rate Limiting:** 10 uploads por minuto por usuário
- **Input Sanitization:** XSS prevention, SQL injection protection

## 📊 Métricas & SLOs

### Performance SLOs
- **Upload Success Rate:** > 99% para arquivos válidos
- **Processing Time:** < 30s para upload + image processing + palette extraction
- **UI Responsiveness:** < 200ms para slider changes e form interactions
- **Wizard Completion Time:** < 15min média para usuário típico
- **Page Load:** < 3s para carregamento inicial do wizard

### Business Metrics
- **Completion Rate:** > 80% dos usuários que iniciam completam wizard
- **Step Abandonment:** < 20% abandonment em qualquer step individual
- **Mobile Completion:** > 70% completion rate em dispositivos móveis
- **Error Recovery:** > 90% usuários recuperam de erros de upload

### Quality Metrics
- **Test Coverage:** > 90% para components, 100% para critical paths
- **Accessibility:** WCAG 2.1 AA compliance via axe-core
- **Bundle Size:** Impact < 200KB após image processing libraries
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1

## ⚠️ Riscos & Mitigações (Top 5)

### 1. Upload Performance Degradation (Alto/Alto)
- **Risco:** Large files causando timeout ou poor UX
- **Mitigação:** Size limits 5MB, progress feedback, background processing
- **Contingência:** Client-side compression, chunked upload

### 2. Wizard Abandonment Rate (Alto/Médio)
- **Risco:** Complex flow intimidando usuários
- **Mitigação:** Progressive disclosure, clear progress, save/resume
- **Contingência:** Simplified "quick setup" mode

### 3. Mobile UX Issues (Médio/Médio)
- **Risco:** Complex interactions não funcionando em mobile
- **Mitigação:** Mobile-first design, touch-friendly components
- **Contingência:** Dedicated mobile flow ou PWA approach

### 4. Image Processing Security (Alto/Baixo)
- **Risco:** Malicious files bypass validation
- **Mitigação:** Multiple validation layers, antivirus scan, sandboxed processing
- **Contingência:** Quarantine system, immediate blocking

### 5. State Management Complexity (Médio/Médio)
- **Risco:** Wizard state getting out of sync
- **Mitigação:** React Query caching, localStorage backup, validation
- **Contingência:** State reset mechanism, user notification

## 🔗 Dependências & Ordem de Execução

### Dependências Técnicas
- **Database Schema** → Foundation para todas tasks (Database_Admin)
- **Upload Infrastructure** → Required para logo upload (Backend_Developer)
- **Image Processing** → Depends on upload infrastructure (Backend_Developer)
- **Wizard Structure** → Foundation para frontend components (Frontend_Developer)

### Dependências Entre Planos
- **Opcional:** Anamnese_Digital_Plan.md para pre-population de campos
- **Consumidor:** Brand_Voice_JSON_Plan.md usa dados do onboarding
- **Relacionado:** Manual_Marca_Digital_Plan.md usa logo e paleta

### Ordem Sugerida de Execução
1. **Database_Admin:** Implementar schema (T-001)
2. **Backend_Developer:** Upload infrastructure + Image processing (T-002, T-003, T-004)
3. **Frontend_Developer:** Wizard structure + Steps implementation (T-005, T-006, T-007, T-008, T-009)
4. **Frontend_Developer:** Integration + State management (T-010, T-011)
5. **QA_Engineer:** Testing implementation (T-012, T-013)

## 🚫 Gaps/Bloqueios Identificados

### [⚠️ DOCUMENTAÇÃO PENDENTE]
1. **Estratégia de Testes para Upload**
   - **Owner:** QA_Engineer
   - **Next Step:** Definir approach para mock file handling em tests

2. **Image Processing Library Selection**
   - **Owner:** Backend_Developer  
   - **Next Step:** Avaliar Sharp.js vs alternativas (performance, security)

3. **Antivírus Integration Details**
   - **Owner:** DevOps_Specialist
   - **Next Step:** Escolher service/library para virus scanning

### [⚠️ PERGUNTAS ABERTAS]
1. **Mobile PWA Capabilities**
   - **Owner:** Frontend_Developer
   - **Next Step:** Determinar se PWA features necessárias para upload

2. **Palette Quality Metrics**
   - **Owner:** Backend_Developer
   - **Next Step:** Definir como medir e melhorar qualidade das cores extraídas

## 📋 Plano de Execução (5-10 Passos)

### Fase 1: Foundation (Database_Admin + Backend_Developer)
1. **T-001:** Implementar Database Schema para Onboarding
2. **T-002:** Implementar Infrastructure de Upload  
3. **T-003:** Implementar Processamento de Imagem
4. **T-004:** Implementar Extração de Paleta de Cores

### Fase 2: Frontend Core (Frontend_Developer)
5. **T-005:** Criar Wizard Structure e Navigation
6. **T-006:** Implementar Logo Upload Step
7. **T-007:** Implementar Tone Configuration Step
8. **T-008:** Implementar Language Configuration Step
9. **T-009:** Implementar Brand Values Step

### Fase 3: Integration & Finalization
10. **T-010:** Implementar Preview e Brand Voice Generation
11. **T-011:** Implementar State Persistence
12. **T-012:** Implementar Component Testing
13. **T-013:** Implementar E2E Wizard Testing

---

**Total Tasks:** 13  
**Estimated Effort:** 44 story points  
**Critical Path:** Database → Upload → Wizard → Integration → Testing  
**Ready for Execution:** ✅ Todas dependências mapeadas, criterios claros, outputs específicos