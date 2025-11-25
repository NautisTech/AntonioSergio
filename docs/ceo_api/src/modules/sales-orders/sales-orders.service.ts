import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  ConfirmOrderDto,
  ShipOrderDto,
  DeliverOrderDto,
  CancelOrderDto,
  OrderStatus,
  SalesOrderStatsDto,
} from './dto/sales-order.dto';

@Injectable()
export class SalesOrdersService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Generate next order number
   * NOTE: Using 'encomendas' table for now (Portuguese schema)
   * TODO: Migrate to 'sales_order' when schema is updated
   */
  private async generateOrderNumber(tenantId: number): Promise<string> {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const year = new Date().getFullYear();

    const result = await pool.request()
      .input('year', sql.Int, year)
      .query(`
        SELECT COUNT(*) as count
        FROM [encomendas]
        WHERE YEAR(data_encomenda) = @year AND ativo = 1
      `);

    const count = result.recordset[0].count + 1;
    return `SO-${year}-${count.toString().padStart(6, '0')}`;
  }

  /**
   * Calculate totals from items
   */
  private calculateTotals(
    items: any[],
    overallDiscountPercentage?: number,
    overallDiscountAmount?: number,
    shippingCost?: number,
  ) {
    let subtotal = 0;
    let totalTax = 0;

    for (const item of items) {
      subtotal += item.lineTotal || 0;
      totalTax += item.taxAmount || 0;
    }

    let discountAmount = overallDiscountAmount || 0;
    if (overallDiscountPercentage && overallDiscountPercentage > 0) {
      discountAmount = subtotal * (overallDiscountPercentage / 100);
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const shipping = shippingCost || 0;
    const totalAmount = subtotalAfterDiscount + totalTax + shipping;

    return {
      subtotal,
      discountAmount,
      taxAmount: totalTax,
      shippingCost: shipping,
      totalAmount,
    };
  }

  /**
   * Create new sales order
   */
  async create(tenantId: number, dto: CreateSalesOrderDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Verify client exists
      const clientResult = await transaction.request()
        .input('clientId', sql.Int, dto.clientId)
        .query(`SELECT id FROM [clientes] WHERE id = @clientId AND ativo = 1`);

      if (clientResult.recordset.length === 0) {
        throw new NotFoundException('Client not found');
      }

      // Generate order number
      const orderNumber = await this.generateOrderNumber(tenantId);

      // Calculate totals
      const totals = this.calculateTotals(
        dto.items,
        dto.discountPercentage,
        dto.discountAmount,
        dto.shippingCost,
      );

      // Create order
      const orderResult = await transaction.request()
        .input('numeroEncomenda', sql.NVarChar, orderNumber)
        .input('clienteId', sql.Int, dto.clientId)
        .input('responsavelId', sql.Int, dto.assignedTo || null)
        .input('vendedorId', sql.Int, dto.salespersonId || null)
        .input('type', sql.NVarChar, dto.orderType)
        .input('prioridade', sql.NVarChar, dto.priority)
        .input('dataEncomenda', sql.Date, dto.orderDate)
        .input('dataEntregaPrevista', sql.Date, dto.expectedDelivery || null)
        .input('observacoes', sql.NVarChar, dto.notes || null)
        .input('status', sql.NVarChar, OrderStatus.DRAFT)
        .input('statusPagamento', sql.NVarChar, 'pendente')
        .input('subtotal', sql.Decimal(18, 2), totals.subtotal)
        .input('desconto', sql.Decimal(18, 2), totals.discountAmount)
        .input('totalIva', sql.Decimal(18, 2), totals.taxAmount)
        .input('custoEnvio', sql.Decimal(18, 2), totals.shippingCost)
        .input('totalGeral', sql.Decimal(18, 2), totals.totalAmount)
        .input('criadoPor', sql.Int, userId)
        .query(`
          INSERT INTO [encomendas] (
            numero_encomenda, cliente_id, responsavel_id, vendedor_id,
            type, prioridade, data_encomenda, data_entrega_prevista,
            observacoes, status, status_pagamento, subtotal, desconto,
            total_iva, custo_envio, total_geral, criado_por, criado_em, ativo
          )
          OUTPUT INSERTED.id
          VALUES (
            @numeroEncomenda, @clienteId, @responsavelId, @vendedorId,
            @type, @prioridade, @dataEncomenda, @dataEntregaPrevista,
            @observacoes, @status, @statusPagamento, @subtotal, @desconto,
            @totalIva, @custoEnvio, @totalGeral, @criadoPor, GETDATE(), 1
          )
        `);

      const orderId = orderResult.recordset[0].id;

      // Insert items
      for (const item of dto.items) {
        await transaction.request()
          .input('encomendaId', sql.Int, orderId)
          .input('produtoId', sql.Int, item.productId || null)
          .input('numeroLinha', sql.Int, item.lineNumber)
          .input('description', sql.NVarChar, item.description)
          .input('quantidade', sql.Decimal(10, 2), item.quantity)
          .input('precoUnitario', sql.Decimal(18, 2), item.unitPrice)
          .input('descontoPercentual', sql.Decimal(5, 2), item.discountPercentage || null)
          .input('descontoValor', sql.Decimal(18, 2), item.discountAmount || null)
          .input('ivaTaxa', sql.Decimal(5, 2), item.taxPercentage || null)
          .input('ivaValor', sql.Decimal(18, 2), item.taxAmount || null)
          .input('total', sql.Decimal(18, 2), item.lineTotal)
          .input('observacoes', sql.NVarChar, item.notes || null)
          .query(`
            INSERT INTO [encomendas_itens] (
              encomenda_id, produto_id, numero_linha, description, quantidade,
              preco_unitario, desconto_percentual, desconto_valor,
              iva_taxa, iva_valor, total, observacoes
            )
            VALUES (
              @encomendaId, @produtoId, @numeroLinha, @description, @quantidade,
              @precoUnitario, @descontoPercentual, @descontoValor,
              @ivaTaxa, @ivaValor, @total, @observacoes
            )
          `);
      }

      await transaction.commit();

      return this.findById(tenantId, orderId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Find all orders with filtering and pagination
   */
  async findAll(tenantId: number, filters: any = {}) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Build WHERE clause with parameterized queries (FIX SQL INJECTION)
    const conditions: string[] = ['e.ativo = 1'];
    const request = pool.request();

    if (filters.status) {
      conditions.push('e.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.clientId) {
      conditions.push('e.cliente_id = @clientId');
      request.input('clientId', sql.Int, filters.clientId);
    }

    if (filters.assignedTo) {
      conditions.push('e.responsavel_id = @assignedTo');
      request.input('assignedTo', sql.Int, filters.assignedTo);
    }

    if (filters.salespersonId) {
      conditions.push('e.vendedor_id = @salespersonId');
      request.input('salespersonId', sql.Int, filters.salespersonId);
    }

    if (filters.orderType) {
      conditions.push('e.type = @orderType');
      request.input('orderType', sql.NVarChar, filters.orderType);
    }

    if (filters.priority) {
      conditions.push('e.prioridade = @priority');
      request.input('priority', sql.NVarChar, filters.priority);
    }

    if (filters.paymentStatus) {
      conditions.push('e.status_pagamento = @paymentStatus');
      request.input('paymentStatus', sql.NVarChar, filters.paymentStatus);
    }

    if (filters.startDate) {
      conditions.push('e.data_encomenda >= @startDate');
      request.input('startDate', sql.Date, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('e.data_encomenda <= @endDate');
      request.input('endDate', sql.Date, filters.endDate);
    }

    if (filters.minAmount) {
      conditions.push('e.total_geral >= @minAmount');
      request.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    }

    if (filters.maxAmount) {
      conditions.push('e.total_geral <= @maxAmount');
      request.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    }

    if (filters.overdue === true || filters.overdue === 'true') {
      conditions.push('e.data_entrega_prevista < CAST(GETDATE() AS DATE)');
      conditions.push('e.status NOT IN (@deliveredStatus, @completedStatus, @cancelledStatus)');
      request.input('deliveredStatus', sql.NVarChar, OrderStatus.DELIVERED);
      request.input('completedStatus', sql.NVarChar, OrderStatus.COMPLETED);
      request.input('cancelledStatus', sql.NVarChar, OrderStatus.CANCELLED);
    }

    const whereClause = conditions.join(' AND ');

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [encomendas] e
      WHERE ${whereClause}
    `);

    // Get data
    const dataRequest = pool.request();

    // Re-add all parameters for data query
    if (filters.status) dataRequest.input('status', sql.NVarChar, filters.status);
    if (filters.clientId) dataRequest.input('clientId', sql.Int, filters.clientId);
    if (filters.assignedTo) dataRequest.input('assignedTo', sql.Int, filters.assignedTo);
    if (filters.salespersonId) dataRequest.input('salespersonId', sql.Int, filters.salespersonId);
    if (filters.orderType) dataRequest.input('orderType', sql.NVarChar, filters.orderType);
    if (filters.priority) dataRequest.input('priority', sql.NVarChar, filters.priority);
    if (filters.paymentStatus) dataRequest.input('paymentStatus', sql.NVarChar, filters.paymentStatus);
    if (filters.startDate) dataRequest.input('startDate', sql.Date, filters.startDate);
    if (filters.endDate) dataRequest.input('endDate', sql.Date, filters.endDate);
    if (filters.minAmount) dataRequest.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    if (filters.maxAmount) dataRequest.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    if (filters.overdue === true || filters.overdue === 'true') {
      dataRequest.input('deliveredStatus', sql.NVarChar, OrderStatus.DELIVERED);
      dataRequest.input('completedStatus', sql.NVarChar, OrderStatus.COMPLETED);
      dataRequest.input('cancelledStatus', sql.NVarChar, OrderStatus.CANCELLED);
    }

    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('pageSize', sql.Int, pageSize);

    const dataResult = await dataRequest.query(`
      SELECT
        e.*,
        c.nome_cliente as client_name,
        r.nome_completo as assigned_to_name,
        v.nome_completo as salesperson_name,
        cr.nome as created_by_name,
        (SELECT COUNT(*) FROM encomendas_itens WHERE encomenda_id = e.id) as items_count,
        CASE
          WHEN e.data_entrega_prevista < CAST(GETDATE() AS DATE) AND e.status NOT IN ('delivered', 'completed', 'cancelled')
          THEN 1
          ELSE 0
        END as is_overdue
      FROM [encomendas] e
      LEFT JOIN [clientes] c ON e.cliente_id = c.id AND c.ativo = 1
      LEFT JOIN [funcionarios] r ON e.responsavel_id = r.id
      LEFT JOIN [funcionarios] v ON e.vendedor_id = v.id
      LEFT JOIN [user] cr ON e.criado_por = cr.id
      WHERE ${whereClause}
      ORDER BY e.data_encomenda DESC, e.id DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset,
      pagination: {
        total: countResult.recordset[0].total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
      },
    };
  }

  /**
   * Find order by ID
   */
  async findById(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          e.*,
          c.nome_cliente as client_name,
          c.email as client_email,
          c.telefone as client_phone,
          r.nome_completo as assigned_to_name,
          v.nome_completo as salesperson_name,
          cr.nome as created_by_name,
          up.nome as updated_by_name,
          CASE
            WHEN e.data_entrega_prevista < CAST(GETDATE() AS DATE) AND e.status NOT IN ('delivered', 'completed', 'cancelled')
            THEN 1
            ELSE 0
          END as is_overdue,
          DATEDIFF(DAY, CAST(GETDATE() AS DATE), e.data_entrega_prevista) as days_until_delivery
        FROM [encomendas] e
        LEFT JOIN [clientes] c ON e.cliente_id = c.id AND c.ativo = 1
        LEFT JOIN [funcionarios] r ON e.responsavel_id = r.id
        LEFT JOIN [funcionarios] v ON e.vendedor_id = v.id
        LEFT JOIN [user] cr ON e.criado_por = cr.id
        LEFT JOIN [user] up ON e.atualizado_por = up.id
        WHERE e.id = @id AND e.ativo = 1
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const orderData = result.recordset[0];

    // Get items
    const itemsResult = await pool.request()
      .input('orderId', sql.Int, id)
      .query(`
        SELECT
          i.*,
          p.nome as product_name,
          p.codigo as product_code
        FROM [encomendas_itens] i
        LEFT JOIN [produtos] p ON i.produto_id = p.id AND p.ativo = 1
        WHERE i.encomenda_id = @orderId
        ORDER BY i.numero_linha
      `);

    return {
      ...orderData,
      items: itemsResult.recordset,
    };
  }

  /**
   * Update order
   */
  async update(tenantId: number, id: number, dto: UpdateSalesOrderDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT id, status FROM [encomendas] WHERE id = @id AND ativo = 1`);

    if (checkResult.recordset.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const currentStatus = checkResult.recordset[0].status;

    // Cannot edit completed, cancelled, or returned orders
    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.RETURNED].includes(currentStatus)) {
      throw new BadRequestException(`Cannot edit order with status: ${currentStatus}`);
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();

    if (dto.clientId !== undefined) {
      updates.push('cliente_id = @clientId');
      request.input('clientId', sql.Int, dto.clientId);
    }
    if (dto.assignedTo !== undefined) {
      updates.push('responsavel_id = @assignedTo');
      request.input('assignedTo', sql.Int, dto.assignedTo);
    }
    if (dto.salespersonId !== undefined) {
      updates.push('vendedor_id = @salespersonId');
      request.input('salespersonId', sql.Int, dto.salespersonId);
    }
    if (dto.orderType !== undefined) {
      updates.push('type = @orderType');
      request.input('orderType', sql.NVarChar, dto.orderType);
    }
    if (dto.priority !== undefined) {
      updates.push('prioridade = @priority');
      request.input('priority', sql.NVarChar, dto.priority);
    }
    if (dto.orderDate !== undefined) {
      updates.push('data_encomenda = @orderDate');
      request.input('orderDate', sql.Date, dto.orderDate);
    }
    if (dto.expectedDelivery !== undefined) {
      updates.push('data_entrega_prevista = @expectedDelivery');
      request.input('expectedDelivery', sql.Date, dto.expectedDelivery);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.notes !== undefined) {
      updates.push('observacoes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');
    updates.push('atualizado_por = @updatedBy');
    request.input('updatedBy', sql.Int, userId);
    request.input('id', sql.Int, id);

    await request.query(`
      UPDATE [encomendas]
      SET ${updates.join(', ')}
      WHERE id = @id AND ativo = 1
    `);

    return this.findById(tenantId, id);
  }

  /**
   * Delete order (soft delete)
   */
  async delete(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [encomendas]
        SET ativo = 0, updated_at = GETDATE()
        WHERE id = @id AND ativo = 1
      `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Order not found');
    }

    return { success: true, message: 'Order deleted successfully' };
  }

  /**
   * Confirm order
   */
  async confirmOrder(tenantId: number, id: number, dto: ConfirmOrderDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const order = await this.findById(tenantId, id);

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only pending or draft orders can be confirmed');
    }

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, OrderStatus.CONFIRMED)
      .input('updatedBy', sql.Int, userId);

    if (dto.expectedDelivery) {
      request.input('expectedDelivery', sql.Date, dto.expectedDelivery);
      await request.query(`
        UPDATE [encomendas]
        SET status = @status,
            data_entrega_prevista = @expectedDelivery,
            updated_at = GETDATE(),
            atualizado_por = @updatedBy
        WHERE id = @id AND ativo = 1
      `);
    } else {
      await request.query(`
        UPDATE [encomendas]
        SET status = @status,
            updated_at = GETDATE(),
            atualizado_por = @updatedBy
        WHERE id = @id AND ativo = 1
      `);
    }

    return this.findById(tenantId, id);
  }

  /**
   * Cancel order
   */
  async cancelOrder(tenantId: number, id: number, dto: CancelOrderDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const order = await this.findById(tenantId, id);

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel completed or already cancelled order');
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, OrderStatus.CANCELLED)
      .input('updatedBy', sql.Int, userId)
      .query(`
        UPDATE [encomendas]
        SET status = @status,
            updated_at = GETDATE(),
            atualizado_por = @updatedBy
        WHERE id = @id AND ativo = 1
      `);

    return this.findById(tenantId, id);
  }

  /**
   * Get order statistics
   */
  async getStats(tenantId: number, filters: any = {}): Promise<SalesOrderStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const conditions: string[] = ['ativo = 1'];
    const request = pool.request();

    if (filters.startDate) {
      conditions.push('data_encomenda >= @startDate');
      request.input('startDate', sql.Date, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('data_encomenda <= @endDate');
      request.input('endDate', sql.Date, filters.endDate);
    }

    if (filters.clientId) {
      conditions.push('cliente_id = @clientId');
      request.input('clientId', sql.Int, filters.clientId);
    }

    const whereClause = conditions.join(' AND ');

    const result = await request.query(`
      SELECT
        COUNT(*) as total_orders,
        ISNULL(SUM(total_geral), 0) as total_value,
        ISNULL(SUM(CASE WHEN status = 'completed' THEN total_geral ELSE 0 END), 0) as completed_value,
        ISNULL(SUM(CASE WHEN status IN ('draft', 'pending', 'confirmed') THEN total_geral ELSE 0 END), 0) as pending_value,
        ISNULL(SUM(CASE WHEN status = 'cancelled' THEN total_geral ELSE 0 END), 0) as cancelled_value,
        CASE WHEN COUNT(*) > 0 THEN AVG(total_geral) ELSE 0 END as average_order_value,
        ISNULL(AVG(CASE WHEN status = 'completed' AND data_entrega_real IS NOT NULL THEN DATEDIFF(DAY, data_encomenda, data_entrega_real) END), 0) as average_fulfillment_time,
        COUNT(CASE WHEN data_entrega_prevista < CAST(GETDATE() AS DATE) AND status NOT IN ('delivered', 'completed', 'cancelled') THEN 1 END) as overdue_count,
        ISNULL(SUM(CASE WHEN status IN ('shipped', 'delivered') THEN total_geral ELSE 0 END), 0) as shipped_value,

        -- By status
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        ISNULL(SUM(CASE WHEN status = 'draft' THEN total_geral ELSE 0 END), 0) as draft_total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        ISNULL(SUM(CASE WHEN status = 'pending' THEN total_geral ELSE 0 END), 0) as pending_total,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        ISNULL(SUM(CASE WHEN status = 'confirmed' THEN total_geral ELSE 0 END), 0) as confirmed_total,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
        ISNULL(SUM(CASE WHEN status = 'processing' THEN total_geral ELSE 0 END), 0) as processing_total,
        COUNT(CASE WHEN status = 'partially_shipped' THEN 1 END) as partially_shipped_count,
        ISNULL(SUM(CASE WHEN status = 'partially_shipped' THEN total_geral ELSE 0 END), 0) as partially_shipped_total,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_count,
        ISNULL(SUM(CASE WHEN status = 'shipped' THEN total_geral ELSE 0 END), 0) as shipped_total,
        COUNT(CASE WHEN status = 'partially_delivered' THEN 1 END) as partially_delivered_count,
        ISNULL(SUM(CASE WHEN status = 'partially_delivered' THEN total_geral ELSE 0 END), 0) as partially_delivered_total,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        ISNULL(SUM(CASE WHEN status = 'delivered' THEN total_geral ELSE 0 END), 0) as delivered_total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_count,
        ISNULL(SUM(CASE WHEN status = 'returned' THEN total_geral ELSE 0 END), 0) as returned_total,

        -- By priority
        COUNT(CASE WHEN prioridade = 'baixa' THEN 1 END) as low_priority_count,
        ISNULL(SUM(CASE WHEN prioridade = 'baixa' THEN total_geral ELSE 0 END), 0) as low_priority_total,
        COUNT(CASE WHEN prioridade = 'normal' THEN 1 END) as normal_priority_count,
        ISNULL(SUM(CASE WHEN prioridade = 'normal' THEN total_geral ELSE 0 END), 0) as normal_priority_total,
        COUNT(CASE WHEN prioridade = 'alta' THEN 1 END) as high_priority_count,
        ISNULL(SUM(CASE WHEN prioridade = 'alta' THEN total_geral ELSE 0 END), 0) as high_priority_total,
        COUNT(CASE WHEN prioridade = 'urgente' THEN 1 END) as urgent_priority_count,
        ISNULL(SUM(CASE WHEN prioridade = 'urgente' THEN total_geral ELSE 0 END), 0) as urgent_priority_total,

        -- By payment status
        COUNT(CASE WHEN status_pagamento = 'pendente' THEN 1 END) as unpaid_count,
        ISNULL(SUM(CASE WHEN status_pagamento = 'pendente' THEN total_geral ELSE 0 END), 0) as unpaid_total,
        COUNT(CASE WHEN status_pagamento = 'parcial' THEN 1 END) as partially_paid_count,
        ISNULL(SUM(CASE WHEN status_pagamento = 'parcial' THEN total_geral ELSE 0 END), 0) as partially_paid_total,
        COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as paid_count,
        ISNULL(SUM(CASE WHEN status_pagamento = 'pago' THEN total_geral ELSE 0 END), 0) as paid_total,
        COUNT(CASE WHEN status_pagamento = 'reembolsado' THEN 1 END) as refunded_count,
        ISNULL(SUM(CASE WHEN status_pagamento = 'reembolsado' THEN total_geral ELSE 0 END), 0) as refunded_total,
        COUNT(CASE WHEN status_pagamento = 'vencido' THEN 1 END) as overdue_payment_count,
        ISNULL(SUM(CASE WHEN status_pagamento = 'vencido' THEN total_geral ELSE 0 END), 0) as overdue_payment_total
      FROM [encomendas]
      WHERE ${whereClause}
    `);

    const data = result.recordset[0];

    // Get top clients
    const topClientsRequest = pool.request();
    if (filters.startDate) topClientsRequest.input('startDate', sql.Date, filters.startDate);
    if (filters.endDate) topClientsRequest.input('endDate', sql.Date, filters.endDate);

    const topClientsResult = await topClientsRequest.query(`
      SELECT TOP 10
        c.id as client_id,
        c.nome_cliente as client_name,
        COUNT(e.id) as total_orders,
        ISNULL(SUM(e.total_geral), 0) as total_value,
        CASE WHEN COUNT(e.id) > 0 THEN AVG(e.total_geral) ELSE 0 END as average_order_value
      FROM [encomendas] e
      INNER JOIN [clientes] c ON e.cliente_id = c.id AND c.ativo = 1
      WHERE ${whereClause}
      GROUP BY c.id, c.nome_cliente
      ORDER BY total_value DESC
    `);

    return {
      totalOrders: data.total_orders,
      totalValue: parseFloat(data.total_value),
      completedValue: parseFloat(data.completed_value),
      pendingValue: parseFloat(data.pending_value),
      cancelledValue: parseFloat(data.cancelled_value),
      averageOrderValue: parseFloat(data.average_order_value),
      averageFulfillmentTime: parseFloat(data.average_fulfillment_time),
      overdueCount: data.overdue_count,
      shippedValue: parseFloat(data.shipped_value),
      byStatus: {
        draft: { count: data.draft_count, total: parseFloat(data.draft_total) },
        pending: { count: data.pending_count, total: parseFloat(data.pending_total) },
        confirmed: { count: data.confirmed_count, total: parseFloat(data.confirmed_total) },
        processing: { count: data.processing_count, total: parseFloat(data.processing_total) },
        partially_shipped: { count: data.partially_shipped_count, total: parseFloat(data.partially_shipped_total) },
        shipped: { count: data.shipped_count, total: parseFloat(data.shipped_total) },
        partially_delivered: { count: data.partially_delivered_count, total: parseFloat(data.partially_delivered_total) },
        delivered: { count: data.delivered_count, total: parseFloat(data.delivered_total) },
        completed: { count: data.completed_count, total: parseFloat(data.completed_value) },
        cancelled: { count: data.cancelled_count, total: parseFloat(data.cancelled_value) },
        returned: { count: data.returned_count, total: parseFloat(data.returned_total) },
      },
      byPriority: {
        low: { count: data.low_priority_count, total: parseFloat(data.low_priority_total) },
        normal: { count: data.normal_priority_count, total: parseFloat(data.normal_priority_total) },
        high: { count: data.high_priority_count, total: parseFloat(data.high_priority_total) },
        urgent: { count: data.urgent_priority_count, total: parseFloat(data.urgent_priority_total) },
      },
      byPaymentStatus: {
        unpaid: { count: data.unpaid_count, total: parseFloat(data.unpaid_total) },
        partially_paid: { count: data.partially_paid_count, total: parseFloat(data.partially_paid_total) },
        paid: { count: data.paid_count, total: parseFloat(data.paid_total) },
        refunded: { count: data.refunded_count, total: parseFloat(data.refunded_total) },
        overdue: { count: data.overdue_payment_count, total: parseFloat(data.overdue_payment_total) },
      },
      topClients: topClientsResult.recordset.map((row) => ({
        clientId: row.client_id,
        clientName: row.client_name,
        totalOrders: row.total_orders,
        totalValue: parseFloat(row.total_value),
        averageOrderValue: parseFloat(row.average_order_value),
      })),
    };
  }

  /**
   * Get overdue orders
   */
  async getOverdueOrders(tenantId: number, days?: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const request = pool.request();
    let whereClause = `e.data_entrega_prevista < CAST(GETDATE() AS DATE)
        AND e.status NOT IN ('delivered', 'completed', 'cancelled')
        AND e.ativo = 1`;

    if (days !== undefined) {
      whereClause += ' AND DATEDIFF(DAY, e.data_entrega_prevista, CAST(GETDATE() AS DATE)) >= @days';
      request.input('days', sql.Int, days);
    }

    const result = await request.query(`
      SELECT
        e.*,
        c.nome_cliente as client_name,
        c.email as client_email,
        r.nome_completo as assigned_to_name,
        DATEDIFF(DAY, e.data_entrega_prevista, CAST(GETDATE() AS DATE)) as days_overdue
      FROM [encomendas] e
      LEFT JOIN [clientes] c ON e.cliente_id = c.id AND c.ativo = 1
      LEFT JOIN [funcionarios] r ON e.responsavel_id = r.id
      WHERE ${whereClause}
      ORDER BY e.data_entrega_prevista ASC
    `);

    return result.recordset;
  }

  /**
   * Find order by order number
   */
  async findByNumber(tenantId: number, orderNumber: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('orderNumber', sql.NVarChar, orderNumber)
      .query(`
        SELECT
          e.*,
          c.nome_cliente as client_name,
          c.email as client_email,
          c.telefone as client_phone,
          r.nome_completo as assigned_to_name,
          v.nome_completo as salesperson_name,
          cr.nome as created_by_name,
          up.nome as updated_by_name
        FROM [encomendas] e
        LEFT JOIN [clientes] c ON e.cliente_id = c.id AND c.ativo = 1
        LEFT JOIN [funcionarios] r ON e.responsavel_id = r.id
        LEFT JOIN [funcionarios] v ON e.vendedor_id = v.id
        LEFT JOIN [user] cr ON e.criado_por = cr.id
        LEFT JOIN [user] up ON e.atualizado_por = up.id
        WHERE e.numero_encomenda = @orderNumber AND e.ativo = 1
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const orderData = result.recordset[0];

    // Get items
    const itemsResult = await pool.request()
      .input('orderId', sql.Int, orderData.id)
      .query(`
        SELECT
          i.*,
          p.nome as product_name,
          p.codigo as product_code
        FROM [encomendas_itens] i
        LEFT JOIN [produtos] p ON i.produto_id = p.id AND p.ativo = 1
        WHERE i.encomenda_id = @orderId
        ORDER BY i.numero_linha
      `);

    return {
      ...orderData,
      items: itemsResult.recordset,
    };
  }

  /**
   * Ship order
   */
  async shipOrder(tenantId: number, id: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const order = await this.findById(tenantId, id);

    if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException('Only confirmed or processing orders can be shipped');
    }

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, OrderStatus.SHIPPED)
      .input('updatedBy', sql.Int, userId);

    if (dto.shippingDate) {
      request.input('shippingDate', sql.Date, dto.shippingDate);
    }
    if (dto.trackingNumber) {
      request.input('trackingNumber', sql.NVarChar, dto.trackingNumber);
    }
    if (dto.carrier) {
      request.input('carrier', sql.NVarChar, dto.carrier);
    }

    let updateFields = ['status = @status', 'updated_at = GETDATE()', 'atualizado_por = @updatedBy'];

    if (dto.shippingDate) {
      updateFields.push('data_envio = @shippingDate');
    }
    if (dto.trackingNumber) {
      updateFields.push('numero_rastreio = @trackingNumber');
    }
    if (dto.carrier) {
      updateFields.push('transportadora = @carrier');
    }

    await request.query(`
      UPDATE [encomendas]
      SET ${updateFields.join(', ')}
      WHERE id = @id AND ativo = 1
    `);

    return this.findById(tenantId, id);
  }

  /**
   * Deliver order
   */
  async deliverOrder(tenantId: number, id: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const order = await this.findById(tenantId, id);

    if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.PARTIALLY_DELIVERED) {
      throw new BadRequestException('Only shipped or partially delivered orders can be marked as delivered');
    }

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, OrderStatus.DELIVERED)
      .input('updatedBy', sql.Int, userId);

    if (dto.deliveryDate) {
      request.input('deliveryDate', sql.Date, dto.deliveryDate);
    }
    if (dto.receivedBy) {
      request.input('receivedBy', sql.NVarChar, dto.receivedBy);
    }
    if (dto.notes) {
      request.input('notes', sql.NVarChar, dto.notes);
    }

    let updateFields = ['status = @status', 'updated_at = GETDATE()', 'atualizado_por = @updatedBy'];

    if (dto.deliveryDate) {
      updateFields.push('data_entrega = @deliveryDate');
    }
    if (dto.receivedBy) {
      updateFields.push('recebido_por = @receivedBy');
    }
    if (dto.notes) {
      updateFields.push('notas_entrega = @notes');
    }

    await request.query(`
      UPDATE [encomendas]
      SET ${updateFields.join(', ')}
      WHERE id = @id AND ativo = 1
    `);

    return this.findById(tenantId, id);
  }

  /**
   * Complete order
   */
  async completeOrder(tenantId: number, id: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const order = await this.findById(tenantId, id);

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Only delivered orders can be marked as completed');
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, OrderStatus.COMPLETED)
      .input('updatedBy', sql.Int, userId)
      .query(`
        UPDATE [encomendas]
        SET status = @status,
            data_conclusao = GETDATE(),
            updated_at = GETDATE(),
            atualizado_por = @updatedBy
        WHERE id = @id AND ativo = 1
      `);

    return this.findById(tenantId, id);
  }

  /**
   * Create return for an order
   */
  async createReturn(tenantId: number, orderId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      const order = await this.findById(tenantId, orderId);

      if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
        throw new BadRequestException('Only delivered or completed orders can be returned');
      }

      // Create return order
      const returnNumber = `RET-${order.numero_encomenda}`;

      const returnResult = await transaction.request()
        .input('numeroEncomenda', sql.NVarChar, returnNumber)
        .input('clienteId', sql.Int, order.cliente_id)
        .input('encomendaOriginalId', sql.Int, orderId)
        .input('motivo', sql.NVarChar, dto.reason)
        .input('observacoes', sql.NVarChar, dto.notes || null)
        .input('valorReembolso', sql.Decimal(18, 2), dto.refundAmount || 0)
        .input('status', sql.NVarChar, OrderStatus.RETURNED)
        .input('criadoPor', sql.Int, userId)
        .query(`
          INSERT INTO [encomendas] (
            numero_encomenda, cliente_id, type, status,
            observacoes, total_geral, criado_por, criado_em, ativo
          )
          OUTPUT INSERTED.id
          VALUES (
            @numeroEncomenda, @clienteId, 'return', @status,
            @observacoes, -@valorReembolso, @criadoPor, GETDATE(), 1
          )
        `);

      const returnId = returnResult.recordset[0].id;

      // Update original order status
      await transaction.request()
        .input('id', sql.Int, orderId)
        .input('status', sql.NVarChar, OrderStatus.RETURNED)
        .input('updatedBy', sql.Int, userId)
        .query(`
          UPDATE [encomendas]
          SET status = @status,
              updated_at = GETDATE(),
              atualizado_por = @updatedBy
          WHERE id = @id AND ativo = 1
        `);

      await transaction.commit();

      return {
        success: true,
        message: 'Return created successfully',
        returnId: returnId,
        returnNumber: returnNumber,
        originalOrderId: orderId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Record payment for an order
   */
  async recordPayment(tenantId: number, orderId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      const order = await this.findById(tenantId, orderId);

      // Insert payment record
      await transaction.request()
        .input('encomendaId', sql.Int, orderId)
        .input('valor', sql.Decimal(18, 2), dto.amount)
        .input('metodoPagamento', sql.NVarChar, dto.paymentMethod)
        .input('dataPagamento', sql.Date, dto.paymentDate || new Date())
        .input('referencia', sql.NVarChar, dto.reference || null)
        .input('observacoes', sql.NVarChar, dto.notes || null)
        .input('criadoPor', sql.Int, userId)
        .query(`
          INSERT INTO [encomendas_pagamentos] (
            encomenda_id, valor, metodo_pagamento, data_pagamento,
            referencia, observacoes, criado_por, criado_em
          )
          VALUES (
            @encomendaId, @valor, @metodoPagamento, @dataPagamento,
            @referencia, @observacoes, @criadoPor, GETDATE()
          )
        `);

      // Calculate total paid
      const paymentsResult = await transaction.request()
        .input('encomendaId', sql.Int, orderId)
        .query(`
          SELECT ISNULL(SUM(valor), 0) as total_pago
          FROM [encomendas_pagamentos]
          WHERE encomenda_id = @encomendaId
        `);

      const totalPaid = parseFloat(paymentsResult.recordset[0].total_pago);
      const totalOrder = parseFloat(order.total_geral);

      // Update payment status
      let paymentStatus = 'unpaid';
      if (totalPaid >= totalOrder) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      }

      await transaction.request()
        .input('id', sql.Int, orderId)
        .input('statusPagamento', sql.NVarChar, paymentStatus)
        .input('totalPago', sql.Decimal(18, 2), totalPaid)
        .input('updatedBy', sql.Int, userId)
        .query(`
          UPDATE [encomendas]
          SET status_pagamento = @statusPagamento,
              total_pago = @totalPago,
              updated_at = GETDATE(),
              atualizado_por = @updatedBy
          WHERE id = @id AND ativo = 1
        `);

      await transaction.commit();

      return {
        success: true,
        message: 'Payment recorded successfully',
        totalPaid: totalPaid,
        totalOrder: totalOrder,
        paymentStatus: paymentStatus,
        remainingAmount: totalOrder - totalPaid,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Clone an existing order (create a copy with new order number)
   */
  async cloneOrder(tenantId: number, orderId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Get original order with items
      const originalOrder = await this.findById(tenantId, orderId);

      if (!originalOrder) {
        throw new NotFoundException('Original order not found');
      }

      // Generate new order number
      const orderNumber = await this.generateOrderNumber(tenantId);

      // Create cloned order with DRAFT status
      const orderResult = await transaction.request()
        .input('numeroEncomenda', sql.NVarChar, orderNumber)
        .input('clienteId', sql.Int, originalOrder.cliente_id)
        .input('responsavelId', sql.Int, originalOrder.responsavel_id)
        .input('vendedorId', sql.Int, originalOrder.vendedor_id)
        .input('type', sql.NVarChar, originalOrder.type)
        .input('prioridade', sql.NVarChar, originalOrder.prioridade)
        .input('dataEncomenda', sql.Date, new Date())
        .input('dataEntregaPrevista', sql.Date, dto.expectedDeliveryDate || null)
        .input('observacoes', sql.NVarChar, dto.notes || originalOrder.observacoes)
        .input('status', sql.NVarChar, OrderStatus.DRAFT)
        .input('statusPagamento', sql.NVarChar, 'pendente')
        .input('subtotal', sql.Decimal(18, 2), originalOrder.subtotal)
        .input('desconto', sql.Decimal(18, 2), originalOrder.desconto)
        .input('totalIva', sql.Decimal(18, 2), originalOrder.total_iva)
        .input('custoEnvio', sql.Decimal(18, 2), originalOrder.custo_envio)
        .input('totalGeral', sql.Decimal(18, 2), originalOrder.total_geral)
        .input('criadoPor', sql.Int, userId)
        .query(`
          INSERT INTO [encomendas] (
            numero_encomenda, cliente_id, responsavel_id, vendedor_id,
            type, prioridade, data_encomenda, data_entrega_prevista,
            observacoes, status, status_pagamento, subtotal, desconto,
            total_iva, custo_envio, total_geral, criado_por, criado_em, ativo
          )
          OUTPUT INSERTED.id
          VALUES (
            @numeroEncomenda, @clienteId, @responsavelId, @vendedorId,
            @type, @prioridade, @dataEncomenda, @dataEntregaPrevista,
            @observacoes, @status, @statusPagamento, @subtotal, @desconto,
            @totalIva, @custoEnvio, @totalGeral, @criadoPor, GETDATE(), 1
          )
        `);

      const newOrderId = orderResult.recordset[0].id;

      // Clone all items from original order
      for (const item of originalOrder.items) {
        await transaction.request()
          .input('encomendaId', sql.Int, newOrderId)
          .input('produtoId', sql.Int, item.produto_id)
          .input('numeroLinha', sql.Int, item.numero_linha)
          .input('description', sql.NVarChar, item.description)
          .input('quantidade', sql.Decimal(10, 2), item.quantidade)
          .input('precoUnitario', sql.Decimal(18, 2), item.preco_unitario)
          .input('descontoPercentual', sql.Decimal(5, 2), item.desconto_percentual)
          .input('descontoValor', sql.Decimal(18, 2), item.desconto_valor)
          .input('ivaTaxa', sql.Decimal(5, 2), item.iva_taxa)
          .input('ivaValor', sql.Decimal(18, 2), item.iva_valor)
          .input('total', sql.Decimal(18, 2), item.total)
          .input('observacoes', sql.NVarChar, item.observacoes)
          .query(`
            INSERT INTO [encomendas_itens] (
              encomenda_id, produto_id, numero_linha, description, quantidade,
              preco_unitario, desconto_percentual, desconto_valor,
              iva_taxa, iva_valor, total, observacoes
            )
            VALUES (
              @encomendaId, @produtoId, @numeroLinha, @description, @quantidade,
              @precoUnitario, @descontoPercentual, @descontoValor,
              @ivaTaxa, @ivaValor, @total, @observacoes
            )
          `);
      }

      await transaction.commit();

      return {
        success: true,
        message: 'Order cloned successfully',
        originalOrderId: orderId,
        newOrderId: newOrderId,
        newOrderNumber: orderNumber,
        order: await this.findById(tenantId, newOrderId),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
