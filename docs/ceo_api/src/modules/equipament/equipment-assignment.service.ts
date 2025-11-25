import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/equipment.dto';
import * as sql from 'mssql';

/**
 * Equipment Assignment Service
 * Tracks equipment assignments, location changes, and movement history
 */
@Injectable()
export class EquipmentAssignmentService {
  private readonly logger = new Logger(EquipmentAssignmentService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create equipment_assignments table if it doesn't exist
   */
  private async ensureAssignmentTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='equipment_assignments' AND xtype='U')
      BEGIN
        CREATE TABLE equipment_assignments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          equipment_id INT NOT NULL,
          type NVARCHAR(50) NOT NULL,
          assigned_to_employee_id INT NULL,
          assigned_to_user_id INT NULL,
          location NVARCHAR(200) NULL,
          department NVARCHAR(100) NULL,
          start_date DATETIME NOT NULL,
          expected_return_date DATETIME NULL,
          actual_return_date DATETIME NULL,
          notes NVARCHAR(MAX) NULL,
          assigned_by INT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (equipment_id) REFERENCES equipamentos(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id)
        CREATE INDEX idx_equipment_assignments_assigned_to ON equipment_assignments(assigned_to_employee_id, assigned_to_user_id)
        CREATE INDEX idx_equipment_assignments_dates ON equipment_assignments(start_date, actual_return_date)
      END
    `);
  }

  /**
   * List assignments with filters
   */
  async list(
    tenantId: number,
    filters?: {
      equipmentId?: number;
      assignedToEmployeeId?: number;
      assignedToUserId?: number;
      type?: string;
      location?: string;
      department?: string;
      activeOnly?: boolean;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    const conditions: string[] = [];
    const request = pool.request();

    if (filters?.equipmentId) {
      conditions.push('a.equipment_id = @equipmentId');
      request.input('equipmentId', sql.Int, filters.equipmentId);
    }

    if (filters?.assignedToEmployeeId) {
      conditions.push('a.assigned_to_employee_id = @assignedToEmployeeId');
      request.input('assignedToEmployeeId', sql.Int, filters.assignedToEmployeeId);
    }

    if (filters?.assignedToUserId) {
      conditions.push('a.assigned_to_user_id = @assignedToUserId');
      request.input('assignedToUserId', sql.Int, filters.assignedToUserId);
    }

    if (filters?.type) {
      conditions.push('a.type = @type');
      request.input('type', sql.NVarChar, filters.type);
    }

    if (filters?.location) {
      conditions.push('a.location LIKE @location');
      request.input('location', sql.NVarChar, `%${filters.location}%`);
    }

    if (filters?.department) {
      conditions.push('a.department = @department');
      request.input('department', sql.NVarChar, filters.department);
    }

    if (filters?.activeOnly) {
      conditions.push('a.actual_return_date IS NULL');
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      a.id,
      a.equipment_id,
      e.numero_interno AS equipment_internal_number,
      e.numero_serie AS equipment_serial_number,
      mo.name AS equipment_model_name,
      ma.name AS equipment_brand_name,
      a.type,
      a.assigned_to_employee_id,
      emp.name_completo AS assigned_to_employee_name,
      a.assigned_to_user_id,
      a.location,
      a.department,
      a.start_date,
      a.expected_return_date,
      a.actual_return_date,
      a.notes,
      a.assigned_by,
      assignedBy.name AS assigned_by_name,
      a.created_at,
      a.updated_at,
      CASE WHEN a.actual_return_date IS NULL THEN 1 ELSE 0 END AS is_active
    `;

    const fromClause = `
      FROM equipment_assignments a
      INNER JOIN equipamentos e ON a.equipment_id = e.id
      INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id
      INNER JOIN marcas ma ON mo.marca_id = ma.id
      LEFT JOIN funcionarios emp ON a.assigned_to_employee_id = emp.id
      LEFT JOIN [user] assignedBy ON a.assigned_by = assignedBy.id
    `;

