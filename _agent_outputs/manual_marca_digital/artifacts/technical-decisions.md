# Technical Decisions — Manual de Marca Digital

**Decision Status:** ✅ All 5 blocking decisions resolved  
**Date:** 6 de setembro de 2025  
**Ready for:** Full execution mode

---

## 🔧 Decision #1: PDF Generation Tool

**Decision:** Puppeteer for MVP with jsPDF fallback  
**Owner:** Frontend_Developer + Backend_Developer  
**Impact:** High (T-009 Export System)

### Implementation Details
- **Primary:** Puppeteer for high-fidelity PDF generation
- **Fallback:** jsPDF for simple exports when Puppeteer unavailable
- **Target:** A4/Letter, < 10s generation, < 512MB RAM per job

### Code Implementation
```typescript
// services/pdf-generator.service.ts
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

### CSS Print Styles
```css
@page { 
  size: A4; 
  margin: 16mm 14mm; 
}

@media print {
  .page-break { 
    break-after: page; 
  }
  header, footer { 
    position: running(header/footer); 
  }
}
```

### Acceptance Criteria
- ✅ A4 e Letter formats com margens via @page
- ✅ Paginação com cabeçalho/rodapé
- ✅ PDF até 15 páginas em < 10s
- ✅ < 512MB RAM por job
- ✅ Suporte fontes custom (WOFF2)
- ✅ Imagens (webp/png/svg)
- ✅ Endpoint idempotente com timeout e fila

---

## 🧪 Decision #2: Visual Testing Strategy

**Decision:** Playwright screenshot testing + pixelmatch  
**Owner:** QA_Engineer  
**Impact:** Medium (T-014 Component Testing)

### Implementation Details
- **Tool:** Playwright with visual comparison
- **Diff Engine:** pixelmatch/odiff for pixel comparison
- **Storage:** Git LFS for baseline images
- **Workflow:** PR approval for visual changes

### Code Implementation
```typescript
// tests/visual/palette.spec.ts
import { test, expect } from '@playwright/test';

test('palette card visual', async ({ page }) => {
  await page.goto('/storybook/iframe.html?id=palette--default');
  const shot = await page.screenshot({ 
    mask: [page.locator('.timestamp')] 
  });
  expect(shot).toMatchSnapshot({ 
    maxDiffPixelRatio: 0.001 
  });
});
```

### Configuration
```json
// playwright.config.ts
{
  "projects": [
    {
      "name": "visual-desktop",
      "use": { 
        "viewport": { "width": 1280, "height": 720 }
      }
    },
    {
      "name": "visual-mobile", 
      "use": {
        "viewport": { "width": 375, "height": 667 }
      }
    }
  ]
}
```

### Acceptance Criteria
- ✅ Baselines por componente/estado/breakpoint (sm, md, lg)
- ✅ Tolerância Δ ≤ 0.1% pixels (0.2% para charts animados)
- ✅ Workflow aprovação diffs no PR (label visual-change)
- ✅ Máscaras para timestamps e avatares

---

## 📱 Decision #3: Mobile Touch Gestures

**Decision:** @use-gesture/react + Framer Motion  
**Owner:** Frontend_Developer  
**Impact:** Medium (T-012 Mobile Responsiveness)

### Gesture Mapping
- **Horizontal swipe:** Navigate between sections
- **Vertical scroll:** Native scrolling behavior  
- **Pinch:** Zoom charts/graphics
- **Double-tap:** Reset zoom to original size

### Code Implementation
```typescript
// components/ui/ChartZoom.tsx
import { useGesture } from '@use-gesture/react';
import { useState } from 'react';

export function ChartZoom({ children }) {
  const [scale, setScale] = useState(1);
  const bind = useGesture({
    onPinch: ({ offset: [d] }) => 
      setScale(() => Math.min(3, Math.max(1, 1 + d/200))),
    onDoubleClick: () => setScale(1),
  });
  
  return (
    <div 
      {...bind()} 
      style={{ 
        touchAction: 'none', 
        transform: `scale(${scale})`, 
        transformOrigin: 'center' 
      }}
    >
      {children}
    </div>
  );
}
```

### Touch Targets
```css
/* Touch target minimum sizes */
.touch-target {
  min-width: 44px; /* iOS guideline */
  min-height: 44px;
}

.touch-target-android {
  min-width: 48px; /* Android guideline */
  min-height: 48px;
}
```

### Acceptance Criteria
- ✅ Alvos toque mínimos 44×44 (iOS) / 48×48 (Android)
- ✅ Threshold swipe: ≥ 48px e velocidade ≥ 0.2
- ✅ Acessibilidade: botões "Anterior/Próxima" espelhando gestos
- ✅ Estado "zoomed" persistente por gráfico + reset visível

---

## 🗄️ Decision #4: Cache Strategy

**Decision:** LRU in-memory (MVP) + Redis pluggable (Fase 2)  
**Owner:** Backend_Developer + Tech_Lead  
**Impact:** High (T-011 Cache Optimization)

### Architecture
- **Abstraction:** CacheProvider interface for swappable implementations
- **MVP:** LRU in-memory cache with TTL
- **Scale:** Redis provider for distributed deployments
- **TTL:** 15 minutes default, stale-while-revalidate

### Code Implementation
```typescript
// utils/cache/CacheProvider.ts
export interface CacheProvider {
  get<T>(k: string): Promise<T|null>;
  set<T>(k: string, v: T, ttlSec: number): Promise<void>;
  del(k: string): Promise<void>;
}

