import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateReviewTriggerDto, UpdateReviewTriggerDto, TriggerType, TriggerEvent } from './dto';
import { ReviewRequestService } from './review-request.service';
import * as sql from 'mssql';

/**
 * Review Trigger Service
 * Manages automatic review triggers based on events
 */
@Injectable()
export class ReviewTriggerService {
  private readonly logger = new Logger(ReviewTriggerService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly reviewRequestService: ReviewRequestService,
  ) {}

  /**
   * Ensure review_triggers table exists
   */
  private async ensureTriggersTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_triggers' AND xtype='U')
      BEGIN
        CREATE TABLE review_triggers (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX) NULL,
          template_id INT NOT NULL,
          trigger_type NVARCHAR(50) NOT NULL,
          event NVARCHAR(50) NULL,
          event_count INT NULL,
          target_role NVARCHAR(100) NULL,
          target_department_id INT NULL,
          days_until_deadline INT NULL,
          reminder_days INT NULL,
          ativo BIT DEFAULT 1,
          conditions NVARCHAR(MAX) NULL,
          last_triggered DATETIME NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (template_id) REFERENCES review_templates(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_review_triggers_template ON review_triggers(template_id)
        CREATE INDEX idx_review_triggers_event ON review_triggers(event)
        CREATE INDEX idx_review_triggers_active ON review_triggers(ativo)

        -- Track trigger executions
        CREATE TABLE review_trigger_log (
          id INT IDENTITY(1,1) PRIMARY KEY,
          trigger_id INT NOT NULL,
          entity_id INT NULL,
          entity_type NVARCHAR(50) NULL,
          request_id INT NULL,
          executed_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (trigger_id) REFERENCES review_triggers(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_review_trigger_log_trigger ON review_trigger_log(trigger_id)
        CREATE INDEX idx_review_trigger_log_entity ON review_trigger_log(entity_type, entity_id)
      END
    `);
  }

  /**
   * Create review trigger
   */
  async create(dto: CreateReviewTriggerDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTriggersTable(pool);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('template_id', sql.Int, dto.templateId)
      .input('trigger_type', sql.NVarChar, dto.triggerType)
      .input('event', sql.NVarChar, dto.event || null)
      .input('event_count', sql.Int, dto.eventCount || null)
      .input('target_role', sql.NVarChar, dto.targetRole || null)
      .input('target_department_id', sql.Int, dto.targetDepartmentId || null)
      .input('days_until_deadline', sql.Int, dto.daysUntilDeadline || null)
      .input('reminder_days', sql.Int, dto.reminderDays || null)
      .input('ativo', sql.Bit, dto.active !== false ? 1 : 0)
      .input('conditions', sql.NVarChar, dto.conditions ? JSON.stringify(dto.conditions) : null).query(`
        INSERT INTO review_triggers (
          name, description, template_id, trigger_type, event, event_count,
          target_role, target_department_id, days_until_deadline, reminder_days,
          ativo, conditions, created_at, updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @description, @template_id, @trigger_type, @event, @event_count,
          @target_role, @target_department_id, @days_until_deadline, @reminder_days,
          @ativo, @conditions, GETDATE(), GETDATE()
        )
      `);

    const triggerId = result.recordset[0].id;

    this.logger.log(`Review trigger created: ${dto.name} (ID: ${triggerId})`);
    return this.getById(triggerId, tenantId);
  }

  /**
   * List review triggers
   */
  async list(tenantId: number, activeOnly: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTriggersTable(pool);

    const whereClause = activeOnly ? ' WHERE t.ativo = 1' : '';

    const result = await pool.request().query(`
      SELECT
        t.id,
        t.name AS name,
        t.description AS description,
        t.template_id,
        rt.name AS template_name,
        t.trigger_type,
        t.event,
        t.event_count,
        t.target_role,
        t.target_department_id,
        t.days_until_deadline,
        t.reminder_days,
        t.ativo AS active,
        t.conditions,
        t.last_triggered,
        t.created_at AS created_at,
        t.updated_at AS updated_at,
        (SELECT COUNT(*) FROM review_trigger_log WHERE trigger_id = t.id) AS execution_count
      FROM review_triggers t
      INNER JOIN review_templates rt ON t.template_id = rt.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `);

    return result.recordset.map(this.parseTrigger);
  }

  /**
   * Get trigger by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTriggersTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        t.id,
        t.name AS name,
        t.description AS description,
        t.template_id,
        rt.name AS template_name,
        t.trigger_type,
        t.event,
        t.event_count,
        t.target_role,
        t.target_department_id,
        t.days_until_deadline,
        t.reminder_days,
        t.ativo AS active,
        t.conditions,
        t.last_triggered,
        t.created_at AS created_at,
        t.updated_at AS updated_at
      FROM review_triggers t
      INNER JOIN review_templates rt ON t.template_id = rt.id
      WHERE t.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Review trigger with ID ${id} not found`);
    }

    return this.parseTrigger(result.recordset[0]);
  }

