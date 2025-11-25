import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class PerformanceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllReviews(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT pr.*, e.full_name as employee_name FROM performance_review pr
        LEFT JOIN employee e ON pr.employee_id = e.id
        WHERE pr.deleted_at IS NULL ORDER BY pr.created_at DESC
      `);

    return result.recordset;
  }

  async createReview(tenantId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('reviewer_id', sql.Int, dto.reviewer_id)
      .input('review_period_start', sql.Date, dto.review_period_start)
      .input('review_period_end', sql.Date, dto.review_period_end)
      .input('review_type', sql.NVarChar, dto.review_type)
      .query(`
        INSERT INTO performance_review (employee_id, reviewer_id, review_period_start, review_period_end, review_type, status, created_at)
        VALUES (@employee_id, @reviewer_id, @review_period_start, @review_period_end, @review_type, 'draft', GETDATE());
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id };
  }

  async findAllGoals(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT pg.*, e.full_name as employee_name FROM performance_goal pg
        LEFT JOIN employee e ON pg.employee_id = e.id
        WHERE pg.deleted_at IS NULL ORDER BY pg.target_date
      `);

    return result.recordset;
  }

  async createGoal(tenantId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('userId', sql.Int, userId)
      .input('goal_type', sql.NVarChar, dto.goal_type)
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('start_date', sql.Date, dto.start_date)
      .input('target_date', sql.Date, dto.target_date)
      .query(`
        INSERT INTO performance_goal (employee_id, set_by, goal_type, title, description, start_date, target_date, status, created_at)
        VALUES (@employee_id, @userId, @goal_type, @title, @description, @start_date, @target_date, 'active', GETDATE());
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id, ...dto };
  }
}
