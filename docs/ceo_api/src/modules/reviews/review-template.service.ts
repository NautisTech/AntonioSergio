import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateReviewTemplateDto,
  UpdateReviewTemplateDto,
  ReviewType,
  QuestionType,
} from './dto';
import * as sql from 'mssql';

/**
 * Review Template Service
 * Manages review templates and questions
 */
@Injectable()
export class ReviewTemplateService {
  private readonly logger = new Logger(ReviewTemplateService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure review_templates table exists
   */
  private async ensureTemplatesTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_templates' AND xtype='U')
      BEGIN
        CREATE TABLE review_templates (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX) NULL,
          type NVARCHAR(50) NOT NULL,
          intro_message NVARCHAR(MAX) NULL,
          thank_you_message NVARCHAR(MAX) NULL,
          requires_approval BIT DEFAULT 0,
          allow_anonymous BIT DEFAULT 0,
          ativo BIT DEFAULT 1,
          icone NVARCHAR(10) NULL,
          cor NVARCHAR(20) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        )

        CREATE INDEX idx_review_templates_tipo ON review_templates(type)
        CREATE INDEX idx_review_templates_ativo ON review_templates(ativo)
      END

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_questions' AND xtype='U')
      BEGIN
        CREATE TABLE review_questions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          template_id INT NOT NULL,
          question NVARCHAR(500) NOT NULL,
          description NVARCHAR(1000) NULL,
          type NVARCHAR(50) NOT NULL,
          required BIT DEFAULT 1,
          display_order INT DEFAULT 0,
          options NVARCHAR(MAX) NULL,
          min_value INT NULL,
          max_value INT NULL,
          min_label NVARCHAR(100) NULL,
          max_label NVARCHAR(100) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (template_id) REFERENCES review_templates(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_review_questions_template ON review_questions(template_id)
        CREATE INDEX idx_review_questions_order ON review_questions(template_id, display_order)
      END
    `);
  }

  /**
   * Create review template with questions
   */
  async create(dto: CreateReviewTemplateDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTemplatesTables(pool);

    // Create template
    const templateResult = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('type', sql.NVarChar, dto.type)
      .input('intro_message', sql.NVarChar, dto.introMessage || null)
      .input('thank_you_message', sql.NVarChar, dto.thankYouMessage || null)
      .input('requires_approval', sql.Bit, dto.requiresApproval ? 1 : 0)
      .input('allow_anonymous', sql.Bit, dto.allowAnonymous ? 1 : 0)
      .input('ativo', sql.Bit, dto.active !== false ? 1 : 0)
      .input('icone', sql.NVarChar, dto.icon || null)
      .input('cor', sql.NVarChar, dto.color || null).query(`
        INSERT INTO review_templates (
          name, description, type, intro_message, thank_you_message,
          requires_approval, allow_anonymous, ativo, icone, cor, created_at, updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @description, @type, @intro_message, @thank_you_message,
          @requires_approval, @allow_anonymous, @ativo, @icone, @cor, GETDATE(), GETDATE()
        )
      `);

    const templateId = templateResult.recordset[0].id;

    // Create questions
    for (const question of dto.questions) {
      await pool
        .request()
        .input('template_id', sql.Int, templateId)
        .input('question', sql.NVarChar, question.question)
        .input('description', sql.NVarChar, question.description || null)
        .input('type', sql.NVarChar, question.type)
        .input('required', sql.Bit, question.required !== false ? 1 : 0)
        .input('display_order', sql.Int, question.order || 0)
        .input('options', sql.NVarChar, question.options ? JSON.stringify(question.options) : null)
        .input('min_value', sql.Int, question.minValue || null)
        .input('max_value', sql.Int, question.maxValue || null)
        .input('min_label', sql.NVarChar, question.minLabel || null)
        .input('max_label', sql.NVarChar, question.maxLabel || null).query(`
          INSERT INTO review_questions (
            template_id, question, description, type, required, display_order,
            options, min_value, max_value, min_label, max_label, created_at
          )
          VALUES (
            @template_id, @question, @description, @type, @required, @display_order,
            @options, @min_value, @max_value, @min_label, @max_label, GETDATE()
          )
        `);
    }

    this.logger.log(`Review template created: ${dto.name} (ID: ${templateId})`);
    return this.getById(templateId, tenantId);
  }

  /**
   * List review templates
   */
  async list(
    tenantId: number,
    filters?: {
      type?: ReviewType;
      active?: boolean;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTemplatesTables(pool);

    const request = pool.request();
    const conditions: string[] = [];

    if (filters?.type) {
      conditions.push('t.type = @type');
      request.input('type', sql.NVarChar, filters.type);
    }

    if (filters?.active !== undefined) {
      conditions.push('t.ativo = @active');
      request.input('active', sql.Bit, filters.active ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      t.id,
      t.name AS name,
      t.description AS description,
      t.type AS type,
      t.intro_message,
      t.thank_you_message,
      t.requires_approval,
      t.allow_anonymous,
      t.ativo AS active,
      t.icone AS icon,
      t.cor AS color,
      t.created_at AS created_at,
      t.updated_at AS updated_at,
      (SELECT COUNT(*) FROM review_questions WHERE template_id = t.id) AS question_count,
      (SELECT COUNT(*) FROM review_requests WHERE template_id = t.id) AS request_count
    `;

    const fromClause = 'FROM review_templates t';
    const orderBy = ' ORDER BY t.created_at DESC';

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const query = `SELECT ${selectFields} ${fromClause} ${whereClause} ${orderBy}`;
      const result = await request.query(query);
      return result.recordset.map(this.parseTemplate);
    }

