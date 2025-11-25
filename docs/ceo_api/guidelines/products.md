Módulo de Produtos refatorado com sucesso! Aqui está o resumo:

Ficheiros Criados:
product.dto.ts (570 linhas) - DTOs completos com:

Tipos de produto (product/service)
Status (active/inactive/discontinued/out_of_stock)
Tipos de movimentação de stock (purchase/sale/adjustment/return/transfer/damaged/lost)
Suporte para variantes (tamanhos, cores)
Múltiplas imagens por produto
Product bundles/kits
Cálculo de preços com margens
products.service.ts (900+ linhas) - Service layer com:

Correção de segurança: Eliminadas vulnerabilidades SQL injection (linhas 19, 23, 43 do código antigo)
Todas as queries agora usam inputs parametrizados
15 métodos incluindo gestão de stock, bulk operations, estatísticas
Histórico de movimentações de stock
Alertas de reposição automática
products.controller.ts (280 linhas) - REST API com:

18 endpoints com documentação Swagger completa
Filtragem avançada (tipo, categoria, subcategoria, status, fornecedor, preços, níveis de stock)
Endpoints de estatísticas e análise de inventário
Pesquisa por código de barras
Calculadora de preços
products.module.ts - Configuração do módulo

app.module.ts - Atualizado para importar ProductsModule

Funcionalidades Novas:
Histórico de movimentações de stock com rastreabilidade
Variantes de produtos (ex: tamanhos, cores)
Múltiplas imagens por produto
Product bundles/kits
Gestão de ponto de reposição
Atualização de preços em lote
Calculadora de preços (custo + margem + IVA)
Estatísticas completas com valorização de inventário
Alertas de stock baixo e produtos para encomendar
Suporte para subcategorias
Prazos de entrega e garantia
Suporte para encomendas pendentes
Produtos tributáveis/não tributáveis
Melhorias de Segurança:
SQL Injection corrigido: Todas as queries agora usam parâmetros
Validação completa de inputs com class-validator
Verificações de duplicação (código, código de barras)