    const orderBy = ' ORDER BY a.start_date DESC';

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
   * Get assignment by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        a.id,
        a.equipment_id,
        e.numero_interno AS equipment_internal_number,
        e.numero_serie AS equipment_serial_number,
        mo.name AS equipment_model_name,
        ma.name AS equipment_brand_name,
        a.type,
        a.assigned_to_employee_id,
        emp.name_completo AS assigned_to_employee_name,
        emp.foto_url AS assigned_to_employee_photo,
        a.assigned_to_user_id,
        a.location,
        a.department,
        a.start_date,
        a.expected_return_date,
        a.actual_return_date,
        a.notes,
        a.assigned_by,
        assignedBy.name AS assigned_by_name,
        a.created_at,
        a.updated_at,
        CASE WHEN a.actual_return_date IS NULL THEN 1 ELSE 0 END AS is_active
      FROM equipment_assignments a
      INNER JOIN equipamentos e ON a.equipment_id = e.id
      INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id
      INNER JOIN marcas ma ON mo.marca_id = ma.id
      LEFT JOIN funcionarios emp ON a.assigned_to_employee_id = emp.id
      LEFT JOIN [user] assignedBy ON a.assigned_by = assignedBy.id
      WHERE a.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Assignment record with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Create assignment record
   */
  async create(dto: CreateAssignmentDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    const result = await pool
      .request()
      .input('equipment_id', sql.Int, dto.equipmentId)
      .input('type', sql.NVarChar, dto.type)
      .input('assigned_to_employee_id', sql.Int, dto.assignedToEmployeeId || null)
      .input('assigned_to_user_id', sql.Int, dto.assignedToUserId || null)
      .input('location', sql.NVarChar, dto.location || null)
      .input('department', sql.NVarChar, dto.department || null)
      .input('start_date', sql.DateTime, dto.startDate)
      .input('expected_return_date', sql.DateTime, dto.expectedReturnDate || null)
      .input('actual_return_date', sql.DateTime, dto.actualReturnDate || null)
      .input('notes', sql.NVarChar, dto.notes || null)
      .input('assigned_by', sql.Int, dto.assignedBy || userId).query(`
        INSERT INTO equipment_assignments
        (equipment_id, type, assigned_to_employee_id, assigned_to_user_id, location, department,
         start_date, expected_return_date, actual_return_date, notes, assigned_by, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@equipment_id, @type, @assigned_to_employee_id, @assigned_to_user_id, @location, @department,
                @start_date, @expected_return_date, @actual_return_date, @notes, @assigned_by, GETDATE(), GETDATE())
      `);

    // Update equipment location and responsible in main table
    await pool
      .request()
      .input('equipment_id', sql.Int, dto.equipmentId)
      .input('location', sql.NVarChar, dto.location || null)
      .input('responsavel_id', sql.Int, dto.assignedToEmployeeId || null)
      .input('utilizador_id', sql.Int, dto.assignedToUserId || null).query(`
        UPDATE equipamentos
        SET
          localizacao = COALESCE(@location, localizacao),
          responsavel_id = COALESCE(@responsavel_id, responsavel_id),
          utilizador_id = COALESCE(@utilizador_id, utilizador_id),
          updated_at = GETDATE()
        WHERE id = @equipment_id
      `);

    this.logger.log(`Assignment record created: ${result.recordset[0].id} for equipment ${dto.equipmentId}`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * Update assignment record (mainly for returns)
   */
  async update(id: number, dto: UpdateAssignmentDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('actual_return_date', sql.DateTime, dto.actualReturnDate || null)
      .input('notes', sql.NVarChar, dto.notes || null).query(`
        UPDATE equipment_assignments
        SET
          actual_return_date = @actual_return_date,
          notes = @notes,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Assignment record updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete assignment record
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM equipment_assignments WHERE id = @id
    `);

    this.logger.log(`Assignment record deleted: ${id}`);
    return { message: 'Assignment record deleted successfully' };
  }

  /**
   * Get current assignment for equipment
   */
  async getCurrentAssignment(equipmentId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    const result = await pool.request().input('equipmentId', sql.Int, equipmentId).query(`
      SELECT TOP 1
        a.id,
        a.equipment_id,
        a.type,
        a.assigned_to_employee_id,
        emp.name_completo AS assigned_to_employee_name,
        emp.foto_url AS assigned_to_employee_photo,
        a.assigned_to_user_id,
        a.location,
        a.department,
        a.start_date,
        a.expected_return_date,
        a.notes,
        DATEDIFF(day, a.start_date, GETDATE()) AS days_since_assignment
      FROM equipment_assignments a
      LEFT JOIN funcionarios emp ON a.assigned_to_employee_id = emp.id
      WHERE a.equipment_id = @equipmentId
        AND a.actual_return_date IS NULL
      ORDER BY a.start_date DESC
    `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Get assignment history for equipment
   */
  async getEquipmentAssignmentHistory(equipmentId: number, tenantId: number) {
    return this.list(tenantId, { equipmentId, pageSize: 100 });
  }

  /**
   * Get active assignments by employee
   */
  async getEmployeeActiveAssignments(employeeId: number, tenantId: number) {
    return this.list(tenantId, { assignedToEmployeeId: employeeId, activeOnly: true });
  }

  /**
   * Get overdue returns (equipment not returned by expected date)
   */
  async getOverdueReturns(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    const result = await pool.request().query(`
      SELECT
        a.id,
        a.equipment_id,
        e.numero_interno AS equipment_internal_number,
        e.numero_serie AS equipment_serial_number,
        mo.name AS equipment_model_name,
        ma.name AS equipment_brand_name,
        a.type,
        a.assigned_to_employee_id,
        emp.name_completo AS assigned_to_employee_name,
        a.location,
        a.department,
        a.start_date,
        a.expected_return_date,
        DATEDIFF(day, a.expected_return_date, GETDATE()) AS days_overdue
      FROM equipment_assignments a
      INNER JOIN equipamentos e ON a.equipment_id = e.id
      INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id
      INNER JOIN marcas ma ON mo.marca_id = ma.id
      LEFT JOIN funcionarios emp ON a.assigned_to_employee_id = emp.id
      WHERE a.actual_return_date IS NULL
        AND a.expected_return_date IS NOT NULL
        AND a.expected_return_date < GETDATE()
      ORDER BY a.expected_return_date ASC
    `);

    return result.recordset;
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureAssignmentTable(pool);

    const stats = await pool.request().query(`
      SELECT
        COUNT(*) AS total_assignments,
        COUNT(CASE WHEN actual_return_date IS NULL THEN 1 END) AS active_assignments,
        COUNT(CASE WHEN actual_return_date IS NOT NULL THEN 1 END) AS completed_assignments,
        COUNT(CASE WHEN actual_return_date IS NULL AND expected_return_date IS NOT NULL AND expected_return_date < GETDATE() THEN 1 END) AS overdue_returns,
        COUNT(DISTINCT equipment_id) AS total_equipment_assigned,
        COUNT(DISTINCT assigned_to_employee_id) AS total_employees_with_equipment
      FROM equipment_assignments
    `);

    const byType = await pool.request().query(`
      SELECT
        type,
        COUNT(*) AS count,
        COUNT(CASE WHEN actual_return_date IS NULL THEN 1 END) AS active_count
      FROM equipment_assignments
      GROUP BY type
      ORDER BY count DESC
    `);

    const byDepartment = await pool.request().query(`
      SELECT
        department,
        COUNT(*) AS count,
        COUNT(CASE WHEN actual_return_date IS NULL THEN 1 END) AS active_count
      FROM equipment_assignments
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY active_count DESC
    `);

    const byLocation = await pool.request().query(`
      SELECT
        location,
        COUNT(*) AS count,
        COUNT(CASE WHEN actual_return_date IS NULL THEN 1 END) AS active_count
      FROM equipment_assignments
      WHERE location IS NOT NULL
      GROUP BY location
      ORDER BY active_count DESC
    `);

    return {
      overview: stats.recordset[0],
      byType: byType.recordset,
      byDepartment: byDepartment.recordset,
      byLocation: byLocation.recordset,
    };
  }
}
