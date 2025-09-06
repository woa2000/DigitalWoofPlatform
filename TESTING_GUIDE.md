# 🧪 Como Testar a Funcionalidade Brand Voice JSON

Este guia mostra como testar a nova funcionalidade Brand Voice JSON implementada na plataforma Digital Woof.

## 🚀 Configuração Inicial

### 1. Verificar Dependências
```bash
# Instalar dependências se necessário
npm install

# Verificar se o TypeScript está funcionando
npx tsc --noEmit
```

### 2. Executar Migrações do Banco
```bash
# Aplicar as migrações para criar as tabelas
npm run db:migrate

# Ou manualmente:
npx drizzle-kit push:mysql
```

## 🧪 Executar Testes Automatizados

### Testes Unitários (Mais Rápidos)
```bash
# Executar testes unitários simplificados
cd /Users/wilsonandrade/Documents/Projetos/DW\ -\ Digital\ Woof\ \(Plataforma\)/DigitalWoofPlatform
npx ts-node tests/unit/simple-test.ts
```

### Testes de Integração
```bash
# Executar testes de integração completos
npx ts-node tests/integration/brand-voice-integration.test.ts
```

## 🔧 Testes Manuais via API

### 1. Iniciar o Servidor
```bash
# Iniciar o servidor de desenvolvimento
npm run dev
# ou
npm start
```

### 2. Testar Endpoints da API

#### Gerar Brand Voice
```bash
# POST /api/brand-voice/generate
curl -X POST http://localhost:3000/api/brand-voice/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174001",
    "options": {
      "preferQuality": true,
      "includeDefaults": true,
      "validateOutput": true
    }
  }'
```

#### Buscar Brand Voice Ativa
```bash
# GET /api/brand-voice/active
curl -X GET http://localhost:3000/api/brand-voice/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Listar Histórico de Versões
```bash
# GET /api/brand-voice/history
curl -X GET http://localhost:3000/api/brand-voice/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Ativar uma Versão Específica
```bash
# PUT /api/brand-voice/:id/activate
curl -X PUT http://localhost:3000/api/brand-voice/BRAND_VOICE_ID/activate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Testar Cenários Específicos

### Cenário 1: Geração com Dados da Anamnese
```typescript
// Criar dados de teste na anamnese
const anamnesisData = {
  userId: "test-user-id",
  segment: "veterinary",
  challenges: ["client_communication", "emergency_response"],
  goals: ["improve_satisfaction", "increase_preventive_care"]
};

// Testar geração
const response = await fetch('/api/brand-voice/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    userId: "test-user-id",
    options: { preferQuality: true, includeDefaults: true, validateOutput: true }
  })
});
```

### Cenário 2: Override Manual
```typescript
const response = await fetch('/api/brand-voice/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    userId: "test-user-id",
    manualOverrides: {
      brand: {
        name: "Clínica Personalizada",
        description: "Uma descrição customizada"
      },
      voice: {
        tone: {
          humor: 0.9,
          formality: 0.3
        }
      }
    },
    options: { preferQuality: true, includeDefaults: true, validateOutput: true }
  })
});
```

### Cenário 3: Testar Performance
```typescript
// Testar múltiplas requisições simultâneas
const promises = [];
for (let i = 0; i < 5; i++) {
  promises.push(
    fetch('/api/brand-voice/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        userId: `test-user-${i}`,
        options: { preferQuality: false, includeDefaults: true, validateOutput: true }
      })
    })
  );
}