  /**
   * Update trigger
   */
  async update(id: number, dto: UpdateReviewTriggerDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTriggersTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('template_id', sql.Int, dto.templateId)
      .input('trigger_type', sql.NVarChar, dto.triggerType)
      .input('event', sql.NVarChar, dto.event || null)
      .input('event_count', sql.Int, dto.eventCount || null)
      .input('target_role', sql.NVarChar, dto.targetRole || null)
      .input('target_department_id', sql.Int, dto.targetDepartmentId || null)
      .input('days_until_deadline', sql.Int, dto.daysUntilDeadline || null)
      .input('reminder_days', sql.Int, dto.reminderDays || null)
      .input('ativo', sql.Bit, dto.active !== false ? 1 : 0)
      .input('conditions', sql.NVarChar, dto.conditions ? JSON.stringify(dto.conditions) : null).query(`
        UPDATE review_triggers
        SET
          name = @name,
          description = @description,
          template_id = @template_id,
          trigger_type = @trigger_type,
          event = @event,
          event_count = @event_count,
          target_role = @target_role,
          target_department_id = @target_department_id,
          days_until_deadline = @days_until_deadline,
          reminder_days = @reminder_days,
          ativo = @ativo,
          conditions = @conditions,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Review trigger updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete trigger
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTriggersTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM review_triggers WHERE id = @id
    `);

    this.logger.log(`Review trigger deleted: ${id}`);
    return { message: 'Review trigger deleted successfully' };
  }

  /**
   * Execute trigger for an event (called from other modules)
   * Example: When a ticket is closed, intervention completed, etc.
   */
  async executeEventTrigger(
    event: TriggerEvent,
    entityId: number,
    entityType: string,
    context: any,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTriggersTable(pool);

    // Find active triggers for this event
    const triggers = await pool.request().input('event', sql.NVarChar, event).input('ativo', sql.Bit, 1).query(`
      SELECT * FROM review_triggers
      WHERE event = @event AND ativo = @ativo
    `);

    for (const trigger of triggers.recordset) {
      try {
        // Check if should execute based on event_count
        if (trigger.event_count) {
          const count = await this.getEventCount(entityType, context, tenantId);
          if (count % trigger.event_count !== 0) {
            continue; // Skip this trigger
          }
        }

        // Create review request based on trigger configuration
        const deadline = trigger.days_until_deadline
          ? new Date(Date.now() + trigger.days_until_deadline * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const requestDto: any = {
          templateId: trigger.template_id,
          deadline,
        };

        // Set respondent based on trigger target and context
        if (context.clientId) requestDto.respondentClientId = context.clientId;
        if (context.employeeId) requestDto.respondentEmployeeId = context.employeeId;
        if (context.userId) requestDto.respondentUserId = context.userId;

        // Set subject based on context
        if (context.subjectUserId) requestDto.subjectUserId = context.subjectUserId;
        if (context.subjectEmployeeId) requestDto.subjectEmployeeId = context.subjectEmployeeId;

        // Set related entities
        if (context.ticketId) requestDto.ticketId = context.ticketId;
        if (context.interventionId) requestDto.interventionId = context.interventionId;
        if (context.supplierId) requestDto.supplierId = context.supplierId;
        if (context.brandId) requestDto.brandId = context.brandId;
        if (context.equipmentId) requestDto.equipmentId = context.equipmentId;

        // Create the review request
        const request = await this.reviewRequestService.create(requestDto, tenantId, context.userId || 0);

        // Log trigger execution
        await pool
          .request()
          .input('trigger_id', sql.Int, trigger.id)
          .input('entity_id', sql.Int, entityId)
          .input('entity_type', sql.NVarChar, entityType)
          .input('request_id', sql.Int, request.id).query(`
            INSERT INTO review_trigger_log (trigger_id, entity_id, entity_type, request_id, executed_at)
            VALUES (@trigger_id, @entity_id, @entity_type, @request_id, GETDATE())
          `);

        // Update last_triggered
        await pool.request().input('id', sql.Int, trigger.id).query(`
          UPDATE review_triggers SET last_triggered = GETDATE() WHERE id = @id
        `);

        this.logger.log(`Trigger executed: ${trigger.name} for ${entityType} ${entityId}`);
      } catch (error) {
        this.logger.error(`Failed to execute trigger ${trigger.id}:`, error.message);
      }
    }
  }

  /**
   * Get event count for trigger logic (e.g., every N interventions)
   */
  private async getEventCount(entityType: string, context: any, tenantId: number): Promise<number> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    if (entityType === 'intervention' && context.clientId) {
      const result = await pool.request().input('clientId', sql.Int, context.clientId).query(`
        SELECT COUNT(*) as count FROM intervencoes WHERE cliente_id = @clientId AND status = 'completed'
      `);
      return result.recordset[0].count;
    }

    if (entityType === 'ticket' && context.clientId) {
      const result = await pool.request().input('clientId', sql.Int, context.clientId).query(`
        SELECT COUNT(*) as count FROM tickets WHERE cliente_id = @clientId AND status = 'closed'
      `);
      return result.recordset[0].count;
    }

    return 0;
  }

  /**
   * Parse trigger record
   */
  private parseTrigger(record: any) {
    return {
      ...record,
      active: Boolean(record.active),
      conditions: record.conditions ? JSON.parse(record.conditions) : null,
    };
  }
}
