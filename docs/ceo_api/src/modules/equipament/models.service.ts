import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateModelDto, UpdateModelDto } from './dto/equipment.dto';
import * as sql from 'mssql';

/**
 * Equipment Models Service
 * Manages equipment models/variants
 */
@Injectable()
export class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create model
   */
  async create(dto: CreateModelDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('code', sql.NVarChar, dto.code)
      .input('brandId', sql.Int, dto.brandId)
      .input('categoryId', sql.Int, dto.categoryId)
      .input('description', sql.NVarChar, dto.description || null)
      .input('specifications', sql.NVarChar, dto.specifications ? JSON.stringify(dto.specifications) : null)
      .input('imageUrl', sql.NVarChar, dto.imageUrl || null)
      .input('active', sql.Bit, dto.active !== false ? 1 : 0).query(`
        INSERT INTO modelos_equipamento (
          name, codigo, marca_id, categoria_id, description,
          especificacoes, imagem_url, ativo, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @code, @brandId, @categoryId, @description,
          @specifications, @imageUrl, @active, GETDATE()
        )
      `);

    this.logger.log(`Model created: ${dto.name} (ID: ${result.recordset[0].id})`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * List models with filters and pagination
   */
  async list(
    tenantId: number,
    filters?: {
      brandId?: number;
      categoryId?: number;
      active?: boolean;
      search?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const request = pool.request();

    const conditions: string[] = [];

    if (filters?.brandId) {
      conditions.push('m.marca_id = @brandId');
      request.input('brandId', sql.Int, filters.brandId);
    }

    if (filters?.categoryId) {
      conditions.push('m.categoria_id = @categoryId');
      request.input('categoryId', sql.Int, filters.categoryId);
    }

    if (filters?.active !== undefined) {
      conditions.push('m.ativo = @active');
      request.input('active', sql.Bit, filters.active ? 1 : 0);
    }

    if (filters?.search) {
      conditions.push('(m.name LIKE @search OR m.codigo LIKE @search OR m.description LIKE @search)');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      m.id,
      m.name AS name,
      m.codigo AS code,
      m.marca_id AS brand_id,
      b.name AS brand_name,
      b.logo_url AS brand_logo,
      m.categoria_id AS category_id,
      c.name AS category_name,
      c.icone AS category_icon,
      c.cor AS category_color,
      m.description AS description,
      m.especificacoes AS specifications,
      m.imagem_url AS image_url,
      m.ativo AS active,
      m.created_at AS created_at,
      m.updated_at AS updated_at,
      (SELECT COUNT(*) FROM equipamentos WHERE modelo_id = m.id) AS total_equipment
    `;

    const fromClause = `
      FROM modelos_equipamento m
      INNER JOIN marcas b ON m.marca_id = b.id
      INNER JOIN categorias_equipamento c ON m.categoria_id = c.id
    `;

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const result = await request.query(`
        SELECT ${selectFields}
        ${fromClause}
        ${whereClause}
        ORDER BY m.name
      `);
      return result.recordset.map(this.parseModel);
    }

    // With pagination
    const page = filters.page;
    const pageSize = filters.pageSize;
    const offset = (page - 1) * pageSize;

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) AS total
      ${fromClause}
      ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Fetch paginated data
    const dataResult = await request.query(`
      SELECT ${selectFields}
      ${fromClause}
      ${whereClause}
      ORDER BY m.name
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset.map(this.parseModel),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get model by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        m.id,
        m.name AS name,
        m.codigo AS code,
        m.marca_id AS brand_id,
        b.name AS brand_name,
        b.logo_url AS brand_logo,
        m.categoria_id AS category_id,
        c.name AS category_name,
        c.icone AS category_icon,
        c.cor AS category_color,
        m.description AS description,
        m.especificacoes AS specifications,
        m.imagem_url AS image_url,
        m.ativo AS active,
        m.created_at AS created_at,
        m.updated_at AS updated_at,
        (SELECT COUNT(*) FROM equipamentos WHERE modelo_id = m.id) AS total_equipment
      FROM modelos_equipamento m
      INNER JOIN marcas b ON m.marca_id = b.id
      INNER JOIN categorias_equipamento c ON m.categoria_id = c.id
      WHERE m.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    return this.parseModel(result.recordset[0]);
  }

  /**
   * Update model
   */
  async update(id: number, dto: UpdateModelDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('code', sql.NVarChar, dto.code)
      .input('brandId', sql.Int, dto.brandId)
      .input('categoryId', sql.Int, dto.categoryId)
      .input('description', sql.NVarChar, dto.description || null)
      .input('specifications', sql.NVarChar, dto.specifications ? JSON.stringify(dto.specifications) : null)
      .input('imageUrl', sql.NVarChar, dto.imageUrl || null)
      .input('active', sql.Bit, dto.active !== false ? 1 : 0).query(`
        UPDATE modelos_equipamento
        SET
          name = @name,
          codigo = @code,
          marca_id = @brandId,
          categoria_id = @categoryId,
          description = @description,
          especificacoes = @specifications,
          imagem_url = @imageUrl,
          ativo = @active,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Model updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete model
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has equipment
    const equipmentCheck = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) AS total FROM equipamentos WHERE modelo_id = @id
    `);

    if (equipmentCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete model that has equipment associated');
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM modelos_equipamento WHERE id = @id
    `);

    this.logger.log(`Model deleted: ${id}`);
    return { message: 'Model deleted successfully' };
  }

  /**
   * Get model statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS total_models,
        COUNT(CASE WHEN ativo = 1 THEN 1 END) AS active_models,
        COUNT(CASE WHEN ativo = 0 THEN 1 END) AS inactive_models
      FROM modelos_equipamento
    `);

    const topModels = await pool.request().query(`
      SELECT TOP 10
        m.id,
        m.name AS name,
        m.codigo AS code,
        b.name AS brand_name,
        c.name AS category_name,
        COUNT(e.id) AS total_equipment
      FROM modelos_equipamento m
      INNER JOIN marcas b ON m.marca_id = b.id
      INNER JOIN categorias_equipamento c ON m.categoria_id = c.id
      LEFT JOIN equipamentos e ON m.id = e.modelo_id
      GROUP BY m.id, m.name, m.codigo, b.name, c.name
      ORDER BY total_equipment DESC
    `);

    return {
      overview: result.recordset[0],
      topModels: topModels.recordset,
    };
  }

  /**
   * Parse model record (handle JSON specifications)
   */
  private parseModel(record: any) {
    return {
      ...record,
      specifications: record.specifications ? JSON.parse(record.specifications) : null,
    };
  }
}
