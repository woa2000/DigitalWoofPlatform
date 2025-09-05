# Sistema de Upload de Logotipos - Manual da Marca

## 📁 Visão Geral

Sistema completo para upload, armazenamento e gerenciamento de logotipos no capítulo 2 do Manual da Marca, utilizando Supabase Storage.

## 🚀 Funcionalidades

### Upload de Logotipos
- **Versões Fixas**: 4 opções predefinidas (Principal Colorida, Monocromática Preta, Monocromática Branca, Escala de Cinza)
- **Formatos Suportados**: SVG, PNG, JPG, JPEG, PDF
- **Tamanho Máximo**: 10MB por arquivo
- **Validação**: Verificação de tipo e tamanho antes do upload
- **Armazenamento**: Supabase Storage com URLs públicas

### Gerenciamento
- **Preview Visual**: Visualização de imagens suportadas
- **Metadados**: Nome, formato, tamanho, data de upload
- **Notas de Aplicação**: Campo opcional para instruções de uso
- **Remoção**: Delete individual com limpeza do storage

## 🛠️ Configuração do Supabase

### 1. Bucket Configuration
```sql
-- Executar no SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Políticas de Segurança
```sql
-- Upload para usuários autenticados
CREATE POLICY "Authenticated users can upload brand assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'brand-assets');

-- Leitura pública
CREATE POLICY "Public can view brand assets" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'brand-assets');

-- Update/Delete para próprios arquivos
CREATE POLICY "Users can manage their own brand assets" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'brand-assets');
```

### 3. Configuração do Bucket
- **Nome**: brand-assets
- **Público**: Sim
- **MIME Types**: image/png, image/jpeg, image/svg+xml, application/pdf
- **Tamanho Máximo**: 10MB

## 📂 Estrutura de Arquivos

```
brand-manuals/
└── logos/
    ├── principal_colorida_1640123456789.svg
    ├── monocromatica_preta_1640123456790.png
    ├── monocromatica_branca_1640123456791.png
    └── escala_cinza_1640123456792.svg
```

## 💾 Estrutura de Dados

```typescript
interface UploadedLogo {
  version: string;           // Versão do logo
  file_url: string;         // URL pública do Supabase
  file_name: string;        // Nome original do arquivo
  format: string;           // Formato (SVG, PNG, etc.)
  uploaded_at: string;      // ISO timestamp
  size_bytes: number;       // Tamanho em bytes
  application_notes?: string; // Notas opcionais
  storage_path?: string;    // Caminho no storage
}
```

## 🔧 Componentes

### LogoSystemEditor
- **Localização**: `src/app/(dashboard)/manual-marca/[id]/editar/page.tsx`
- **Funcionalidade**: Interface de upload e gerenciamento
- **Estado**: Sincronizado com dados do manual

### ChapterContent (Visualizador)
- **Localização**: `src/app/(dashboard)/manual-marca/[id]/page.tsx`
- **Funcionalidade**: Galeria de logos com estatísticas
- **Features**: Preview, download, copy link

### Utilities
- **Upload Helper**: `src/lib/brand-logo-upload.ts`
- **Funções**: ensureBrandAssetsBucket, uploadBrandLogo, removeBrandLogo

## 🎯 Fluxo de Upload

1. **Seleção**: Usuário escolhe versão do logo
2. **Arquivo**: Upload do arquivo (validação automática)
3. **Notas**: Adiciona instruções opcionais
4. **Upload**: Arquivo enviado para Supabase Storage
5. **Metadados**: Informações salvas no manual
6. **Preview**: Logo aparece na lista imediatamente

## 🔍 Validações

### Cliente (Frontend)
- Tipo de arquivo (MIME type)
- Tamanho máximo (10MB)
- Versão selecionada obrigatória

### Servidor (Supabase)
- Políticas de acesso (RLS)
- Configuração do bucket
- Autenticação obrigatória

## 📊 Monitoramento

### Logs do Console
- Status de upload
- Erros de conexão
- Criação de buckets
- Operações de storage

### Feedback do Usuário
- Loading states
- Mensagens de erro
- Confirmação de sucesso
- Progresso visual

## 🚨 Troubleshooting

### Erro de Bucket
```
Bucket 'brand-assets' não existe
```
**Solução**: Executar `ensureBrandAssetsBucket()` ou criar manualmente

### Erro de Permissão
```
New row violates RLS policy
```
**Solução**: Verificar políticas de segurança e autenticação

### Erro de Upload
```
File too large / Invalid file type
```
**Solução**: Verificar validações e configuração do bucket

## 🔄 Atualizações Futuras

- [ ] Progress bar durante upload
- [ ] Redimensionamento automático de imagens
- [ ] Suporte a múltiplos arquivos
- [ ] Versionamento de logos
- [ ] Integração com CDN
- [ ] Compressão automática

## 📝 Notas Técnicas

- URLs do Supabase Storage são públicas e persistentes
- Arquivos são organizados por timestamp para evitar conflitos
- Sistema de limpeza automática ao remover logos
- Compatibilidade com diferentes formatos de arquivo
- Fallback para preview quando formato não suportado
