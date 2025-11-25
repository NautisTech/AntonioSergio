import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto, LoseLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== LEADS CRUD ====================

  /**
   * Create a new lead
   */
  async create(tenantId: number, dto: CreateLeadDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // If companyId is provided, verify it exists
    if (dto.companyId) {
      const companyCheck = await pool
        .request()
        .input('companyId', sql.Int, dto.companyId)
        .query(`SELECT id FROM [company] WHERE id = @companyId AND deleted_at IS NULL`);

      if (companyCheck.recordset.length === 0) {
        throw new NotFoundException('Company not found');
      }
    }

    // If assignedTo is provided, verify user exists
    if (dto.assignedTo) {
      const userCheck = await pool
        .request()
        .input('assignedTo', sql.Int, dto.assignedTo)
        .query(`SELECT id FROM [user] WHERE id = @assignedTo AND deleted_at IS NULL`);

      if (userCheck.recordset.length === 0) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const result = await pool
      .request()
      .input('title', sql.NVarChar, dto.title)
      .input('fullName', sql.NVarChar, dto.fullName)
      .input('email', sql.NVarChar, dto.email || null)
      .input('phone', sql.NVarChar, dto.phone || null)
      .input('companyName', sql.NVarChar, dto.companyName || null)
      .input('jobTitle', sql.NVarChar, dto.jobTitle || null)
      .input('source', sql.NVarChar, dto.source || null)
      .input('status', sql.NVarChar, dto.status || 'new')
      .input('estimatedValue', sql.Decimal(18, 2), dto.estimatedValue || null)
      .input('probability', sql.Int, dto.probability || null)
      .input('expectedCloseDate', sql.Date, dto.expectedCloseDate || null)
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('companyId', sql.Int, dto.companyId || null)
      .input('assignedTo', sql.Int, dto.assignedTo || null)
      .query(`
        INSERT INTO [lead] (
          title, full_name, email, phone, company_name, job_title,
          source, status, estimated_value, probability, expected_close_date,
          notes, company_id, assigned_to, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @fullName, @email, @phone, @companyName, @jobTitle,
          @source, @status, @estimatedValue, @probability, @expectedCloseDate,
          @notes, @companyId, @assignedTo, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Lead created successfully',
    };
  }

  /**
   * Find all leads with optional filtering and pagination
   */
  async findAll(
    tenantId: number,
    filters: {
      status?: string;
      source?: string;
      assignedTo?: number;
      companyId?: number;
      searchText?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let whereClause = 'WHERE l.deleted_at IS NULL';
    const conditions: string[] = [];

    if (filters.status) {
      conditions.push('l.status = @status');
    }

    if (filters.source) {
      conditions.push('l.source = @source');
    }

    if (filters.assignedTo) {
      conditions.push('l.assigned_to = @assignedTo');
    }

    if (filters.companyId) {
      conditions.push('l.company_id = @companyId');
    }

    if (filters.searchText) {
      conditions.push(
        '(l.full_name LIKE @searchText OR l.email LIKE @searchText OR l.company_name LIKE @searchText OR l.title LIKE @searchText)',
      );
    }

    if (conditions.length > 0) {
      whereClause += ' AND ' + conditions.join(' AND ');
    }

    // Without pagination
    if (!filters.page || !filters.pageSize) {
      const request = pool.request();

      if (filters.status) request.input('status', sql.NVarChar, filters.status);
      if (filters.source) request.input('source', sql.NVarChar, filters.source);
      if (filters.assignedTo) request.input('assignedTo', sql.Int, filters.assignedTo);
      if (filters.companyId) request.input('companyId', sql.Int, filters.companyId);
      if (filters.searchText)
        request.input('searchText', sql.NVarChar, `%${filters.searchText}%`);

      const result = await request.query(`
        SELECT
          l.*,
          u.full_name as assigned_to_name,
          c.name as company_name_ref,
          cl.name as converted_to_client_name
        FROM [lead] l
        LEFT JOIN [user] u ON l.assigned_to = u.id AND u.deleted_at IS NULL
        LEFT JOIN [company] c ON l.company_id = c.id AND c.deleted_at IS NULL
        LEFT JOIN [client] cl ON l.converted_to_client_id = cl.id AND cl.deleted_at IS NULL
        ${whereClause}
        ORDER BY l.created_at DESC
      `);

      return result.recordset;
    }

    // With pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const countRequest = pool.request();
    if (filters.status) countRequest.input('status', sql.NVarChar, filters.status);
    if (filters.source) countRequest.input('source', sql.NVarChar, filters.source);
    if (filters.assignedTo) countRequest.input('assignedTo', sql.Int, filters.assignedTo);
    if (filters.companyId) countRequest.input('companyId', sql.Int, filters.companyId);
    if (filters.searchText)
      countRequest.input('searchText', sql.NVarChar, `%${filters.searchText}%`);

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM [lead] l ${whereClause}
    `);

    const dataRequest = pool.request();
    if (filters.status) dataRequest.input('status', sql.NVarChar, filters.status);
    if (filters.source) dataRequest.input('source', sql.NVarChar, filters.source);
    if (filters.assignedTo) dataRequest.input('assignedTo', sql.Int, filters.assignedTo);
    if (filters.companyId) dataRequest.input('companyId', sql.Int, filters.companyId);
    if (filters.searchText)
      dataRequest.input('searchText', sql.NVarChar, `%${filters.searchText}%`);

    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('pageSize', sql.Int, pageSize);

    const dataResult = await dataRequest.query(`
      SELECT
        l.*,
        u.full_name as assigned_to_name,
        c.name as company_name_ref,
        cl.name as converted_to_client_name
      FROM [lead] l
      LEFT JOIN [user] u ON l.assigned_to = u.id AND u.deleted_at IS NULL
      LEFT JOIN [company] c ON l.company_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN [client] cl ON l.converted_to_client_id = cl.id AND cl.deleted_at IS NULL
      ${whereClause}
      ORDER BY l.created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset,
      total: countResult.recordset[0].total,
      page,
      pageSize,
      totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
    };
  }

  /**
   * Find a lead by ID
   */
  async findOne(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        l.*,
        u.full_name as assigned_to_name,
        c.name as company_name_ref,
        cl.name as converted_to_client_name
      FROM [lead] l
      LEFT JOIN [user] u ON l.assigned_to = u.id AND u.deleted_at IS NULL
      LEFT JOIN [company] c ON l.company_id = c.id AND c.deleted_at IS NULL
      LEFT JOIN [client] cl ON l.converted_to_client_id = cl.id AND cl.deleted_at IS NULL
      WHERE l.id = @id AND l.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Lead not found');
    }

    return result.recordset[0];
  }

  /**
   * Update a lead
   */
  async update(tenantId: number, id: number, dto: UpdateLeadDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if lead exists and get current status
    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id, status FROM [lead] WHERE id = @id AND deleted_at IS NULL`);

    if (existing.recordset.length === 0) {
      throw new NotFoundException('Lead not found');
    }

    // Don't allow updating converted or lost leads
    const currentStatus = existing.recordset[0].status;
    if (currentStatus === 'converted' || currentStatus === 'lost') {
      throw new BadRequestException(
        `Cannot update a ${currentStatus} lead. Use convert or lose endpoints instead.`,
      );
    }

    // If updating companyId, verify it exists
    if (dto.companyId) {
      const companyCheck = await pool
        .request()
        .input('companyId', sql.Int, dto.companyId)
        .query(`SELECT id FROM [company] WHERE id = @companyId AND deleted_at IS NULL`);

      if (companyCheck.recordset.length === 0) {
        throw new NotFoundException('Company not found');
      }
    }

    // If updating assignedTo, verify user exists
    if (dto.assignedTo) {
      const userCheck = await pool
        .request()
        .input('assignedTo', sql.Int, dto.assignedTo)
        .query(`SELECT id FROM [user] WHERE id = @assignedTo AND deleted_at IS NULL`);

      if (userCheck.recordset.length === 0) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const request = pool.request();

    if (dto.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }
    if (dto.fullName !== undefined) {
      updates.push('full_name = @fullName');
      request.input('fullName', sql.NVarChar, dto.fullName);
    }
    if (dto.email !== undefined) {
      updates.push('email = @email');
      request.input('email', sql.NVarChar, dto.email);
    }
    if (dto.phone !== undefined) {
      updates.push('phone = @phone');
      request.input('phone', sql.NVarChar, dto.phone);
    }
    if (dto.companyName !== undefined) {
      updates.push('company_name = @companyName');
      request.input('companyName', sql.NVarChar, dto.companyName);
    }
    if (dto.jobTitle !== undefined) {
      updates.push('job_title = @jobTitle');
      request.input('jobTitle', sql.NVarChar, dto.jobTitle);
    }
    if (dto.source !== undefined) {
      updates.push('source = @source');
      request.input('source', sql.NVarChar, dto.source);
    }
    if (dto.status !== undefined) {
      // Don't allow setting to converted or lost via update
      if (dto.status === 'converted' || dto.status === 'lost') {
        throw new BadRequestException(
          'Use convert or lose endpoints to change lead to this status',
        );
      }
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.estimatedValue !== undefined) {
      updates.push('estimated_value = @estimatedValue');
      request.input('estimatedValue', sql.Decimal(18, 2), dto.estimatedValue);
    }
    if (dto.probability !== undefined) {
      updates.push('probability = @probability');
      request.input('probability', sql.Int, dto.probability);
    }
    if (dto.expectedCloseDate !== undefined) {
      updates.push('expected_close_date = @expectedCloseDate');
      request.input('expectedCloseDate', sql.Date, dto.expectedCloseDate);
    }
    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }
    if (dto.companyId !== undefined) {
      updates.push('company_id = @companyId');
      request.input('companyId', sql.Int, dto.companyId);
    }
    if (dto.assignedTo !== undefined) {
      updates.push('assigned_to = @assignedTo');
      request.input('assignedTo', sql.Int, dto.assignedTo);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updated_at = GETDATE()');

    request.input('id', sql.Int, id);

    await request.query(`
      UPDATE [lead]
      SET ${updates.join(', ')}
      WHERE id = @id
    `);

    return {
      success: true,
      message: 'Lead updated successfully',
    };
  }

  /**
   * Soft delete a lead
   */
  async remove(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      UPDATE [lead]
      SET deleted_at = GETDATE()
      WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Lead not found');
    }

    return {
      success: true,
      message: 'Lead deleted successfully',
    };
  }

  /**
   * Convert a lead to a client
   */
  async convert(tenantId: number, id: number, dto: ConvertLeadDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if lead exists and is not already converted
    const leadCheck = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id, status FROM [lead] WHERE id = @id AND deleted_at IS NULL`);

    if (leadCheck.recordset.length === 0) {
      throw new NotFoundException('Lead not found');
    }

    if (leadCheck.recordset[0].status === 'converted') {
      throw new BadRequestException('Lead is already converted');
    }

    // Verify client exists
    const clientCheck = await pool
      .request()
      .input('clientId', sql.Int, dto.convertedToClientId)
      .query(`SELECT id FROM [client] WHERE id = @clientId AND deleted_at IS NULL`);

    if (clientCheck.recordset.length === 0) {
      throw new NotFoundException('Client not found');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('clientId', sql.Int, dto.convertedToClientId)
      .query(`
        UPDATE [lead]
        SET status = 'converted',
            converted_to_client_id = @clientId,
            converted_at = GETDATE(),
            updated_at = GETDATE()
        WHERE id = @id
      `);

    return {
      success: true,
      message: 'Lead converted successfully',
    };
  }

  /**
   * Mark a lead as lost
   */
  async lose(tenantId: number, id: number, dto: LoseLeadDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if lead exists
    const leadCheck = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id, status FROM [lead] WHERE id = @id AND deleted_at IS NULL`);

    if (leadCheck.recordset.length === 0) {
      throw new NotFoundException('Lead not found');
    }

    if (leadCheck.recordset[0].status === 'lost') {
      throw new BadRequestException('Lead is already marked as lost');
    }

    if (leadCheck.recordset[0].status === 'converted') {
      throw new BadRequestException('Cannot mark a converted lead as lost');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('lostReason', sql.NVarChar, dto.lostReason)
      .query(`
        UPDATE [lead]
        SET status = 'lost',
            lost_reason = @lostReason,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    return {
      success: true,
      message: 'Lead marked as lost',
    };
  }

  /**
   * Get lead statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as totalLeads,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as newLeads,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contactedLeads,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualifiedLeads,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as convertedLeads,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lostLeads,
        CASE
          WHEN COUNT(*) > 0 THEN
            CAST(SUM(CASE WHEN status = 'converted' THEN 1.0 ELSE 0 END) * 100 / COUNT(*) AS DECIMAL(5,2))
          ELSE 0
        END as conversionRate,
        SUM(CASE WHEN MONTH(created_at) = MONTH(GETDATE()) AND YEAR(created_at) = YEAR(GETDATE()) THEN 1 ELSE 0 END) as leadsThisMonth,
        ISNULL(SUM(estimated_value), 0) as totalEstimatedValue
      FROM [lead]
      WHERE deleted_at IS NULL
    `);

    return result.recordset[0];
  }

  /**
   * Create lead from public form
   */
  async createPublic(tenantId: number, dto: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Default client is CLI001 (id: 1), which has company_id = 1
    const defaultClientId = 1;
    const defaultCompanyId = 1;

    // Verify default client exists and get company_id
    const clientCheck = await pool
      .request()
      .input('clientId', sql.Int, defaultClientId)
      .query(`
        SELECT id, company_id FROM [client]
        WHERE id = @clientId AND deleted_at IS NULL
      `);

    if (clientCheck.recordset.length === 0) {
      throw new Error(
        'Default client (CLI001) not found. Please contact administrator.',
      );
    }

    const companyId = clientCheck.recordset[0].company_id || defaultCompanyId;

    // Build notes from DTO
    const notes: string[] = [];
    if (dto.address) notes.push(`Address: ${dto.address}`);
    if (dto.location) notes.push(`Location: ${dto.location}`);
    if (dto.postalCode) notes.push(`Postal Code: ${dto.postalCode}`);
    if (dto.district) notes.push(`District: ${dto.district}`);
    if (dto.country) notes.push(`Country: ${dto.country}`);
    if (dto.need) notes.push(`Need: ${dto.need}`);
    if (dto.source) notes.push(`Source: ${dto.source}`);

    const notesText = notes.length > 0 ? notes.join('\n') : null;

    // Create the lead with default values for public submissions
    const result = await pool
      .request()
      .input('title', sql.NVarChar, `Support request from ${dto.fullName}`)
      .input('fullName', sql.NVarChar, dto.fullName)
      .input('email', sql.NVarChar, dto.email)
      .input('phone', sql.NVarChar, dto.phone || dto.mobile || null)
      .input('companyName', sql.NVarChar, dto.companyName || null)
      .input('jobTitle', sql.NVarChar, dto.jobTitle || null)
      .input('source', sql.NVarChar, dto.source || 'website')
      .input('status', sql.NVarChar, 'new')
      .input('companyId', sql.Int, companyId)
      .input('notes', sql.NVarChar, notesText)
      .query(`
        INSERT INTO [lead] (
          title, full_name, email, phone, company_name, job_title,
          source, status, company_id, notes, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @fullName, @email, @phone, @companyName, @jobTitle,
          @source, @status, @companyId, @notes, GETDATE()
        )
      `);

    return {
      id: result.recordset[0].id,
      success: true,
      message: 'Lead created successfully',
    };
  }
}
