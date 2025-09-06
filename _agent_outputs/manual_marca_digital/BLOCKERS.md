# BLOCKERS — Manual de Marca Digital

**Status:** ✅ 5 bloqueios RESOLVIDOS  
**Impact:** Nenhum - todas as decisões foram tomadas  
**Update:** 6 de setembro de 2025

---

## ✅ Bloqueios Resolvidos

### 1. **PDF Generation Tool Selection** ✅
- **Tag:** [✅ RESOLVIDO]
- **Impact:** Alto (T-009 Export System)
- **Owner:** Frontend_Developer + Backend_Developer
- **Decision:** Puppeteer para MVP com fallback jsPDF para export simples
- **Rationale:** Melhor render de CSS/Fonts/@page/SVG, charts por canvas funcionam bem via headless Chromium
- **Implementation:** 
  - A4/Letter, margens via @page, paginação com cabeçalho/rodapé
  - PDF até 15 páginas em < 10s e < 512MB RAM por job
  - Suporte fontes custom (WOFF2) + imagens (webp/png/svg)
  - Endpoint idempotente com timeout e fila

**Code snippet:**
```typescript
import puppeteer from 'puppeteer';

export async function exportPdf(html: string) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
    preferCSSPageSize: true,
  });

  await browser.close();
  return pdf;
}
```

---

### 2. **Visual Testing Strategy** ✅
- **Tag:** [✅ RESOLVIDO]  
- **Impact:** Médio (T-014 Component Testing)
- **Owner:** QA_Engineer
- **Decision:** Playwright screenshot testing + pixelmatch/odiff com baselines versionadas
- **Rationale:** Git LFS para baselines, masking de áreas dinâmicas, workflow de aprovação
- **Implementation:**
  - Baselines por componente/estado/breakpoint (sm, md, lg)
  - Tolerância Δ ≤ 0.1% pixels (0.2% para charts animados)
  - Workflow aprovação diffs no PR (label visual-change)
  - Máscaras para timestamps e avatares

**Code snippet:**
```typescript
import { test, expect } from '@playwright/test';

test('palette card visual', async ({ page }) => {
  await page.goto('/storybook/iframe.html?id=palette--default');
  const shot = await page.screenshot({ mask: [page.locator('.timestamp')] });
  expect(shot).toMatchSnapshot({ maxDiffPixelRatio: 0.001 });
});
```

---

### 3. **Mobile Touch Gestures Specification** ✅
- **Tag:** [✅ RESOLVIDO]
- **Impact:** Médio (T-012 Mobile Responsiveness)
- **Owner:** Frontend_Developer
- **Decision:** @use-gesture/react + Framer Motion para gestos nativos
- **Rationale:** Horizontal = navegar seções, vertical = scroll, pinch = zoom, double-tap = reset
- **Implementation:**
  - Alvos toque mínimos 44×44 (iOS) / 48×48 (Android)
  - Threshold swipe: ≥ 48px e velocidade ≥ 0.2
  - Acessibilidade: botões "Anterior/Próxima" espelhando gestos
  - Estado "zoomed" persistente por gráfico + reset visível

**Code snippet:**
```typescript
import { useGesture } from '@use-gesture/react';
import { useState } from 'react';

export function ChartZoom({ children }) {
  const [scale, setScale] = useState(1);
  const bind = useGesture({
    onPinch: ({ offset: [d] }) => setScale(() => Math.min(3, Math.max(1, 1 + d/200))),
    onDoubleClick: () => setScale(1),
  });
  return <div {...bind()} style={{ touchAction:'none', transform:`scale(${scale})`, transformOrigin:'center' }}>{children}</div>;
}
```

---

### 4. **Cache Strategy Implementation** ✅
- **Tag:** [✅ RESOLVIDO]
- **Impact:** Alto (T-011 Cache Optimization)  
- **Owner:** Backend_Developer + Tech_Lead
- **Decision:** Abstração cache com LRU in-memory (MVP) + Redis plugável (Fase 2)
- **Rationale:** TTL 15min, stale-while-revalidate, interface única com métricas
- **Implementation:**
  - Interface CacheProvider com hit/miss/hitRate
  - Invalidação por chave ao atualizar Manual/Seção
  - Meta hit rate > 90% em produção
  - Switch por env (CACHE_PROVIDER=memory|redis)

