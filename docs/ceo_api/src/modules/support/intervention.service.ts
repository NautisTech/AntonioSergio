import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateInterventionDto, UpdateInterventionDto, InterventionStatus, ActivityType } from './dto';
import * as sql from 'mssql';

/**
 * Intervention Service
 * Manages technical interventions and work logs for tickets
 *
 * Schema: Uses new English optimized schema from db/tenant/base.sql
 */
@Injectable()
export class InterventionService {
  private readonly logger = new Logger(InterventionService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create intervention
   */
  async create(dto: CreateInterventionDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Validate ticket exists
    const ticketResult = await pool
      .request()
      .input('ticketId', sql.Int, dto.ticketId)
      .query('SELECT id FROM [ticket] WHERE id = @ticketId AND deleted_at IS NULL');

    if (ticketResult.recordset.length === 0) {
      throw new NotFoundException(`Ticket with ID ${dto.ticketId} not found`);
    }

    // Create intervention
    const result = await pool
      .request()
      .input('ticket_id', sql.Int, dto.ticketId)
      .input('technician_id', sql.Int, dto.technicianId)
      .input('intervention_type', sql.NVarChar, dto.type || 'maintenance')
      .input('description', sql.NVarChar, dto.description)
      .input('start_time', sql.DateTime2, dto.startDate ? new Date(dto.startDate) : new Date())
      .input('end_time', sql.DateTime2, dto.endDate ? new Date(dto.endDate) : null)
      .input('duration_minutes', sql.Int, dto.durationMinutes || null)
      .input('status', sql.NVarChar, dto.status || InterventionStatus.PENDING)
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('created_by', sql.Int, userId)
      .query(`
        INSERT INTO [intervention] (
          ticket_id, technician_id, intervention_type, description,
          start_time, end_time, duration_minutes, status, notes,
          created_at, created_by
        )
        OUTPUT INSERTED.id
        VALUES (
          @ticket_id, @technician_id, @intervention_type, @description,
          @start_time, @end_time, @duration_minutes, @status, @notes,
          GETDATE(), @created_by
        )
      `);

    const interventionId = result.recordset[0].id;

    // Add costs if provided
    if (dto.laborCost && dto.laborCost > 0) {
      await this.addCost(interventionId, {
        description: 'Labor cost',
        cost_type: 'labor',
        quantity: dto.durationMinutes ? dto.durationMinutes / 60 : 1, // hours
        unit_price: dto.laborCost,
        total_price: dto.laborCost,
      }, tenantId);
    }

    if (dto.partsCost && dto.partsCost > 0) {
      await this.addCost(interventionId, {
        description: 'Parts cost',
        cost_type: 'part',
        quantity: 1,
        unit_price: dto.partsCost,
        total_price: dto.partsCost,
      }, tenantId);
    }

    // Log activity on ticket
    await this.logTicketActivity(
      dto.ticketId!,
      ActivityType.INTERVENTION_ADDED,
      userId,
      `Intervention created by technician`,
      { intervention_id: interventionId },
      tenantId,
    );

    this.logger.log(`Intervention created: ID ${interventionId} for ticket ${dto.ticketId}`);
    return this.getById(interventionId, tenantId);
  }

  /**
   * Add cost to intervention
   */
  async addCost(
    interventionId: number,
    cost: {
      description: string;
      cost_type: 'labor' | 'part' | 'travel' | 'other';
      quantity: number;
      unit_price: number;
      total_price: number;
      notes?: string;
    },
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('intervention_id', sql.Int, interventionId)
      .input('description', sql.NVarChar, cost.description)
      .input('cost_type', sql.NVarChar, cost.cost_type)
      .input('quantity', sql.Decimal(10, 2), cost.quantity)
      .input('unit_price', sql.Decimal(18, 2), cost.unit_price)
      .input('total_price', sql.Decimal(18, 2), cost.total_price)
      .input('notes', sql.NVarChar, cost.notes || null)
      .query(`
        INSERT INTO [intervention_cost] (
          intervention_id, description, cost_type, quantity,
          unit_price, total_price, notes, created_at
        )
        VALUES (
          @intervention_id, @description, @cost_type, @quantity,
          @unit_price, @total_price, @notes, GETDATE()
        )
      `);
  }

  /**
   * List interventions with filters
   */
  async list(
    tenantId: number,
    filters?: {
      ticketId?: number;
      equipmentId?: number;
      technicianId?: number;
      type?: string;
      status?: string;
      clientId?: number;
      search?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const request = pool.request();

    const conditions: string[] = ['i.deleted_at IS NULL'];

    if (filters?.ticketId) {
      conditions.push('i.ticket_id = @ticketId');
      request.input('ticketId', sql.Int, filters.ticketId);
    }

    if (filters?.equipmentId) {
      conditions.push('t.equipment_id = @equipmentId');
      request.input('equipmentId', sql.Int, filters.equipmentId);
    }

    if (filters?.technicianId) {
      conditions.push('i.technician_id = @technicianId');
      request.input('technicianId', sql.Int, filters.technicianId);
    }

    if (filters?.type) {
      conditions.push('i.intervention_type = @type');
      request.input('type', sql.NVarChar, filters.type);
    }

    if (filters?.status) {
      conditions.push('i.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters?.clientId) {
      conditions.push('t.client_id = @clientId');
      request.input('clientId', sql.Int, filters.clientId);
    }

    if (filters?.search) {
      conditions.push(
        '(i.description LIKE @search OR i.notes LIKE @search OR t.ticket_number LIKE @search)',
      );
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    const whereClause = ' WHERE ' + conditions.join(' AND ');

    const selectFields = `
      i.id,
      i.ticket_id,
      t.ticket_number,
      t.title AS ticket_title,
      t.client_id,
      c.name AS client_name,
      t.equipment_id,
      e.internal_number AS equipment_internal_number,
      e.serial_number AS equipment_serial_number,
      i.technician_id,
      u.first_name + ' ' + u.last_name AS technician_name,
      u.avatar_url AS technician_photo,
      i.intervention_type,
      i.description,
      i.start_time,
      i.end_time,
      i.duration_minutes,
      i.status,
      i.notes,
      i.created_at,
      i.updated_at,
      (SELECT SUM(total_price) FROM [intervention_cost] WHERE intervention_id = i.id) AS total_cost
    `;

    const fromClause = `
      FROM [intervention] i
      INNER JOIN [ticket] t ON i.ticket_id = t.id
      LEFT JOIN [client] c ON t.client_id = c.id
      LEFT JOIN [equipment] e ON t.equipment_id = e.id
      LEFT JOIN [user] u ON i.technician_id = u.id
    `;

    const orderBy = ' ORDER BY i.created_at DESC';

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const query = `SELECT ${selectFields} ${fromClause} ${whereClause} ${orderBy}`;
      const result = await request.query(query);

      // Fetch costs for each intervention
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

          return {
            ...intervention,
            costs: costsResult.recordset.length > 0 ? costsResult.recordset : undefined,
          };
        }),
      );

      return interventionsWithCosts;
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

    // Fetch costs for each intervention in the paginated result
    const interventionsWithCosts = await Promise.all(
      dataResult.recordset.map(async (intervention) => {
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

        return {
          ...intervention,
          costs: costsResult.recordset.length > 0 ? costsResult.recordset : undefined,
        };
      }),
    );

    return {
      data: interventionsWithCosts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get intervention by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        i.id,
        i.ticket_id,
        t.ticket_number,
        t.title AS ticket_title,
        t.status AS ticket_status,
        t.client_id,
        c.name AS client_name,
        (SELECT TOP 1 value FROM [contact] WHERE entity_type = 'client' AND entity_id = t.client_id AND contact_type = 'email' AND deleted_at IS NULL ORDER BY is_primary DESC) AS client_email,
        t.equipment_id,
        e.internal_number AS equipment_internal_number,
        e.serial_number AS equipment_serial_number,
        e.description AS equipment_description,
        i.technician_id,
        u.first_name + ' ' + u.last_name AS technician_name,
        u.email AS technician_email,
        u.avatar_url AS technician_photo,
        i.intervention_type,
        i.description,
        i.start_time,
        i.end_time,
        i.duration_minutes,
        i.status,
        i.notes,
        i.created_at,
        i.updated_at,
        i.created_by,
        i.updated_by
      FROM [intervention] i
      INNER JOIN [ticket] t ON i.ticket_id = t.id
      LEFT JOIN [client] c ON t.client_id = c.id
      LEFT JOIN [equipment] e ON t.equipment_id = e.id
      LEFT JOIN [user] u ON i.technician_id = u.id
      WHERE i.id = @id AND i.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Intervention with ID ${id} not found`);
    }

    const intervention = result.recordset[0];

    // Get costs
    const costsResult = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        id,
        description,
        cost_type,
        quantity,
        unit_price,
        total_price,
        notes,
        created_at
      FROM [intervention_cost]
      WHERE intervention_id = @id
      ORDER BY created_at
    `);

    return {
      ...intervention,
      costs: costsResult.recordset,
      total_cost: costsResult.recordset.reduce((sum, cost) => sum + cost.total_price, 0),
    };
  }

  /**
   * Update intervention
   */
  async update(id: number, dto: UpdateInterventionDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    const updates: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.startDate !== undefined) {
      updates.push('start_time = @start_time');
      request.input('start_time', sql.DateTime2, new Date(dto.startDate));
    }

    if (dto.endDate !== undefined) {
      updates.push('end_time = @end_time');
      request.input('end_time', sql.DateTime2, dto.endDate ? new Date(dto.endDate) : null);
    }

    if (dto.durationMinutes !== undefined) {
      updates.push('duration_minutes = @duration_minutes');
      request.input('duration_minutes', sql.Int, dto.durationMinutes);
    }

    if (dto.notes !== undefined) {
      updates.push('notes = @notes');
      request.input('notes', sql.NVarChar, dto.notes);
    }

    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }

    if (updates.length === 0) {
      return this.getById(id, tenantId);
    }

    updates.push('updated_at = GETDATE()');
    updates.push('updated_by = @updated_by');
    request.input('updated_by', sql.Int, userId);

    await request.query(`UPDATE [intervention] SET ${updates.join(', ')} WHERE id = @id`);

    this.logger.log(`Intervention updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete intervention (soft delete)
   */
  async delete(id: number, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('updated_by', sql.Int, userId)
      .query(`
        UPDATE [intervention]
        SET deleted_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id
      `);

    this.logger.log(`Intervention deleted: ${id}`);
    return { message: 'Intervention deleted successfully' };
  }

  /**
   * Get intervention statistics
   */
  async getStatistics(tenantId: number, technicianId?: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const techFilter = technicianId ? 'AND i.technician_id = @technicianId' : '';
    const request = pool.request();

    if (technicianId) {
      request.input('technicianId', sql.Int, technicianId);
    }

    const overview = await request.query(`
      SELECT
        COUNT(*) as total_interventions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        AVG(CASE WHEN duration_minutes IS NOT NULL THEN duration_minutes END) as avg_duration_minutes
      FROM [intervention] i
      WHERE i.deleted_at IS NULL ${techFilter}
    `);

    const totalCost = await pool.request().query(`
      SELECT
        SUM(ic.total_price) as total_cost,
        AVG(ic.total_price) as avg_cost_per_item
      FROM [intervention_cost] ic
      INNER JOIN [intervention] i ON ic.intervention_id = i.id
      WHERE i.deleted_at IS NULL ${techFilter}
    `);

    const byType = await request.query(`
      SELECT intervention_type AS type, COUNT(*) as count
      FROM [intervention] i
      WHERE i.deleted_at IS NULL ${techFilter}
      GROUP BY intervention_type
      ORDER BY count DESC
    `);

    const topTechnicians = await pool.request().query(`
      SELECT TOP 10
        u.id,
        u.first_name + ' ' + u.last_name AS name,
        u.avatar_url AS photo,
        COUNT(i.id) as intervention_count,
        AVG(i.duration_minutes) as avg_duration_minutes,
        (SELECT SUM(ic.total_price)
         FROM [intervention_cost] ic
         WHERE ic.intervention_id IN (
           SELECT id FROM [intervention] WHERE technician_id = u.id AND deleted_at IS NULL
         )
        ) as total_revenue
      FROM [user] u
      INNER JOIN [intervention] i ON u.id = i.technician_id
      WHERE i.deleted_at IS NULL
      GROUP BY u.id, u.first_name, u.last_name, u.avatar_url
      ORDER BY intervention_count DESC
    `);

    return {
      overview: {
        ...overview.recordset[0],
        ...totalCost.recordset[0],
      },
      byType: byType.recordset,
      topTechnicians: topTechnicians.recordset,
    };
  }

  /**
   * Log activity on ticket
   */
  private async logTicketActivity(
    ticketId: number,
    type: ActivityType,
    userId: number,
    description: string | null,
    metadata: any,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    try {
      await pool
        .request()
        .input('ticket_id', sql.Int, ticketId)
        .input('activity_type', sql.NVarChar, type)
        .input('user_id', sql.Int, userId)
        .input('description', sql.NVarChar, description)
        .input('metadata', sql.NVarChar, metadata ? JSON.stringify(metadata) : null)
        .query(`
          INSERT INTO [ticket_activities] (ticket_id, activity_type, user_id, description, metadata, created_at)
          VALUES (@ticket_id, @activity_type, @user_id, @description, @metadata, GETDATE())
        `);
    } catch (error) {
      // Table might not exist, ignore
      this.logger.warn('Could not log ticket activity:', error.message);
    }
  }
}