// utils/cache/MemoryCache.ts
import LRU from 'lru-cache';

export function makeMemoryCache(): CacheProvider {
  const lru = new LRU<string, any>({ 
    max: 5_000, 
    ttl: 15*60*1000 
  });
  
  return {
    async get(k) { 
      return lru.get(k) ?? null; 
    },
    async set(k, v, ttl) { 
      lru.set(k, v, { ttl: ttl*1000 }); 
    },
    async del(k) { 
      lru.delete(k); 
    },
  };
}
```

### Environment Configuration
```bash
# .env
CACHE_PROVIDER=memory  # or 'redis'
CACHE_TTL_SECONDS=900  # 15 minutes
CACHE_MAX_SIZE=5000    # LRU max entries
REDIS_URL=redis://localhost:6379  # if redis provider
```

### Acceptance Criteria
- ✅ Interface CacheProvider com hit/miss/hitRate
- ✅ Invalidação por chave ao atualizar Manual/Seção
- ✅ Meta hit rate > 90% em produção
- ✅ Switch por env (CACHE_PROVIDER=memory|redis)

---

## 🔒 Decision #5: Embed Security Policy

**Decision:** Restrictive CSP + DNS TXT verification for allowlist  
**Owner:** Backend_Developer + Tech_Lead  
**Impact:** Medium (T-010 Sharing System)

### Security Strategy
- **Initial:** Allow only *.digitalwoof.com domains
- **Expansion:** Client domain requests via DNS TXT verification
- **Headers:** CSP frame-ancestors + Permissions-Policy + X-Frame-Options legacy

### Code Implementation
```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const res = NextResponse.next();
  
  res.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "frame-ancestors 'self' https://*.digitalwoof.com"
  );
  
  res.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=()'
  );
  
  res.headers.set('X-Frame-Options', 'SAMEORIGIN'); // legacy
  
  return res;
}
```

### Domain Verification Process
```typescript
// services/domain-verification.service.ts
import { dns } from 'dns/promises';

export async function verifyDomainOwnership(domain: string, token: string): Promise<boolean> {
  try {
    const txtRecords = await dns.resolveTxt(domain);
    const flatRecords = txtRecords.flat();
    
    return flatRecords.some(record => 
      record.includes(`woof-embed=${token}`)
    );
  } catch (error) {
    return false;
  }
}
```

### Acceptance Criteria
- ✅ CSP ativa com frame-ancestors 'self' https://*.digitalwoof.com
- ✅ Endpoint request + validação domínio (DNS TXT woof-embed=...)
- ✅ Permissions-Policy mínimo e X-Frame-Options legado
- ✅ Log/audit concessões com expiração

---

## 🚀 Implementation Roadmap

### Phase 1: Core Implementation (T-001 to T-008)
1. **T-001:** Manual Data Model with cache abstraction
2. **T-002:** Navigation with gesture placeholders  
3. **T-004-007:** All sections with basic functionality
4. **T-008:** Dynamic previews system

### Phase 2: Export & Sharing (T-009 to T-010)
1. **T-009:** Puppeteer PDF service implementation
2. **T-010:** Sharing with restrictive CSP

### Phase 3: Performance & Polish (T-011 to T-013)
1. **T-011:** LRU cache implementation
2. **T-012:** Full gesture support with @use-gesture
3. **T-013:** Accessibility audit and fixes

### Phase 4: Testing & Validation (T-014 to T-015)
1. **T-014:** Playwright visual testing setup
2. **T-015:** E2E testing with all features

---

## 📊 Success Metrics Targets

### Performance Targets
- **Load Time:** < 3s for complete manual
- **Navigation:** < 500ms between sections
- **PDF Export:** < 10s for complete manual
- **Cache Hit Rate:** > 90% for frequent data
- **Memory Usage:** < 512MB per PDF generation job

### Quality Targets
- **Accessibility:** 100% WCAG 2.1 AA compliance
- **Visual Regression:** < 0.1% pixel difference tolerance
- **Touch Targets:** 100% compliance with platform guidelines
- **Security:** 0 CSP violations in production

### Business Targets
- **Adoption Rate:** > 70% users access manual after Brand Voice creation
- **Mobile Usage:** > 25% access via mobile devices
- **Export Usage:** > 30% users generate at least 1 export

---

**Status:** ✅ All technical decisions documented and ready for implementation  
**Next Step:** Execute with `--mode execute` to begin task implementation