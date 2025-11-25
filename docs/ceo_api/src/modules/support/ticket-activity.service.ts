import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ActivityType } from './dto';
import * as sql from 'mssql';

/**
 * Ticket Activity Service
 * Manages ticket activity timeline and history tracking
 */
@Injectable()
export class TicketActivityService {
  private readonly logger = new Logger(TicketActivityService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create ticket_activities table if doesn't exist
   */
  private async ensureActivityTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ticket_activities' AND xtype='U')
      BEGIN
        CREATE TABLE ticket_activities (
          id INT IDENTITY(1,1) PRIMARY KEY,
          ticket_id INT NOT NULL,
          activity_type NVARCHAR(50) NOT NULL,
          user_id INT NULL,
          description NVARCHAR(MAX) NULL,
          metadata NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_ticket_activities_ticket_id ON ticket_activities(ticket_id)
        CREATE INDEX idx_ticket_activities_activity_type ON ticket_activities(activity_type)
        CREATE INDEX idx_ticket_activities_created_at ON ticket_activities(created_at DESC)
      END
    `);
  }

  /**
   * Get ticket activity timeline
   */
  async getTicketTimeline(ticketId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureActivityTable(pool);

    const result = await pool.request().input('ticketId', sql.Int, ticketId).query(`
      SELECT
        a.id,
        a.ticket_id,
        a.activity_type AS type,
        a.user_id,
        u.full_name AS user_name,
        u.avatar_url AS user_photo,
        a.description,
        a.metadata,
        a.created_at,
        CASE
          WHEN a.activity_type = 'created' THEN 'Ticket created'
          WHEN a.activity_type = 'status_changed' THEN 'Status changed'
          WHEN a.activity_type = 'priority_changed' THEN 'Priority changed'
          WHEN a.activity_type = 'assigned' THEN 'Ticket assigned'
          WHEN a.activity_type = 'reassigned' THEN 'Ticket reassigned'
          WHEN a.activity_type = 'comment_added' THEN 'Comment added'
          WHEN a.activity_type = 'attachment_added' THEN 'Attachment added'
          WHEN a.activity_type = 'intervention_added' THEN 'Intervention recorded'
          WHEN a.activity_type = 'customer_response' THEN 'Customer response'
          WHEN a.activity_type = 'technician_response' THEN 'Technician response'
          WHEN a.activity_type = 'closed' THEN 'Ticket closed'
          WHEN a.activity_type = 'reopened' THEN 'Ticket reopened'
          WHEN a.activity_type = 'sla_warning' THEN 'SLA warning'
          WHEN a.activity_type = 'sla_breach' THEN 'SLA breached'
          ELSE a.activity_type
        END AS type_label
      FROM ticket_activities a
      LEFT JOIN [user] u ON a.user_id = u.id
      WHERE a.ticket_id = @ticketId
      ORDER BY a.created_at DESC
    `);

    return result.recordset.map((r) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null,
    }));
  }

  /**
   * Get ticket comments
   */
  async getTicketComments(ticketId: number, tenantId: number, includeInternal: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureActivityTable(pool);

    const internalFilter = includeInternal ? '' : "AND (JSON_VALUE(a.metadata, '$.isInternal') IS NULL OR JSON_VALUE(a.metadata, '$.isInternal') = 'false')";

    const result = await pool.request().input('ticketId', sql.Int, ticketId).query(`
      SELECT
        a.id,
        a.ticket_id,
        a.user_id,
        u.full_name AS user_name,
        u.avatar_url AS user_photo,
        u.email AS user_email,
        a.description AS comment,
        a.metadata,
        a.created_at,
        CASE WHEN JSON_VALUE(a.metadata, '$.isInternal') = 'true' THEN 1 ELSE 0 END AS is_internal
      FROM ticket_activities a
      LEFT JOIN [user] u ON a.user_id = u.id
      WHERE a.ticket_id = @ticketId
        AND a.activity_type = 'comment_added'
        ${internalFilter}
      ORDER BY a.created_at ASC
    `);

    return result.recordset.map((r) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null,
      is_internal: Boolean(r.is_internal),
    }));
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(tenantId: number, userId?: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureActivityTable(pool);

    const userFilter = userId ? 'WHERE a.user_id = @userId' : '';
    const request = pool.request();

    if (userId) {
      request.input('userId', sql.Int, userId);
    }

    const result = await request.query(`
      SELECT
        a.activity_type AS type,
        COUNT(*) as count
      FROM ticket_activities a
      ${userFilter}
      GROUP BY a.activity_type
      ORDER BY count DESC
    `);

    const recent = await request.query(`
      SELECT TOP 20
        a.id,
        a.ticket_id,
        t.ticket_number,
        t.title AS ticket_title,
        a.activity_type AS type,
        a.user_id,
        u.full_name AS user_name,
        u.avatar_url AS user_photo,
        a.description,
        a.created_at
      FROM ticket_activities a
      INNER JOIN ticket t ON a.ticket_id = t.id
      LEFT JOIN [user] u ON a.user_id = u.id
      ${userFilter}
      ORDER BY a.created_at DESC
    `);

    return {
      byType: result.recordset,
      recentActivities: recent.recordset,
    };
  }

  /**
   * Delete activity
   */
  async deleteActivity(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureActivityTable(pool);

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM ticket_activities WHERE id = @id
    `);

    this.logger.log(`Activity deleted: ${id}`);
    return { message: 'Activity deleted successfully' };
  }
}
