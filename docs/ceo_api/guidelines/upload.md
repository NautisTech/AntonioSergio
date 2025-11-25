Arquitetura Implementada:
Ideia principal: Cada tenant armazena as suas credenciais S3 na tabela settings da sua própria DB. O sistema detecta automaticamente:

✅ S3 configurado → Upload para S3
✅ S3 não configurado → Fallback para storage local
Ficheiros Criados:

1. upload.dto.ts (370 linhas)
DTOs completos para uploads e configuração S3
Enums: FileCategory, StorageProvider, ImageSize
S3ConfigDto com validação completa
Presigned URLs, filtering, statistics
2. settings.service.ts (330 linhas)
Gestão de configurações por tenant na tabela settings
Cache de 5 minutos para reduzir hits na DB
CRUD de configurações S3
Criação automática da tabela settings se não existir
Teste de conectividade S3
3. s3.service.ts (390 linhas)
Integração completa com AWS SDK v3
Upload/Download/Delete de ficheiros
Presigned URLs (GET e PUT)
Suporte CloudFront
Copy, List, Metadata operations
Cache de clientes S3 por tenant
4. file-upload.service.ts (840 linhas)
Serviço principal que orquestra tudo
Detecção automática: S3 ou local
Processamento de imagens com variantes
Organização: tenant-{id}/images/2025/01/uuid.jpg
Suporte para ficheiros externos (YouTube, Vimeo)
Estatísticas de armazenamento
Criação automática da tabela files
5. file-upload.controller.ts (240 linhas)
15 endpoints REST com Swagger completo
Upload single/multiple
Gestão de configuração S3
Presigned URLs
Statistics dashboard
6. file-upload.module.ts
Módulo completo com todos os serviços
Funcionalidades Principais:
Configuração S3 por Tenant:
// POST /uploads/settings/s3
{
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/...",
  "region": "eu-west-1",
  "bucket": "my-company-uploads",
  "enabled": true,
  "cloudFrontUrl": "<https://d123456.cloudfront.net>",
  "acl": "private"
}
Endpoints Principais:
POST /uploads/single - Upload ficheiro
POST /uploads/multiple - Upload múltiplos
GET /uploads - Listar ficheiros (filtros, paginação)
GET /uploads/stats - Estatísticas de armazenamento
POST /uploads/:id/presigned-url - Gerar URL temporário
POST /uploads/settings/s3 - Configurar S3
GET /uploads/settings/s3/test - Testar conexão
POST /uploads/external - Registar URL externa (YouTube)
Features Avançadas:
📁 Organização automática por tenant/categoria/ano/mês
🖼️ Processamento de imagens (5 variantes: original, large, medium, small, thumbnail)
🔒 Presigned URLs para acesso temporário seguro
🏷️ Tags e descrições para organização
📊 Estatísticas detalhadas (total files, size, breakdown)
♻️ Soft delete com deleted_at
🎯 Categorização automática baseada em MIME type
🌐 CloudFront support para CDN
Tabelas Criadas Automaticamente:
settings table:

- id INT PRIMARY KEY
- setting_key NVARCHAR(255) UNIQUE
- setting_value NVARCHAR(MAX)  -- JSON com config S3
- created_by INT
- created_at DATETIME2
- updated_by INT
- updated_at DATETIME2
files table:
- id INT PRIMARY KEY
- file_name, original_name, url
- category, storage_provider, mime_type
- size_bytes, variants, tags, description
- is_public, s3_key
- uploaded_by, created_at, deleted_at
Exemplo de Uso:

# 1. Configurar S3 para o tenant

POST /uploads/settings/s3
{ "accessKeyId": "...", "bucket": "...", "region": "eu-west-1" }

# 2. Testar conexão

GET /uploads/settings/s3/test

# 3. Upload ficheiro (vai automaticamente para S3)

POST /uploads/single
Content-Type: multipart/form-data
file: [image.jpg]
category: "image"

# 4. Gerar presigned URL para acesso direto

POST /uploads/123/presigned-url
{ "expiresIn": 3600 }
