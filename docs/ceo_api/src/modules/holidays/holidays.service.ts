import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class HolidaysService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`SELECT * FROM holiday WHERE deleted_at IS NULL ORDER BY holiday_date`);

    return result.recordset;
  }

  async create(tenantId: number, dto: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('holiday_date', sql.Date, dto.holiday_date)
      .input('holiday_type', sql.NVarChar, dto.holiday_type)
      .input('is_recurring', sql.Bit, dto.is_recurring || false)
      .query(`
        INSERT INTO holiday (name, description, holiday_date, holiday_type, is_recurring, created_at)
        VALUES (@name, @description, @holiday_date, @holiday_type, @is_recurring, GETDATE());
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id, ...dto };
  }

  async remove(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`UPDATE holiday SET deleted_at = GETDATE() WHERE id = @id`);

    return { message: 'Deleted successfully' };
  }
}
