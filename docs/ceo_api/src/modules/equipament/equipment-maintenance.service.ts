import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto, MaintenanceStatus } from './dto/equipment.dto';
import * as sql from 'mssql';

/**
 * Equipment Maintenance Service
 * Manages maintenance records, schedules, and history
 */
@Injectable()
export class EquipmentMaintenanceService {
  private readonly logger = new Logger(EquipmentMaintenanceService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create equipment_maintenance table if it doesn't exist
   */
  private async ensureMaintenanceTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='equipment_maintenance' AND xtype='U')
      BEGIN
        CREATE TABLE equipment_maintenance (
          id INT IDENTITY(1,1) PRIMARY KEY,
          equipment_id INT NOT NULL,
          type NVARCHAR(50) NOT NULL,
          scheduled_date DATETIME NOT NULL,
          completion_date DATETIME NULL,
          description NVARCHAR(MAX) NULL,
          performed_by INT NULL,
          estimated_cost DECIMAL(10,2) NULL,
          actual_cost DECIMAL(10,2) NULL,
          status NVARCHAR(50) NOT NULL DEFAULT 'scheduled',
          service_provider NVARCHAR(200) NULL,
          parts_replaced NVARCHAR(MAX) NULL,
          notes NVARCHAR(MAX) NULL,
          created_by INT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (equipment_id) REFERENCES equipamentos(id) ON DELETE CASCADE
        )
      END
    `);
  }

  /**
   * List maintenances with filters
   */
  async list(
    tenantId: number,
    filters?: {
      equipmentId?: number;
      type?: string;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
      performedBy?: number;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    const conditions: string[] = [];
    const request = pool.request();

    if (filters?.equipmentId) {
      conditions.push('m.equipment_id = @equipmentId');
      request.input('equipmentId', sql.Int, filters.equipmentId);
    }

    if (filters?.type) {
      conditions.push('m.type = @type');
      request.input('type', sql.NVarChar, filters.type);
    }

    if (filters?.status) {
      conditions.push('m.status = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters?.fromDate) {
      conditions.push('m.scheduled_date >= @fromDate');
      request.input('fromDate', sql.DateTime, filters.fromDate);
    }

    if (filters?.toDate) {
      conditions.push('m.scheduled_date <= @toDate');
      request.input('toDate', sql.DateTime, filters.toDate);
    }

    if (filters?.performedBy) {
      conditions.push('m.performed_by = @performedBy');
      request.input('performedBy', sql.Int, filters.performedBy);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      m.id,
      m.equipment_id,
      e.numero_interno AS equipment_internal_number,
      e.numero_serie AS equipment_serial_number,
      mo.name AS equipment_model_name,
      ma.name AS equipment_brand_name,
      m.type,
      m.scheduled_date,
      m.completion_date,
      m.description,
      m.performed_by,
      emp.name_completo AS performed_by_name,
      m.estimated_cost,
      m.actual_cost,
      m.status,
      m.service_provider,
      m.parts_replaced,
      m.notes,
      m.created_at,
      m.updated_at
    `;

    const fromClause = `
      FROM equipment_maintenance m
      INNER JOIN equipamentos e ON m.equipment_id = e.id
      INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id
      INNER JOIN marcas ma ON mo.marca_id = ma.id
      LEFT JOIN funcionarios emp ON m.performed_by = emp.id
    `;

