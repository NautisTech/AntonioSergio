import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateEquipmentDto, UpdateEquipmentDto } from './dto/equipment.dto';
import * as sql from 'mssql';

/**
 * Equipment Service
 * Manages equipment instances (actual physical assets)
 */
@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * List equipment with filters and pagination
   */
  async list(
    tenantId: number,
    filters?: {
      modelId?: number;
      responsibleId?: number;
      userId?: number;
      status?: string;
      location?: string;
      search?: string;
      active?: boolean;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const request = pool.request();

    const conditions: string[] = [];

    if (filters?.modelId) {
      conditions.push('e.modelo_id = @modelId');
      request.input('modelId', sql.Int, filters.modelId);
    }

    if (filters?.responsibleId) {
      conditions.push('e.responsavel_id = @responsibleId');
      request.input('responsibleId', sql.Int, filters.responsibleId);
    }

    if (filters?.userId) {
      conditions.push('e.utilizador_id = @userId');
      request.input('userId', sql.Int, filters.userId);
    }

    if (filters?.status) {
      conditions.push('e.estado = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters?.location) {
      conditions.push('e.localizacao LIKE @location');
      request.input('location', sql.NVarChar, `%${filters.location}%`);
    }

    if (filters?.search) {
      conditions.push(
        '(e.numero_serie LIKE @search OR e.numero_interno LIKE @search OR e.description LIKE @search OR m.name LIKE @search OR ma.name LIKE @search)',
      );
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (filters?.active !== undefined) {
      conditions.push('e.ativo = @active');
      request.input('active', sql.Bit, filters.active ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      e.id,
      e.modelo_id AS model_id,
      m.name AS model_name,
      m.codigo AS model_code,
      m.imagem_url AS model_image,
      m.marca_id AS brand_id,
      ma.name AS brand_name,
      ma.logo_url AS brand_logo,
      m.categoria_id AS category_id,
      c.name AS category_name,
      c.icone AS category_icon,
      c.cor AS category_color,
      e.responsavel_id AS responsible_id,
      f.name_completo AS responsible_name,
      f.foto_url AS responsible_photo,
      e.utilizador_id AS user_id,
      e.localizacao AS location,
      e.numero_serie AS serial_number,
      e.numero_interno AS internal_number,
      e.description AS description,
      e.data_aquisicao AS acquisition_date,
      e.valor_aquisicao AS acquisition_value,
      e.fornecedor AS supplier,
      e.data_garantia AS warranty_expiration_date,
      e.data_proxima_manutencao AS next_maintenance_date,
      e.estado AS status,
      e.observacoes AS notes,
      e.foto_url AS photo_url,
      e.ativo AS active,
      e.created_at AS created_at,
      e.updated_at AS updated_at
    `;

    const fromClause = `
      FROM equipamentos e
      INNER JOIN modelos_equipamento m ON e.modelo_id = m.id
      INNER JOIN marcas ma ON m.marca_id = ma.id
      INNER JOIN categorias_equipamento c ON m.categoria_id = c.id
      LEFT JOIN funcionarios f ON e.responsavel_id = f.id
    `;

    const orderBy = ' ORDER BY e.numero_interno, e.numero_serie';

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
   * Get equipment by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        e.id,
        e.modelo_id AS model_id,
        m.name AS model_name,
        m.codigo AS model_code,
        m.imagem_url AS model_image,
        m.especificacoes AS model_specifications,
        m.marca_id AS brand_id,
        ma.name AS brand_name,
        ma.logo_url AS brand_logo,
        m.categoria_id AS category_id,
        c.name AS category_name,
        c.icone AS category_icon,
        c.cor AS category_color,
        e.responsavel_id AS responsible_id,
        f.name_completo AS responsible_name,
        f.foto_url AS responsible_photo,
        f.email AS responsible_email,
        e.utilizador_id AS user_id,
        e.localizacao AS location,
        e.numero_serie AS serial_number,
        e.numero_interno AS internal_number,
        e.description AS description,
        e.data_aquisicao AS acquisition_date,
        e.valor_aquisicao AS acquisition_value,
        e.fornecedor AS supplier,
        e.data_garantia AS warranty_expiration_date,
        e.data_proxima_manutencao AS next_maintenance_date,
        e.estado AS status,
        e.observacoes AS notes,
        e.foto_url AS photo_url,
        e.ativo AS active,
        e.created_at AS created_at,
        e.updated_at AS updated_at,
        CASE WHEN e.data_garantia IS NOT NULL AND e.data_garantia > GETDATE() THEN 1 ELSE 0 END AS is_under_warranty,
        DATEDIFF(day, GETDATE(), e.data_garantia) AS warranty_days_remaining
      FROM equipamentos e
      INNER JOIN modelos_equipamento m ON e.modelo_id = m.id
      INNER JOIN marcas ma ON m.marca_id = ma.id
      INNER JOIN categorias_equipamento c ON m.categoria_id = c.id
      LEFT JOIN funcionarios f ON e.responsavel_id = f.id
      WHERE e.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return this.parseEquipment(result.recordset[0]);
  }

  /**
   * Create equipment
   */
  async create(dto: CreateEquipmentDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('empresa_id', sql.Int, tenantId)
      .input('modelo_id', sql.Int, dto.modelId)
      .input('responsavel_id', sql.Int, dto.responsibleId || null)
      .input('utilizador_id', sql.Int, dto.userId || null)
      .input('numero_serie', sql.NVarChar, dto.serialNumber)
      .input('numero_interno', sql.NVarChar, dto.internalNumber)
      .input('description', sql.NVarChar, dto.description || null)
      .input('localizacao', sql.NVarChar, dto.location || null)
      .input('data_aquisicao', sql.Date, dto.acquisitionDate || null)
      .input('valor_aquisicao', sql.Decimal(10, 2), dto.acquisitionValue || null)
      .input('fornecedor', sql.NVarChar, dto.supplier || null)
      .input('data_garantia', sql.Date, dto.warrantyExpirationDate || null)
      .input('data_proxima_manutencao', sql.Date, dto.nextMaintenanceDate || null)
      .input('estado', sql.NVarChar, dto.status || 'operational')
      .input('observacoes', sql.NVarChar, dto.notes || null)
      .input('foto_url', sql.NVarChar, dto.photoUrl || null)
      .input('ativo', sql.Bit, dto.active !== false ? 1 : 0).query(`
        INSERT INTO equipamentos
        (empresa_id, modelo_id, responsavel_id, utilizador_id, numero_serie, numero_interno, description,
         localizacao, data_aquisicao, valor_aquisicao, fornecedor, data_garantia, data_proxima_manutencao,
         estado, observacoes, foto_url, ativo, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@empresa_id, @modelo_id, @responsavel_id, @utilizador_id, @numero_serie, @numero_interno, @description,
                @localizacao, @data_aquisicao, @valor_aquisicao, @fornecedor, @data_garantia, @data_proxima_manutencao,
                @estado, @observacoes, @foto_url, @ativo, GETDATE(), GETDATE())
      `);

    this.logger.log(`Equipment created: ${dto.internalNumber} (ID: ${result.recordset[0].id})`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * Update equipment
   */
  async update(id: number, dto: UpdateEquipmentDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('modelo_id', sql.Int, dto.modelId)
      .input('responsavel_id', sql.Int, dto.responsibleId || null)
      .input('utilizador_id', sql.Int, dto.userId || null)
      .input('numero_serie', sql.NVarChar, dto.serialNumber)
      .input('numero_interno', sql.NVarChar, dto.internalNumber)
      .input('description', sql.NVarChar, dto.description || null)
      .input('localizacao', sql.NVarChar, dto.location || null)
      .input('data_aquisicao', sql.Date, dto.acquisitionDate || null)
      .input('valor_aquisicao', sql.Decimal(10, 2), dto.acquisitionValue || null)
      .input('fornecedor', sql.NVarChar, dto.supplier || null)
      .input('data_garantia', sql.Date, dto.warrantyExpirationDate || null)
      .input('data_proxima_manutencao', sql.Date, dto.nextMaintenanceDate || null)
      .input('estado', sql.NVarChar, dto.status || 'operational')
      .input('observacoes', sql.NVarChar, dto.notes || null)
      .input('foto_url', sql.NVarChar, dto.photoUrl || null)
      .input('ativo', sql.Bit, dto.active !== false ? 1 : 0).query(`
        UPDATE equipamentos
        SET
          modelo_id = @modelo_id,
          responsavel_id = @responsavel_id,
          utilizador_id = @utilizador_id,
          numero_serie = @numero_serie,
          numero_interno = @numero_interno,
          description = @description,
          localizacao = @localizacao,
          data_aquisicao = @data_aquisicao,
          valor_aquisicao = @valor_aquisicao,
          fornecedor = @fornecedor,
          data_garantia = @data_garantia,
          data_proxima_manutencao = @data_proxima_manutencao,
          estado = @estado,
          observacoes = @observacoes,
          foto_url = @foto_url,
          ativo = @ativo,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Equipment updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete equipment
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has related tickets
    const ticketsCheck = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) as total FROM tickets WHERE equipamento_id = @id
    `);

    if (ticketsCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete equipment that has associated tickets');
    }

    // Check if has maintenance records (from new table)
    const maintenanceCheck = await pool.request().input('id', sql.Int, id).query(`
      IF EXISTS (SELECT * FROM sysobjects WHERE name='equipment_maintenance' AND xtype='U')
      BEGIN
        SELECT COUNT(*) as total FROM equipment_maintenance WHERE equipment_id = @id
      END
      ELSE
      BEGIN
        SELECT 0 as total
      END
    `);

    if (maintenanceCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete equipment that has maintenance records');
    }

    // Check if has assignment records
    const assignmentCheck = await pool.request().input('id', sql.Int, id).query(`
      IF EXISTS (SELECT * FROM sysobjects WHERE name='equipment_assignments' AND xtype='U')
      BEGIN
        SELECT COUNT(*) as total FROM equipment_assignments WHERE equipment_id = @id
      END
      ELSE
      BEGIN
        SELECT 0 as total
      END
    `);

    if (assignmentCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete equipment that has assignment records');
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM equipamentos WHERE id = @id
    `);

    this.logger.log(`Equipment deleted: ${id}`);
    return { message: 'Equipment deleted successfully' };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // General statistics
    const generalStats = await pool.request().query(`
      SELECT
        COUNT(*) as total_equipment,
        COUNT(CASE WHEN estado = 'operational' THEN 1 END) as operational,
        COUNT(CASE WHEN estado = 'maintenance' THEN 1 END) as in_maintenance,
        COUNT(CASE WHEN estado = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN estado = 'broken' THEN 1 END) as broken,
        COUNT(CASE WHEN estado = 'retired' THEN 1 END) as retired,
        COUNT(CASE WHEN estado = 'in_repair' THEN 1 END) as in_repair,
        COUNT(CASE WHEN ativo = 1 THEN 1 END) as active,
        COUNT(CASE WHEN data_proxima_manutencao IS NOT NULL AND data_proxima_manutencao <= DATEADD(day, 30, GETDATE()) THEN 1 END) as maintenance_due_30_days,
        COUNT(CASE WHEN data_garantia IS NOT NULL AND data_garantia > GETDATE() THEN 1 END) as under_warranty,
        COUNT(CASE WHEN data_garantia IS NOT NULL AND data_garantia <= DATEADD(day, 30, GETDATE()) AND data_garantia > GETDATE() THEN 1 END) as warranty_expiring_30_days,
        ISNULL(SUM(CAST(valor_aquisicao as DECIMAL(18,2))), 0) as total_acquisition_value
      FROM equipamentos
    `);

    // Equipment by status
    const byStatus = await pool.request().query(`
      SELECT
        estado AS status,
        COUNT(*) as count
      FROM equipamentos
      WHERE estado IS NOT NULL
      GROUP BY estado
      ORDER BY count DESC
    `);

    // Top brands
    const topBrands = await pool.request().query(`
      SELECT TOP 10
        ma.id,
        ma.name AS name,
        ma.logo_url AS logo,
        COUNT(e.id) as equipment_count
      FROM marcas ma
      INNER JOIN modelos_equipamento m ON ma.id = m.marca_id
      INNER JOIN equipamentos e ON m.id = e.modelo_id
      GROUP BY ma.id, ma.name, ma.logo_url
      ORDER BY equipment_count DESC
    `);

    // Top models
    const topModels = await pool.request().query(`
      SELECT TOP 10
        m.id,
        m.name AS name,
        m.codigo AS code,
        ma.name AS brand_name,
        COUNT(e.id) as equipment_count
      FROM modelos_equipamento m
      INNER JOIN marcas ma ON m.marca_id = ma.id
      INNER JOIN equipamentos e ON m.id = e.modelo_id
      GROUP BY m.id, m.name, m.codigo, ma.name
      ORDER BY equipment_count DESC
    `);

    // Equipment with most tickets
    const mostTickets = await pool.request().query(`
      SELECT TOP 10
        e.id,
        e.numero_interno AS internal_number,
        e.numero_serie AS serial_number,
        e.description AS description,
        m.name AS model_name,
        ma.name AS brand_name,
        COUNT(t.id) as total_tickets,
        COUNT(CASE WHEN t.status = 'aberto' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN t.status = 'fechado' THEN 1 END) as closed_tickets
      FROM equipamentos e
      LEFT JOIN tickets t ON e.id = t.equipamento_id
      INNER JOIN modelos_equipamento m ON e.modelo_id = m.id
      INNER JOIN marcas ma ON m.marca_id = ma.id
      GROUP BY e.id, e.numero_interno, e.numero_serie, e.description, m.name, ma.name
      HAVING COUNT(t.id) > 0
      ORDER BY total_tickets DESC
    `);

    // Equipment by category
    const byCategory = await pool.request().query(`
      SELECT
        c.id,
        c.name AS name,
        c.icone AS icon,
        c.cor AS color,
        COUNT(e.id) as equipment_count
      FROM categorias_equipamento c
      INNER JOIN modelos_equipamento m ON c.id = m.categoria_id
      INNER JOIN equipamentos e ON m.id = e.modelo_id
      GROUP BY c.id, c.name, c.icone, c.cor
      ORDER BY equipment_count DESC
    `);

    // Equipment by location
    const byLocation = await pool.request().query(`
      SELECT
        e.localizacao AS location,
        COUNT(*) as equipment_count
      FROM equipamentos e
      WHERE e.localizacao IS NOT NULL AND e.localizacao != ''
      GROUP BY e.localizacao
      ORDER BY equipment_count DESC
    `);

    // Recent activity (recently created equipment)
    const recentActivity = await pool.request().query(`
      SELECT TOP 10
        e.id,
        e.numero_interno AS internal_number,
        e.numero_serie AS serial_number,
        e.description AS description,
        e.estado AS status,
        m.name AS model_name,
        ma.name AS brand_name,
        e.created_at AS created_at
      FROM equipamentos e
      INNER JOIN modelos_equipamento m ON e.modelo_id = m.id
      INNER JOIN marcas ma ON m.marca_id = ma.id
      ORDER BY e.created_at DESC
    `);

    return {
      overview: generalStats.recordset[0],
      byStatus: byStatus.recordset,
      topBrands: topBrands.recordset,
      topModels: topModels.recordset,
      mostTickets: mostTickets.recordset,
      byCategory: byCategory.recordset,
      byLocation: byLocation.recordset,
      recentActivity: recentActivity.recordset,
    };
  }

  /**
   * Parse equipment record (handle JSON model specifications)
   */
  private parseEquipment(record: any) {
    return {
      ...record,
      model_specifications: record.model_specifications ? JSON.parse(record.model_specifications) : null,
    };
  }
}
