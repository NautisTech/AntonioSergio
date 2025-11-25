Perfeito! Refatorei completamente o módulo de orçamentos com English schema v2.0 e muitas funcionalidades novas! 🎯

🔒 Correções de Segurança Críticas:
Corrigido SQL Injection: O código antigo tinha interpolação direta nas linhas 219 e 676
Queries 100% parametrizadas em todo o serviço
Validação completa com class-validator
🔄 Migração de Schema:
Migrado de orcamentos (PT) → quote (EN)
Campos em English snake_case: quote_date, valid_until, quote_number, approved_at
Soft delete correto: deleted_at IS NULL (substituiu ativo = 1)
Audit trail completo: created_by, updated_by, approved_by_id, timestamps
✨ Novas Funcionalidades:

1. Quote Cloning 📋
Clone orçamentos existentes para novos clientes ou mesmo cliente com datas atualizadas

2. Win Rate Analytics 📊
Taxa de conversão: Percentual de orçamentos aceites vs rejeitados
Top 10 clientes: Ranking por valor total com win rate individual
Tempo médio de fecho: Tracking de quantos dias até aceitação/rejeição
Análise de valores por status (pendente, aceite, rejeitado, expirado)
3. Gestão de Expiração ⏰
Marcação automática de orçamentos expirados
Endpoint para ver orçamentos a expirar nos próximos X dias
Alertas de expiração
4. Workflow de Status Aprimorado 🔄
Estados: draft → sent → viewed → accepted/rejected/expired → converted

✅ Não permite editar orçamentos aceites, rejeitados ou convertidos
✅ Não permite aceitar orçamentos expirados
✅ Não permite enviar orçamentos já aceites/rejeitados
5. Filtros Avançados 🔍
Filtragem por:

Status, cliente, utilizador atribuído, empresa
Intervalo de datas, valores mínimo/máximo
Orçamentos expirados
Orçamentos a expirar em X dias
6. Estatísticas Abrangentes 📈
Valor total de orçamentos
Valores aceites/rejeitados/pendentes/expirados
Win rate (percentagem de conversão)
Valor médio por orçamento
Tempo médio até fecho (em dias)
Breakdown por status com contagens e totais
Top 10 clientes por valor total com win rates individuais
7. Números Auto-Gerados 🔢
Formato: QUO-2025-000001 (único por ano)

📊 Arquivos Criados:
/ceo_api/src/modules/orcamentos/dto/quote.dto.ts (531 linhas)
DTOs completos com validação:

CreateQuoteDto, UpdateQuoteDto
CreateQuoteItemDto, UpdateQuoteItemDto
AcceptQuoteDto, RejectQuoteDto
SendQuoteDto, CloneQuoteDto
QuoteStatsDto (estatísticas detalhadas)
Enums: QuoteStatus, QuoteType
/ceo_api/src/modules/orcamentos/quotes.service.ts (944 linhas)
15 métodos abrangentes:

create() - Criar com cálculo automático de totais
findAll() - Filtros avançados parametrizados
findById() - Obter com itens e info de expiração
findByNumber() - Buscar por número
update() - Atualização dinâmica com validação de status
delete() - Soft delete
sendQuote() - Enviar ao cliente
acceptQuote() - Aceitar com validações
rejectQuote() - Rejeitar com motivo
cloneQuote() - Clonar com customização
getStats() - Estatísticas completas
markExpiredQuotes() - Marcar expirados
getExpiringQuotes() - Obter a expirar
generateQuoteNumber() - Gerar números únicos
calculateTotals() - Calcular totais automaticamente
/ceo_api/src/modules/orcamentos/quotes.controller.ts (256 linhas)
19 endpoints REST com Swagger completo:

CRUD Básico:

GET /quotes - Listar com filtros avançados
GET /quotes/stats - Estatísticas com win rate
GET /quotes/expiring?days=7 - Orçamentos a expirar
GET /quotes/number/:number - Buscar por número
GET /quotes/:id - Obter por ID
POST /quotes - Criar orçamento
PUT /quotes/:id - Atualizar
DELETE /quotes/:id - Soft delete
Workflow:

POST /quotes/:id/send - Enviar ao cliente
POST /quotes/:id/accept - Aceitar orçamento
POST /quotes/:id/reject - Rejeitar com motivo
POST /quotes/:id/clone - Clonar orçamento
Utilidades:

POST /quotes/mark-expired - Marcar expirados
🎯 Funcionalidades de Negócio:
✅ Validações de Workflow:

Não permite editar orçamentos aceites/rejeitados/convertidos
Não permite aceitar orçamentos expirados
Não permite enviar orçamentos já finalizados
✅ Analytics:

Win rate e tracking de conversão
Análise de performance de clientes
Ranking de top clientes
✅ Gestão de Ciclo de Vida:

Estados bem definidos com transições validadas
Alertas de expiração automáticos
Clone para reutilização
🚀 Otimizações:
✅ Queries 100% parametrizadas (SQL injection prevention)
✅ Soft delete em todas as operações
✅ Suporte a transações para consistência
✅ Query building dinâmico para filtros flexíveis
✅ Paginação eficiente
✅ Cálculo automático de totais
✅ Documentação Swagger/OpenAPI completa
✅ Error handling abrangente
📝 Commit:
Commit: 8076c82
Branch: claude/validate-api-infrastructure-013A3WLQAEjgPdUyZDe32H8Y
Status: ✅ Pushed com sucesso
O módulo de Orçamentos está agora completamente modernizado, seguro e com funcionalidades analíticas poderosas seguindo os mesmos padrões dos outros módulos refatorados! 🎉
