import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class ShiftsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`SELECT * FROM employee_shift WHERE deleted_at IS NULL ORDER BY shift_date DESC`);

    return result.recordset;
  }

  async create(tenantId: number, dto: any, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('shift_template_id', sql.Int, dto.shift_template_id || null)
      .input('shift_date', sql.Date, dto.shift_date)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO employee_shift (employee_id, shift_template_id, shift_date, status, assigned_by, created_at)
        VALUES (@employee_id, @shift_template_id, @shift_date, 'scheduled', @userId, GETDATE());
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id };
  }

  async update(tenantId: number, id: number, dto: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, dto.status || null)
      .query(`UPDATE employee_shift SET status = COALESCE(@status, status), updated_at = GETDATE() WHERE id = @id`);

    return { message: 'Updated successfully' };
  }

  async remove(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`UPDATE employee_shift SET deleted_at = GETDATE() WHERE id = @id`);

    return { message: 'Deleted successfully' };
  }
}
