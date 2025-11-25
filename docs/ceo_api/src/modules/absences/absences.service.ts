import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import { CreateAbsenceRequestDto, UpdateAbsenceRequestDto, ApproveAbsenceDto, CreateAbsenceTypeDto, UpdateAbsenceTypeDto } from './dto/absence.dto';

@Injectable()
export class AbsencesService {
  constructor(private readonly databaseService: DatabaseService) { }

  // Absence Requests
  async findAllRequests(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT ar.*, e.full_name as employee_name, at.name as absence_type_name, at.color
        FROM absence_request ar
        LEFT JOIN employee e ON ar.employee_id = e.id
        LEFT JOIN absence_type at ON ar.absence_type_id = at.id
        WHERE ar.deleted_at IS NULL
        ORDER BY ar.created_at DESC
      `);

    return result.recordset;
  }

  async findOneRequest(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT ar.*, e.full_name as employee_name, at.name as absence_type_name
        FROM absence_request ar
        LEFT JOIN employee e ON ar.employee_id = e.id
        LEFT JOIN absence_type at ON ar.absence_type_id = at.id
        WHERE ar.id = @id AND ar.deleted_at IS NULL
      `);

    return result.recordset[0] || null;
  }

  async createRequest(tenantId: number, dto: CreateAbsenceRequestDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('employee_id', sql.Int, dto.employee_id)
      .input('absence_type_id', sql.Int, dto.absence_type_id)
      .input('start_date', sql.Date, dto.start_date)
      .input('end_date', sql.Date, dto.end_date)
      .input('is_start_half_day', sql.Bit, dto.is_start_half_day || false)
      .input('is_end_half_day', sql.Bit, dto.is_end_half_day || false)
      .input('start_half_day_period', sql.NVarChar, dto.start_half_day_period || null)
      .input('end_half_day_period', sql.NVarChar, dto.end_half_day_period || null)
      .input('total_days', sql.Decimal(10, 2), dto.total_days)
      .input('reason', sql.NVarChar, dto.reason || null)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO absence_request (
          employee_id, absence_type_id, start_date, end_date,
          is_start_half_day, is_end_half_day, start_half_day_period, end_half_day_period,
          total_days, reason, status, submitted_at, created_at, created_by
        )
        VALUES (
          @employee_id, @absence_type_id, @start_date, @end_date,
          @is_start_half_day, @is_end_half_day, @start_half_day_period, @end_half_day_period,
          @total_days, @reason, 'pending', GETDATE(), GETDATE(), @userId
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    const requestId = result.recordset[0].id;
    return this.findOneRequest(tenantId, requestId);
  }

  async updateRequest(tenantId: number, id: number, dto: UpdateAbsenceRequestDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const updateFields: string[] = [];
    const request = pool.request();

    request.input('id', sql.Int, id);
    request.input('userId', sql.Int, userId);

    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = @${key}`);

        // Map field types appropriately
        if (key === 'employee_id' || key === 'absence_type_id') {
          request.input(key, sql.Int, value);
        } else if (key === 'start_date' || key === 'end_date') {
          request.input(key, sql.Date, value);
        } else if (key === 'is_start_half_day' || key === 'is_end_half_day') {
          request.input(key, sql.Bit, value);
        } else if (key === 'total_days') {
          request.input(key, sql.Decimal(10, 2), value);
        } else {
          request.input(key, sql.NVarChar, value);
        }
      }
    });

    if (updateFields.length === 0) {
      return this.findOneRequest(tenantId, id);
    }

    updateFields.push('updated_at = GETDATE()');
    updateFields.push('updated_by = @userId');

    await request.query(`
      UPDATE absence_request
      SET ${updateFields.join(', ')}
      WHERE id = @id AND deleted_at IS NULL AND status = 'pending'
    `);

    return this.findOneRequest(tenantId, id);
  }

  async removeRequest(tenantId: number, id: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`UPDATE absence_request SET deleted_at = GETDATE() WHERE id = @id`);

    return { message: 'Absence request deleted successfully' };
  }

  async approveRequest(tenantId: number, id: number, dto: ApproveAbsenceDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('action', sql.NVarChar, dto.action)
      .input('review_notes', sql.NVarChar, dto.review_notes || null)
      .query(`
        UPDATE absence_request
        SET status = @action,
            reviewed_by = @userId,
            reviewed_at = GETDATE(),
            review_notes = @review_notes
        WHERE id = @id AND deleted_at IS NULL
      `);

    return this.findOneRequest(tenantId, id);
  }

  // Absence Types
  async findAllTypes(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .query(`
        SELECT * FROM absence_type
        WHERE deleted_at IS NULL AND is_active = 1
        ORDER BY name
      `);

    return result.recordset;
  }

  async createType(tenantId: number, dto: CreateAbsenceTypeDto, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('is_paid', sql.Bit, dto.is_paid !== undefined ? dto.is_paid : true)
      .input('requires_approval', sql.Bit, dto.requires_approval !== undefined ? dto.requires_approval : true)
      .input('requires_document', sql.Bit, dto.requires_document || false)
      .input('max_days_per_year', sql.Int, dto.max_days_per_year || null)
      .query(`
        INSERT INTO absence_type (
          code, name, description, is_paid, requires_approval, requires_document,
          max_days_per_year, created_at
        )
        VALUES (
          @code, @name, @description, @is_paid, @requires_approval, @requires_document,
          @max_days_per_year, GETDATE()
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    return { id: result.recordset[0].id, ...dto };
  }
}
