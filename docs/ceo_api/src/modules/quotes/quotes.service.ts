import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  AcceptQuoteDto,
  RejectQuoteDto,
  SendQuoteDto,
  ConvertQuoteToOrderDto,
  CloneQuoteDto,
  QuoteStatsDto,
  QuoteStatus,
} from './dto/quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Generate next quote number
   */
  private async generateQuoteNumber(tenantId: number): Promise<string> {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const year = new Date().getFullYear();

    const result = await pool.request()
      .input('year', sql.Int, year)
      .query(`
        SELECT COUNT(*) as count
        FROM [quote]
        WHERE YEAR(quote_date) = @year AND deleted_at IS NULL
      `);

    const count = result.recordset[0].count + 1;
    return `QUO-${year}-${count.toString().padStart(6, '0')}`;
  }

  /**
   * Calculate totals from items
   */
  private calculateTotals(items: any[], overallDiscountPercentage?: number, overallDiscountAmount?: number) {
    let subtotal = 0;
    let totalTax = 0;

    // Calculate subtotal and tax from items
    for (const item of items) {
      subtotal += item.lineTotal || 0;
      totalTax += item.taxAmount || 0;
    }

    // Apply overall discount
    let discountAmount = overallDiscountAmount || 0;
    if (overallDiscountPercentage && overallDiscountPercentage > 0) {
      discountAmount = subtotal * (overallDiscountPercentage / 100);
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const totalAmount = subtotalAfterDiscount + totalTax;

    return {
      subtotal,
      discountAmount,
      taxAmount: totalTax,
      totalAmount,
    };
  }

  /**
   * Create new quote
   */
  async create(tenantId: number, dto: CreateQuoteDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Verify client exists
      const clientResult = await transaction.request()
        .input('clientId', sql.Int, dto.clientId)
        .query(`SELECT id FROM [client] WHERE id = @clientId AND deleted_at IS NULL`);

      if (clientResult.recordset.length === 0) {
        throw new NotFoundException('Client not found');
      }

      // Generate quote number
      const quoteNumber = await this.generateQuoteNumber(tenantId);

      // Calculate totals
      const totals = this.calculateTotals(
        dto.items,
        dto.discountPercentage,
        dto.discountAmount,
      );

      // Create quote
      const quoteResult = await transaction.request()
        .input('companyId', sql.Int, dto.companyId || null)
        .input('clientId', sql.Int, dto.clientId)
        .input('assignedTo', sql.Int, dto.assignedTo || null)
        .input('quoteNumber', sql.NVarChar, quoteNumber)
        .input('title', sql.NVarChar, dto.title)
        .input('description', sql.NVarChar, dto.description || null)
        .input('status', sql.NVarChar, QuoteStatus.DRAFT)
        .input('quoteDate', sql.Date, dto.quoteDate)
        .input('validUntil', sql.Date, dto.validUntil)
        .input('subtotal', sql.Decimal(18, 2), totals.subtotal)
        .input('discountPercentage', sql.Decimal(5, 2), dto.discountPercentage || null)
        .input('discountAmount', sql.Decimal(18, 2), totals.discountAmount)
        .input('taxPercentage', sql.Decimal(5, 2), dto.taxPercentage || null)
        .input('taxAmount', sql.Decimal(18, 2), totals.taxAmount)
        .input('totalAmount', sql.Decimal(18, 2), totals.totalAmount)
        .input('notes', sql.NVarChar, dto.notes || null)
        .input('termsAndConditions', sql.NVarChar, dto.termsAndConditions || null)
        .input('createdBy', sql.Int, userId)
        .query(`
          INSERT INTO [quote] (
            company_id, client_id, assigned_to, quote_number, title,
            description, status, quote_date, valid_until, subtotal,
            discount_percentage, discount_amount, tax_percentage,
            tax_amount, total_amount, notes, terms_and_conditions,
            created_at, created_by
          )
          OUTPUT INSERTED.id
          VALUES (
            @companyId, @clientId, @assignedTo, @quoteNumber, @title,
            @description, @status, @quoteDate, @validUntil, @subtotal,
            @discountPercentage, @discountAmount, @taxPercentage,
            @taxAmount, @totalAmount, @notes, @termsAndConditions,
            GETDATE(), @createdBy
          )
        `);

      const quoteId = quoteResult.recordset[0].id;

      // Insert items
      for (const item of dto.items) {
        await transaction.request()
          .input('quoteId', sql.Int, quoteId)
          .input('productId', sql.Int, item.productId || null)
          .input('lineNumber', sql.Int, item.lineNumber)
          .input('description', sql.NVarChar, item.description)
          .input('quantity', sql.Decimal(10, 2), item.quantity)
          .input('unitPrice', sql.Decimal(18, 2), item.unitPrice)
          .input('discountPercentage', sql.Decimal(5, 2), item.discountPercentage || null)
          .input('discountAmount', sql.Decimal(18, 2), item.discountAmount || null)
          .input('taxPercentage', sql.Decimal(5, 2), item.taxPercentage || null)
          .input('taxAmount', sql.Decimal(18, 2), item.taxAmount || null)
          .input('lineTotal', sql.Decimal(18, 2), item.lineTotal)
          .input('notes', sql.NVarChar, item.notes || null)
          .query(`
            INSERT INTO [quote_item] (
              quote_id, product_id, line_number, description, quantity,
              unit_price, discount_percentage, discount_amount,
              tax_percentage, tax_amount, line_total, notes
            )
            VALUES (
              @quoteId, @productId, @lineNumber, @description, @quantity,
              @unitPrice, @discountPercentage, @discountAmount,
              @taxPercentage, @taxAmount, @lineTotal, @notes
            )
          `);
      }

      await transaction.commit();

      return this.findById(tenantId, quoteId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Find all quotes with filtering and pagination
   */
  async findAll(tenantId: number, filters: any = {}) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Build WHERE clause with parameterized queries
    const conditions: string[] = ['q.deleted_at IS NULL'];
    const request = pool.request();

    if (filters.status) {
      conditions.push('q.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.clientId) {
      conditions.push('q.client_id = @clientId');
      request.input('clientId', sql.Int, filters.clientId);
    }

    if (filters.assignedTo) {
      conditions.push('q.assigned_to = @assignedTo');
      request.input('assignedTo', sql.Int, filters.assignedTo);
    }

    if (filters.companyId) {
      conditions.push('q.company_id = @companyId');
      request.input('companyId', sql.Int, filters.companyId);
    }

    if (filters.startDate) {
      conditions.push('q.quote_date >= @startDate');
      request.input('startDate', sql.Date, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('q.quote_date <= @endDate');
      request.input('endDate', sql.Date, filters.endDate);
    }

    if (filters.minAmount) {
      conditions.push('q.total_amount >= @minAmount');
      request.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    }

    if (filters.maxAmount) {
      conditions.push('q.total_amount <= @maxAmount');
      request.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    }

    if (filters.expired === true || filters.expired === 'true') {
      conditions.push('q.valid_until < CAST(GETDATE() AS DATE)');
      conditions.push('q.status NOT IN (@acceptedStatus, @rejectedStatus, @convertedStatus)');
      request.input('acceptedStatus', sql.NVarChar, QuoteStatus.ACCEPTED);
      request.input('rejectedStatus', sql.NVarChar, QuoteStatus.REJECTED);
      request.input('convertedStatus', sql.NVarChar, QuoteStatus.CONVERTED);
    }

    if (filters.expiringIn) {
      const days = parseInt(filters.expiringIn);
      conditions.push('q.valid_until <= DATEADD(DAY, @days, CAST(GETDATE() AS DATE))');
      conditions.push('q.valid_until >= CAST(GETDATE() AS DATE)');
      conditions.push('q.status = @sentStatus');
      request.input('days', sql.Int, days);
      request.input('sentStatus', sql.NVarChar, QuoteStatus.SENT);
    }

    const whereClause = conditions.join(' AND ');

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [quote] q
      WHERE ${whereClause}
    `);

    // Get data
    const dataRequest = pool.request();

    // Re-add all parameters for data query
    if (filters.status) dataRequest.input('status', sql.NVarChar, filters.status);
    if (filters.clientId) dataRequest.input('clientId', sql.Int, filters.clientId);
    if (filters.assignedTo) dataRequest.input('assignedTo', sql.Int, filters.assignedTo);
    if (filters.companyId) dataRequest.input('companyId', sql.Int, filters.companyId);
    if (filters.startDate) dataRequest.input('startDate', sql.Date, filters.startDate);
    if (filters.endDate) dataRequest.input('endDate', sql.Date, filters.endDate);
    if (filters.minAmount) dataRequest.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    if (filters.maxAmount) dataRequest.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    if (filters.expired === true || filters.expired === 'true') {
      dataRequest.input('acceptedStatus', sql.NVarChar, QuoteStatus.ACCEPTED);
      dataRequest.input('rejectedStatus', sql.NVarChar, QuoteStatus.REJECTED);
      dataRequest.input('convertedStatus', sql.NVarChar, QuoteStatus.CONVERTED);
    }
    if (filters.expiringIn) {
      const days = parseInt(filters.expiringIn);
      dataRequest.input('days', sql.Int, days);
      dataRequest.input('sentStatus', sql.NVarChar, QuoteStatus.SENT);
    }

    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('pageSize', sql.Int, pageSize);

    const dataResult = await dataRequest.query(`
      SELECT
        q.*,
        c.full_name as client_name,
        u.full_name as assigned_to_name,
        cr.full_name as created_by_name,
        (SELECT COUNT(*) FROM quote_item WHERE quote_id = q.id) as items_count,
        CASE
          WHEN q.valid_until < CAST(GETDATE() AS DATE) AND q.status NOT IN ('accepted', 'rejected', 'converted')
          THEN 1
          ELSE 0
        END as is_expired
      FROM [quote] q
      LEFT JOIN [client] c ON q.client_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN [user] u ON q.assigned_to = u.id AND u.deleted_at IS NULL
      LEFT JOIN [user] cr ON q.created_by = cr.id AND cr.deleted_at IS NULL
      WHERE ${whereClause}
      ORDER BY q.quote_date DESC, q.id DESC
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
   * Find quote by ID
   */
  async findById(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          q.*,
          c.full_name as client_name,
          c.email as client_email,
          c.phone as client_phone,
          comp.name as company_name,
          u.full_name as assigned_to_name,
          cr.full_name as created_by_name,
          up.full_name as updated_by_name,
          ap.full_name as approved_by_name,
          CASE
            WHEN q.valid_until < CAST(GETDATE() AS DATE) AND q.status NOT IN ('accepted', 'rejected', 'converted')
            THEN 1
            ELSE 0
          END as is_expired,
          DATEDIFF(DAY, CAST(GETDATE() AS DATE), q.valid_until) as days_until_expiry
        FROM [quote] q
        LEFT JOIN [client] c ON q.client_id = c.id AND c.deleted_at IS NULL
        LEFT JOIN [company] comp ON q.company_id = comp.id AND comp.deleted_at IS NULL
        LEFT JOIN [user] u ON q.assigned_to = u.id AND u.deleted_at IS NULL
        LEFT JOIN [user] cr ON q.created_by = cr.id AND cr.deleted_at IS NULL
        LEFT JOIN [user] up ON q.updated_by = up.id AND up.deleted_at IS NULL
        LEFT JOIN [user] ap ON q.approved_by_id = ap.id AND ap.deleted_at IS NULL
        WHERE q.id = @id AND q.deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Quote not found');
    }

    const quoteData = result.recordset[0];

    // Get items
    const itemsResult = await pool.request()
      .input('quoteId', sql.Int, id)
      .query(`
        SELECT
          qi.*,
          p.name as product_name,
          p.code as product_code
        FROM [quote_item] qi
        LEFT JOIN [product] p ON qi.product_id = p.id AND p.deleted_at IS NULL
        WHERE qi.quote_id = @quoteId
        ORDER BY qi.line_number
      `);

    return {
      ...quoteData,
      items: itemsResult.recordset,
    };
  }

  /**
   * Find quote by number
   */
  async findByNumber(tenantId: number, quoteNumber: string) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('quoteNumber', sql.NVarChar, quoteNumber)
      .query(`SELECT id FROM [quote] WHERE quote_number = @quoteNumber AND deleted_at IS NULL`);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Quote not found');
    }

    return this.findById(tenantId, result.recordset[0].id);
  }

  /**
   * Update quote
   */
  async update(tenantId: number, id: number, dto: UpdateQuoteDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT id, status FROM [quote] WHERE id = @id AND deleted_at IS NULL`);

    if (checkResult.recordset.length === 0) {
      throw new NotFoundException('Quote not found');
    }

    const currentStatus = checkResult.recordset[0].status;

    // Cannot edit accepted, rejected, or converted quotes
    if ([QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.CONVERTED].includes(currentStatus)) {
      throw new BadRequestException(`Cannot edit quote with status: ${currentStatus}`);
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();

    if (dto.companyId !== undefined) {
      updates.push('company_id = @companyId');
      request.input('companyId', sql.Int, dto.companyId);
    }
    if (dto.clientId !== undefined) {
      updates.push('client_id = @clientId');
      request.input('clientId', sql.Int, dto.clientId);
    }
    if (dto.assignedTo !== undefined) {
      updates.push('assigned_to = @assignedTo');
      request.input('assignedTo', sql.Int, dto.assignedTo);
    }
    if (dto.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.quoteDate !== undefined) {
      updates.push('quote_date = @quoteDate');
      request.input('quoteDate', sql.Date, dto.quoteDate);
    }
    if (dto.validUntil !== undefined) {
      updates.push('valid_until = @validUntil');
      request.input('validUntil', sql.Date, dto.validUntil);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }
    if (dto.termsAndConditions !== undefined) {
      updates.push('terms_and_conditions = @termsAndConditions');
      request.input('termsAndConditions', sql.NVarChar, dto.termsAndConditions);
    }
    if (dto.discountPercentage !== undefined) {
      updates.push('discount_percentage = @discountPercentage');
      request.input('discountPercentage', sql.Decimal(5, 2), dto.discountPercentage);
    }
    if (dto.discountAmount !== undefined) {
      updates.push('discount_amount = @discountAmount');
      request.input('discountAmount', sql.Decimal(18, 2), dto.discountAmount);
    }
    if (dto.taxPercentage !== undefined) {
      updates.push('tax_percentage = @taxPercentage');
      request.input('taxPercentage', sql.Decimal(5, 2), dto.taxPercentage);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');
    updates.push('updated_by = @updatedBy');
    request.input('updatedBy', sql.Int, userId);
    request.input('id', sql.Int, id);

    await request.query(`
      UPDATE [quote]
      SET ${updates.join(', ')}
      WHERE id = @id AND deleted_at IS NULL
    `);

    return this.findById(tenantId, id);
  }

  /**
   * Delete quote (soft delete)
   */
  async delete(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [quote]
        SET deleted_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Quote not found');
    }

    return { success: true, message: 'Quote deleted successfully' };
  }

  /**
   * Send quote to client
   */
  async sendQuote(tenantId: number, id: number, dto: SendQuoteDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const quote = await this.findById(tenantId, id);

    if (quote.status === QuoteStatus.ACCEPTED || quote.status === QuoteStatus.REJECTED) {
      throw new BadRequestException('Cannot send quote that has been accepted or rejected');
    }

    // Update status to sent
    await pool.request()
      .input('id', sql.Int, id)
      .input('updatedBy', sql.Int, userId)
      .query(`
        UPDATE [quote]
        SET status = 'sent',
            updated_at = GETDATE(),
            updated_by = @updatedBy
        WHERE id = @id AND deleted_at IS NULL
      `);

    // TODO: Send email to client
    // This would integrate with an email service

    return this.findById(tenantId, id);
  }

  /**
   * Accept quote
   */
  async acceptQuote(tenantId: number, id: number, dto: AcceptQuoteDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const quote = await this.findById(tenantId, id);

    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Quote has already been accepted');
    }

    if (quote.status === QuoteStatus.REJECTED) {
      throw new BadRequestException('Cannot accept a rejected quote');
    }

    if (quote.is_expired) {
      throw new BadRequestException('Cannot accept an expired quote');
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('approvedBy', sql.Int, userId)
      .query(`
        UPDATE [quote]
        SET status = 'accepted',
            approved_at = GETDATE(),
            approved_by_id = @approvedBy,
            updated_at = GETDATE(),
            updated_by = @approvedBy
        WHERE id = @id AND deleted_at IS NULL
      `);

    return this.findById(tenantId, id);
  }

  /**
   * Reject quote
   */
  async rejectQuote(tenantId: number, id: number, dto: RejectQuoteDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const quote = await this.findById(tenantId, id);

    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot reject an accepted quote');
    }

    if (quote.status === QuoteStatus.REJECTED) {
      throw new BadRequestException('Quote has already been rejected');
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('rejectedReason', sql.NVarChar, dto.reason)
      .input('updatedBy', sql.Int, userId)
      .query(`
        UPDATE [quote]
        SET status = 'rejected',
            rejected_reason = @rejectedReason,
            updated_at = GETDATE(),
            updated_by = @updatedBy
        WHERE id = @id AND deleted_at IS NULL
      `);

    return this.findById(tenantId, id);
  }

  /**
   * Clone quote
   */
  async cloneQuote(tenantId: number, id: number, dto: CloneQuoteDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Get original quote with items
      const original = await this.findById(tenantId, id);

      // Generate new quote number
      const quoteNumber = await this.generateQuoteNumber(tenantId);

      // Prepare new title
      const newTitle = dto.newTitle || `${original.title} (Copy)`;

      // Prepare new valid until date
      const newValidUntil = dto.newValidUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Create new quote
      const quoteResult = await transaction.request()
        .input('companyId', sql.Int, original.company_id)
        .input('clientId', sql.Int, dto.newClientId || original.client_id)
        .input('assignedTo', sql.Int, original.assigned_to)
        .input('quoteNumber', sql.NVarChar, quoteNumber)
        .input('title', sql.NVarChar, newTitle)
        .input('description', sql.NVarChar, original.description)
        .input('status', sql.NVarChar, dto.asDraft !== false ? QuoteStatus.DRAFT : QuoteStatus.SENT)
        .input('quoteDate', sql.Date, new Date())
        .input('validUntil', sql.Date, newValidUntil)
        .input('subtotal', sql.Decimal(18, 2), original.subtotal)
        .input('discountPercentage', sql.Decimal(5, 2), original.discount_percentage)
        .input('discountAmount', sql.Decimal(18, 2), original.discount_amount)
        .input('taxPercentage', sql.Decimal(5, 2), original.tax_percentage)
        .input('taxAmount', sql.Decimal(18, 2), original.tax_amount)
        .input('totalAmount', sql.Decimal(18, 2), original.total_amount)
        .input('notes', sql.NVarChar, original.notes)
        .input('termsAndConditions', sql.NVarChar, original.terms_and_conditions)
        .input('createdBy', sql.Int, userId)
        .query(`
          INSERT INTO [quote] (
            company_id, client_id, assigned_to, quote_number, title,
            description, status, quote_date, valid_until, subtotal,
            discount_percentage, discount_amount, tax_percentage,
            tax_amount, total_amount, notes, terms_and_conditions,
            created_at, created_by
          )
          OUTPUT INSERTED.id
          VALUES (
            @companyId, @clientId, @assignedTo, @quoteNumber, @title,
            @description, @status, @quoteDate, @validUntil, @subtotal,
            @discountPercentage, @discountAmount, @taxPercentage,
            @taxAmount, @totalAmount, @notes, @termsAndConditions,
            GETDATE(), @createdBy
          )
        `);

      const newQuoteId = quoteResult.recordset[0].id;

      // Clone items
      for (const item of original.items) {
        await transaction.request()
          .input('quoteId', sql.Int, newQuoteId)
          .input('productId', sql.Int, item.product_id)
          .input('lineNumber', sql.Int, item.line_number)
          .input('description', sql.NVarChar, item.description)
          .input('quantity', sql.Decimal(10, 2), item.quantity)
          .input('unitPrice', sql.Decimal(18, 2), item.unit_price)
          .input('discountPercentage', sql.Decimal(5, 2), item.discount_percentage)
          .input('discountAmount', sql.Decimal(18, 2), item.discount_amount)
          .input('taxPercentage', sql.Decimal(5, 2), item.tax_percentage)
          .input('taxAmount', sql.Decimal(18, 2), item.tax_amount)
          .input('lineTotal', sql.Decimal(18, 2), item.line_total)
          .input('notes', sql.NVarChar, item.notes)
          .query(`
            INSERT INTO [quote_item] (
              quote_id, product_id, line_number, description, quantity,
              unit_price, discount_percentage, discount_amount,
              tax_percentage, tax_amount, line_total, notes
            )
            VALUES (
              @quoteId, @productId, @lineNumber, @description, @quantity,
              @unitPrice, @discountPercentage, @discountAmount,
              @taxPercentage, @taxAmount, @lineTotal, @notes
            )
          `);
      }

      await transaction.commit();

      return this.findById(tenantId, newQuoteId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get quote statistics
   */
  async getStats(tenantId: number, filters: any = {}): Promise<QuoteStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const conditions: string[] = ['deleted_at IS NULL'];
    const request = pool.request();

    if (filters.startDate) {
      conditions.push('quote_date >= @startDate');
      request.input('startDate', sql.Date, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('quote_date <= @endDate');
      request.input('endDate', sql.Date, filters.endDate);
    }

    if (filters.clientId) {
      conditions.push('client_id = @clientId');
      request.input('clientId', sql.Int, filters.clientId);
    }

    if (filters.assignedTo) {
      conditions.push('assigned_to = @assignedTo');
      request.input('assignedTo', sql.Int, filters.assignedTo);
    }

    const whereClause = conditions.join(' AND ');

    const result = await request.query(`
      SELECT
        COUNT(*) as total_quotes,
        ISNULL(SUM(total_amount), 0) as total_value,
        ISNULL(SUM(CASE WHEN status = 'accepted' THEN total_amount ELSE 0 END), 0) as accepted_value,
        ISNULL(SUM(CASE WHEN status = 'rejected' THEN total_amount ELSE 0 END), 0) as rejected_value,
        ISNULL(SUM(CASE WHEN status IN ('draft', 'sent', 'viewed') THEN total_amount ELSE 0 END), 0) as pending_value,
        ISNULL(SUM(CASE WHEN status = 'expired' OR (valid_until < CAST(GETDATE() AS DATE) AND status NOT IN ('accepted', 'rejected', 'converted')) THEN total_amount ELSE 0 END), 0) as expired_value,

        CASE
          WHEN COUNT(CASE WHEN status IN ('accepted', 'rejected') THEN 1 END) > 0
          THEN (CAST(COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS FLOAT) / COUNT(CASE WHEN status IN ('accepted', 'rejected') THEN 1 END)) * 100
          ELSE 0
        END as win_rate,

        CASE WHEN COUNT(*) > 0 THEN AVG(total_amount) ELSE 0 END as average_value,

        ISNULL(AVG(CASE WHEN status IN ('accepted', 'rejected') AND approved_at IS NOT NULL THEN DATEDIFF(DAY, quote_date, approved_at) END), 0) as average_time_to_close,

        COUNT(CASE WHEN valid_until < CAST(GETDATE() AS DATE) AND status NOT IN ('accepted', 'rejected', 'converted') THEN 1 END) as expired_count,

        -- By status
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        ISNULL(SUM(CASE WHEN status = 'draft' THEN total_amount ELSE 0 END), 0) as draft_total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        ISNULL(SUM(CASE WHEN status = 'sent' THEN total_amount ELSE 0 END), 0) as sent_total,
        COUNT(CASE WHEN status = 'viewed' THEN 1 END) as viewed_count,
        ISNULL(SUM(CASE WHEN status = 'viewed' THEN total_amount ELSE 0 END), 0) as viewed_total,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_status_count,
        ISNULL(SUM(CASE WHEN status = 'expired' THEN total_amount ELSE 0 END), 0) as expired_status_total,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count,
        ISNULL(SUM(CASE WHEN status = 'converted' THEN total_amount ELSE 0 END), 0) as converted_total
      FROM [quote]
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
        c.full_name as client_name,
        COUNT(q.id) as total_quotes,
        ISNULL(SUM(q.total_amount), 0) as total_value,
        COUNT(CASE WHEN q.status = 'accepted' THEN 1 END) as accepted_count,
        CASE
          WHEN COUNT(CASE WHEN q.status IN ('accepted', 'rejected') THEN 1 END) > 0
          THEN (CAST(COUNT(CASE WHEN q.status = 'accepted' THEN 1 END) AS FLOAT) / COUNT(CASE WHEN q.status IN ('accepted', 'rejected') THEN 1 END)) * 100
          ELSE 0
        END as win_rate
      FROM [quote] q
      INNER JOIN [client] c ON q.client_id = c.id AND c.deleted_at IS NULL
      WHERE ${whereClause}
      GROUP BY c.id, c.full_name
      ORDER BY total_value DESC
    `);

    return {
      totalQuotes: data.total_quotes,
      totalValue: parseFloat(data.total_value),
      acceptedValue: parseFloat(data.accepted_value),
      rejectedValue: parseFloat(data.rejected_value),
      pendingValue: parseFloat(data.pending_value),
      expiredValue: parseFloat(data.expired_value),
      winRate: parseFloat(data.win_rate),
      averageValue: parseFloat(data.average_value),
      averageTimeToClose: parseFloat(data.average_time_to_close),
      expiredCount: data.expired_count,
      byStatus: {
        draft: {
          count: data.draft_count,
          total: parseFloat(data.draft_total),
        },
        sent: {
          count: data.sent_count,
          total: parseFloat(data.sent_total),
        },
        viewed: {
          count: data.viewed_count,
          total: parseFloat(data.viewed_total),
        },
        accepted: {
          count: data.accepted_count,
          total: parseFloat(data.accepted_value),
        },
        rejected: {
          count: data.rejected_count,
          total: parseFloat(data.rejected_value),
        },
        expired: {
          count: data.expired_status_count,
          total: parseFloat(data.expired_status_total),
        },
        converted: {
          count: data.converted_count,
          total: parseFloat(data.converted_total),
        },
      },
      topClients: topClientsResult.recordset.map((row) => ({
        clientId: row.client_id,
        clientName: row.client_name,
        totalQuotes: row.total_quotes,
        totalValue: parseFloat(row.total_value),
        acceptedCount: row.accepted_count,
        winRate: parseFloat(row.win_rate),
      })),
    };
  }

  /**
   * Mark expired quotes
   */
  async markExpiredQuotes(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      UPDATE [quote]
      SET status = 'expired',
          updated_at = GETDATE()
      WHERE valid_until < CAST(GETDATE() AS DATE)
        AND status IN ('sent', 'viewed')
        AND deleted_at IS NULL
    `);

    return {
      success: true,
      message: `Marked ${result.rowsAffected[0]} quotes as expired`,
      count: result.rowsAffected[0],
    };
  }

  /**
   * Get expiring quotes (within X days)
   */
  async getExpiringQuotes(tenantId: number, days: number = 7) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('days', sql.Int, days)
      .query(`
        SELECT
          q.*,
          c.full_name as client_name,
          c.email as client_email,
          u.full_name as assigned_to_name,
          DATEDIFF(DAY, CAST(GETDATE() AS DATE), q.valid_until) as days_until_expiry
        FROM [quote] q
        LEFT JOIN [client] c ON q.client_id = c.id AND c.deleted_at IS NULL
        LEFT JOIN [user] u ON q.assigned_to = u.id AND u.deleted_at IS NULL
        WHERE q.valid_until <= DATEADD(DAY, @days, CAST(GETDATE() AS DATE))
          AND q.valid_until >= CAST(GETDATE() AS DATE)
          AND q.status IN ('sent', 'viewed')
          AND q.deleted_at IS NULL
        ORDER BY q.valid_until ASC
      `);

    return result.recordset;
  }
}