const results = await Promise.all(promises);
console.log('Todas as requisições completadas:', results.length);
```

## 🔍 Validar Resultados

### Estrutura do Brand Voice Retornado
```json
{
  "brandVoice": {
    "brand": {
      "name": "Nome da Clínica",
      "segment": "veterinary",
      "description": "Descrição da marca",
      "targetAudience": ["pet_owners", "animal_lovers"],
      "location": "Localização"
    },
    "voice": {
      "tone": {
        "professional": 0.8,
        "caring": 0.9,
        "humor": 0.3,
        "urgency": 0.2,
        "formality": 0.7
      },
      "language": "portuguese_brazil",
      "vocabulary": "accessible_technical",
      "structure": "informative"
    },
    "content": {
      "topics": ["pet_health", "preventive_care"],
      "avoid": ["harsh_treatments"],
      "messaging": {
        "primary": "Mensagem principal",
        "secondary": "Mensagem secundária"
      }
    },
    "guidelines": {
      "doUse": ["empathetic_language", "clear_explanations"],
      "doNotUse": ["fear_inducing_language"],
      "contentTypes": ["educational_posts", "health_tips"]
    },
    "metadata": {
      "created_at": "2025-01-13T22:30:00Z",
      "updated_at": "2025-01-13T22:30:00Z",
      "version": "1.0.0",
      "source": "anamnesis_onboarding",
      "quality_metrics": {
        "completeness": 0.95,
        "consistency": 0.92,
        "relevance": 0.88
      }
    }
  },
  "metadata": {
    "generatedFrom": "anamnesis_onboarding",
    "generationTime": 1250,
    "timestamp": "2025-01-13T22:30:00Z",
    "version": "1.0.0"
  }
}
```

## 📊 Monitorar Performance

### Métricas a Verificar
- **Tempo de Geração:** < 2 segundos
- **Cache Hit Rate:** > 90%
- **Qualidade Score:** > 0.7
- **Tempo de Resposta API:** < 100ms (cache hit)

### Logs para Monitorar
```bash
# Verificar logs de geração
tail -f logs/brand-voice-generation.log

# Verificar logs de cache
tail -f logs/cache-performance.log

# Verificar logs de qualidade
tail -f logs/quality-metrics.log
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Schema Validation
```bash
# Verificar se as migrações foram aplicadas
npm run db:status

# Recriar o banco se necessário
npm run db:reset
npm run db:migrate
```

#### 2. Problemas de Cache
```bash
# Limpar cache se necessário
# (implementar endpoint de clear cache)
curl -X DELETE http://localhost:3000/api/brand-voice/cache/clear \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Performance Lenta
```bash
# Verificar índices do banco
npm run db:analyze

# Verificar uso de memória do cache
curl -X GET http://localhost:3000/api/brand-voice/cache/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎮 Interface de Teste (Frontend)

### Criar Página de Teste Simples
```html
<!DOCTYPE html>
<html>
<head>
    <title>Teste Brand Voice JSON</title>
</head>
<body>
    <h1>Teste Brand Voice Generator</h1>
    
    <form id="brandVoiceForm">
        <label>User ID:</label>
        <input type="text" id="userId" value="test-user-123" required>
        
        <label>Prefer Quality:</label>
        <input type="checkbox" id="preferQuality" checked>
        
        <label>Include Defaults:</label>
        <input type="checkbox" id="includeDefaults" checked>
        
        <button type="submit">Gerar Brand Voice</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.getElementById('brandVoiceForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const response = await fetch('/api/brand-voice/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOKEN'
                },
                body: JSON.stringify({
                    userId: document.getElementById('userId').value,
                    options: {
                        preferQuality: document.getElementById('preferQuality').checked,
                        includeDefaults: document.getElementById('includeDefaults').checked,
                        validateOutput: true
                    }
                })
            });
            
            const data = await response.json();
            document.getElementById('result').innerHTML = 
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        };
    </script>
</body>
</html>
```

## ✅ Checklist de Testes

- [ ] Testes unitários executam com sucesso
- [ ] Testes de integração passam
- [ ] API endpoints respondem corretamente
- [ ] Performance está dentro dos limites
- [ ] Cache está funcionando
- [ ] Validação de schema funciona
- [ ] Overrides manuais aplicam corretamente
- [ ] Versioning funciona
- [ ] Qualidade metrics são calculadas
- [ ] Defaults por segment funcionam

---

**💡 Dica:** Comece com os testes automatizados para validação rápida, depois teste manualmente os cenários específicos do seu caso de uso!