    // With pagination
    const page = filters.page;
    const pageSize = filters.pageSize;
    const offset = (page - 1) * pageSize;

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const countQuery = `SELECT COUNT(*) as total ${fromClause} ${whereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

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
      data: dataResult.recordset.map(this.parseTemplate),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get template by ID with questions
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTemplatesTables(pool);

    const templateResult = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        t.id,
        t.name AS name,
        t.description AS description,
        t.type AS type,
        t.intro_message,
        t.thank_you_message,
        t.requires_approval,
        t.allow_anonymous,
        t.ativo AS active,
        t.icone AS icon,
        t.cor AS color,
        t.created_at AS created_at,
        t.updated_at AS updated_at
      FROM review_templates t
      WHERE t.id = @id
    `);

    if (templateResult.recordset.length === 0) {
      throw new NotFoundException(`Review template with ID ${id} not found`);
    }

    const template = this.parseTemplate(templateResult.recordset[0]);

    // Get questions
    const questionsResult = await pool.request().input('template_id', sql.Int, id).query(`
      SELECT
        id,
        question,
        description,
        type AS type,
        required,
        display_order AS order,
        options,
        min_value,
        max_value,
        min_label,
        max_label,
        created_at AS created_at
      FROM review_questions
      WHERE template_id = @template_id
      ORDER BY display_order, id
    `);

    template.questions = questionsResult.recordset.map(this.parseQuestion);

    return template;
  }

  /**
   * Update template
   */
  async update(id: number, dto: UpdateReviewTemplateDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTemplatesTables(pool);

    // Check if exists
    await this.getById(id, tenantId);

    // Update template
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('type', sql.NVarChar, dto.type)
      .input('intro_message', sql.NVarChar, dto.introMessage || null)
      .input('thank_you_message', sql.NVarChar, dto.thankYouMessage || null)
      .input('requires_approval', sql.Bit, dto.requiresApproval ? 1 : 0)
      .input('allow_anonymous', sql.Bit, dto.allowAnonymous ? 1 : 0)
      .input('ativo', sql.Bit, dto.active !== false ? 1 : 0)
      .input('icone', sql.NVarChar, dto.icon || null)
      .input('cor', sql.NVarChar, dto.color || null).query(`
        UPDATE review_templates
        SET
          name = @name,
          description = @description,
          type = @type,
          intro_message = @intro_message,
          thank_you_message = @thank_you_message,
          requires_approval = @requires_approval,
          allow_anonymous = @allow_anonymous,
          ativo = @ativo,
          icone = @icone,
          cor = @cor,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    // Delete old questions and recreate
    await pool.request().input('template_id', sql.Int, id).query(`
      DELETE FROM review_questions WHERE template_id = @template_id
    `);

    // Create new questions
    for (const question of dto.questions) {
      await pool
        .request()
        .input('template_id', sql.Int, id)
        .input('question', sql.NVarChar, question.question)
        .input('description', sql.NVarChar, question.description || null)
        .input('type', sql.NVarChar, question.type)
        .input('required', sql.Bit, question.required !== false ? 1 : 0)
        .input('display_order', sql.Int, question.order || 0)
        .input('options', sql.NVarChar, question.options ? JSON.stringify(question.options) : null)
        .input('min_value', sql.Int, question.minValue || null)
        .input('max_value', sql.Int, question.maxValue || null)
        .input('min_label', sql.NVarChar, question.minLabel || null)
        .input('max_label', sql.NVarChar, question.maxLabel || null).query(`
          INSERT INTO review_questions (
            template_id, question, description, type, required, display_order,
            options, min_value, max_value, min_label, max_label, created_at
          )
          VALUES (
            @template_id, @question, @description, @type, @required, @display_order,
            @options, @min_value, @max_value, @min_label, @max_label, GETDATE()
          )
        `);
    }

    this.logger.log(`Review template updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete template
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTemplatesTables(pool);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has requests
    const requestsCheck = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) as total FROM review_requests WHERE template_id = @id
    `);

    if (requestsCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete template that has review requests');
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM review_templates WHERE id = @id
    `);

    this.logger.log(`Review template deleted: ${id}`);
    return { message: 'Review template deleted successfully' };
  }

  /**
   * Get template statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTemplatesTables(pool);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as total_templates,
        COUNT(CASE WHEN ativo = 1 THEN 1 END) as active_templates,
        (SELECT COUNT(*) FROM review_questions) as total_questions,
        (SELECT COUNT(DISTINCT type) FROM review_templates) as unique_types
      FROM review_templates
    `);

    const byType = await pool.request().query(`
      SELECT
        type AS type,
        COUNT(*) as count
      FROM review_templates
      GROUP BY type
      ORDER BY count DESC
    `);

    return {
      overview: result.recordset[0],
      byType: byType.recordset,
    };
  }

  /**
   * Parse template record
   */
  private parseTemplate(record: any) {
    return {
      ...record,
      requires_approval: Boolean(record.requires_approval),
      allow_anonymous: Boolean(record.allow_anonymous),
      active: Boolean(record.active),
    };
  }

  /**
   * Parse question record
   */
  private parseQuestion(record: any) {
    return {
      ...record,
      required: Boolean(record.required),
      options: record.options ? JSON.parse(record.options) : null,
    };
  }
}
