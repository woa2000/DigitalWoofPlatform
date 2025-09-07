# Biblioteca de Campanhas - API Documentation

## Visão Geral

A API da Biblioteca de Campanhas fornece endpoints REST para gerenciamento completo de templates de campanhas de marketing digital, incluindo busca avançada, comparação, personalização e analytics de performance.

**Base URL:** `/api/templates`

## Autenticação

Todos os endpoints requerem autenticação via JWT token no header `Authorization: Bearer <token>`.

## Endpoints

### 1. Listar Templates

**GET** `/api/templates`

Lista templates de campanhas com filtros avançados e paginação.

#### Parâmetros de Query

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-------------|
| `category` | enum | Categoria da campanha (social, email, etc.) | Não |
| `serviceType` | enum | Tipo de serviço (petshop, veterinaria, etc.) | Não |
| `isPublic` | boolean | Apenas templates públicos | Não |
| `isPremium` | boolean | Apenas templates premium | Não |
| `createdBy` | UUID | ID do criador do template | Não |
| `page` | number | Página atual (padrão: 1) | Não |
| `limit` | number | Itens por página (1-100, padrão: 20) | Não |
| `sortBy` | enum | Campo para ordenação | Não |
| `sortOrder` | enum | Ordem (asc/desc, padrão: desc) | Não |
| `search` | string | Termo de busca textual | Não |
| `minRating` | number | Rating mínimo (0-5) | Não |
| `maxUsageCount` | number | Máximo de usos | Não |

#### Exemplo de Request

```bash
GET /api/templates?category=social&serviceType=petshop&limit=10&search=veterinaria
```

#### Response

```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Campanha Vacinação Pet",
      "description": "Template para campanha de vacinação",
      "category": "social",
      "serviceType": "veterinaria",
      "isPublic": true,
      "isPremium": false,
      "usageCount": 150,
      "avgEngagementRate": 4.2,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 45,
    "totalPages": 5,
    "hasMore": true
  },
  "filters": {
    "category": "social",
    "serviceType": "petshop",
    "search": "veterinaria"
  }
}
```

### 2. Busca de Templates

**GET** `/api/templates/search`

Busca templates por termo textual com relevância.

#### Parâmetros

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-------------|
| `q` | string | Termo de busca (1-100 caracteres) | Sim |
| `limit` | number | Máximo de resultados (1-50, padrão: 20) | Não |

#### Exemplo

```bash
GET /api/templates/search?q=vacinação+pet&limit=5
```

### 3. Templates Populares

**GET** `/api/templates/popular`

Retorna templates mais utilizados.

#### Parâmetros

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-------------|
| `limit` | number | Número de templates (1-50, padrão: 10) | Não |

### 4. Detalhes do Template

**GET** `/api/templates/:id`

Retorna detalhes completos de um template específico.

#### Parâmetros

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-------------|
| `id` | UUID | ID do template | Sim (na URL) |

#### Response

```json
{
  "id": "uuid",
  "name": "Campanha Vacinação Pet",
  "description": "Template completo para campanha de vacinação",
  "category": "social",
  "serviceType": "veterinaria",
  "content": {
    "headline": "Proteja seu pet!",
    "body": "Vacinação completa para cães e gatos",
    "callToAction": "Agende agora",
    "hashtags": ["#PetCare", "#Vacinação"]
  },
  "assets": [
    {
      "type": "image",
      "url": "https://...",
      "alt": "Cachorro vacinado"
    }
  ],
  "isPublic": true,
  "isPremium": false,
  "usageCount": 150,
  "avgEngagementRate": 4.2,
  "createdBy": "uuid",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T00:00:00Z"
}
```

### 5. Incrementar Contador de Uso

**POST** `/api/templates/:id/usage`

Incrementa o contador de uso do template (chamado quando um template é utilizado).

#### Parâmetros

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-------------|
| `id` | UUID | ID do template | Sim (na URL) |

### 6. Dados de Performance

**GET** `/api/templates/:id/performance`

Retorna métricas de performance do template.

#### Response

```json
{
  "templateId": "uuid",
  "usageCount": 150,
  "avgEngagementRate": 4.2,
  "avgConversionRate": 3.8,
  "totalImpressions": 15000,
  "totalClicks": 2250,
  "totalConversions": 570,
  "performanceByChannel": {
    "instagram": { "engagement": 4.5, "conversion": 4.1 },
    "facebook": { "engagement": 3.8, "conversion": 3.5 }
  },
  "lastUpdated": "2025-01-15T00:00:00Z"
}
```

### 7. Comparar Templates

**GET** `/api/templates/compare`

Compara múltiplos templates lado a lado.

#### Parâmetros

| Parâmetro | Tipo | Descrição | Obrigatório |
|-----------|------|-----------|-------------|
| `ids` | string | IDs separados por vírgula (2-5 templates) | Sim |

#### Exemplo

```bash
GET /api/templates/compare?ids=uuid1,uuid2,uuid3
```

## Códigos de Status HTTP

- `200` - Sucesso
- `400` - Parâmetros inválidos
- `401` - Não autorizado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## Rate Limiting

- Templates list/search: 100 requests/minuto
- Template details: 500 requests/minuto
- Performance data: 200 requests/minuto

## Cache

- Templates list: 5 minutos
- Template details: 10 minutos
- Performance data: 15 minutos

## Versionamento

A API utiliza versionamento via header `Accept-Version: v1`.

## Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento ou consulte a documentação completa em `/docs/api/`.