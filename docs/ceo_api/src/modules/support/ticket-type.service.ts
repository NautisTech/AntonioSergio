import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto';
import * as sql from 'mssql';

/**
 * Ticket Type Service
 * Manages ticket types/categories with SLA configuration
 */
@Injectable()
export class TicketTypeService {
  private readonly logger = new Logger(TicketTypeService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * List ticket types
   */
  async list(tenantId: number, activeOnly: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const whereClause = activeOnly ? ' WHERE tt.deleted_at IS NULL' : '';

    const result = await pool.request().query(`
      SELECT
        tt.id,
        tt.name,
        tt.description,
        tt.sla_hours,
        tt.icon,
        tt.color,
        tt.created_at,
        tt.updated_at,
        tt.deleted_at,
        (SELECT COUNT(*) FROM ticket WHERE ticket_type_id = tt.id AND deleted_at IS NULL) AS ticket_count
      FROM ticket_type tt
      ${whereClause}
      ORDER BY tt.name
    `);

    return result.recordset;
  }

  /**
   * Get ticket type by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        tt.id,
        tt.name,
        tt.description,
        tt.sla_hours,
        tt.icon,
        tt.color,
        tt.created_at,
        tt.updated_at,
        tt.deleted_at,
        (SELECT COUNT(*) FROM ticket WHERE ticket_type_id = tt.id AND deleted_at IS NULL) AS ticket_count,
        (SELECT COUNT(*) FROM ticket WHERE ticket_type_id = tt.id AND status IN ('open', 'in_progress') AND deleted_at IS NULL) AS open_tickets
      FROM ticket_type tt
      WHERE tt.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Ticket type with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Create ticket type
   */
  async create(dto: CreateTicketTypeDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('sla_hours', sql.Int, dto.slaHours || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null).query(`
        INSERT INTO ticket_type (
          name, description, sla_hours, icon, color, created_at, updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @description, @sla_hours, @icon, @color, GETDATE(), GETDATE()
        )
      `);

    this.logger.log(`Ticket type created: ${dto.name} (ID: ${result.recordset[0].id})`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * Update ticket type
   */
  async update(id: number, dto: UpdateTicketTypeDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('sla_hours', sql.Int, dto.slaHours || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null).query(`
        UPDATE ticket_type
        SET
          name = @name,
          description = @description,
          sla_hours = @sla_hours,
          icon = @icon,
          color = @color,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Ticket type updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete ticket type (soft delete)
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has active tickets
    const ticketsCheck = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) as total
      FROM ticket
      WHERE ticket_type_id = @id
        AND deleted_at IS NULL
        AND status NOT IN ('closed', 'cancelled')
    `);

    if (ticketsCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete ticket type that has active tickets');
    }

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE ticket_type
      SET deleted_at = GETDATE()
      WHERE id = @id
    `);

    this.logger.log(`Ticket type deleted: ${id}`);
    return { message: 'Ticket type deleted successfully' };
  }

  /**
   * Get ticket type statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as total_types,
        COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_types,
        COUNT(CASE WHEN sla_hours IS NOT NULL THEN 1 END) as types_with_sla,
        AVG(CAST(sla_hours AS FLOAT)) as avg_sla_hours
      FROM ticket_type
    `);

    return result.recordset[0];
  }
}
