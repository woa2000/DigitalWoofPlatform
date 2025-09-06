# API Endpoints - Brand Onboarding

## Onboarding Routes (`/api/onboarding`)

### GET `/api/onboarding/:userId`
Recupera dados de onboarding do usuário
- **Response**: Objeto com dados completos do onboarding

### GET `/api/onboarding/:userId/progress`
Recupera progresso do onboarding
- **Response**: Objeto com step atual, passos completos e total

### POST `/api/onboarding/:userId`
Cria novo registro de onboarding
- **Body**: OnboardingData (toneConfig e languageConfig obrigatórios)
- **Response**: Registro criado

### PUT `/api/onboarding/:userId`
Atualiza dados de onboarding existentes
- **Body**: Partial<OnboardingData>
- **Response**: Registro atualizado

### PUT `/api/onboarding/:userId/upsert`
Cria ou atualiza dados de onboarding
- **Body**: OnboardingData (toneConfig e languageConfig obrigatórios)
- **Response**: Registro criado/atualizado

### POST `/api/onboarding/:userId/step/:step`
Atualiza step atual do wizard
- **Params**: step (logo|palette|tone|language|values|completed)
- **Response**: Registro atualizado

### POST `/api/onboarding/:userId/complete`
Marca onboarding como completo e gera Brand Voice JSON
- **Response**: Dados de onboarding + Brand Voice JSON formatado

### GET `/api/onboarding/:userId/brand-voice-json`
Gera Brand Voice JSON a partir dos dados de onboarding
- **Response**: Brand Voice JSON completo

### DELETE `/api/onboarding/:userId`
Remove dados de onboarding do usuário
- **Response**: Confirmação de exclusão

## Storage Routes (`/api/storage`)

### POST `/api/storage/logo/:userId`
Upload de logo para usuário
- **Body**: FormData com campo 'logo' (imagem, max 5MB)
- **Response**: URL do logo, metadata e paleta de cores
- **Automatic**: Atualiza onboarding com dados do logo

### DELETE `/api/storage/logo/:userId`
Remove logo do usuário
- **Response**: Confirmação de exclusão
- **Automatic**: Remove dados do logo do onboarding

### GET `/api/storage/logo/:userId/metadata`
Recupera metadata do logo
- **Response**: URL, metadata e paleta de cores

### GET `/api/storage/logo/:userId/palette`
Extrai paleta de cores do logo
- **Response**: Array de cores em formato hex
- **Automatic**: Atualiza onboarding com nova paleta

## Data Models

### OnboardingData Interface
```typescript
{
  logoUrl?: string;
  palette?: string[]; // Cores em hex
  logoMetadata?: {
    width: number;
    height: number;
    format: string;
    hasTransparency: boolean;
    fileSize: number;
  };
  toneConfig: {
    confianca: number;    // 0.0-1.0
    acolhimento: number;  // 0.0-1.0
    humor: number;        // 0.0-1.0
    especializacao: number; // 0.0-1.0
  };
  languageConfig: {
    preferredTerms: string[]; // max 20
    avoidTerms: string[];     // max 15
    defaultCTAs: string[];    // max 5
  };
  brandValues?: {
    mission?: string; // max 200 chars
    values: Array<{
      name: string;
      description?: string;
      weight: number; // 0.0-1.0
    }>; // max 5
    disclaimer: string; // obrigatório
  };
  stepCompleted?: 'logo' | 'palette' | 'tone' | 'language' | 'values' | 'completed';
}
```

## Features Implementadas

✅ **Serviço de Onboarding**: Classe completa com CRUD operations
✅ **API Routes**: Endpoints REST completos para onboarding
✅ **Upload de Logo**: Integração com Supabase Storage
✅ **Extração de Paleta**: Serviço para cores do logo
✅ **Progress Tracking**: Sistema de progresso do wizard
✅ **Brand Voice Generation**: Conversão automática para JSON
✅ **Database Integration**: Persistência via Drizzle ORM
✅ **Type Safety**: Interfaces TypeScript completas
✅ **Error Handling**: Tratamento de erros consistente

## Próximos Passos

1. **Frontend Integration**: Conectar wizard do onboarding com APIs
2. **Image Processing**: Implementar análise real de imagens
3. **Color Extraction**: Biblioteca para extração automática de cores
4. **Validation**: Validação avançada de dados de entrada
5. **Testing**: Testes unitários e de integração

## Environment Variables Necessárias

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string
```