    const orderBy = ' ORDER BY m.scheduled_date DESC';

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const query = `SELECT ${selectFields} ${fromClause} ${whereClause} ${orderBy}`;
      const result = await request.query(query);
      return result.recordset;
    }

    // With pagination
    const page = filters.page;
    const pageSize = filters.pageSize;
    const offset = (page - 1) * pageSize;

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    // Count total
    const countQuery = `SELECT COUNT(*) as total ${fromClause} ${whereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Fetch paginated data
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
      data: dataResult.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get maintenance by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        m.id,
        m.equipment_id,
        e.numero_interno AS equipment_internal_number,
        e.numero_serie AS equipment_serial_number,
        mo.name AS equipment_model_name,
        ma.name AS equipment_brand_name,
        m.type,
        m.scheduled_date,
        m.completion_date,
        m.description,
        m.performed_by,
        emp.name_completo AS performed_by_name,
        m.estimated_cost,
        m.actual_cost,
        m.status,
        m.service_provider,
        m.parts_replaced,
        m.notes,
        m.created_at,
        m.updated_at
      FROM equipment_maintenance m
      INNER JOIN equipamentos e ON m.equipment_id = e.id
      INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id
      INNER JOIN marcas ma ON mo.marca_id = ma.id
      LEFT JOIN funcionarios emp ON m.performed_by = emp.id
      WHERE m.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Create maintenance record
   */
  async create(dto: CreateMaintenanceDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    const result = await pool
      .request()
      .input('equipment_id', sql.Int, dto.equipmentId)
      .input('type', sql.NVarChar, dto.type)
      .input('scheduled_date', sql.DateTime, dto.scheduledDate)
      .input('completion_date', sql.DateTime, dto.completionDate || null)
      .input('description', sql.NVarChar, dto.description || null)
      .input('performed_by', sql.Int, dto.performedBy || null)
      .input('estimated_cost', sql.Decimal(10, 2), dto.estimatedCost || null)
      .input('actual_cost', sql.Decimal(10, 2), dto.actualCost || null)
      .input('status', sql.NVarChar, dto.status || MaintenanceStatus.SCHEDULED)
      .input('service_provider', sql.NVarChar, dto.serviceProvider || null)
      .input('parts_replaced', sql.NVarChar, dto.partsReplaced ? JSON.stringify(dto.partsReplaced) : null)
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('created_by', sql.Int, userId).query(`
        INSERT INTO equipment_maintenance
        (equipment_id, type, scheduled_date, completion_date, description, performed_by,
         estimated_cost, actual_cost, status, service_provider, parts_replaced, notes, created_by, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@equipment_id, @type, @scheduled_date, @completion_date, @description, @performed_by,
                @estimated_cost, @actual_cost, @status, @service_provider, @parts_replaced, @notes, @created_by, GETDATE(), GETDATE())
      `);

    this.logger.log(`Maintenance record created: ${result.recordset[0].id} for equipment ${dto.equipmentId}`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * Update maintenance record
   */
  async update(id: number, dto: UpdateMaintenanceDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('equipment_id', sql.Int, dto.equipmentId)
      .input('type', sql.NVarChar, dto.type)
      .input('scheduled_date', sql.DateTime, dto.scheduledDate)
      .input('completion_date', sql.DateTime, dto.completionDate || null)
      .input('description', sql.NVarChar, dto.description || null)
      .input('performed_by', sql.Int, dto.performedBy || null)
      .input('estimated_cost', sql.Decimal(10, 2), dto.estimatedCost || null)
      .input('actual_cost', sql.Decimal(10, 2), dto.actualCost || null)
      .input('status', sql.NVarChar, dto.status || MaintenanceStatus.SCHEDULED)
      .input('service_provider', sql.NVarChar, dto.serviceProvider || null)
      .input('parts_replaced', sql.NVarChar, dto.partsReplaced ? JSON.stringify(dto.partsReplaced) : null)
      .input('notes', sql.NVarChar, dto.notes || null).query(`
        UPDATE equipment_maintenance
        SET
          equipment_id = @equipment_id,
          type = @type,
          scheduled_date = @scheduled_date,
          completion_date = @completion_date,
          description = @description,
          performed_by = @performed_by,
          estimated_cost = @estimated_cost,
          actual_cost = @actual_cost,
          status = @status,
          service_provider = @service_provider,
          parts_replaced = @parts_replaced,
          notes = @notes,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Maintenance record updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete maintenance record
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM equipment_maintenance WHERE id = @id
    `);

    this.logger.log(`Maintenance record deleted: ${id}`);
    return { message: 'Maintenance record deleted successfully' };
  }

  /**
   * Get upcoming maintenances (next 30 days)
   */
  async getUpcomingMaintenances(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    const result = await pool.request().query(`
      SELECT
        m.id,
        m.equipment_id,
        e.numero_interno AS equipment_internal_number,
        e.numero_serie AS equipment_serial_number,
        mo.name AS equipment_model_name,
        ma.name AS equipment_brand_name,
        m.type,
        m.scheduled_date,
        m.description,
        m.estimated_cost,
        m.status,
        DATEDIFF(day, GETDATE(), m.scheduled_date) AS days_until_maintenance
      FROM equipment_maintenance m
      INNER JOIN equipamentos e ON m.equipment_id = e.id
      INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id
      INNER JOIN marcas ma ON mo.marca_id = ma.id
      WHERE m.status IN ('scheduled', 'in_progress')
        AND m.scheduled_date BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())
      ORDER BY m.scheduled_date ASC
    `);

    return result.recordset;
  }

  /**
   * Get maintenance history for equipment
   */
  async getEquipmentMaintenanceHistory(equipmentId: number, tenantId: number) {
    return this.list(tenantId, { equipmentId, pageSize: 100 });
  }

  /**
   * Get maintenance statistics
   */
  async getMaintenanceStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMaintenanceTable(pool);

    const stats = await pool.request().query(`
      SELECT
        COUNT(*) AS total_maintenances,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) AS scheduled,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
        COUNT(CASE WHEN scheduled_date BETWEEN GETDATE() AND DATEADD(day, 7, GETDATE()) AND status = 'scheduled' THEN 1 END) AS upcoming_this_week,
        COUNT(CASE WHEN scheduled_date BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE()) AND status = 'scheduled' THEN 1 END) AS upcoming_this_month,
        SUM(CAST(estimated_cost AS DECIMAL(18,2))) AS total_estimated_cost,
        SUM(CAST(actual_cost AS DECIMAL(18,2))) AS total_actual_cost,
        AVG(CAST(actual_cost AS DECIMAL(18,2))) AS avg_maintenance_cost
      FROM equipment_maintenance
    `);

    const byType = await pool.request().query(`
      SELECT
        type,
        COUNT(*) AS count,
        SUM(CAST(actual_cost AS DECIMAL(18,2))) AS total_cost
      FROM equipment_maintenance
      WHERE actual_cost IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
    `);

    const byMonth = await pool.request().query(`
      SELECT
        YEAR(scheduled_date) AS year,
        MONTH(scheduled_date) AS month,
        COUNT(*) AS count,
        SUM(CAST(actual_cost AS DECIMAL(18,2))) AS total_cost
      FROM equipment_maintenance
      WHERE scheduled_date >= DATEADD(month, -12, GETDATE())
      GROUP BY YEAR(scheduled_date), MONTH(scheduled_date)
      ORDER BY year DESC, month DESC
    `);

    return {
      overview: stats.recordset[0],
      byType: byType.recordset,
      byMonth: byMonth.recordset,
    };
  }
}
