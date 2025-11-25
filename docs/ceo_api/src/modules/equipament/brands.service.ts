import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/equipment.dto';
import * as sql from 'mssql';

/**
 * Equipment Brands Service
 * Manages equipment brands/manufacturers
 */
@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create brand
   */
  async create(dto: CreateBrandDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('logoUrl', sql.NVarChar, dto.logoUrl || null)
      .input('website', sql.NVarChar, dto.website || null)
      .input('readingCode', sql.NVarChar, dto.readingCode || null)
      .input('readingType', sql.NVarChar, dto.readingType || null)
      .input('supportEmail', sql.NVarChar, dto.supportEmail || null)
      .input('supportPhone', sql.NVarChar, dto.supportPhone || null)
      .input('supportLink', sql.NVarChar, dto.supportLink || null)
      .input('active', sql.Bit, dto.active !== false ? 1 : 0).query(`
        INSERT INTO marcas (
          name, logo_url, website, codigo_leitura, tipo_leitura,
          email_suporte, telefone_suporte, link_suporte, ativo, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @logoUrl, @website, @readingCode, @readingType,
          @supportEmail, @supportPhone, @supportLink, @active, GETDATE()
        )
      `);

    this.logger.log(`Brand created: ${dto.name} (ID: ${result.recordset[0].id})`);
    return this.getById(result.recordset[0].id, tenantId);
  }

  /**
   * List brands with filters and pagination
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
      conditions.push('m.ativo = @active');
      request.input('active', sql.Bit, filters.active ? 1 : 0);
    }

    if (filters?.search) {
      conditions.push('(m.name LIKE @search OR m.website LIKE @search)');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const selectFields = `
      m.id,
      m.name AS name,
      m.logo_url AS logo_url,
      m.website,
      m.codigo_leitura AS reading_code,
      m.tipo_leitura AS reading_type,
      m.email_suporte AS support_email,
      m.telefone_suporte AS support_phone,
      m.link_suporte AS support_link,
      m.ativo AS active,
      m.created_at AS created_at,
      m.updated_at AS updated_at,
      (SELECT COUNT(*) FROM modelos_equipamento WHERE marca_id = m.id) AS total_models,
      (SELECT COUNT(*) FROM equipamentos e INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id WHERE mo.marca_id = m.id) AS total_equipment
    `;

    // Without pagination
    if (!filters?.page || !filters?.pageSize) {
      const result = await request.query(`
        SELECT ${selectFields}
        FROM marcas m
        ${whereClause}
        ORDER BY m.name
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
      FROM marcas m
      ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Fetch paginated data
    const dataResult = await request.query(`
      SELECT ${selectFields}
      FROM marcas m
      ${whereClause}
      ORDER BY m.name
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
   * Get brand by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        m.id,
        m.name AS name,
        m.logo_url AS logo_url,
        m.website,
        m.codigo_leitura AS reading_code,
        m.tipo_leitura AS reading_type,
        m.email_suporte AS support_email,
        m.telefone_suporte AS support_phone,
        m.link_suporte AS support_link,
        m.ativo AS active,
        m.created_at AS created_at,
        m.updated_at AS updated_at,
        (SELECT COUNT(*) FROM modelos_equipamento WHERE marca_id = m.id) AS total_models,
        (SELECT COUNT(*) FROM equipamentos e INNER JOIN modelos_equipamento mo ON e.modelo_id = mo.id WHERE mo.marca_id = m.id) AS total_equipment
      FROM marcas m
      WHERE m.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Update brand
   */
  async update(id: number, dto: UpdateBrandDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('logoUrl', sql.NVarChar, dto.logoUrl || null)
      .input('website', sql.NVarChar, dto.website || null)
      .input('readingCode', sql.NVarChar, dto.readingCode || null)
      .input('readingType', sql.NVarChar, dto.readingType || null)
      .input('supportEmail', sql.NVarChar, dto.supportEmail || null)
      .input('supportPhone', sql.NVarChar, dto.supportPhone || null)
      .input('supportLink', sql.NVarChar, dto.supportLink || null)
      .input('active', sql.Bit, dto.active !== false ? 1 : 0).query(`
        UPDATE marcas
        SET
          name = @name,
          logo_url = @logoUrl,
          website = @website,
          codigo_leitura = @readingCode,
          tipo_leitura = @readingType,
          email_suporte = @supportEmail,
          telefone_suporte = @supportPhone,
          link_suporte = @supportLink,
          ativo = @active,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Brand updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete brand
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has models
    const modelsCheck = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) AS total FROM modelos_equipamento WHERE marca_id = @id
    `);

    if (modelsCheck.recordset[0].total > 0) {
      throw new Error('Cannot delete brand that has models associated');
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM marcas WHERE id = @id
    `);

    this.logger.log(`Brand deleted: ${id}`);
    return { message: 'Brand deleted successfully' };
  }

  /**
   * Get brand statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS total_brands,
        COUNT(CASE WHEN ativo = 1 THEN 1 END) AS active_brands,
        COUNT(CASE WHEN ativo = 0 THEN 1 END) AS inactive_brands
      FROM marcas
    `);

    const topBrands = await pool.request().query(`
      SELECT TOP 10
        m.id,
        m.name AS name,
        m.logo_url AS logo_url,
        COUNT(DISTINCT mo.id) AS total_models,
        COUNT(DISTINCT e.id) AS total_equipment
      FROM marcas m
      LEFT JOIN modelos_equipamento mo ON m.id = mo.marca_id
      LEFT JOIN equipamentos e ON mo.id = e.modelo_id
      GROUP BY m.id, m.name, m.logo_url
      ORDER BY total_equipment DESC, total_models DESC
    `);

    return {
      overview: result.recordset[0],
      topBrands: topBrands.recordset,
    };
  }
}
