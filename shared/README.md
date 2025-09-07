# 🎯 Digital Woof Platform - Shared Library

Biblioteca centralizada de **schemas**, **tipos** e **utilitários** para a plataforma Digital Woof.

## 📋 Estrutura

```
shared/
├── schemas/              # Schemas Drizzle ORM + Zod
│   ├── tenant-system/    # Multi-tenancy
│   ├── brand-system/     # Brand Voice & Onboarding
│   ├── campaign-system/  # Campanhas & Templates
│   ├── ai-content/       # IA & Geração de Conteúdo
│   ├── assets/           # Biblioteca Visual
│   └── anamnesis/        # Análise & Insights
├── types/                # Interfaces TypeScript
│   ├── tenant-system/
│   ├── brand-system/
│   ├── campaign-system/
│   ├── ai-content/
│   ├── assets/
│   └── anamnesis/
└── index.ts             # Export central
```

## 🚀 Como Usar

### Import Central
```typescript
import { 
  // Schemas
  tenantsTable,
  brandOnboardingTable,
  campaignsTable,
  aiContentTable,
  assetsTable,
  anamnesisAnalysisTable,
  
  // Tipos
  Tenant,
  Campaign,
  AiContent,
  Asset,
  
  // Validações
  insertTenantSchema,
  insertCampaignSchema,
  
  // Utilitários
  calculateROI,
  formatFileSize,
  extractKeyInsights
} from '@/shared';
```

### Import Específico
```typescript
// Sistema de Tenants
import { 
  tenantsTable, 
  Tenant, 
  TenantSettings 
} from '@/shared/schemas/tenant-system';

// Sistema de Campanhas
import { 
  campaignsTable, 
  Campaign, 
  CampaignAnalytics 
} from '@/shared/schemas/campaign-system';
```

## 📊 Sistemas Disponíveis

### 🏢 Tenant System
- **Multi-tenancy** completo
- **Gestão de usuários** por tenant
- **Permissões** granulares
- **Configurações** por tenant

```typescript
import { 
  tenantsTable, 
  tenantUsersTable, 
  profilesTable,
  Tenant,
  TenantUser,
  TenantPermissions 
} from '@/shared/schemas/tenant-system';
```

### 🎨 Brand System
- **Brand Voice JSON** v1.0
- **Onboarding** progressivo
- **Guidelines** da marca
- **Validação** automática

```typescript
import { 
  brandOnboardingTable,
  brandVoiceJsonsTable,
  BrandVoiceV1,
  OnboardingProgress 
} from '@/shared/schemas/brand-system';
```

### 📢 Campaign System
- **Templates** de campanha
- **Performance** tracking
- **Analytics** detalhadas
- **Colaboração** em equipe

```typescript
import { 
  campaignsTable,
  campaignTemplatesTable,
  campaignPerformanceTable,
  CampaignAnalytics,
  PerformanceMetrics 
} from '@/shared/schemas/campaign-system';
```

### 🤖 AI Content System
- **Prompts** dinâmicos
- **Geração** de conteúdo
- **Feedback** para IA
- **Compliance** checking

```typescript
import { 
  aiPromptsTable,
  contentBriefsTable,
  generatedContentTable,
  aiContentTable,
  ContentAnalysis,
  GenerationParams 
} from '@/shared/schemas/ai-content';
```

### 🎨 Assets System
- **Biblioteca visual** completa
- **Coleções** organizadas
- **Analytics** de uso
- **Brand assets** específicos

```typescript
import { 
  assetsTable,
  assetCollectionsTable,
  brandAssetsTable,
  AssetLibrary,
  AssetUsageAnalytics 
} from '@/shared/schemas/assets';
```

### 🔬 Anamnesis System
- **Análise** automatizada
- **Insights** com IA
- **Business** anamnesis
- **Relatórios** detalhados

```typescript
import { 
  anamnesisAnalysisTable,
  anamnesisSourceTable,
  businessAnamnesisTable,
  AnalysisReport,
  CompetitiveAnalysis 
} from '@/shared/schemas/anamnesis';
```

## 🛠️ Validação com Zod

Todos os schemas incluem validação Zod integrada:

```typescript
import { insertTenantSchema, updateTenantSchema } from '@/shared';

// Validar dados de entrada
const result = insertTenantSchema.safeParse(tenantData);
if (!result.success) {
  console.error(result.error.issues);
}

// TypeScript types automáticos
const validTenant: Tenant = result.data;
```

## 🔧 Helpers Utilitários

### Cálculos de Performance
```typescript
import { 
  calculateROI, 
  calculateCTR, 
  calculateEngagementRate 
} from '@/shared';

const roi = calculateROI(revenue, cost);
const ctr = calculateCTR(clicks, impressions);
const engagement = calculateEngagementRate(interactions, reach);
```

### Formatação
```typescript
import { 
  formatFileSize, 
  formatDuration 
} from '@/shared';

const size = formatFileSize(1024000); // "1.02 MB"
const duration = formatDuration(3665); // "1:01:05"
```

### Análise de Conteúdo
```typescript
import { 
  extractHashtags, 
  extractMentions, 
  validateContentLength 
} from '@/shared';

const hashtags = extractHashtags(content);
const mentions = extractMentions(content);
const isValid = validateContentLength(content, 'instagram');
```

## 🌟 Recursos Avançados

### Brand Voice Validation
```typescript
import { brandVoiceV1Schema } from '@/shared';

const validation = brandVoiceV1Schema.safeParse(brandVoiceData);
```

### Campaign Analytics
```typescript
import { CampaignAnalytics, calculateROI } from '@/shared';

const analytics: CampaignAnalytics = {
  campaign,
  totalMetrics: {
    roi: calculateROI(revenue, cost),
    // ... outras métricas
  }
};
```

### Asset Processing
```typescript
import { 
  AssetProcessing, 
  validateAssetConstraints 
} from '@/shared';

const validation = validateAssetConstraints(asset, {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png']
});
```

## 📈 Versionamento

- **Schema Version**: `1.0.0`
- **API Version**: `v1`
- **Platform Version**: `1.0.0-beta`

## 🛡️ Segurança

Sistema de permissões granular:

```typescript
import { Permission, SecurityContext } from '@/shared';

const permissions: Permission[] = [
  'tenant:read',
  'campaign:write',
  'content:generate',
  'analytics:read'
];
```

## 🚀 Próximos Passos

1. **Testes unitários** para todos os schemas
2. **Documentação** de API automática
3. **Migrations** automáticas
4. **Validação** em tempo real
5. **Performance** monitoring

---

**Desenvolvido para Digital Woof Platform** 🐕✨