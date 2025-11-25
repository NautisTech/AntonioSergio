import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateReviewRequestDto,
  SubmitReviewResponseDto,
  ReviewRequestStatus,
  ReviewRequestFilterDto,
} from './dto';
import * as sql from 'mssql';

/**
 * Review Request Service
 * Manages review requests, responses, and scoring
 */
@Injectable()
export class ReviewRequestService {
  private readonly logger = new Logger(ReviewRequestService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure review_requests and review_responses tables exist
   */
  private async ensureRequestsTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_requests' AND xtype='U')
      BEGIN
        CREATE TABLE review_requests (
          id INT IDENTITY(1,1) PRIMARY KEY,
          template_id INT NOT NULL,
          respondent_user_id INT NULL,
          respondent_employee_id INT NULL,
          respondent_client_id INT NULL,
          respondent_email NVARCHAR(200) NULL,
          subject_user_id INT NULL,
          subject_employee_id INT NULL,
          ticket_id INT NULL,
          intervention_id INT NULL,
          supplier_id INT NULL,
          brand_id INT NULL,
          equipment_id INT NULL,
          status NVARCHAR(20) DEFAULT 'pending',
          unique_code NVARCHAR(50) NOT NULL UNIQUE,
          deadline DATETIME NULL,
          send_email BIT DEFAULT 1,
          custom_message NVARCHAR(MAX) NULL,
          metadata NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          respondido_em DATETIME NULL,
          FOREIGN KEY (template_id) REFERENCES review_templates(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_review_requests_template ON review_requests(template_id)
        CREATE INDEX idx_review_requests_status ON review_requests(status)
        CREATE INDEX idx_review_requests_respondent_user ON review_requests(respondent_user_id)
        CREATE INDEX idx_review_requests_respondent_employee ON review_requests(respondent_employee_id)
        CREATE INDEX idx_review_requests_subject_user ON review_requests(subject_user_id)
        CREATE INDEX idx_review_requests_ticket ON review_requests(ticket_id)
        CREATE INDEX idx_review_requests_intervention ON review_requests(intervention_id)
        CREATE INDEX idx_review_requests_code ON review_requests(unique_code)
      END

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_responses' AND xtype='U')
      BEGIN
        CREATE TABLE review_responses (
          id INT IDENTITY(1,1) PRIMARY KEY,
          request_id INT NOT NULL,
          overall_comment NVARCHAR(MAX) NULL,
          overall_score DECIMAL(5,2) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (request_id) REFERENCES review_requests(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_review_responses_request ON review_responses(request_id)
      END

      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='review_answers' AND xtype='U')
      BEGIN
        CREATE TABLE review_answers (
          id INT IDENTITY(1,1) PRIMARY KEY,
          response_id INT NOT NULL,
          question_id INT NOT NULL,
          answer NVARCHAR(MAX) NULL,
          comment NVARCHAR(MAX) NULL,
          score DECIMAL(5,2) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (response_id) REFERENCES review_responses(id) ON DELETE CASCADE,
          FOREIGN KEY (question_id) REFERENCES review_questions(id)
        )

        CREATE INDEX idx_review_answers_response ON review_answers(response_id)
        CREATE INDEX idx_review_answers_question ON review_answers(question_id)
      END
    `);
  }

  /**
   * Generate unique access code
   */
  private async generateUniqueCode(pool: any): Promise<string> {
    let attempts = 0;
    let code: string;

    do {
      code = Math.random().toString(36).substring(2, 15).toUpperCase();
      const exists = await pool
        .request()
        .input('code', sql.NVarChar, code)
        .query('SELECT 1 FROM review_requests WHERE unique_code = @code');

      if (exists.recordset.length === 0) break;
      attempts++;
    } while (attempts < 10);

    return code;
  }

  /**
   * Create review request
   */
  async create(dto: CreateReviewRequestDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureRequestsTables(pool);

    const uniqueCode = await this.generateUniqueCode(pool);

    const result = await pool
      .request()
      .input('template_id', sql.Int, dto.templateId)
      .input('respondent_user_id', sql.Int, dto.respondentUserId || null)
      .input('respondent_employee_id', sql.Int, dto.respondentEmployeeId || null)
      .input('respondent_client_id', sql.Int, dto.respondentClientId || null)
      .input('respondent_email', sql.NVarChar, dto.respondentEmail || null)
      .input('subject_user_id', sql.Int, dto.subjectUserId || null)
      .input('subject_employee_id', sql.Int, dto.subjectEmployeeId || null)
      .input('ticket_id', sql.Int, dto.ticketId || null)
      .input('intervention_id', sql.Int, dto.interventionId || null)
      .input('supplier_id', sql.Int, dto.supplierId || null)
      .input('brand_id', sql.Int, dto.brandId || null)
      .input('equipment_id', sql.Int, dto.equipmentId || null)
      .input('unique_code', sql.NVarChar, uniqueCode)
      .input('deadline', sql.DateTime, dto.deadline ? new Date(dto.deadline) : null)
      .input('send_email', sql.Bit, dto.sendEmail !== false ? 1 : 0)
      .input('custom_message', sql.NVarChar, dto.customMessage || null)
      .input('metadata', sql.NVarChar, dto.metadata ? JSON.stringify(dto.metadata) : null).query(`
        INSERT INTO review_requests (
          template_id, respondent_user_id, respondent_employee_id, respondent_client_id, respondent_email,
          subject_user_id, subject_employee_id, ticket_id, intervention_id, supplier_id, brand_id, equipment_id,
          status, unique_code, deadline, send_email, custom_message, metadata, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @template_id, @respondent_user_id, @respondent_employee_id, @respondent_client_id, @respondent_email,
          @subject_user_id, @subject_employee_id, @ticket_id, @intervention_id, @supplier_id, @brand_id, @equipment_id,
          'pending', @unique_code, @deadline, @send_email, @custom_message, @metadata, GETDATE()
        )
      `);

    const requestId = result.recordset[0].id;

    this.logger.log(`Review request created: ${uniqueCode} (ID: ${requestId})`);
    return this.getById(requestId, tenantId);
  }

  /**
   * Submit review response
   */
  async submitResponse(dto: SubmitReviewResponseDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureRequestsTables(pool);

    // Get request
    const request = await this.getById(dto.requestId, tenantId);

    if (request.status === 'completed') {
      throw new BadRequestException('This review has already been completed');
    }

    if (request.status === 'expired') {
      throw new BadRequestException('This review has expired');
    }

    // Create response
    const responseResult = await pool
      .request()
      .input('request_id', sql.Int, dto.requestId)
      .input('overall_comment', sql.NVarChar, dto.overallComment || null).query(`
        INSERT INTO review_responses (request_id, overall_comment, created_at)
        OUTPUT INSERTED.id
        VALUES (@request_id, @overall_comment, GETDATE())
      `);

    const responseId = responseResult.recordset[0].id;

    // Save answers and calculate scores
    let totalScore = 0;
    let scoredAnswers = 0;

    for (const answer of dto.answers) {
      // Get question details
      const questionResult = await pool.request().input('id', sql.Int, answer.questionId).query(`
        SELECT type, options, min_value, max_value FROM review_questions WHERE id = @id
      `);

      if (questionResult.recordset.length === 0) continue;

      const question = questionResult.recordset[0];
      const answerScore = this.calculateAnswerScore(answer.answer, question);

      await pool
        .request()
        .input('response_id', sql.Int, responseId)
        .input('question_id', sql.Int, answer.questionId)
        .input('answer', sql.NVarChar, typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : String(answer.answer))
        .input('comment', sql.NVarChar, answer.comment || null)
        .input('score', sql.Decimal(5, 2), answerScore).query(`
          INSERT INTO review_answers (response_id, question_id, answer, comment, score, created_at)
          VALUES (@response_id, @question_id, @answer, @comment, @score, GETDATE())
        `);

      if (answerScore !== null) {
        totalScore += answerScore;
        scoredAnswers++;
      }
    }

    // Calculate overall score
    const overallScore = scoredAnswers > 0 ? totalScore / scoredAnswers : null;

    // Update response with overall score
    await pool
      .request()
      .input('id', sql.Int, responseId)
      .input('overall_score', sql.Decimal(5, 2), overallScore).query(`
        UPDATE review_responses SET overall_score = @overall_score WHERE id = @id
      `);

    // Update request status
    await pool.request().input('id', sql.Int, dto.requestId).query(`
      UPDATE review_requests
      SET status = 'completed', respondido_em = GETDATE()
      WHERE id = @id
    `);

    this.logger.log(`Review response submitted: request ${dto.requestId}, score ${overallScore}`);
    return this.getResponse(responseId, tenantId);
  }

  /**
   * Calculate score for an answer based on question type
   */
  private calculateAnswerScore(answer: any, question: any): number | null {
    const type = question.type;

    // Rating questions (1-5)
    if (type === 'rating' || type === 'csat') {
      return typeof answer === 'number' ? answer : null;
    }

    // NPS (0-10)
    if (type === 'nps') {
      return typeof answer === 'number' ? (answer / 10) * 5 : null; // Normalize to 0-5
    }

    // CES (1-7)
    if (type === 'ces') {
      return typeof answer === 'number' ? (answer / 7) * 5 : null; // Normalize to 0-5
    }

    // Scale (custom min-max)
    if (type === 'scale') {
      if (typeof answer === 'number' && question.min_value !== null && question.max_value !== null) {
        const range = question.max_value - question.min_value;
        const normalized = (answer - question.min_value) / range;
        return normalized * 5; // Normalize to 0-5
      }
      return null;
    }

    // Yes/No
    if (type === 'yes_no') {
      return answer === 'yes' || answer === true ? 5 : 1;
    }

    // Multiple/Single choice with scores
    if (type === 'multiple_choice' || type === 'single_choice') {
      try {
        const options = JSON.parse(question.options);
        if (Array.isArray(answer)) {
          // Multiple choice - average of selected options
          const scores = answer
            .map((val) => options.find((opt) => opt.value === val)?.score)
            .filter((s) => s !== undefined);
          return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        } else {
          // Single choice
          const option = options.find((opt) => opt.value === answer);
          return option?.score || null;
        }
      } catch {
        return null;
      }
    }

    // Text answers don't have scores
    return null;
  }

  /**
   * List review requests
   */
  async list(tenantId: number, filters?: ReviewRequestFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureRequestsTables(pool);

    const request = pool.request();
    const conditions: string[] = [];

    if (filters?.templateId) {
      conditions.push('rr.template_id = @templateId');
      request.input('templateId', sql.Int, filters.templateId);
    }

    if (filters?.status) {
      conditions.push('rr.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters?.respondentUserId) {
      conditions.push('rr.respondent_user_id = @respondentUserId');
      request.input('respondentUserId', sql.Int, filters.respondentUserId);
    }

    if (filters?.respondentEmployeeId) {
      conditions.push('rr.respondent_employee_id = @respondentEmployeeId');
      request.input('respondentEmployeeId', sql.Int, filters.respondentEmployeeId);
    }

    if (filters?.subjectUserId) {
      conditions.push('rr.subject_user_id = @subjectUserId');
      request.input('subjectUserId', sql.Int, filters.subjectUserId);
    }

    if (filters?.overdueOnly) {
      conditions.push('rr.deadline < GETDATE() AND rr.status = @pendingStatus');
      request.input('pendingStatus', sql.NVarChar, ReviewRequestStatus.PENDING);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      rr.id,
      rr.template_id,
      rt.name AS template_name,
      rt.type AS template_type,
      rr.respondent_user_id,
      rr.respondent_employee_id,
      rr.respondent_client_id,
      rr.respondent_email,
      rr.subject_user_id,
      rr.subject_employee_id,
      rr.ticket_id,
      rr.intervention_id,
      rr.supplier_id,
      rr.brand_id,
      rr.equipment_id,
      rr.status,
      rr.unique_code,
      rr.deadline,
      rr.custom_message,
      rr.metadata,
      rr.created_at AS created_at,
      rr.respondido_em AS responded_at,
      CASE WHEN rr.deadline < GETDATE() AND rr.status = 'pending' THEN 1 ELSE 0 END AS is_overdue
    `;

    const fromClause = `
      FROM review_requests rr
      INNER JOIN review_templates rt ON rr.template_id = rt.id
    `;

    const orderBy = ' ORDER BY rr.created_at DESC';

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const query = `SELECT ${selectFields} ${fromClause} ${whereClause} ${orderBy}`;
      const result = await request.query(query);
      return result.recordset.map(this.parseRequest);
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
      data: dataResult.recordset.map(this.parseRequest),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get request by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureRequestsTables(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        rr.id,
        rr.template_id,
        rt.name AS template_name,
        rt.type AS template_type,
        rt.intro_message,
        rt.thank_you_message,
        rr.respondent_user_id,
        rr.respondent_employee_id,
        rr.respondent_client_id,
        rr.respondent_email,
        rr.subject_user_id,
        rr.subject_employee_id,
        rr.ticket_id,
        rr.intervention_id,
        rr.supplier_id,
        rr.brand_id,
        rr.equipment_id,
        rr.status,
        rr.unique_code,
        rr.deadline,
        rr.custom_message,
        rr.metadata,
        rr.created_at AS created_at,
        rr.respondido_em AS responded_at
      FROM review_requests rr
      INNER JOIN review_templates rt ON rr.template_id = rt.id
      WHERE rr.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Review request with ID ${id} not found`);
    }

    return this.parseRequest(result.recordset[0]);
  }

  /**
   * Get response with answers
   */
  async getResponse(responseId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureRequestsTables(pool);

    const responseResult = await pool.request().input('id', sql.Int, responseId).query(`
      SELECT
        r.id,
        r.request_id,
        r.overall_comment,
        r.overall_score,
        r.created_at AS created_at
      FROM review_responses r
      WHERE r.id = @id
    `);

    if (responseResult.recordset.length === 0) {
      throw new NotFoundException(`Review response with ID ${responseId} not found`);
    }

    const response = responseResult.recordset[0];

    // Get answers
    const answersResult = await pool.request().input('response_id', sql.Int, responseId).query(`
      SELECT
        a.id,
        a.question_id,
        q.question,
        q.type AS question_type,
        a.answer,
        a.comment,
        a.score,
        a.created_at AS created_at
      FROM review_answers a
      INNER JOIN review_questions q ON a.question_id = q.id
      WHERE a.response_id = @response_id
      ORDER BY q.display_order, q.id
    `);

    response.answers = answersResult.recordset.map((a) => ({
      ...a,
      answer: this.parseAnswer(a.answer, a.question_type),
    }));

    return response;
  }

  /**
   * Cancel review request
   */
  async cancel(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureRequestsTables(pool);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE review_requests SET status = 'cancelled' WHERE id = @id
    `);

    this.logger.log(`Review request cancelled: ${id}`);
    return { message: 'Review request cancelled successfully' };
  }

  /**
   * Parse request record
   */
  private parseRequest(record: any) {
    return {
      ...record,
      metadata: record.metadata ? JSON.parse(record.metadata) : null,
      is_overdue: Boolean(record.is_overdue),
    };
  }

  /**
   * Parse answer based on question type
   */
  private parseAnswer(answer: string, questionType: string) {
    if (questionType === 'multiple_choice') {
      try {
        return JSON.parse(answer);
      } catch {
        return answer;
      }
    }

    if (questionType === 'rating' || questionType === 'scale' || questionType === 'nps' || questionType === 'csat' || questionType === 'ces') {
      const num = parseFloat(answer);
      return isNaN(num) ? answer : num;
    }

    if (questionType === 'yes_no') {
      return answer === 'true' || answer === '1' || answer === 'yes';
    }

    return answer;
  }
}
