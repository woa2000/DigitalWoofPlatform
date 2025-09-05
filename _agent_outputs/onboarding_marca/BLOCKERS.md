# BLOCKERS - Onboarding de Marca

## 📋 Bloqueios Identificados

### [✅ RESOLVIDOS]

#### 1. Estratégia de Testes para Upload de Arquivos
- **Owner:** QA_Engineer ✅
- **Descrição:** Approach específico para testing de file upload definido
- **Decisão:** Pirâmide de testes com RTL + Jest (unidade/integração) + MSW (mock rede) + Playwright (E2E)
- **Implementação:**
  - **Unit/Integration:** Mock de File, FormData, URL.createObjectURL, FileReader
  - **Casos mínimos:** Upload feliz (200), rejeição MIME (415), tamanho (413), antivírus infected (422), drag&drop, cancelamento, timeout/retry
  - **E2E:** Fluxo completo com progress bar, rede lenta, mobile viewport
  - **DoD:** 90% cobertura unit/integration, 2 cenários E2E estáveis no CI
- **Timeline:** ✅ Definido - implementar junto à T-012

#### 2. Seleção de Library para Image Processing
- **Owner:** Backend_Developer ✅
- **Descrição:** Sharp.js validado como escolha principal
- **Decisão:** Sharp (libvips, alto desempenho) + node-vibrant para palette extraction
- **Justificativa:** Jimp é mais lento/consome mais memória em imagens 5MB+
- **POC Requirements:**
  - Redimensionar max(2048), strip metadados, < 300ms para 5MB
  - Checklist segurança: validar MIME antes Sharp, limitar dimensões, remover EXIF/ICC
  - Benchmark: tempo/memória + teste 50 uploads concorrentes
- **Timeline:** ✅ Aprovado - implementar em T-003

#### 3. Processo de Antivírus Scan
- **Owner:** DevOps_Specialist ✅
- **Descrição:** Arquitetura "staging → scan → promote" definida
- **Decisão:** ClamAV automatizado com buckets separados
- **Fluxo:** Upload → staging bucket → ClamAV scan → se clean: promote para safe bucket
- **Implementação:**
  - Presigned URL para uploads-staging/
  - Event-driven scan (webhook + Edge Function)
  - Container/Func com ClamAV + freshclam
  - Status no DB: clean|infected com signature
- **DoD:** POC 1-10MB < 2s, alertas para infected, retenção staging 24-48h
- **Timeline:** ✅ Arquitetura definida - implementar em T-002

### [✅ PERGUNTAS ABERTAS - DECIDIDAS]

#### 4. PWA Capabilities para Upload
- **Owner:** Frontend_Developer ✅
- **Descrição:** PWA/offline não incluído no MVP
- **Decisão:** Focar em upload online com retry + telemetria para avaliar demanda futura
- **Implementação MVP:**
  - Estado de rede (online/offline) visível
  - Retomada automática em refresh (idempotência)
  - Timeouts e reintentos exponenciais
  - Métricas: upload_success_rate, avg_upload_time, fail_reason
- **Revisitar quando:** 5% uploads falhando por rede OU cenário operacional offline claro
- **Timeline:** ✅ Decidido - implementar em T-006

#### 5. Métricas de Qualidade para Palette Extraction
- **Owner:** Backend_Developer ✅
- **Descrição:** Score composto (0-100) com 4 dimensões definido
- **Decisão:** Contraste (40%) + Diversidade (30%) + Luminância (20%) + Saturação (10%)
- **Implementação:**
  - Contraste: WCAG ratio ≥ 4.5:1 para pelo menos 1 cor
  - Diversidade: ΔE00 médio ≥ 15 entre cores (LAB)
  - Luminância: distribuição balanceada de L*
  - Saturação: pelo menos 1 cor com saturação moderada
- **DoD:** Score ≥ 70 em >80% imagens teste, pelo menos 1 cor WCAG compliant
- **Timeline:** ✅ Definido - implementar em T-004

## 🚦 Status de Gates

