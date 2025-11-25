import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ReviewAnalyticsFilterDto, ReviewType } from './dto';
import * as sql from 'mssql';

/**
 * Review Analytics Service
 * Provides statistics and reports on review data
 */
@Injectable()
export class ReviewAnalyticsService {
  private readonly logger = new Logger(ReviewAnalyticsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get overall review statistics
   */
  async getOverviewStatistics(tenantId: number, filters?: ReviewAnalyticsFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const dateFilter = this.buildDateFilter(filters);
    const request = pool.request();

    if (filters?.startDate) request.input('startDate', sql.DateTime, new Date(filters.startDate));
    if (filters?.endDate) request.input('endDate', sql.DateTime, new Date(filters.endDate));
    if (filters?.templateId) request.input('templateId', sql.Int, filters.templateId);

    const templateCondition = filters?.templateId ? 'AND rr.template_id = @templateId' : '';

    const result = await request.query(`
      SELECT
        COUNT(DISTINCT rr.id) as total_requests,
        COUNT(DISTINCT CASE WHEN rr.status = 'completed' THEN rr.id END) as completed_requests,
        COUNT(DISTINCT CASE WHEN rr.status = 'pending' THEN rr.id END) as pending_requests,
        COUNT(DISTINCT CASE WHEN rr.status = 'expired' THEN rr.id END) as expired_requests,
        COUNT(DISTINCT CASE WHEN rr.deadline < GETDATE() AND rr.status = 'pending' THEN rr.id END) as overdue_requests,
        AVG(resp.overall_score) as avg_score,
        COUNT(DISTINCT resp.id) as total_responses,
        CAST(COUNT(DISTINCT CASE WHEN rr.status = 'completed' THEN rr.id END) AS FLOAT) / NULLIF(COUNT(DISTINCT rr.id), 0) * 100 as completion_rate
      FROM review_requests rr
      LEFT JOIN review_responses resp ON rr.id = resp.request_id
      WHERE 1=1 ${dateFilter} ${templateCondition}
    `);

    return result.recordset[0];
  }

  /**
   * Get statistics by review type
   */
  async getStatisticsByType(tenantId: number, filters?: ReviewAnalyticsFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const dateFilter = this.buildDateFilter(filters);
    const request = pool.request();

    if (filters?.startDate) request.input('startDate', sql.DateTime, new Date(filters.startDate));
    if (filters?.endDate) request.input('endDate', sql.DateTime, new Date(filters.endDate));

    const result = await request.query(`
      SELECT
        rt.type AS type,
        rt.name AS template_name,
        COUNT(DISTINCT rr.id) as total_requests,
        COUNT(DISTINCT CASE WHEN rr.status = 'completed' THEN rr.id END) as completed_requests,
        AVG(resp.overall_score) as avg_score,
        MIN(resp.overall_score) as min_score,
        MAX(resp.overall_score) as max_score
      FROM review_requests rr
      INNER JOIN review_templates rt ON rr.template_id = rt.id
      LEFT JOIN review_responses resp ON rr.id = resp.request_id
      WHERE 1=1 ${dateFilter}
      GROUP BY rt.type, rt.name
      ORDER BY completed_requests DESC
    `);

    return result.recordset;
  }

  /**
   * Get top rated subjects (employees, suppliers, etc.)
   */
  async getTopRatedSubjects(
    tenantId: number,
    subjectType: 'employee' | 'supplier' | 'brand',
    limit: number = 10,
    filters?: ReviewAnalyticsFilterDto,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const dateFilter = this.buildDateFilter(filters);
    const request = pool.request().input('limit', sql.Int, limit);

    if (filters?.startDate) request.input('startDate', sql.DateTime, new Date(filters.startDate));
    if (filters?.endDate) request.input('endDate', sql.DateTime, new Date(filters.endDate));

    let subjectField = '';
    let joinClause = '';
    let nameField = '';

    if (subjectType === 'employee') {
      subjectField = 'rr.subject_employee_id';
      joinClause = 'LEFT JOIN funcionarios f ON rr.subject_employee_id = f.id';
      nameField = 'f.name_completo';
    } else if (subjectType === 'supplier') {
      subjectField = 'rr.supplier_id';
      joinClause = 'LEFT JOIN fornecedores s ON rr.supplier_id = s.id';
      nameField = 's.name';
    } else if (subjectType === 'brand') {
      subjectField = 'rr.brand_id';
      joinClause = 'LEFT JOIN marcas b ON rr.brand_id = b.id';
      nameField = 'b.name';
    }

    const result = await request.query(`
      SELECT TOP (@limit)
        ${subjectField} AS subject_id,
        ${nameField} AS subject_name,
        COUNT(DISTINCT rr.id) as total_reviews,
        AVG(resp.overall_score) as avg_score,
        MIN(resp.overall_score) as min_score,
        MAX(resp.overall_score) as max_score
      FROM review_requests rr
      INNER JOIN review_responses resp ON rr.id = resp.request_id
      ${joinClause}
      WHERE ${subjectField} IS NOT NULL ${dateFilter}
      GROUP BY ${subjectField}, ${nameField}
      HAVING COUNT(DISTINCT rr.id) >= 3
      ORDER BY avg_score DESC, total_reviews DESC
    `);

    return result.recordset;
  }

  /**
   * Get response trends over time
   */
  async getResponseTrends(tenantId: number, filters?: ReviewAnalyticsFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const dateFilter = this.buildDateFilter(filters);
    const request = pool.request();

    if (filters?.startDate) request.input('startDate', sql.DateTime, new Date(filters.startDate));
    if (filters?.endDate) request.input('endDate', sql.DateTime, new Date(filters.endDate));

    const result = await request.query(`
      SELECT
        YEAR(resp.created_at) AS year,
        MONTH(resp.created_at) AS month,
        COUNT(DISTINCT resp.id) as responses_count,
        AVG(resp.overall_score) as avg_score
      FROM review_responses resp
      INNER JOIN review_requests rr ON resp.request_id = rr.id
      WHERE 1=1 ${dateFilter}
      GROUP BY YEAR(resp.created_at), MONTH(resp.created_at)
      ORDER BY year DESC, month DESC
    `);

    return result.recordset;
  }

  /**
   * Get question-level analytics
   */
  async getQuestionAnalytics(templateId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('templateId', sql.Int, templateId).query(`
      SELECT
        q.id AS question_id,
        q.question,
        q.type AS question_type,
        COUNT(a.id) as total_answers,
        AVG(a.score) as avg_score,
        MIN(a.score) as min_score,
        MAX(a.score) as max_score
      FROM review_questions q
      LEFT JOIN review_answers a ON q.id = a.question_id
      WHERE q.template_id = @templateId
      GROUP BY q.id, q.question, q.type, q.display_order
      ORDER BY q.display_order
    `);

    return result.recordset;
  }

  /**
   * Get completion rates by respondent type
   */
  async getCompletionRatesByRespondent(tenantId: number, filters?: ReviewAnalyticsFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const dateFilter = this.buildDateFilter(filters);
    const request = pool.request();

    if (filters?.startDate) request.input('startDate', sql.DateTime, new Date(filters.startDate));
    if (filters?.endDate) request.input('endDate', sql.DateTime, new Date(filters.endDate));

    const result = await request.query(`
      SELECT
        CASE
          WHEN respondent_client_id IS NOT NULL THEN 'Client'
          WHEN respondent_employee_id IS NOT NULL THEN 'Employee'
          WHEN respondent_user_id IS NOT NULL THEN 'User'
          ELSE 'External'
        END AS respondent_type,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        CAST(COUNT(CASE WHEN status = 'completed' THEN 1 END) AS FLOAT) / COUNT(*) * 100 as completion_rate
      FROM review_requests
      WHERE 1=1 ${dateFilter}
      GROUP BY
        CASE
          WHEN respondent_client_id IS NOT NULL THEN 'Client'
          WHEN respondent_employee_id IS NOT NULL THEN 'Employee'
          WHEN respondent_user_id IS NOT NULL THEN 'User'
          ELSE 'External'
        END
    `);

    return result.recordset;
  }

  /**
   * Get employee performance reviews summary
   */
  async getEmployeePerformanceSummary(employeeId: number, tenantId: number, filters?: ReviewAnalyticsFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const dateFilter = this.buildDateFilter(filters);
    const request = pool.request().input('employeeId', sql.Int, employeeId);

    if (filters?.startDate) request.input('startDate', sql.DateTime, new Date(filters.startDate));
    if (filters?.endDate) request.input('endDate', sql.DateTime, new Date(filters.endDate));

    const result = await request.query(`
      SELECT
        rt.type AS review_type,
        rt.name AS template_name,
        COUNT(DISTINCT rr.id) as total_reviews,
        AVG(resp.overall_score) as avg_score,
        MIN(resp.overall_score) as min_score,
        MAX(resp.overall_score) as max_score
      FROM review_requests rr
      INNER JOIN review_templates rt ON rr.template_id = rt.id
      INNER JOIN review_responses resp ON rr.id = resp.request_id
      WHERE rr.subject_employee_id = @employeeId ${dateFilter}
      GROUP BY rt.type, rt.name
      ORDER BY rt.type
    `);

    return result.recordset;
  }

  /**
   * Build date filter clause
   */
  private buildDateFilter(filters?: ReviewAnalyticsFilterDto): string {
    const conditions: string[] = [];

    if (filters?.startDate) {
      conditions.push('rr.created_at >= @startDate');
    }

    if (filters?.endDate) {
      conditions.push('rr.created_at <= @endDate');
    }

    return conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '';
  }
}
