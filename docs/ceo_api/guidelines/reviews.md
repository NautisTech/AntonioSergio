Módulo de Reviews - Sistema Completo de Avaliações
O que foi criado (2420 linhas de código):

1. Tipos de Review Suportados:

✅ Clientes: Avaliação de satisfação, qualidade de suporte, qualidade de intervenções
✅ Funcionários: Peer review, auto-avaliação, avaliar responsável, responsável avaliar funcionário, satisfação, performance
✅ Fornecedores e Marcas: Avaliação de qualidade
✅ Equipamentos e Produtos: Avaliação de qualidade
✅ Custom: Qualquer tipo personalizado!
2. Tipos de Perguntas (9 tipos!):

📊 Rating (1-5 estrelas)
📈 Scale (escala personalizada, ex: 1-10)
☑️ Multiple Choice (escolha múltipla)
⚪ Single Choice (escolha única)
✔️ Yes/No
✏️ Text (resposta curta)
📝 Textarea (resposta longa)
🎯 NPS (Net Promoter Score, 0-10)
😊 CSAT (Customer Satisfaction, 1-5)
💪 CES (Customer Effort Score, 1-7)
3. Serviços Criados:

ReviewTemplateService - Gestão de Templates

Criar questionários personalizados com múltiplas perguntas
Definir intro e mensagem de agradecimento
Workflow de aprovação opcional
Respostas anônimas
Ícones e cores personalizáveis
ReviewRequestService - Gestão de Pedidos e Respostas

Enviar pedidos de review para qualquer pessoa (cliente, funcionário, externo)
Código único de acesso para cada review
Deadlines com deteção de atrasos
Cálculo automático de scores (normaliza todos os tipos para escala 0-5)
Suporte para respostas ponderadas
Link a tickets, intervenções, fornecedores, marcas, equipamentos
ReviewAnalyticsService - Analytics Poderoso

Estatísticas gerais (taxa de conclusão, scores médios)
Estatísticas por tipo de review
Top rated: Melhores funcionários, fornecedores, marcas
Trends ao longo do tempo
Analytics por pergunta
Taxa de conclusão por tipo de respondente
Resumo de performance de funcionário
ReviewTriggerService - Triggers Automáticos! 🚀

Eventos suportados:
ticket_closed - Quando ticket é fechado
intervention_completed - Quando intervenção é concluída
every_n_interventions - A cada X intervenções (teu exemplo de 10!)
every_n_tickets - A cada X tickets
monthly, quarterly, yearly - Periódicos
employee_anniversary - Aniversário de funcionário
probation_end - Fim de período experimental
Targeting por departamento, role, ou indivíduo específico
Deadlines automáticos
Lembretes antes do deadline
Condições customizáveis
Log de execução
4. Database Schema (6 tabelas auto-criadas):

review_templates - Templates de questionários
review_questions - Perguntas com tipos e opções
review_requests - Pedidos enviados
review_responses - Respostas submetidas com scores
review_answers - Respostas individuais a perguntas
review_triggers - Configuração de triggers automáticos
review_trigger_log - Histórico de execuções
5. Endpoints do Controller:

Templates:

GET /reviews/templates - Listar templates
GET /reviews/templates/statistics - Estatísticas
GET /reviews/templates/:id - Detalhes com perguntas
POST /reviews/templates - Criar
PUT /reviews/templates/:id - Atualizar
DELETE /reviews/templates/:id - Deletar
Requests:

GET /reviews/requests - Listar pedidos
GET /reviews/requests/:id - Detalhes
POST /reviews/requests - Criar pedido
POST /reviews/requests/:id/cancel - Cancelar
Responses:

POST /reviews/responses/submit - Submeter resposta
GET /reviews/responses/:id - Ver resposta com respostas
Analytics:

GET /reviews/analytics/overview - Overview
GET /reviews/analytics/by-type - Por tipo
GET /reviews/analytics/top-rated/:subjectType - Top rated
GET /reviews/analytics/trends - Trends
GET /reviews/analytics/questions/:templateId - Por pergunta
GET /reviews/analytics/completion-rates - Taxas de conclusão
GET /reviews/analytics/employee/:employeeId - Performance de funcionário
Triggers:

GET /reviews/triggers - Listar triggers
GET /reviews/triggers/:id - Detalhes
POST /reviews/triggers - Criar
PUT /reviews/triggers/:id - Atualizar
DELETE /reviews/triggers/:id - Deletar
