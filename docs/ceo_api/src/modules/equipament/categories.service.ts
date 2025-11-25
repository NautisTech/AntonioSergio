import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateEquipmentCategoryDto, UpdateEquipmentCategoryDto } from './dto/equipment.dto';
import * as sql from 'mssql';

/**
 * Equipment Categories Service
 * Manages equipment categories/types
 */
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create category
   */
  async create(dto: CreateEquipmentCategoryDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('description', sql.NVarChar, dto.description || null)
      .input('active', sql.Bit, dto.active !== false ? 1 : 0).query(`
        INSERT INTO categorias_equipamento (
          name, icone, cor, description, ativo, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @icon, @color, @description, @active, GETDATE()
        )
      `);

    this.logger.log(`Category created: ${dto.name} (ID: ${result.recordset[0].id})`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * List categories with filters and pagination
   */
  async list(
    tenantId: number,
    filters?: {
      active?: boolean;
      search?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const request = pool.request();

    const conditions: string[] = [];

    if (filters?.active !== undefined) {
      conditions.push('c.ativo = @active');
      request.input('active', sql.Bit, filters.active ? 1 : 0);
    }

    if (filters?.search) {
      conditions.push('(c.name LIKE @search OR c.description LIKE @search)');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      c.id,
      c.name AS name,
      c.icone AS icon,
      c.cor AS color,
      c.description AS description,
      c.ativo AS active,
      c.created_at AS created_at,
      c.updated_at AS updated_at,
      (SELECT COUNT(*) FROM modelos_equipamento WHERE categoria_id = c.id) AS total_models,
      (SELECT COUNT(*) FROM equipamentos e INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id WHERE mo.categoria_id = c.id) AS total_equipment
    `;

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const result = await request.query(`
        SELECT ${selectFields}
        FROM categorias_equipamento c
        ${whereClause}
        ORDER BY c.name
      `);
      return result.recordset;
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
      FROM categorias_equipamento c
      ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Fetch paginated data
    const dataResult = await request.query(`
      SELECT ${selectFields}
      FROM categorias_equipamento c
      ${whereClause}
      ORDER BY c.name
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get category by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        c.id,
        c.name AS name,
        c.icone AS icon,
        c.cor AS color,
        c.description AS description,
        c.ativo AS active,
        c.created_at AS created_at,
        c.updated_at AS updated_at,
        (SELECT COUNT(*) FROM modelos_equipamento WHERE categoria_id = c.id) AS total_models,
        (SELECT COUNT(*) FROM equipamentos e INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id WHERE mo.categoria_id = c.id) AS total_equipment
      FROM categorias_equipamento c
      WHERE c.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Update category
   */
  async update(id: number, dto: UpdateEquipmentCategoryDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('description', sql.NVarChar, dto.description || null)
      .input('active', sql.Bit, dto.active !== false ? 1 : 0).query(`
        UPDATE categorias_equipamento
        SET
          name = @name,
          icone = @icon,
          cor = @color,
          description = @description,
          ativo = @active,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Category updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete category
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has models
    const modelsCheck = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) AS total FROM modelos_equipamento WHERE categoria_id = @id
    `);

    if (modelsCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete category that has models associated');
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM categorias_equipamento WHERE id = @id
    `);

    this.logger.log(`Category deleted: ${id}`);
    return { message: 'Category deleted successfully' };
  }

  /**
   * Get category statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS total_categories,
        COUNT(CASE WHEN ativo = 1 THEN 1 END) AS active_categories,
        COUNT(CASE WHEN ativo = 0 THEN 1 END) AS inactive_categories
      FROM categorias_equipamento
    `);

    const topCategories = await pool.request().query(`
      SELECT TOP 10
        c.id,
        c.name AS name,
        c.icone AS icon,
        c.cor AS color,
        COUNT(DISTINCT mo.id) AS total_models,
        COUNT(DISTINCT e.id) AS total_equipment
      FROM categorias_equipamento c
      LEFT JOIN modelos_equipamento mo ON c.id = mo.categoria_id
      LEFT JOIN equipamentos e ON mo.id = e.modelo_id
      GROUP BY c.id, c.name, c.icone, c.cor
      ORDER BY total_equipment DESC, total_models DESC
    `);

    return {
      overview: result.recordset[0],
      topCategories: topCategories.recordset,
    };
  }
}
