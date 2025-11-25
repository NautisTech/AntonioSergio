import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  CloseTicketDto,
  ReopenTicketDto,
  AddTicketCommentDto,
  RateTicketDto,
  TicketFilterDto,
  TicketStatus,
  TicketPriority,
  SLAStatus,
  ActivityType,
} from './dto';
import * as sql from 'mssql';

/**
 * Ticket Service
 * Comprehensive ticket management with SLA tracking and activity logging
 */
@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Calculate SLA status and remaining time
   */
  private calculateSLA(ticket: any): any {
    if (!ticket.sla_hours || !ticket.opened_at || ticket.completed_at) {
      return ticket;
    }

    const now = new Date();
    const openedAt = new Date(ticket.opened_at);
    const slaDeadline = new Date(
      openedAt.getTime() + ticket.sla_hours * 60 * 60 * 1000,
    );

    const timeRemainingMs = slaDeadline.getTime() - now.getTime();
    const timeRemainingMinutes = Math.floor(timeRemainingMs / (1000 * 60));
    const totalTimeMinutes = ticket.sla_hours * 60;
    const percentageRemaining = (timeRemainingMinutes / totalTimeMinutes) * 100;

    let slaStatus: SLAStatus = SLAStatus.OK;
    if (timeRemainingMinutes < 0) {
      slaStatus = SLAStatus.BREACHED;
    } else if (percentageRemaining < 10) {
      slaStatus = SLAStatus.CRITICAL;
    } else if (percentageRemaining < 25) {
      slaStatus = SLAStatus.WARNING;
    }

    return {
      ...ticket,
      sla_deadline: slaDeadline.toISOString(),
      sla_status: slaStatus,
      sla_time_remaining_minutes: timeRemainingMinutes,
      sla_percentage_remaining: percentageRemaining,
      sla_is_breached: timeRemainingMinutes < 0,
    };
  }

  /**
   * Generate unique ticket number
   */
  async generateTicketNumber(pool: any): Promise<string> {
    const result = await pool
      .request()
      .query('SELECT COUNT(*) as total FROM [ticket]');
    const count = result.recordset[0].total + 1;
    return `TKT${String(count).padStart(6, '0')}`;
  }

  /**
   * Generate unique public access code
   */
  async generateUniqueCode(pool: any): Promise<string> {
    let attempts = 0;
    let code: string;

    do {
      code = Math.random().toString(36).substring(2, 12).toUpperCase();
      const exists = await pool
        .request()
        .input('code', sql.NVarChar, code)
        .query('SELECT 1 FROM [ticket] WHERE unique_code = @code');

      if (exists.recordset.length === 0) break;
      attempts++;
    } while (attempts < 10);

    return code;
  }

  /**
   * Get default public user for ticket creation
   * Priority:
   * 1. Search for user with full_name 'Utilizador Geral'
   * 2. Use user with id 1 (general company user)
   */
  async getOrCreatePublicUser(pool: any, clientId?: number): Promise<number> {
    // 1. Search for 'Utilizador Geral'
    const generalUser = await pool.request().query(`
      SELECT id FROM [user]
      WHERE full_name = 'Utilizador Geral' AND deleted_at IS NULL
    `);

    if (generalUser.recordset.length > 0) {
      return generalUser.recordset[0].id;
    }

    // 2. Use user with id 1 (general company user)
    const fallbackUser = await pool.request().input('userId', sql.Int, 1)
      .query(`
        SELECT id FROM [user]
        WHERE id = @userId AND deleted_at IS NULL
      `);

    if (fallbackUser.recordset.length > 0) {
      return 1;
    }

    // If all else fails, throw an error
    throw new Error('No default user found for ticket creation');
  }

  /**
   * Create ticket
   */
  async create(dto: CreateTicketDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const ticketNumber = await this.generateTicketNumber(pool);
    const uniqueCode = await this.generateUniqueCode(pool);

    const result = await pool
      .request()
      .input('client_id', sql.Int, dto.clientId || null)
      .input('ticket_number', sql.NVarChar, ticketNumber)
      .input('ticket_type_id', sql.Int, dto.ticketTypeId)
      .input('equipment_id', sql.Int, dto.equipmentId || null)
      .input(
        'equipment_serial',
        sql.NVarChar,
        dto.equipmentSerialNumber || null,
      )
      .input(
        'equipment_description',
        sql.NVarChar,
        dto.equipmentDescription || null,
      )
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description)
      .input('priority', sql.NVarChar, dto.priority)
      .input('status', sql.NVarChar, dto.status || TicketStatus.OPEN)
      .input('requester_id', sql.Int, dto.requesterId)
      .input('assigned_id', sql.Int, dto.assignedToId || null)
      .input('location', sql.NVarChar, dto.location || null)
      .input(
        'expected_at',
        sql.DateTime,
        dto.expectedDate ? new Date(dto.expectedDate) : null,
      )
      .input('unique_code', sql.NVarChar, uniqueCode).query(`
        INSERT INTO [ticket] (
          client_id, ticket_number, ticket_type_id, equipment_id, equipment_serial, equipment_description,
          title, description, priority, status, requester_id, assigned_id, location,
          unique_code, opened_at, expected_at, created_at, updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @client_id, @ticket_number, @ticket_type_id, @equipment_id, @equipment_serial, @equipment_description,
          @title, @description, @priority, @status, @requester_id, @assigned_id, @location,
          @unique_code, GETDATE(), @expected_at, GETDATE(), GETDATE()
        )
      `);

    const ticketId = result.recordset[0].id;

    // Log activity
    await this.logActivity(
      ticketId,
      ActivityType.CREATED,
      userId,
      null,
      {
        created_by: dto.requesterId,
        assigned_to: dto.assignedToId,
      },
      tenantId,
    );

    this.logger.log(`Ticket created: ${ticketNumber} (ID: ${ticketId})`);
    return this.getById(ticketId, tenantId);
  }

  /**
   * List tickets with filters and pagination
   */
  async list(tenantId: number, filters?: TicketFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const request = pool.request();

    const conditions: string[] = [];

    if (filters?.ticketTypeId) {
      conditions.push('t.ticket_type_id = @ticketTypeId');
      request.input('ticketTypeId', sql.Int, filters.ticketTypeId);
    }

    if (filters?.clientId) {
      conditions.push('t.client_id = @clientId');
      request.input('clientId', sql.Int, filters.clientId);
    }

    if (filters?.status) {
      conditions.push('t.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters?.priority) {
      conditions.push('t.priority = @priority');
      request.input('priority', sql.NVarChar, filters.priority);
    }

    if (filters?.assignedToId) {
      conditions.push('t.assigned_id = @assignedToId');
      request.input('assignedToId', sql.Int, filters.assignedToId);
    }

    if (filters?.requesterId) {
      conditions.push('t.requester_id = @requesterId');
      request.input('requesterId', sql.Int, filters.requesterId);
    }

    if (filters?.equipmentId) {
      conditions.push('t.equipment_id = @equipmentId');
      request.input('equipmentId', sql.Int, filters.equipmentId);
    }

    if (filters?.search) {
      conditions.push(
        '(t.ticket_number LIKE @search OR t.title LIKE @search OR t.description LIKE @search)',
      );
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (filters?.overdueOnly) {
      conditions.push(
        't.expected_at < GETDATE() AND t.status NOT IN (@resolvedStatus, @closedStatus)',
      );
      request.input('resolvedStatus', sql.NVarChar, TicketStatus.RESOLVED);
      request.input('closedStatus', sql.NVarChar, TicketStatus.CLOSED);
    }

    const whereClause =
      conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      t.id,
      t.ticket_number AS ticket_number,
      t.unique_code AS unique_code,
      t.ticket_type_id AS ticket_type_id,
      tt.name AS ticket_type_name,
      tt.sla_hours,
      tt.icon AS ticket_type_icon,
      tt.color AS ticket_type_color,
      t.client_id AS client_id,
      c.name AS client_name,
      t.equipment_id AS equipment_id,
      e.internal_number AS equipment_internal_number,
      e.serial_number AS equipment_serial_number,
      t.equipment_serial AS equipment_sn,
      t.equipment_description AS equipment_description,
      t.title AS title,
      t.description AS description,
      t.priority AS priority,
      t.status,
      t.requester_id AS requester_id,
      req.full_name AS requester_name,
      req.email AS requester_email,
      t.assigned_id AS assigned_to_id,
      atr.full_name AS assigned_to_name,
      atr.avatar_url AS assigned_to_photo,
      t.location AS location,
      t.opened_at AS opened_at,
      t.expected_at AS expected_date,
      t.completed_at AS closed_at,
      t.resolution_time_minutes AS resolution,
      t.rating AS rating,
      t.rating_comment AS rating_feedback,
      t.created_at AS created_at,
      t.updated_at AS updated_at,
      DATEDIFF(HOUR, t.opened_at, COALESCE(t.completed_at, GETDATE())) AS age_hours,
      (SELECT COUNT(*) FROM [intervention] WHERE ticket_id = t.id) AS intervention_count,
      (SELECT COUNT(*) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'comment_added') AS comment_count
    `;

    const fromClause = `
      FROM [ticket] t
      INNER JOIN [ticket_type] tt ON t.ticket_type_id = tt.id
      LEFT JOIN [client] c ON t.client_id = c.id
      LEFT JOIN [user] req ON t.requester_id = req.id
      LEFT JOIN [user] atr ON t.assigned_id = atr.id
      LEFT JOIN [equipment] e ON t.equipment_id = e.id
    `;

    const orderBy = ' ORDER BY t.opened_at DESC';

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const query = `SELECT ${selectFields} ${fromClause} ${whereClause} ${orderBy}`;
      const result = await request.query(query);
      return result.recordset.map((r) => this.parseTicket(r));
    }

    // With pagination
    const page = filters.page;
    const pageSize = filters.pageSize;
    const offset = (page - 1) * pageSize;

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    // Count total
    const countQuery = `SELECT COUNT(*) as total ${fromClause} ${whereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Fetch paginated data
    const dataQuery = `
      SELECT ${selectFields}
      ${fromClause}
      ${whereClause}
      ${orderBy}
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    const dataResult = await request.query(dataQuery);

    return {
      data: dataResult.recordset.map((r) => this.parseTicket(r)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get ticket by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        t.id,
        t.ticket_number AS ticket_number,
        t.unique_code AS unique_code,
        t.ticket_type_id AS ticket_type_id,
        tt.name AS ticket_type_name,
        tt.description AS ticket_type_description,
        tt.sla_hours,
        tt.icon AS ticket_type_icon,
        tt.color AS ticket_type_color,
        t.client_id AS client_id,
        c.name AS client_name,
        (SELECT TOP 1 contact_value FROM [contact] WHERE entity_type = 'client' AND entity_id = t.client_id AND contact_type = 'email' AND deleted_at IS NULL ORDER BY is_primary DESC) AS client_email,
        t.equipment_id AS equipment_id,
        e.serial_number AS equipment_serial_number,
        e.internal_number AS equipment_internal_number,
        e.description AS equipment_full_description,
        t.equipment_serial AS equipment_sn,
        t.equipment_description AS equipment_description,
        t.title AS title,
        t.description AS description,
        t.priority AS priority,
        t.status,
        t.requester_id AS requester_id,
        req.full_name AS requester_name,
        req.email AS requester_email,
        req.avatar_url AS requester_photo,
        t.assigned_id AS assigned_to_id,
        atr.full_name AS assigned_to_name,
        atr.email AS assigned_to_email,
        atr.avatar_url AS assigned_to_photo,
        t.location AS location,
        t.opened_at AS opened_at,
        t.expected_at AS expected_date,
        t.completed_at AS closed_at,
        t.resolution_time_minutes AS resolution,
        t.rating AS rating,
        t.rating_comment AS rating_feedback,
        t.created_at AS created_at,
        t.updated_at AS updated_at,
        DATEDIFF(HOUR, t.opened_at, COALESCE(t.completed_at, GETDATE())) AS age_hours
      FROM [ticket] t
      INNER JOIN [ticket_type] tt ON t.ticket_type_id = tt.id
      LEFT JOIN [client] c ON t.client_id = c.id
      LEFT JOIN [user] req ON t.requester_id = req.id
      LEFT JOIN [user] atr ON t.assigned_id = atr.id
      LEFT JOIN [equipment] e ON t.equipment_id = e.id
      WHERE t.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return this.parseTicket(result.recordset[0]);
  }

  /**
   * Update ticket
   */
  async update(
    id: number,
    dto: UpdateTicketDto,
    tenantId: number,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get current ticket
    const current = await this.getById(id, tenantId);

    const updates: string[] = [];
    const changes: any = {};

    if (dto.title !== undefined) {
      updates.push('title = @title');
      if (dto.title !== current.title)
        changes.title = { from: current.title, to: dto.title };
    }

    if (dto.description !== undefined) {
      updates.push('description = @description');
    }

    if (dto.priority !== undefined) {
      updates.push('priority = @priority');
      if (dto.priority !== current.priority)
        changes.priority = { from: current.priority, to: dto.priority };
    }

    if (dto.status !== undefined) {
      updates.push('status = @status');
      if (dto.status !== current.status) {
        changes.status = { from: current.status, to: dto.status };
        if (
          dto.status === TicketStatus.CLOSED ||
          dto.status === TicketStatus.RESOLVED
        ) {
          updates.push('completed_at = GETDATE()');
        }
      }
    }

    if (dto.assignedToId !== undefined) {
      updates.push('assigned_id = @assignedToId');
      if (dto.assignedToId !== current.assigned_to_id) {
        changes.assigned = {
          from: current.assigned_to_id,
          to: dto.assignedToId,
        };
      }
    }

    if (dto.location !== undefined) {
      updates.push('location = @location');
    }

    if (dto.expectedDate !== undefined) {
      updates.push('expected_at = @expectedDate');
    }

    if (dto.equipmentSerialNumber !== undefined) {
      updates.push('equipment_serial = @equipmentSerialNumber');
    }

    if (dto.equipmentDescription !== undefined) {
      updates.push('equipment_description = @equipmentDescription');
    }

    if (updates.length === 0) {
      return current;
    }

    updates.push('updated_at = GETDATE()');

    const request = pool.request().input('id', sql.Int, id);

    if (dto.title !== undefined)
      request.input('title', sql.NVarChar, dto.title);
    if (dto.description !== undefined)
      request.input('description', sql.NVarChar, dto.description);
    if (dto.priority !== undefined)
      request.input('priority', sql.NVarChar, dto.priority);
    if (dto.status !== undefined)
      request.input('status', sql.NVarChar, dto.status);
    if (dto.assignedToId !== undefined)
      request.input('assignedToId', sql.Int, dto.assignedToId);
    if (dto.location !== undefined)
      request.input('location', sql.NVarChar, dto.location);
    if (dto.expectedDate !== undefined)
      request.input('expectedDate', sql.DateTime, new Date(dto.expectedDate));
    if (dto.equipmentSerialNumber !== undefined)
      request.input(
        'equipmentSerialNumber',
        sql.NVarChar,
        dto.equipmentSerialNumber,
      );
    if (dto.equipmentDescription !== undefined)
      request.input(
        'equipmentDescription',
        sql.NVarChar,
        dto.equipmentDescription,
      );

    await request.query(
      `UPDATE [ticket] SET ${updates.join(', ')} WHERE id = @id`,
    );

    // Log activities for changes
    if (changes.status) {
      await this.logActivity(
        id,
        ActivityType.STATUS_CHANGED,
        userId,
        null,
        changes.status,
        tenantId,
      );
    }
    if (changes.priority) {
      await this.logActivity(
        id,
        ActivityType.PRIORITY_CHANGED,
        userId,
        null,
        changes.priority,
        tenantId,
      );
    }
    if (changes.assigned) {
      const activityType = current.assigned_to_id
        ? ActivityType.REASSIGNED
        : ActivityType.ASSIGNED;
      await this.logActivity(
        id,
        activityType,
        userId,
        null,
        changes.assigned,
        tenantId,
      );
    }

    this.logger.log(`Ticket updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Close ticket
   */
  async close(
    id: number,
    dto: CloseTicketDto,
    tenantId: number,
    userId: number,
  ) {
    await this.logActivity(
      id,
      ActivityType.CLOSED,
      userId,
      dto.resolution,
      null,
      tenantId,
    );

    return this.update(
      id,
      {
        status: TicketStatus.CLOSED,
      },
      tenantId,
      userId,
    );
  }

  /**
   * Reopen ticket
   */
  async reopen(
    id: number,
    dto: ReopenTicketDto,
    tenantId: number,
    userId: number,
  ) {
    await this.logActivity(
      id,
      ActivityType.REOPENED,
      userId,
      dto.reason,
      null,
      tenantId,
    );

    return this.update(
      id,
      {
        status: TicketStatus.REOPENED,
      },
      tenantId,
      userId,
    );
  }

  /**
   * Add comment to ticket
   */
  async addComment(
    id: number,
    dto: AddTicketCommentDto,
    tenantId: number,
    userId: number,
  ) {
    await this.logActivity(
      id,
      ActivityType.COMMENT_ADDED,
      userId,
      dto.comment,
      { isInternal: dto.isInternal, attachmentIds: dto.attachmentIds },
      tenantId,
    );

    return { message: 'Comment added successfully' };
  }

  /**
   * Rate ticket
   */
  async rate(id: number, dto: RateTicketDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('rating', sql.Int, dto.rating)
      .input('feedback', sql.NVarChar, dto.feedback || null).query(`
        UPDATE [ticket]
        SET
          rating = @rating,
          rating_comment = @feedback,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Ticket rated: ${id} - ${dto.rating}/5`);
    return { message: 'Ticket rated successfully' };
  }

  /**
   * Delete ticket
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    // Check for interventions
    const interventionsCheck = await pool.request().input('id', sql.Int, id)
      .query(`
      SELECT COUNT(*) as total FROM [intervention] WHERE ticket_id = @id
    `);

    if (interventionsCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete ticket that has interventions');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM [ticket] WHERE id = @id');

    this.logger.log(`Ticket deleted: ${id}`);
    return { message: 'Ticket deleted successfully' };
  }

  /**
   * Get ticket statistics (dashboard)
   */
  async getDashboardStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const overview = await pool.request().query(`
      SELECT
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets,
        COUNT(CASE WHEN priority = 'urgent' OR priority = 'critical' THEN 1 END) as urgent_tickets,
        COUNT(CASE WHEN expected_at < GETDATE() AND status NOT IN ('resolved', 'closed') THEN 1 END) as overdue_tickets,
        AVG(CASE WHEN completed_at IS NOT NULL THEN DATEDIFF(HOUR, opened_at, completed_at) END) as avg_resolution_time_hours,
        AVG(CAST(avaliacao AS FLOAT)) as avg_rating
      FROM [ticket]
    `);

    const byStatus = await pool.request().query(`
      SELECT status, COUNT(*) as count
      FROM [ticket]
      GROUP BY status
      ORDER BY count DESC
    `);

    const byPriority = await pool.request().query(`
      SELECT priority AS priority, COUNT(*) as count
      FROM [ticket]
      GROUP BY priority
      ORDER BY
        CASE priority
          WHEN 'critical' THEN 1
          WHEN 'urgent' THEN 2
          WHEN 'high' THEN 3
          WHEN 'medium' THEN 4
          WHEN 'low' THEN 5
        END
    `);

    const byType = await pool.request().query(`
      SELECT
        tt.id,
        tt.name AS name,
        tt.icon AS icon,
        tt.color AS color,
        COUNT(t.id) as count
      FROM [ticket_type] tt
      LEFT JOIN [ticket] t ON tt.id = t.ticket_type_id
      GROUP BY tt.id, tt.name, tt.icon, tt.color
      ORDER BY count DESC
    `);

    const topTechnicians = await pool.request().query(`
      SELECT TOP 10
        u.id,
        u.full_name AS name,
        u.foto_url AS photo,
        COUNT(t.id) as assigned_tickets,
        COUNT(CASE WHEN t.status = 'closed' THEN 1 END) as closed_tickets,
        AVG(CASE WHEN t.completed_at IS NOT NULL THEN DATEDIFF(HOUR, t.opened_at, t.completed_at) END) as avg_resolution_hours,
        AVG(CAST(t.rating AS FLOAT)) as avg_rating
      FROM [user] u
      LEFT JOIN [ticket] t ON u.id = t.assigned_id
      WHERE t.id IS NOT NULL
      GROUP BY u.id, u.full_name, u.foto_url
      ORDER BY closed_tickets DESC
    `);

    const slaStatus = await pool.request().query(`
      SELECT
        COUNT(CASE
          WHEN t.completed_at IS NULL AND tt.sla_hours IS NOT NULL THEN
            CASE
              WHEN DATEDIFF(MINUTE, GETDATE(), DATEADD(HOUR, tt.sla_hours, t.opened_at)) < 0 THEN 1
            END
        END) as sla_breached,
        COUNT(CASE
          WHEN t.completed_at IS NULL AND tt.sla_hours IS NOT NULL THEN
            CASE
              WHEN DATEDIFF(MINUTE, GETDATE(), DATEADD(HOUR, tt.sla_hours, t.opened_at)) BETWEEN 0 AND (tt.sla_hours * 6) THEN 1
            END
        END) as sla_critical,
        COUNT(CASE
          WHEN t.completed_at IS NULL AND tt.sla_hours IS NOT NULL THEN
            CASE
              WHEN DATEDIFF(MINUTE, GETDATE(), DATEADD(HOUR, tt.sla_hours, t.opened_at)) BETWEEN (tt.sla_hours * 6) AND (tt.sla_hours * 15) THEN 1
            END
        END) as sla_warning,
        COUNT(CASE
          WHEN t.completed_at IS NULL AND tt.sla_hours IS NOT NULL THEN
            CASE
              WHEN DATEDIFF(MINUTE, GETDATE(), DATEADD(HOUR, tt.sla_hours, t.opened_at)) > (tt.sla_hours * 15) THEN 1
            END
        END) as sla_ok
      FROM [ticket] t
      INNER JOIN [ticket_type] tt ON t.ticket_type_id = tt.id
    `);

    return {
      overview: overview.recordset[0],
      byStatus: byStatus.recordset,
      byPriority: byPriority.recordset,
      byType: byType.recordset,
      topTechnicians: topTechnicians.recordset,
      slaStatus: slaStatus.recordset[0],
    };
  }

  /**
   * Log ticket activity
   */
  private async logActivity(
    ticketId: number,
    type: ActivityType,
    userId: number,
    description: string | null,
    metadata: any,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('ticket_id', sql.Int, ticketId)
      .input('activity_type', sql.NVarChar, type)
      .input('user_id', sql.Int, userId)
      .input('description', sql.NVarChar, description)
      .input(
        'metadata',
        sql.NVarChar,
        metadata ? JSON.stringify(metadata) : null,
      ).query(`
        INSERT INTO ticket_activities (ticket_id, activity_type, user_id, description, metadata, created_at)
        VALUES (@ticket_id, @activity_type, @user_id, @description, @metadata, GETDATE())
      `);
  }

  /**
   * Parse ticket record
   */
  private parseTicket(record: any) {
    return this.calculateSLA(record);
  }

  /**
   * Get ticket by unique code (public access)
   */
  async getByCode(code: string, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('code', sql.NVarChar, code)
      .query(`
        SELECT
          t.id,
          t.ticket_number,
          t.unique_code,
          t.ticket_type_id,
          tt.name AS ticket_type_name,
          tt.description AS ticket_type_description,
          tt.sla_hours,
          tt.icon AS ticket_type_icon,
          tt.color AS ticket_type_color,
          t.client_id,
          c.name AS client_name,
          c.code AS client_code,
          t.equipment_serial,
          t.equipment_description,
          t.title,
          t.description,
          t.priority,
          t.status,
          t.requester_id,
          req.full_name AS requester_name,
          t.assigned_id,
          atr.full_name AS assigned_to_name,
          t.location,
          t.opened_at,
          t.expected_at,
          t.completed_at,
          t.resolution_time_minutes,
          t.rating,
          t.rating_comment,
          t.created_at,
          t.updated_at
        FROM [ticket] t
        INNER JOIN [ticket_type] tt ON t.ticket_type_id = tt.id
        LEFT JOIN [client] c ON t.client_id = c.id
        LEFT JOIN [user] req ON t.requester_id = req.id
        LEFT JOIN [user] atr ON t.assigned_id = atr.id
        WHERE t.unique_code = @code AND t.deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Ticket with code ${code} not found`);
    }

    const ticket = result.recordset[0];

    // Transform flat structure to nested objects expected by frontend
    return {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      unique_code: ticket.unique_code,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      location: ticket.location,
      equipment_serial: ticket.equipment_serial,
      equipment_description: ticket.equipment_description,
      opened_at: ticket.opened_at,
      expected_at: ticket.expected_at,
      completed_at: ticket.completed_at,
      resolution_time_minutes: ticket.resolution_time_minutes,
      rating: ticket.rating,
      rating_comment: ticket.rating_comment,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      ticket_type: {
        id: ticket.ticket_type_id,
        name: ticket.ticket_type_name,
        description: ticket.ticket_type_description,
        sla_hours: ticket.sla_hours,
        icon: ticket.ticket_type_icon,
        color: ticket.ticket_type_color,
      },
      client: ticket.client_id
        ? {
            id: ticket.client_id,
            name: ticket.client_name,
            code: ticket.client_code,
          }
        : null,
      requester: ticket.requester_id
        ? {
            id: ticket.requester_id,
            name: ticket.requester_name,
          }
        : null,
      assigned: ticket.assigned_id
        ? {
            id: ticket.assigned_id,
            name: ticket.assigned_to_name,
          }
        : null,
      // Calculate SLA info (for all tickets - use completed_at for closed tickets, now for open tickets)
      ...this.calculateSLAInfo(
        ticket.opened_at,
        ticket.sla_hours,
        ticket.completed_at,
      ),
    };
  }

  /**
   * Calculate SLA information for a ticket
   * For open tickets: calculates remaining time until SLA deadline
   * For closed tickets: calculates whether SLA was met at completion time
   */
  private calculateSLAInfo(
    openedAt: Date,
    slaHours: number | null,
    completedAt: Date | null,
  ): any {
    if (!slaHours || !openedAt) {
      return {};
    }

    const opened = new Date(openedAt);
    const slaDeadline = new Date(opened.getTime() + slaHours * 60 * 60 * 1000);

    // Use completed_at for closed tickets, current time for open tickets
    const referenceTime = completedAt ? new Date(completedAt) : new Date();

    const timeRemainingMs = slaDeadline.getTime() - referenceTime.getTime();
    const timeRemainingMinutes = Math.floor(timeRemainingMs / (1000 * 60));
    const totalTimeMinutes = slaHours * 60;
    const percentageRemaining = (timeRemainingMinutes / totalTimeMinutes) * 100;

    let slaStatus = 'ok';
    if (timeRemainingMinutes < 0) {
      slaStatus = 'breached';
    } else if (percentageRemaining < 10) {
      slaStatus = 'critical';
    } else if (percentageRemaining < 25) {
      slaStatus = 'warning';
    }

    return {
      sla_deadline: slaDeadline.toISOString(),
      sla_status: slaStatus,
      sla_time_remaining_minutes: timeRemainingMinutes,
      sla_percentage_remaining: percentageRemaining,
      sla_is_breached: timeRemainingMinutes < 0,
    };
  }

  /**
   * Reopen ticket by unique code (public access)
   */
  async reopenByCode(code: string, reason: string, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get ticket
    const ticketResult = await pool.request().input('code', sql.NVarChar, code)
      .query(`
        SELECT id, status, completed_at, requester_id
        FROM [ticket]
        WHERE unique_code = @code AND deleted_at IS NULL
      `);

    if (ticketResult.recordset.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    const ticket = ticketResult.recordset[0];

    // Check if ticket can be reopened (only completed/closed tickets)
    if (!ticket.completed_at && ticket.status !== 'closed') {
      throw new Error('Only completed tickets can be reopened');
    }

    // Clear completed_at and set status to reopened
    await pool
      .request()
      .input('ticketId', sql.Int, ticket.id)
      .query(`
        UPDATE [ticket]
        SET completed_at = NULL, status = 'reopened', updated_at = GETDATE()
        WHERE id = @ticketId
      `);

    // Log activity
    await this.logActivity(
      ticket.id,
      ActivityType.REOPENED,
      ticket.requester_id,
      reason,
      null,
      tenantId,
    );

    this.logger.log(`Ticket reopened: ${ticket.id}`);
    return { success: true, message: 'Ticket reopened successfully' };
  }

  /**
   * Close ticket by unique code (public access)
   */
  async closeByCode(
    code: string,
    reason: string | undefined,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get ticket
    const ticketResult = await pool.request().input('code', sql.NVarChar, code)
      .query(`
        SELECT id, status, completed_at, requester_id
        FROM [ticket]
        WHERE unique_code = @code AND deleted_at IS NULL
      `);

    if (ticketResult.recordset.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    const ticket = ticketResult.recordset[0];

    // Check if ticket can be closed (not already closed)
    if (ticket.completed_at || ticket.status === 'closed') {
      throw new Error('Ticket is already closed');
    }

    // Set completed_at and status to close the ticket
    await pool
      .request()
      .input('ticketId', sql.Int, ticket.id)
      .query(`
        UPDATE [ticket]
        SET completed_at = GETDATE(), status = 'closed', updated_at = GETDATE()
        WHERE id = @ticketId
      `);

    // Log activity if reason provided
    if (reason) {
      await this.logActivity(
        ticket.id,
        ActivityType.CLOSED,
        ticket.requester_id,
        reason,
        null,
        tenantId,
      );
    }

    this.logger.log(`Ticket closed: ${ticket.id}`);
    return { success: true, message: 'Ticket closed successfully' };
  }

  /**
   * Rate ticket by unique code (public access)
   */
  async rateByCode(
    code: string,
    rating: number,
    comment: string | undefined,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get ticket
    const ticketResult = await pool.request().input('code', sql.NVarChar, code)
      .query(`
        SELECT id, completed_at
        FROM [ticket]
        WHERE unique_code = @code AND deleted_at IS NULL
      `);

    if (ticketResult.recordset.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    const ticket = ticketResult.recordset[0];

    // Check if ticket is closed
    if (!ticket.completed_at) {
      throw new Error('Only closed tickets can be rated');
    }

    // Update ticket rating
    await pool
      .request()
      .input('ticketId', sql.Int, ticket.id)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar, comment || null).query(`
        UPDATE [ticket]
        SET rating = @rating, rating_comment = @comment, updated_at = GETDATE()
        WHERE id = @ticketId
      `);

    this.logger.log(`Ticket rated: ${ticket.id} - ${rating}/5`);
    return { success: true, message: 'Ticket rated successfully' };
  }

  /**
   * Create ticket from public form
   */
  async createPublic(dto: any, tenantId: number, clientId?: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Verify client exists (only if clientId is provided)
    if (clientId) {
      const clientCheck = await pool
        .request()
        .input('clientId', sql.Int, clientId).query(`
          SELECT id, code, name FROM [client]
          WHERE id = @clientId AND deleted_at IS NULL
        `);

      if (clientCheck.recordset.length === 0) {
        throw new Error(`Client with ID ${clientId} not found`);
      }
    }

    // Verify ticket type exists
    const ticketTypeCheck = await pool
      .request()
      .input('ticketTypeId', sql.Int, dto.ticketTypeId).query(`
        SELECT id, sla_hours FROM ticket_type
        WHERE id = @ticketTypeId AND deleted_at IS NULL
      `);

    if (ticketTypeCheck.recordset.length === 0) {
      throw new NotFoundException('Ticket type not found');
    }

    // Get or create default public user
    const requesterId = await this.getOrCreatePublicUser(pool, clientId);

    // Generate ticket number and unique code
    const ticketNumber = await this.generateTicketNumber(pool);
    const uniqueCode = await this.generateUniqueCode(pool);

    const result = await pool
      .request()
      .input('client_id', sql.Int, clientId || null)
      .input('ticket_number', sql.NVarChar, ticketNumber)
      .input('ticket_type_id', sql.Int, dto.ticketTypeId)
      .input(
        'equipment_serial',
        sql.NVarChar,
        dto.equipmentSerialNumber || null,
      )
      .input(
        'equipment_description',
        sql.NVarChar,
        dto.equipmentDescription || null,
      )
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description)
      .input('priority', sql.NVarChar, dto.priority)
      .input('status', sql.NVarChar, 'open')
      .input('requester_id', sql.Int, requesterId)
      .input('location', sql.NVarChar, dto.location || null)
      .input('unique_code', sql.NVarChar, uniqueCode).query(`
        INSERT INTO [ticket] (
          client_id, ticket_number, ticket_type_id, equipment_serial, equipment_description,
          title, description, priority, status, requester_id, location,
          unique_code, opened_at, created_at, updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @client_id, @ticket_number, @ticket_type_id, @equipment_serial, @equipment_description,
          @title, @description, @priority, @status, @requester_id, @location,
          @unique_code, GETDATE(), GETDATE(), GETDATE()
        )
      `);

    const ticketId = result.recordset[0].id;

    // Log activity
    await this.logActivity(
      ticketId,
      ActivityType.CREATED,
      requesterId,
      'Ticket created from public form',
      { created_by: requesterId },
      tenantId,
    );

    this.logger.log(`Public ticket created: ${ticketNumber} (ID: ${ticketId})`);

    return {
      id: ticketId,
      ticketNumber,
      uniqueCode,
      success: true,
      message: 'Ticket created successfully',
    };
  }

  /**
   * Get ticket interventions by unique code (public access)
   */
  async getInterventionsByCode(code: string, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // First get the ticket ID from the unique code
    const ticketResult = await pool.request().input('code', sql.NVarChar, code)
      .query(`
        SELECT id FROM [ticket]
        WHERE unique_code = @code AND deleted_at IS NULL
      `);

    if (ticketResult.recordset.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    const ticketId = ticketResult.recordset[0].id;

    // Get interventions for this ticket
    const result = await pool.request().input('ticketId', sql.Int, ticketId)
      .query(`
        SELECT
          i.id,
          i.intervention_type,
          i.description,
          i.status,
          i.start_time,
          i.end_time,
          i.duration_minutes,
          i.notes,
          i.created_at,
          u.id as technician_id,
          CONCAT(u.first_name, ' ', u.last_name) as technician_name
        FROM intervention i
        LEFT JOIN [user] u ON i.technician_id = u.id
        WHERE i.ticket_id = @ticketId
        ORDER BY i.start_time DESC, i.created_at DESC
      `);

    // Get costs for each intervention
    const interventionsWithCosts = await Promise.all(
      result.recordset.map(async (intervention) => {
        const costsResult = await pool.request()
          .input('interventionId', sql.Int, intervention.id)
          .query(`
            SELECT
              id,
              intervention_id,
              description,
              cost_type,
              quantity,
              unit_price,
              total_price,
              notes,
              created_at
            FROM intervention_cost
            WHERE intervention_id = @interventionId
            ORDER BY created_at ASC
          `);

        const costs = costsResult.recordset.map((cost) => ({
          id: cost.id,
          intervention_id: cost.intervention_id,
          description: cost.description,
          cost_type: cost.cost_type,
          quantity: cost.quantity,
          unit_price: cost.unit_price,
          total_price: cost.total_price,
          notes: cost.notes,
          created_at: cost.created_at,
        }));

        return {
          id: intervention.id,
          intervention_type: intervention.intervention_type,
          description: intervention.description,
          status: intervention.status,
          start_time: intervention.start_time,
          end_time: intervention.end_time,
          duration_minutes: intervention.duration_minutes,
          notes: intervention.notes,
          created_at: intervention.created_at,
          technician: intervention.technician_id
            ? {
                id: intervention.technician_id,
                name: intervention.technician_name,
              }
            : null,
          costs: costs.length > 0 ? costs : undefined,
        };
      }),
    );

    return interventionsWithCosts;
  }

  /**
   * List all ticket types (public access)
   */
  async listTicketTypes(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        id,
        name,
        description,
        sla_hours,
        icon,
        color
      FROM ticket_type
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    return result.recordset;
  }
}