### ✅ Gates RESOLVIDOS - Ready for Execute Mode:
- ✅ **Antivírus Strategy (Blocker #3)** - ClamAV com staging→scan→promote definido
- ✅ **Image Processing Library (Blocker #2)** - Sharp + node-vibrant validado com POC requirements
- ✅ **Testing Strategy (Blocker #1)** - RTL/Jest + MSW + Playwright com casos definidos
- ✅ **PWA Requirements (Blocker #4)** - MVP sem PWA, telemetria para futuro
- ✅ **Palette Quality Metrics (Blocker #5)** - Score composto com 4 dimensões definido

## 📋 Resumo das Decisões Aprovadas

| Blocker | Decisão | Tecnologia/Approach | Timeline |
|---------|---------|---------------------|----------|
| **#1 Testes Upload** | RTL/Jest + MSW (integração) + Playwright (E2E) | Mock File API + casos definidos | T-012 |
| **#2 Image Processing** | Sharp + node-vibrant + security hardening | libvips performance + palette extraction | T-003 |
| **#3 Antivírus** | ClamAV staging→scan→promote architecture | Event-driven with buckets separation | T-002 |
| **#4 PWA** | MVP sem PWA, telemetria para avaliar demanda | Online-first + retry + metrics | T-006 |
| **#5 Métricas Paleta** | Score composto: Contraste + Diversidade + Lum + Sat | WCAG + ΔE00 + balanceamento | T-004 |

## 📋 Recomendações para Execução

### ✅ DESBLOQUEADO - Ready for Execute Mode:
1. **Todos blockers críticos resolvidos** - arquiteturas definidas
2. **POC requirements claros** - critérios de validação estabelecidos  
3. **DoD estabelecidos** - métricas e acceptance criteria definidos
4. **Tech stack validado** - Sharp, ClamAV, RTL/Jest confirmados

### Próximos Passos Imediatos:
1. **Atualizar progress.json** - marcar blocks como resolved
2. **Executar com --mode execute** - iniciar implementação
3. **Seguir ordem de dependências** - T-001 → T-002 → T-003 → T-005 → T-006...

### Validações Durante Execução:
- **T-002:** Validar ClamAV POC com tempo < 2s para 1-10MB
- **T-003:** Benchmark Sharp com 50 uploads concorrentes
- **T-004:** Validar score ≥ 70 em 80%+ das imagens teste  
- **T-012:** Implementar 90% cobertura + 2 cenários E2E estáveis

---

**Status:** ✅ TODOS BLOCKERS RESOLVIDOS - Arquiteturas e decisões técnicas definidas  
**Ready for Execute Mode:** ✅ SIM - Pode proceder com implementação  
**Recommended Action:** Execute com --mode execute seguindo ordem T-001 → T-002 → T-003...

## 🎯 Artefatos de Decisão

### Código de Exemplo - Testing Strategy (RTL + MSW)
```typescript
// upload.test.tsx
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../test/msw/server';
import { rest } from 'msw';
import Upload from '../Upload';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mocks de browser
Object.defineProperty(global.URL, 'createObjectURL', { value: jest.fn(()=>'blob:preview') });

test('faz upload e mostra sucesso', async () => {
  server.use(
    rest.post('/api/upload', async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ id: 'file_123', av: 'clean' }));
    })
  );

  render(<Upload />);
  const file = new File([new Uint8Array([1,2,3])], 'foto.jpg', { type: 'image/jpeg' });
  await userEvent.upload(screen.getByLabelText(/selecione o arquivo/i), file);

  await waitFor(() => expect(screen.getByText(/upload concluído/i)).toBeInTheDocument());
});
```

### Código de Exemplo - Image Processing (Sharp + Vibrant)
```typescript
import sharp from 'sharp';
import Vibrant from 'node-vibrant';

export async function processImage(buf: Buffer) {
  const out = await sharp(buf)
    .rotate()                     // auto-orient
    .resize({ width: 2048, withoutEnlargement: true })
    .toFormat('webp', { quality: 82 })
    .withMetadata({ exif: false, icc: false })
    .toBuffer();

  const small = await sharp(out).resize(256).toFormat('jpeg', { quality: 80 }).toBuffer();
  const palette = await Vibrant.from(small).getPalette(); // cores dominantes
  return { out, palette };
}
```

### Pseudocódigo - Palette Quality Score
```typescript
import { wcagContrast, deltaE00, toLab } from 'culori';

function paletteScore(colors: string[]) {
  const lab = colors.map(c => toLab(c));
  const pairs = allPairs(lab);
  const dE = pairs.map(([a,b]) => deltaE00(a,b));
  const diversity = clamp(avg(dE) / 30, 0, 1); // ~30 é ótimo

  const contrastCandidates = colors.map(c => Math.max(
    wcagContrast(c, '#000'), wcagContrast(c, '#fff')
  ));
  const contrastOk = contrastCandidates.some(cr => cr >= 4.5) ? 1 : 0.6;
  const contrast = clamp(avg(contrastCandidates) / 7, 0, 1); // 7 ~= AAA

  const luminances = lab.map(l => l.l);
  const lumSpread = (max(luminances) - min(luminances)) / 100; // 0..1

  const sat = estimateSaturation(colors); // 0..1

  const score =
    0.40*contrast +
    0.30*diversity +
    0.20*lumSpread +
    0.10*sat;

  return Math.round(score*100);
}
```