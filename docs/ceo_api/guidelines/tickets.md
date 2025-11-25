Serviços Criados/Modernizados

1. TicketService (ticket.service.ts)

Substitui o antigo TicketsService
SLA Tracking Avançado:
4 níveis de status: ok, warning (< 25%), critical (< 10%), breached
Cálculo de porcentagem restante
Tempo restante em minutos
Deadline automático baseado em SLA
Métodos: create(), list(), getById(), update(), close(), reopen(), addComment(), rate(), delete()
Sistema de avaliação (1-5 estrelas) com feedback
Tags para categorização
Filtros avançados (status, prioridade, SLA, técnico, cliente, etc.)
2. TicketActivityService (ticket-activity.service.ts) ✨ NOVO

Timeline completa de atividades:
Histórico de mudanças de status
Comentários (internos e externos)
Reatribuições
Alertas de SLA
Anexos adicionados
getTicketTimeline() - visualização cronológica
getTicketComments() - thread de comentários com visibilidade
getActivityStatistics() - estatísticas de atividade
3. InterventionService (intervention.service.ts)

Substitui IntervencoesService e IntervencoesCustosService
Tracking de peças utilizadas (JSON storage)
Workflow de aprovação do cliente
Gestão de custos: mão de obra + peças = custo total
Fornecedores externos e faturação
Garantia e duração tracking
Integração automática com tickets (log activity)
4. TicketTypeService (ticket-type.service.ts)

Gestão de tipos de ticket
Configuração de SLA por tipo
Auto-atribuição por departamento
Ícones e cores personalizáveis
Exigência de equipamento configurável
DTOs Modernos (support.dto.ts)
Mais de 30 DTOs com validação completa:

CreateTicketDto, UpdateTicketDto, CloseTicketDto, ReopenTicketDto
AddTicketCommentDto, RateTicketDto
CreateInterventionDto, UpdateInterventionDto
CreateTicketTypeDto, UpdateTicketTypeDto
TicketFilterDto com suporte para paginação
Enums:

TicketPriority: low, medium, high, urgent, critical
TicketStatus: open, in_progress, awaiting_customer, awaiting_technician, on_hold, resolved, closed, cancelled, reopened
InterventionType: preventive, corrective, installation, configuration, upgrade, maintenance, repair, diagnosis, inspection
InterventionStatus: scheduled, pending, in_progress, completed, cancelled, failed
ActivityType: created, status_changed, priority_changed, assigned, reassigned, comment_added, etc.
SLAStatus: ok, warning, critical, breached
Controller Unificado (support.controller.ts)
Endpoints de Tickets:

GET /support/tickets - Listar com filtros
GET /support/tickets/dashboard - Estatísticas
GET /support/tickets/:id - Detalhes
POST /support/tickets - Criar
PUT /support/tickets/:id - Atualizar
POST /support/tickets/:id/close - Fechar
POST /support/tickets/:id/reopen - Reabrir
POST /support/tickets/:id/comments - Adicionar comentário
POST /support/tickets/:id/rate - Avaliar
DELETE /support/tickets/:id - Deletar
Endpoints de Atividades (NOVO):

GET /support/tickets/:id/timeline - Timeline de atividades
GET /support/tickets/:id/comments - Comentários
GET /support/activities/statistics - Estatísticas
Endpoints de Intervenções:

GET /support/interventions - Listar
GET /support/interventions/statistics - Estatísticas
GET /support/interventions/:id - Detalhes
POST /support/interventions - Criar
PUT /support/interventions/:id - Atualizar
DELETE /support/interventions/:id - Deletar
Endpoints de Tipos de Ticket:

GET /support/ticket-types - Listar
GET /support/ticket-types/statistics - Estatísticas
GET /support/ticket-types/:id - Detalhes
POST /support/ticket-types - Criar
PUT /support/ticket-types/:id - Atualizar
DELETE /support/ticket-types/:id - Deletar
Estatísticas e Analytics
Dashboard de Tickets:

Total de tickets por status
Tickets urgentes e atrasados
Tempo médio de resolução
Avaliação média
Top técnicos com métricas
Status de SLA (ok, warning, critical, breached)
Dashboard de Intervenções:

Total de intervenções por tipo
Duração média
Custos totais e médios
Top técnicos por receita
