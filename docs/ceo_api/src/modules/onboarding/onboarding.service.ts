import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class OnboardingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllProcesses(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT op.*, e.full_name as employee_name FROM onboarding_process op
        LEFT JOIN employee e ON op.employee_id = e.id
        WHERE op.deleted_at IS NULL ORDER BY op.created_at DESC
      `);

    return result.recordset;
  }

  async createProcess(tenantId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('start_date', sql.Date, dto.start_date)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO onboarding_process (employee_id, start_date, status, created_at, created_by)
        VALUES (@employee_id, @start_date, 'not_started', GETDATE(), @userId);
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id, ...dto };
  }

  async findAllOffboarding(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT op.*, e.full_name as employee_name FROM offboarding_process op
        LEFT JOIN employee e ON op.employee_id = e.id
        WHERE op.deleted_at IS NULL ORDER BY op.created_at DESC
      `);

    return result.recordset;
  }

  async createOffboarding(tenantId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('termination_date', sql.Date, dto.termination_date)
      .input('termination_type', sql.NVarChar, dto.termination_type)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO offboarding_process (employee_id, termination_date, termination_type, initiated_by, status, created_at)
        VALUES (@employee_id, @termination_date, @termination_type, @userId, 'initiated', GETDATE());
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id, ...dto };
  }
}
