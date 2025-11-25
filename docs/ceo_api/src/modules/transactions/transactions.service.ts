import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateTransactionItemDto,
  RecordPaymentDto,
  CreateInvoiceDto,
  CreateExpenseDto,
  ProcessRefundDto,
  TransactionType,
  TransactionStatus,
  EntityType,
  TransactionStatsDto,
} from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Generate next transaction number
   */
  private async generateTransactionNumber(
    tenantId: number,
    type: TransactionType,
  ): Promise<string> {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const year = new Date().getFullYear();
    const prefix = type.toUpperCase().substring(0, 3);

    const result = await pool.request()
      .input('year', sql.Int, year)
      .input('prefix', sql.NVarChar, prefix)
      .query(`
        SELECT COUNT(*) as count
        FROM [transaction]
        WHERE transaction_number LIKE @prefix + '-' + CAST(@year AS NVARCHAR) + '-%'
          AND deleted_at IS NULL
      `);

    const count = result.recordset[0].count + 1;
    return `${prefix}-${year}-${count.toString().padStart(6, '0')}`;
  }

  /**
   * Create new transaction
   */
  async create(tenantId: number, dto: CreateTransactionDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        tenantId,
        dto.transactionType,
      );

      // Calculate balance
      const balance = dto.balance !== undefined
        ? dto.balance
        : dto.totalAmount - (dto.paidAmount || 0);

      // Create transaction
      const transactionResult = await transaction.request()
        .input('companyId', sql.Int, dto.companyId || null)
        .input('entityType', sql.NVarChar, dto.entityType)
        .input('entityId', sql.Int, dto.entityId)
        .input('transactionNumber', sql.NVarChar, transactionNumber)
        .input('transactionType', sql.NVarChar, dto.transactionType)
        .input('transactionDate', sql.Date, dto.transactionDate)
        .input('dueDate', sql.Date, dto.dueDate || null)
        .input('paymentDate', sql.Date, dto.paymentDate || null)
        .input('paymentMethod', sql.NVarChar, dto.paymentMethod || null)
        .input('status', sql.NVarChar, dto.status)
        .input('subtotal', sql.Decimal(18, 2), dto.subtotal)
        .input('taxAmount', sql.Decimal(18, 2), dto.taxAmount || null)
        .input('totalAmount', sql.Decimal(18, 2), dto.totalAmount)
        .input('paidAmount', sql.Decimal(18, 2), dto.paidAmount || null)
        .input('balance', sql.Decimal(18, 2), balance)
        .input('currency', sql.NVarChar, dto.currency || 'EUR')
        .input('notes', sql.NVarChar, dto.notes || null)
        .input('externalRef', sql.NVarChar, dto.externalRef || null)
        .input('createdBy', sql.Int, userId)
        .query(`
          INSERT INTO [transaction] (
            company_id, entity_type, entity_id, transaction_number,
            transaction_type, transaction_date, due_date, payment_date,
            payment_method, status, subtotal, tax_amount, total_amount,
            paid_amount, balance, currency, notes, external_ref,
            created_at, created_by
          )
          OUTPUT INSERTED.id
          VALUES (
            @companyId, @entityType, @entityId, @transactionNumber,
            @transactionType, @transactionDate, @dueDate, @paymentDate,
            @paymentMethod, @status, @subtotal, @taxAmount, @totalAmount,
            @paidAmount, @balance, @currency, @notes, @externalRef,
            GETDATE(), @createdBy
          )
        `);

      const transactionId = transactionResult.recordset[0].id;

      // Insert items if provided
      if (dto.items && dto.items.length > 0) {
        for (const item of dto.items) {
          await transaction.request()
            .input('transactionId', sql.Int, transactionId)
            .input('productId', sql.Int, item.productId || null)
            .input('lineNumber', sql.Int, item.lineNumber)
            .input('description', sql.NVarChar, item.description)
            .input('quantity', sql.Decimal(10, 2), item.quantity)
            .input('unitPrice', sql.Decimal(18, 2), item.unitPrice)
            .input('taxPercentage', sql.Decimal(5, 2), item.taxPercentage || null)
            .input('taxAmount', sql.Decimal(18, 2), item.taxAmount || null)
            .input('lineTotal', sql.Decimal(18, 2), item.lineTotal)
            .query(`
              INSERT INTO [transaction_item] (
                transaction_id, product_id, line_number, description,
                quantity, unit_price, tax_percentage, tax_amount, line_total
              )
              VALUES (
                @transactionId, @productId, @lineNumber, @description,
                @quantity, @unitPrice, @taxPercentage, @taxAmount, @lineTotal
              )
            `);
        }
      }

      await transaction.commit();

      return this.findById(tenantId, transactionId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Find all transactions with filtering and pagination
   */
  async findAll(tenantId: number, filters: any = {}) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Build WHERE clause with parameterized queries
    const conditions: string[] = ['t.deleted_at IS NULL'];
    const request = pool.request();

    if (filters.transactionType) {
      conditions.push('t.transaction_type = @transactionType');
      request.input('transactionType', sql.NVarChar, filters.transactionType);
    }

    if (filters.status) {
      conditions.push('t.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.entityType) {
      conditions.push('t.entity_type = @entityType');
      request.input('entityType', sql.NVarChar, filters.entityType);
    }

    if (filters.entityId) {
      conditions.push('t.entity_id = @entityId');
      request.input('entityId', sql.Int, filters.entityId);
    }

    if (filters.companyId) {
      conditions.push('t.company_id = @companyId');
      request.input('companyId', sql.Int, filters.companyId);
    }

    if (filters.paymentMethod) {
      conditions.push('t.payment_method = @paymentMethod');
      request.input('paymentMethod', sql.NVarChar, filters.paymentMethod);
    }

    if (filters.startDate) {
      conditions.push('t.transaction_date >= @startDate');
      request.input('startDate', sql.Date, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('t.transaction_date <= @endDate');
      request.input('endDate', sql.Date, filters.endDate);
    }

    if (filters.minAmount) {
      conditions.push('t.total_amount >= @minAmount');
      request.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    }

    if (filters.maxAmount) {
      conditions.push('t.total_amount <= @maxAmount');
      request.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    }

    if (filters.currency) {
      conditions.push('t.currency = @currency');
      request.input('currency', sql.NVarChar, filters.currency);
    }

    if (filters.overdue === true || filters.overdue === 'true') {
      conditions.push('t.status = @overdueStatus AND t.due_date < GETDATE()');
      request.input('overdueStatus', sql.NVarChar, TransactionStatus.OVERDUE);
    }

    const whereClause = conditions.join(' AND ');

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [transaction] t
      WHERE ${whereClause}
    `);

    // Get data
    const dataRequest = pool.request();

    // Re-add all parameters for data query
    if (filters.transactionType) dataRequest.input('transactionType', sql.NVarChar, filters.transactionType);
    if (filters.status) dataRequest.input('status', sql.NVarChar, filters.status);
    if (filters.entityType) dataRequest.input('entityType', sql.NVarChar, filters.entityType);
    if (filters.entityId) dataRequest.input('entityId', sql.Int, filters.entityId);
    if (filters.companyId) dataRequest.input('companyId', sql.Int, filters.companyId);
    if (filters.paymentMethod) dataRequest.input('paymentMethod', sql.NVarChar, filters.paymentMethod);
    if (filters.startDate) dataRequest.input('startDate', sql.Date, filters.startDate);
    if (filters.endDate) dataRequest.input('endDate', sql.Date, filters.endDate);
    if (filters.minAmount) dataRequest.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    if (filters.maxAmount) dataRequest.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    if (filters.currency) dataRequest.input('currency', sql.NVarChar, filters.currency);
    if (filters.overdue === true || filters.overdue === 'true') {
      dataRequest.input('overdueStatus', sql.NVarChar, TransactionStatus.OVERDUE);
    }

    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('pageSize', sql.Int, pageSize);

    const dataResult = await dataRequest.query(`
      SELECT
        t.*,
        e.full_name as created_by_name,
        (SELECT COUNT(*) FROM transaction_item WHERE transaction_id = t.id) as items_count
      FROM [transaction] t
      LEFT JOIN [employee] e ON t.created_by = e.id AND e.deleted_at IS NULL
      WHERE ${whereClause}
      ORDER BY t.transaction_date DESC, t.id DESC
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
   * Find transaction by ID
   */
  async findById(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          t.*,
          e.full_name as created_by_name,
          u.full_name as updated_by_name
        FROM [transaction] t
        LEFT JOIN [employee] e ON t.created_by = e.id AND e.deleted_at IS NULL
        LEFT JOIN [employee] u ON t.updated_by = u.id AND u.deleted_at IS NULL
        WHERE t.id = @id AND t.deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    const transactionData = result.recordset[0];

    // Get items
    const itemsResult = await pool.request()
      .input('transactionId', sql.Int, id)
      .query(`
        SELECT
          i.*,
          p.name as product_name
        FROM [transaction_item] i
        LEFT JOIN [product] p ON i.product_id = p.id AND p.deleted_at IS NULL
        WHERE i.transaction_id = @transactionId
        ORDER BY i.line_number
      `);

    return {
      ...transactionData,
      items: itemsResult.recordset,
    };
  }

  /**
   * Find transaction by number
   */
  async findByNumber(tenantId: number, transactionNumber: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('transactionNumber', sql.NVarChar, transactionNumber)
      .query(`
        SELECT id
        FROM [transaction]
        WHERE transaction_number = @transactionNumber AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    return this.findById(tenantId, result.recordset[0].id);
  }

  /**
   * Update transaction
   */
  async update(tenantId: number, id: number, dto: UpdateTransactionDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM [transaction] WHERE id = @id AND deleted_at IS NULL`);

    if (checkResult.recordset.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();

    if (dto.companyId !== undefined) {
      updates.push('company_id = @companyId');
      request.input('companyId', sql.Int, dto.companyId);
    }
    if (dto.entityType !== undefined) {
      updates.push('entity_type = @entityType');
      request.input('entityType', sql.NVarChar, dto.entityType);
    }
    if (dto.entityId !== undefined) {
      updates.push('entity_id = @entityId');
      request.input('entityId', sql.Int, dto.entityId);
    }
    if (dto.transactionType !== undefined) {
      updates.push('transaction_type = @transactionType');
      request.input('transactionType', sql.NVarChar, dto.transactionType);
    }
    if (dto.transactionDate !== undefined) {
      updates.push('transaction_date = @transactionDate');
      request.input('transactionDate', sql.Date, dto.transactionDate);
    }
    if (dto.dueDate !== undefined) {
      updates.push('due_date = @dueDate');
      request.input('dueDate', sql.Date, dto.dueDate);
    }
    if (dto.paymentDate !== undefined) {
      updates.push('payment_date = @paymentDate');
      request.input('paymentDate', sql.Date, dto.paymentDate);
    }
    if (dto.paymentMethod !== undefined) {
      updates.push('payment_method = @paymentMethod');
      request.input('paymentMethod', sql.NVarChar, dto.paymentMethod);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.subtotal !== undefined) {
      updates.push('subtotal = @subtotal');
      request.input('subtotal', sql.Decimal(18, 2), dto.subtotal);
    }
    if (dto.taxAmount !== undefined) {
      updates.push('tax_amount = @taxAmount');
      request.input('taxAmount', sql.Decimal(18, 2), dto.taxAmount);
    }
    if (dto.totalAmount !== undefined) {
      updates.push('total_amount = @totalAmount');
      request.input('totalAmount', sql.Decimal(18, 2), dto.totalAmount);
    }
    if (dto.paidAmount !== undefined) {
      updates.push('paid_amount = @paidAmount');
      request.input('paidAmount', sql.Decimal(18, 2), dto.paidAmount);
    }
    if (dto.balance !== undefined) {
      updates.push('balance = @balance');
      request.input('balance', sql.Decimal(18, 2), dto.balance);
    }
    if (dto.currency !== undefined) {
      updates.push('currency = @currency');
      request.input('currency', sql.NVarChar, dto.currency);
    }
    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }
    if (dto.externalRef !== undefined) {
      updates.push('external_ref = @externalRef');
      request.input('externalRef', sql.NVarChar, dto.externalRef);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');
    updates.push('updated_by = @updatedBy');
    request.input('updatedBy', sql.Int, userId);
    request.input('id', sql.Int, id);

    await request.query(`
      UPDATE [transaction]
      SET ${updates.join(', ')}
      WHERE id = @id AND deleted_at IS NULL
    `);

    return this.findById(tenantId, id);
  }

  /**
   * Delete transaction (soft delete)
   */
  async delete(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [transaction]
        SET deleted_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Transaction not found');
    }

    return { success: true, message: 'Transaction deleted successfully' };
  }

  /**
   * Record payment for an invoice
   */
  async recordPayment(tenantId: number, transactionId: number, dto: RecordPaymentDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get transaction
    const transaction = await this.findById(tenantId, transactionId);

    if (transaction.status === TransactionStatus.PAID) {
      throw new BadRequestException('Transaction is already fully paid');
    }

    if (transaction.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for cancelled transaction');
    }

    const currentPaidAmount = transaction.paid_amount || 0;
    const newPaidAmount = currentPaidAmount + dto.amount;

    if (newPaidAmount > transaction.total_amount) {
      throw new BadRequestException('Payment amount exceeds total amount');
    }

    const newBalance = transaction.total_amount - newPaidAmount;
    const newStatus = newBalance === 0
      ? TransactionStatus.PAID
      : TransactionStatus.PARTIALLY_PAID;

    // Update transaction
    const request = pool.request()
      .input('transactionId', sql.Int, transactionId)
      .input('paidAmount', sql.Decimal(18, 2), newPaidAmount)
      .input('balance', sql.Decimal(18, 2), newBalance)
      .input('status', sql.NVarChar, newStatus)
      .input('paymentDate', sql.Date, dto.paymentDate)
      .input('paymentMethod', sql.NVarChar, dto.paymentMethod)
      .input('externalRef', sql.NVarChar, dto.externalRef || null)
      .input('notes', sql.NVarChar, dto.notes || transaction.notes)
      .input('updatedBy', sql.Int, userId);

    await request.query(`
      UPDATE [transaction]
      SET paid_amount = @paidAmount,
          balance = @balance,
          status = @status,
          payment_date = @paymentDate,
          payment_method = @paymentMethod,
          external_ref = @externalRef,
          notes = @notes,
          updated_at = GETDATE(),
          updated_by = @updatedBy
      WHERE id = @transactionId AND deleted_at IS NULL
    `);

    return this.findById(tenantId, transactionId);
  }

  /**
   * Create invoice for client
   */
  async createInvoice(tenantId: number, dto: CreateInvoiceDto, userId: number) {
    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of dto.items) {
      subtotal += item.lineTotal;
      if (item.taxAmount) {
        taxAmount += item.taxAmount;
      }
    }

    const totalAmount = subtotal;

    const transactionDto: CreateTransactionDto = {
      companyId: dto.companyId,
      entityType: EntityType.CLIENT,
      entityId: dto.clientId,
      transactionType: TransactionType.INVOICE,
      transactionDate: dto.invoiceDate,
      dueDate: dto.dueDate,
      status: TransactionStatus.PENDING,
      subtotal,
      taxAmount: taxAmount || 0,
      totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      currency: dto.currency || 'EUR',
      notes: dto.notes,
      items: dto.items,
    };

    return this.create(tenantId, transactionDto, userId);
  }

  /**
   * Create expense for supplier
   */
  async createExpense(tenantId: number, dto: CreateExpenseDto, userId: number) {
    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of dto.items) {
      subtotal += item.lineTotal;
      if (item.taxAmount) {
        taxAmount += item.taxAmount;
      }
    }

    const totalAmount = subtotal;
    const isPaid = !!dto.paymentMethod;

    const transactionDto: CreateTransactionDto = {
      companyId: dto.companyId,
      entityType: EntityType.SUPPLIER,
      entityId: dto.supplierId,
      transactionType: TransactionType.EXPENSE,
      transactionDate: dto.expenseDate,
      dueDate: dto.dueDate,
      paymentMethod: dto.paymentMethod,
      paymentDate: isPaid ? dto.expenseDate : undefined,
      status: isPaid ? TransactionStatus.PAID : TransactionStatus.PENDING,
      subtotal,
      taxAmount: taxAmount || 0,
      totalAmount,
      paidAmount: isPaid ? totalAmount : 0,
      balance: isPaid ? 0 : totalAmount,
      currency: dto.currency || 'EUR',
      notes: dto.notes,
      externalRef: dto.externalRef,
      items: dto.items,
    };

    return this.create(tenantId, transactionDto, userId);
  }

  /**
   * Process refund
   */
  async processRefund(tenantId: number, dto: ProcessRefundDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get original transaction
    const originalTransaction = await this.findById(tenantId, dto.originalTransactionId);

    if (dto.amount > originalTransaction.total_amount) {
      throw new BadRequestException('Refund amount cannot exceed original transaction amount');
    }

    // Create refund transaction
    const transactionDto: CreateTransactionDto = {
      companyId: originalTransaction.company_id,
      entityType: originalTransaction.entity_type,
      entityId: originalTransaction.entity_id,
      transactionType: TransactionType.REFUND,
      transactionDate: dto.refundDate,
      paymentMethod: dto.paymentMethod || originalTransaction.payment_method,
      paymentDate: dto.refundDate,
      status: TransactionStatus.PAID,
      subtotal: dto.amount,
      taxAmount: 0,
      totalAmount: dto.amount,
      paidAmount: dto.amount,
      balance: 0,
      currency: originalTransaction.currency,
      notes: `Refund for transaction ${originalTransaction.transaction_number}: ${dto.reason}`,
      externalRef: dto.externalRef,
    };

    return this.create(tenantId, transactionDto, userId);
  }

  /**
   * Get transaction statistics
   */
  async getStats(tenantId: number, filters: any = {}): Promise<TransactionStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const conditions: string[] = ['deleted_at IS NULL'];
    const request = pool.request();

    if (filters.startDate) {
      conditions.push('transaction_date >= @startDate');
      request.input('startDate', sql.Date, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('transaction_date <= @endDate');
      request.input('endDate', sql.Date, filters.endDate);
    }

    if (filters.entityType) {
      conditions.push('entity_type = @entityType');
      request.input('entityType', sql.NVarChar, filters.entityType);
    }

    if (filters.entityId) {
      conditions.push('entity_id = @entityId');
      request.input('entityId', sql.Int, filters.entityId);
    }

    const whereClause = conditions.join(' AND ');

    const result = await request.query(`
      SELECT
        COUNT(*) as total_transactions,
        ISNULL(SUM(total_amount), 0) as total_amount,
        ISNULL(SUM(paid_amount), 0) as total_paid,
        ISNULL(SUM(CASE WHEN status IN ('pending', 'partially_paid') THEN balance ELSE 0 END), 0) as total_pending,
        ISNULL(SUM(CASE WHEN status = 'overdue' THEN balance ELSE 0 END), 0) as total_overdue,
        ISNULL(SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END), 0) as overdue_count,
        CASE WHEN COUNT(*) > 0 THEN AVG(total_amount) ELSE 0 END as average_value,

        -- By type
        ISNULL(SUM(CASE WHEN transaction_type = 'invoice' THEN 1 ELSE 0 END), 0) as invoice_count,
        ISNULL(SUM(CASE WHEN transaction_type = 'invoice' THEN total_amount ELSE 0 END), 0) as invoice_total,
        ISNULL(SUM(CASE WHEN transaction_type = 'payment' THEN 1 ELSE 0 END), 0) as payment_count,
        ISNULL(SUM(CASE WHEN transaction_type = 'payment' THEN total_amount ELSE 0 END), 0) as payment_total,
        ISNULL(SUM(CASE WHEN transaction_type = 'expense' THEN 1 ELSE 0 END), 0) as expense_count,
        ISNULL(SUM(CASE WHEN transaction_type = 'expense' THEN total_amount ELSE 0 END), 0) as expense_total,
        ISNULL(SUM(CASE WHEN transaction_type = 'refund' THEN 1 ELSE 0 END), 0) as refund_count,
        ISNULL(SUM(CASE WHEN transaction_type = 'refund' THEN total_amount ELSE 0 END), 0) as refund_total,

        -- By status
        ISNULL(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draft_count,
        ISNULL(SUM(CASE WHEN status = 'draft' THEN total_amount ELSE 0 END), 0) as draft_total,
        ISNULL(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
        ISNULL(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_total,
        ISNULL(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paid_count,
        ISNULL(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_total,
        ISNULL(SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END), 0) as overdue_status_count,
        ISNULL(SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END), 0) as overdue_status_total,
        ISNULL(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_count,
        ISNULL(SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END), 0) as cancelled_total,
        ISNULL(SUM(CASE WHEN status = 'partially_paid' THEN 1 ELSE 0 END), 0) as partially_paid_count,
        ISNULL(SUM(CASE WHEN status = 'partially_paid' THEN total_amount ELSE 0 END), 0) as partially_paid_total
      FROM [transaction]
      WHERE ${whereClause}
    `);

    const data = result.recordset[0];

    return {
      totalTransactions: data.total_transactions,
      totalAmount: parseFloat(data.total_amount),
      totalPaid: parseFloat(data.total_paid),
      totalPending: parseFloat(data.total_pending),
      totalOverdue: parseFloat(data.total_overdue),
      overdueCount: data.overdue_count,
      averageValue: parseFloat(data.average_value),
      byType: {
        invoice: {
          count: data.invoice_count,
          total: parseFloat(data.invoice_total),
        },
        payment: {
          count: data.payment_count,
          total: parseFloat(data.payment_total),
        },
        expense: {
          count: data.expense_count,
          total: parseFloat(data.expense_total),
        },
        refund: {
          count: data.refund_count,
          total: parseFloat(data.refund_total),
        },
      },
      byStatus: {
        draft: {
          count: data.draft_count,
          total: parseFloat(data.draft_total),
        },
        pending: {
          count: data.pending_count,
          total: parseFloat(data.pending_total),
        },
        paid: {
          count: data.paid_count,
          total: parseFloat(data.paid_total),
        },
        overdue: {
          count: data.overdue_status_count,
          total: parseFloat(data.overdue_status_total),
        },
        cancelled: {
          count: data.cancelled_count,
          total: parseFloat(data.cancelled_total),
        },
        partially_paid: {
          count: data.partially_paid_count,
          total: parseFloat(data.partially_paid_total),
        },
      },
    };
  }

  /**
   * Mark overdue transactions
   */
  async markOverdueTransactions(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      UPDATE [transaction]
      SET status = 'overdue',
          updated_at = GETDATE()
      WHERE status IN ('pending', 'partially_paid')
        AND due_date < CAST(GETDATE() AS DATE)
        AND deleted_at IS NULL
    `);

    return {
      success: true,
      message: `Marked ${result.rowsAffected[0]} transactions as overdue`,
      count: result.rowsAffected[0],
    };
  }

  /**
   * Get entity balance (total receivable/payable)
   */
  async getEntityBalance(tenantId: number, entityType: EntityType, entityId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('entityType', sql.NVarChar, entityType)
      .input('entityId', sql.Int, entityId)
      .query(`
        SELECT
          ISNULL(SUM(CASE WHEN transaction_type = 'invoice' THEN balance ELSE 0 END), 0) as receivable,
          ISNULL(SUM(CASE WHEN transaction_type = 'expense' THEN balance ELSE 0 END), 0) as payable,
          ISNULL(SUM(CASE WHEN transaction_type = 'invoice' THEN total_amount ELSE 0 END), 0) as total_invoiced,
          ISNULL(SUM(CASE WHEN transaction_type = 'expense' THEN total_amount ELSE 0 END), 0) as total_expenses,
          ISNULL(SUM(CASE WHEN transaction_type = 'invoice' THEN paid_amount ELSE 0 END), 0) as total_received,
          ISNULL(SUM(CASE WHEN transaction_type = 'expense' THEN paid_amount ELSE 0 END), 0) as total_paid
        FROM [transaction]
        WHERE entity_type = @entityType
          AND entity_id = @entityId
          AND status NOT IN ('draft', 'cancelled')
          AND deleted_at IS NULL
      `);

    const data = result.recordset[0];

    return {
      entityType,
      entityId,
      receivable: parseFloat(data.receivable),
      payable: parseFloat(data.payable),
      totalInvoiced: parseFloat(data.total_invoiced),
      totalExpenses: parseFloat(data.total_expenses),
      totalReceived: parseFloat(data.total_received),
      totalPaid: parseFloat(data.total_paid),
      netBalance: parseFloat(data.receivable) - parseFloat(data.payable),
    };
  }

  // ========================
  // Transaction Items Operations
  // ========================

  /**
   * Get items for a transaction
   */
  async getTransactionItems(tenantId: number, transactionId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if transaction exists
    await this.findById(tenantId, transactionId);

    const result = await pool
      .request()
      .input('transactionId', sql.Int, transactionId)
      .query(`
        SELECT
          ti.*,
          p.name as product_name,
          p.code as product_code
        FROM transaction_item ti
        LEFT JOIN product p ON ti.product_id = p.id
        WHERE ti.transaction_id = @transactionId
        ORDER BY ti.line_number ASC
      `);

    return result.recordset;
  }

  /**
   * Add item to transaction
   */
  async addTransactionItem(
    tenantId: number,
    transactionId: number,
    dto: any,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if transaction exists
    await this.findById(tenantId, transactionId);

    const result = await pool
      .request()
      .input('transactionId', sql.Int, transactionId)
      .input('productId', sql.Int, dto.productId || null)
      .input('lineNumber', sql.Int, dto.lineNumber)
      .input('description', sql.NVarChar, dto.description)
      .input('quantity', sql.Decimal(18, 4), dto.quantity)
      .input('unitPrice', sql.Decimal(18, 2), dto.unitPrice)
      .input('taxPercentage', sql.Decimal(5, 2), dto.taxPercentage || 0)
      .input('taxAmount', sql.Decimal(18, 2), dto.taxAmount || 0)
      .input('lineTotal', sql.Decimal(18, 2), dto.lineTotal)
      .query(`
        INSERT INTO transaction_item (
          transaction_id, product_id, line_number, description, quantity,
          unit_price, tax_percentage, tax_amount, line_total, created_at
        )
        VALUES (
          @transactionId, @productId, @lineNumber, @description, @quantity,
          @unitPrice, @taxPercentage, @taxAmount, @lineTotal, GETDATE()
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    const itemId = result.recordset[0].id;

    // Update transaction totals
    await this.recalculateTransactionTotals(tenantId, transactionId);

    return {
      id: itemId,
      success: true,
      message: 'Transaction item added successfully',
    };
  }

  /**
   * Update transaction item
   */
  async updateTransactionItem(
    tenantId: number,
    transactionId: number,
    itemId: number,
    dto: any,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if transaction exists
    await this.findById(tenantId, transactionId);

    // Check if item exists
    const itemCheck = await pool
      .request()
      .input('itemId', sql.Int, itemId)
      .input('transactionId', sql.Int, transactionId)
      .query(`
        SELECT id FROM transaction_item
        WHERE id = @itemId AND transaction_id = @transactionId
      `);

    if (itemCheck.recordset.length === 0) {
      throw new NotFoundException('Transaction item not found');
    }

    const updates: string[] = [];
    const request = pool.request()
      .input('itemId', sql.Int, itemId)
      .input('transactionId', sql.Int, transactionId);

    if (dto.productId !== undefined) {
      updates.push('product_id = @productId');
      request.input('productId', sql.Int, dto.productId);
    }

    if (dto.lineNumber !== undefined) {
      updates.push('line_number = @lineNumber');
      request.input('lineNumber', sql.Int, dto.lineNumber);
    }

    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.quantity !== undefined) {
      updates.push('quantity = @quantity');
      request.input('quantity', sql.Decimal(18, 4), dto.quantity);
    }

    if (dto.unitPrice !== undefined) {
      updates.push('unit_price = @unitPrice');
      request.input('unitPrice', sql.Decimal(18, 2), dto.unitPrice);
    }

    if (dto.taxPercentage !== undefined) {
      updates.push('tax_percentage = @taxPercentage');
      request.input('taxPercentage', sql.Decimal(5, 2), dto.taxPercentage);
    }

    if (dto.taxAmount !== undefined) {
      updates.push('tax_amount = @taxAmount');
      request.input('taxAmount', sql.Decimal(18, 2), dto.taxAmount);
    }

    if (dto.lineTotal !== undefined) {
      updates.push('line_total = @lineTotal');
      request.input('lineTotal', sql.Decimal(18, 2), dto.lineTotal);
    }

    if (updates.length === 0) {
      return { success: true, message: 'No updates provided' };
    }

    updates.push('updated_at = GETDATE()');

    await request.query(`
      UPDATE transaction_item
      SET ${updates.join(', ')}
      WHERE id = @itemId AND transaction_id = @transactionId
    `);

    // Update transaction totals
    await this.recalculateTransactionTotals(tenantId, transactionId);

    return { success: true, message: 'Transaction item updated successfully' };
  }

  /**
   * Delete transaction item
   */
  async deleteTransactionItem(tenantId: number, transactionId: number, itemId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if transaction exists
    await this.findById(tenantId, transactionId);

    // Check if item exists
    const itemCheck = await pool
      .request()
      .input('itemId', sql.Int, itemId)
      .input('transactionId', sql.Int, transactionId)
      .query(`
        SELECT id FROM transaction_item
        WHERE id = @itemId AND transaction_id = @transactionId
      `);

    if (itemCheck.recordset.length === 0) {
      throw new NotFoundException('Transaction item not found');
    }

    await pool
      .request()
      .input('itemId', sql.Int, itemId)
      .input('transactionId', sql.Int, transactionId)
      .query(`
        DELETE FROM transaction_item
        WHERE id = @itemId AND transaction_id = @transactionId
      `);

    // Update transaction totals
    await this.recalculateTransactionTotals(tenantId, transactionId);

    return { success: true, message: 'Transaction item deleted successfully' };
  }

  /**
   * Recalculate transaction totals based on items
   */
  private async recalculateTransactionTotals(tenantId: number, transactionId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('transactionId', sql.Int, transactionId)
      .query(`
        SELECT
          ISNULL(SUM(line_total - tax_amount), 0) as subtotal,
          ISNULL(SUM(tax_amount), 0) as taxAmount,
          ISNULL(SUM(line_total), 0) as totalAmount
        FROM transaction_item
        WHERE transaction_id = @transactionId
      `);

    const totals = result.recordset[0];

    await pool
      .request()
      .input('transactionId', sql.Int, transactionId)
      .input('subtotal', sql.Decimal(18, 2), totals.subtotal)
      .input('taxAmount', sql.Decimal(18, 2), totals.taxAmount)
      .input('totalAmount', sql.Decimal(18, 2), totals.totalAmount)
      .query(`
        UPDATE [transaction]
        SET
          subtotal = @subtotal,
          tax_amount = @taxAmount,
          total_amount = @totalAmount,
          balance = @totalAmount - ISNULL(paid_amount, 0),
          updated_at = GETDATE()
        WHERE id = @transactionId
      `);
  }
}