**Code snippet:**
```typescript
export interface CacheProvider {
  get<T>(k: string): Promise<T|null>;
  set<T>(k: string, v: T, ttlSec: number): Promise<void>;
  del(k: string): Promise<void>;
}

import LRU from 'lru-cache';
export function makeMemoryCache(): CacheProvider {
  const lru = new LRU<string, any>({ max: 5_000, ttl: 15*60*1000 });
  return {
    async get(k){ return lru.get(k) ?? null; },
    async set(k,v,ttl){ lru.set(k, v, { ttl: ttl*1000 }); },
    async del(k){ lru.delete(k); },
  };
}
```

---

### 5. **Embed Security Domain Policy** ✅
- **Tag:** [✅ RESOLVIDO]
- **Impact:** Médio (T-010 Sharing System)
- **Owner:** Backend_Developer + Tech_Lead
- **Decision:** Restritivo inicial: *.digitalwoof.com + allowlist com verificação DNS TXT
- **Rationale:** Segurança primeiro, processo verificação para domínios clientes
- **Implementation:**
  - CSP com frame-ancestors 'self' https://*.digitalwoof.com
  - Endpoint request + validação domínio (DNS TXT woof-embed=...)
  - Permissions-Policy mínimo e X-Frame-Options legado
  - Log/audit concessões com expiração

**Code snippet:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
export function middleware(req: Request) {
  const res = NextResponse.next();
  res.headers.set('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self' https://*.digitalwoof.com");
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN'); // legado
  return res;
}
```

---

## 🚀 Execução Desbloqueada

### ✅ Todas as Decisões Tomadas
**Status:** Pode iniciar execução completa de todas as 15 tarefas

### Próximos Passos Imediatos
1. **T-001** (Manual Data Model) - ✅ Pronto para start
2. **T-002** (Navigation Component) - ✅ Pronto para start  
3. **T-009** (Export System) - ✅ Implementar com Puppeteer
4. **T-010** (Sharing System) - ✅ Implementar CSP restritivo
5. **T-011** (Cache Optimization) - ✅ Implementar LRU in-memory
6. **T-012** (Mobile Responsiveness) - ✅ Implementar gestos @use-gesture
7. **T-014** (Component Testing) - ✅ Setup Playwright visual testing

### Critical Path Liberado
**T-001 → T-002 → T-003 → ... → T-015** - Todas dependências resolvidas

---

## 🎯 Implementation Guidelines

### PDF Generation (T-009)
- **Start:** Implement Puppeteer service with basic A4 export
- **Priority:** High - required for export functionality
- **Testing:** Validate < 10s generation time, < 512MB memory

### Visual Testing (T-014)
- **Start:** Setup Playwright with screenshot comparison
- **Priority:** Medium - can parallelize with other tasks
- **Testing:** Create baseline images for key components

### Mobile Gestures (T-012)
- **Start:** Implement @use-gesture/react integration
- **Priority:** Medium - mobile experience enhancement
- **Testing:** Validate touch targets and gesture thresholds

---

## 📋 Decision Template

Para cada blocking decision, use o template:

```markdown
## Decision: [Title]
**Date:** [YYYY-MM-DD]
**Decided by:** [Role/Name]
**Context:** [Brief context]
**Options Considered:** [List]
**Decision:** [Chosen option]
**Rationale:** [Why this choice]
**Implementation:** [Next steps]
**Review Date:** [When to revisit]
```

---

## 🔄 Update Protocol

1. **Daily standup:** Review blocking status
2. **Decision made:** Update este file + notify affected tasks
3. **New blocker identified:** Add to this file + update progress.json
4. **Blocker resolved:** Move para resolved section

---

**Próxima review:** N/A - Todas decisões tomadas  
**Status geral:** 🚀 PRONTO PARA EXECUÇÃO COMPLETA

---

## 📊 Summary
- **5/5 Decisions Made:** ✅ Complete
- **0 Blockers Remaining:** ✅ Clear path
- **15 Tasks Ready:** ✅ Can start any task
- **Dependencies Resolved:** ✅ Critical path open

**→ Ready to run:** `--mode execute`