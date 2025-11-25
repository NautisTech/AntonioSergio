import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class TimesheetsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT te.*, e.full_name as employee_name
        FROM timesheet_entry te
        LEFT JOIN employee e ON te.employee_id = e.id
        WHERE te.deleted_at IS NULL
        ORDER BY te.work_date DESC
      `);

    return result.recordset;
  }

  async findOne(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM timesheet_entry WHERE id = @id AND deleted_at IS NULL`);

    return result.recordset[0] || null;
  }

  async create(tenantId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('work_date', sql.Date, dto.work_date)
      .input('clock_in', sql.DateTime2, dto.clock_in)
      .input('clock_out', sql.DateTime2, dto.clock_out || null)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO timesheet_entry (employee_id, work_date, clock_in, clock_out, status, created_at, created_by)
        VALUES (@employee_id, @work_date, @clock_in, @clock_out, 'pending', GETDATE(), @userId);
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return this.findOne(tenantId, result.recordset[0].id);
  }

  async update(tenantId: number, id: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('work_date', sql.Date, dto.work_date || null)
      .input('clock_in', sql.DateTime2, dto.clock_in || null)
      .input('clock_out', sql.DateTime2, dto.clock_out || null)
      .query(`
        UPDATE timesheet_entry SET work_date = COALESCE(@work_date, work_date),
          clock_in = COALESCE(@clock_in, clock_in), clock_out = COALESCE(@clock_out, clock_out),
          updated_at = GETDATE(), updated_by = @userId
        WHERE id = @id AND deleted_at IS NULL
      `);

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`UPDATE timesheet_entry SET deleted_at = GETDATE() WHERE id = @id`);

    return { message: 'Deleted successfully' };
  }

  async approve(tenantId: number, id: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE timesheet_entry SET status = 'approved', approved_by = @userId, approved_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return this.findOne(tenantId, id);
  }
}
