import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import {
  CreateExpenseClaimDto,
  UpdateExpenseClaimDto,
  ApproveClaimDto,
  RejectClaimDto,
  ExpenseClaimFilterDto,
  CreateExpenseItemDto,
  UpdateExpenseItemDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ========================
  // Expense Claims - CRUD
  // ========================

  async listClaims(tenantId: number, filters: ExpenseClaimFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    let query = `
      SELECT
        ec.*,
        e.full_name as employee_name,
        e.email as employee_email,
        approver.full_name as approver_name,
        rejector.full_name as rejector_name
      FROM expense_claim ec
      LEFT JOIN employee e ON ec.employee_id = e.id
      LEFT JOIN [user] approver ON ec.approved_by = approver.id
      LEFT JOIN [user] rejector ON ec.rejected_by = rejector.id
      WHERE ec.deleted_at IS NULL
    `;

    const conditions: string[] = [];
    const request = pool.request();

    if (filters.employeeId) {
      conditions.push('ec.employee_id = @employeeId');
      request.input('employeeId', sql.Int, filters.employeeId);
    }

    if (filters.status) {
      conditions.push('ec.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.categoryId) {
      conditions.push('EXISTS (SELECT 1 FROM expense_item ei WHERE ei.expense_claim_id = ec.id AND ei.category_id = @categoryId)');
      request.input('categoryId', sql.Int, filters.categoryId);
    }

    if (filters.fromDate) {
      conditions.push('ec.expense_date >= @fromDate');
      request.input('fromDate', sql.Date, filters.fromDate);
    }

    if (filters.toDate) {
      conditions.push('ec.expense_date <= @toDate');
      request.input('toDate', sql.Date, filters.toDate);
    }

    if (filters.minAmount) {
      conditions.push('ec.total_amount >= @minAmount');
      request.input('minAmount', sql.Decimal(18, 2), filters.minAmount);
    }

    if (filters.maxAmount) {
      conditions.push('ec.total_amount <= @maxAmount');
      request.input('maxAmount', sql.Decimal(18, 2), filters.maxAmount);
    }

    if (filters.search) {
      conditions.push('(ec.title LIKE @search OR ec.description LIKE @search)');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ec.created_at DESC';

    const result = await request.query(query);
    return result.recordset;
  }

  async getClaimById(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          ec.*,
          e.full_name as employee_name,
          e.email as employee_email,
          approver.full_name as approver_name,
          rejector.full_name as rejector_name
        FROM expense_claim ec
        LEFT JOIN employee e ON ec.employee_id = e.id
        LEFT JOIN [user] approver ON ec.approved_by = approver.id
        LEFT JOIN [user] rejector ON ec.rejected_by = rejector.id
        WHERE ec.id = @id AND ec.deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Expense claim not found');
    }

    // Get items for this claim
    const items = await this.getClaimItems(tenantId, id);

    return {
      ...result.recordset[0],
      items,
    };
  }

  async createClaim(tenantId: number, dto: CreateExpenseClaimDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employeeId', sql.Int, dto.employeeId)
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('expenseDate', sql.Date, dto.expenseDate)
      .input('totalAmount', sql.Decimal(18, 2), dto.totalAmount)
      .input('status', sql.NVarChar, dto.status || 'draft')
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('attachments', sql.NVarChar, dto.attachments ? JSON.stringify(dto.attachments) : null)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO expense_claim (
          employee_id, title, description, expense_date, total_amount,
          status, notes, attachments, created_at, created_by
        )
        VALUES (
          @employeeId, @title, @description, @expenseDate, @totalAmount,
          @status, @notes, @attachments, GETDATE(), @userId
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    const claimId = result.recordset[0].id;

    // Create items if provided
    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        await this.addClaimItem(tenantId, claimId, item, userId);
      }
    }

    return {
      id: claimId,
      success: true,
      message: 'Expense claim created successfully'
    };
  }

  async updateClaim(
    tenantId: number,
    id: number,
    dto: UpdateExpenseClaimDto,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    await this.getClaimById(tenantId, id);

    const updates: string[] = [];
    const request = pool.request().input('id', sql.Int, id).input('userId', sql.Int, userId);

    if (dto.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }

    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.expenseDate !== undefined) {
      updates.push('expense_date = @expenseDate');
      request.input('expenseDate', sql.Date, dto.expenseDate);
    }

    if (dto.totalAmount !== undefined) {
      updates.push('total_amount = @totalAmount');
      request.input('totalAmount', sql.Decimal(18, 2), dto.totalAmount);
    }

    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }

    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (dto.attachments !== undefined) {
      updates.push('attachments = @attachments');
      request.input('attachments', sql.NVarChar, JSON.stringify(dto.attachments));
    }

    if (updates.length === 0) {
      return { success: true, message: 'No updates provided' };
    }

    updates.push('updated_at = GETDATE()');
    updates.push('updated_by = @userId');

    await request.query(`
      UPDATE expense_claim
      SET ${updates.join(', ')}
      WHERE id = @id AND deleted_at IS NULL
    `);

    return { success: true, message: 'Expense claim updated successfully' };
  }

  async deleteClaim(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    await this.getClaimById(tenantId, id);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE expense_claim
        SET deleted_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);
  }

  // ========================
  // Expense Claims - Actions
  // ========================

  async submitClaim(tenantId: number, id: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    const claim = await this.getClaimById(tenantId, id);

    if (claim.status !== 'draft') {
      throw new BadRequestException('Only draft claims can be submitted');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE expense_claim
        SET status = 'submitted', submitted_at = GETDATE(), updated_by = @userId, updated_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return { success: true, message: 'Expense claim submitted for approval' };
  }

  async approveClaim(
    tenantId: number,
    id: number,
    userId: number,
    dto: ApproveClaimDto,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    const claim = await this.getClaimById(tenantId, id);

    if (claim.status !== 'submitted') {
      throw new BadRequestException('Only submitted claims can be approved');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('approvalNotes', sql.NVarChar, dto.approvalNotes || null)
      .query(`
        UPDATE expense_claim
        SET
          status = 'approved',
          approved_by = @userId,
          approved_at = GETDATE(),
          notes = CASE
            WHEN @approvalNotes IS NOT NULL THEN CONCAT(COALESCE(notes, ''), CHAR(13) + CHAR(10) + 'Approval Notes: ' + @approvalNotes)
            ELSE notes
          END,
          updated_by = @userId,
          updated_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return { success: true, message: 'Expense claim approved successfully' };
  }

  async rejectClaim(
    tenantId: number,
    id: number,
    userId: number,
    dto: RejectClaimDto,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    const claim = await this.getClaimById(tenantId, id);

    if (claim.status !== 'submitted') {
      throw new BadRequestException('Only submitted claims can be rejected');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('rejectionReason', sql.NVarChar, dto.rejectionReason)
      .query(`
        UPDATE expense_claim
        SET
          status = 'rejected',
          rejected_by = @userId,
          rejected_at = GETDATE(),
          rejection_reason = @rejectionReason,
          updated_by = @userId,
          updated_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return { success: true, message: 'Expense claim rejected' };
  }

  async markAsPaid(
    tenantId: number,
    id: number,
    userId: number,
    paymentReference?: string,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    const claim = await this.getClaimById(tenantId, id);

    if (claim.status !== 'approved') {
      throw new BadRequestException('Only approved claims can be marked as paid');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('paymentReference', sql.NVarChar, paymentReference || null)
      .query(`
        UPDATE expense_claim
        SET
          status = 'paid',
          paid_at = GETDATE(),
          payment_reference = @paymentReference,
          updated_by = @userId,
          updated_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return { success: true, message: 'Expense claim marked as paid' };
  }

  async getStatistics(
    tenantId: number,
    filters: { employeeId?: number; fromDate?: string; toDate?: string },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const request = pool.request();

    let conditions = 'ec.deleted_at IS NULL';

    if (filters.employeeId) {
      conditions += ' AND ec.employee_id = @employeeId';
      request.input('employeeId', sql.Int, filters.employeeId);
    }

    if (filters.fromDate) {
      conditions += ' AND ec.expense_date >= @fromDate';
      request.input('fromDate', sql.Date, filters.fromDate);
    }

    if (filters.toDate) {
      conditions += ' AND ec.expense_date <= @toDate';
      request.input('toDate', sql.Date, filters.toDate);
    }

    // Overall statistics
    const statsResult = await request.query(`
      SELECT
        COUNT(*) as totalClaims,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        COALESCE(SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END), 0) as pendingClaims,
        COALESCE(SUM(CASE WHEN status = 'submitted' THEN total_amount ELSE 0 END), 0) as pendingAmount,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approvedClaims,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END), 0) as approvedAmount,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejectedClaims,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN total_amount ELSE 0 END), 0) as rejectedAmount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paidClaims,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paidAmount,
        COALESCE(AVG(total_amount), 0) as averageClaimAmount
      FROM expense_claim ec
      WHERE ${conditions}
    `);

    // By category
    const byCategoryResult = await pool.request().query(`
      SELECT
        ec2.id as categoryId,
        ec2.name as categoryName,
        COUNT(DISTINCT ei.expense_claim_id) as count,
        COALESCE(SUM(ei.amount), 0) as totalAmount
      FROM expense_category ec2
      LEFT JOIN expense_item ei ON ei.category_id = ec2.id
      WHERE ec2.deleted_at IS NULL
      GROUP BY ec2.id, ec2.name
      ORDER BY totalAmount DESC
    `);

    // By employee
    const byEmployeeResult = await pool.request().query(`
      SELECT
        e.id as employeeId,
        e.full_name as employeeName,
        COUNT(ec.id) as count,
        COALESCE(SUM(ec.total_amount), 0) as totalAmount
      FROM employee e
      LEFT JOIN expense_claim ec ON ec.employee_id = e.id AND ${conditions}
      WHERE e.deleted_at IS NULL
      GROUP BY e.id, e.full_name
      HAVING COUNT(ec.id) > 0
      ORDER BY totalAmount DESC
    `);

    // By status
    const byStatusResult = await request.query(`
      SELECT
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as totalAmount
      FROM expense_claim ec
      WHERE ${conditions}
      GROUP BY status
      ORDER BY count DESC
    `);

    // By month
    const byMonthResult = await request.query(`
      SELECT
        FORMAT(expense_date, 'yyyy-MM') as month,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as totalAmount
      FROM expense_claim ec
      WHERE ${conditions}
      GROUP BY FORMAT(expense_date, 'yyyy-MM')
      ORDER BY month DESC
    `);

    return {
      ...statsResult.recordset[0],
      byCategory: byCategoryResult.recordset,
      byEmployee: byEmployeeResult.recordset,
      byStatus: byStatusResult.recordset,
      byMonth: byMonthResult.recordset,
    };
  }

  // ========================
  // Expense Items
  // ========================

  async getClaimItems(tenantId: number, claimId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('claimId', sql.Int, claimId)
      .query(`
        SELECT
          ei.*,
          ec.name as category_name
        FROM expense_item ei
        LEFT JOIN expense_category ec ON ei.category_id = ec.id
        WHERE ei.expense_claim_id = @claimId
        ORDER BY ei.created_at ASC
      `);

    return result.recordset;
  }

  async addClaimItem(
    tenantId: number,
    claimId: number,
    dto: CreateExpenseItemDto,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    await this.getClaimById(tenantId, claimId);

    const result = await pool
      .request()
      .input('claimId', sql.Int, claimId)
      .input('categoryId', sql.Int, dto.categoryId)
      .input('description', sql.NVarChar, dto.description)
      .input('amount', sql.Decimal(18, 2), dto.amount)
      .input('expenseDate', sql.Date, dto.expenseDate)
      .input('receiptUrl', sql.NVarChar, dto.receiptUrl || null)
      .input('hasReceipt', sql.Bit, dto.hasReceipt || false)
      .input('notes', sql.NVarChar, dto.notes || null)
      .query(`
        INSERT INTO expense_item (
          expense_claim_id, category_id, description, amount, expense_date,
          receipt_url, has_receipt, notes, created_at
        )
        VALUES (
          @claimId, @categoryId, @description, @amount, @expenseDate,
          @receiptUrl, @hasReceipt, @notes, GETDATE()
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Expense item added successfully',
    };
  }

  async updateClaimItem(
    tenantId: number,
    claimId: number,
    itemId: number,
    dto: UpdateExpenseItemDto,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    await this.getClaimById(tenantId, claimId);

    const updates: string[] = [];
    const request = pool.request()
      .input('claimId', sql.Int, claimId)
      .input('itemId', sql.Int, itemId);

    if (dto.categoryId !== undefined) {
      updates.push('category_id = @categoryId');
      request.input('categoryId', sql.Int, dto.categoryId);
    }

    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.amount !== undefined) {
      updates.push('amount = @amount');
      request.input('amount', sql.Decimal(18, 2), dto.amount);
    }

    if (dto.expenseDate !== undefined) {
      updates.push('expense_date = @expenseDate');
      request.input('expenseDate', sql.Date, dto.expenseDate);
    }

    if (dto.receiptUrl !== undefined) {
      updates.push('receipt_url = @receiptUrl');
      request.input('receiptUrl', sql.NVarChar, dto.receiptUrl);
    }

    if (dto.hasReceipt !== undefined) {
      updates.push('has_receipt = @hasReceipt');
      request.input('hasReceipt', sql.Bit, dto.hasReceipt);
    }

    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (updates.length === 0) {
      return { success: true, message: 'No updates provided' };
    }

    updates.push('updated_at = GETDATE()');

    await request.query(`
      UPDATE expense_item
      SET ${updates.join(', ')}
      WHERE id = @itemId AND expense_claim_id = @claimId
    `);

    return { success: true, message: 'Expense item updated successfully' };
  }

  async deleteClaimItem(tenantId: number, claimId: number, itemId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if claim exists
    await this.getClaimById(tenantId, claimId);

    await pool
      .request()
      .input('claimId', sql.Int, claimId)
      .input('itemId', sql.Int, itemId)
      .query(`
        DELETE FROM expense_item
        WHERE id = @itemId AND expense_claim_id = @claimId
      `);
  }

  // ========================
  // Expense Categories
  // ========================

  async listCategories(tenantId: number, activeOnly?: boolean) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let query = 'SELECT * FROM expense_category WHERE deleted_at IS NULL';

    if (activeOnly) {
      query += ' AND is_active = 1';
    }

    query += ' ORDER BY name ASC';

    const result = await pool.request().query(query);
    return result.recordset;
  }

  async getCategoryById(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT * FROM expense_category
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Expense category not found');
    }

    return result.recordset[0];
  }

  async createCategory(tenantId: number, dto: CreateCategoryDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('requiresReceipt', sql.Bit, dto.requiresReceipt !== false)
      .input('maxAmount', sql.Decimal(18, 2), dto.maxAmount || null)
      .input('isActive', sql.Bit, dto.isActive !== false)
      .query(`
        INSERT INTO expense_category (
          name, description, icon, color, requires_receipt, max_amount, is_active, created_at
        )
        VALUES (
          @name, @description, @icon, @color, @requiresReceipt, @maxAmount, @isActive, GETDATE()
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Expense category created successfully',
    };
  }

  async updateCategory(tenantId: number, id: number, dto: UpdateCategoryDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if category exists
    await this.getCategoryById(tenantId, id);

    const updates: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (dto.name !== undefined) {
      updates.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }

    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.icon !== undefined) {
      updates.push('icon = @icon');
      request.input('icon', sql.NVarChar, dto.icon);
    }

    if (dto.color !== undefined) {
      updates.push('color = @color');
      request.input('color', sql.NVarChar, dto.color);
    }

    if (dto.requiresReceipt !== undefined) {
      updates.push('requires_receipt = @requiresReceipt');
      request.input('requiresReceipt', sql.Bit, dto.requiresReceipt);
    }

    if (dto.maxAmount !== undefined) {
      updates.push('max_amount = @maxAmount');
      request.input('maxAmount', sql.Decimal(18, 2), dto.maxAmount);
    }

    if (dto.isActive !== undefined) {
      updates.push('is_active = @isActive');
      request.input('isActive', sql.Bit, dto.isActive);
    }

    if (updates.length === 0) {
      return { success: true, message: 'No updates provided' };
    }

    updates.push('updated_at = GETDATE()');

    await request.query(`
      UPDATE expense_category
      SET ${updates.join(', ')}
      WHERE id = @id AND deleted_at IS NULL
    `);

    return { success: true, message: 'Expense category updated successfully' };
  }

  async deleteCategory(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if category exists
    await this.getCategoryById(tenantId, id);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE expense_category
        SET deleted_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);
  }
}
