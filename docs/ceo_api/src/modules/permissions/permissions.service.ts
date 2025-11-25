import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import { PermissionDto, PermissionListDto } from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Lista todas as permissões com filtros e paginação
   */
  async findAll(
    tenantId: number,
    category?: string,
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PermissionListDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let whereClause = 'deleted_at IS NULL';
    const request = pool.request();

    if (category) {
      whereClause += ' AND category = @category';
      request.input('category', sql.NVarChar, category);
    }

    if (search) {
      whereClause += ' AND (name LIKE @search OR permission_code LIKE @search OR description LIKE @search OR module_code LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total
      FROM [permission]
      WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data with pagination
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);

    const result = await request.query(`
      SELECT
        id,
        module_code,
        permission_code,
        action,
        name,
        description,
        category,
        is_dangerous,
        display_order,
        created_at,
        updated_at,
        created_by,
        updated_by,
        deleted_at
      FROM [permission]
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN display_order IS NOT NULL THEN 0 ELSE 1 END,
        display_order,
        module_code,
        name
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      data: result.recordset,
      total,
      limit,
      offset,
    };
  }

  /**
   * Busca permissão por ID
   */
  async findOne(tenantId: number, id: number): Promise<PermissionDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id).query(`
        SELECT
          id,
          module_code,
          permission_code,
          action,
          name,
          description,
          category,
          is_dangerous,
          display_order,
          created_at,
          updated_at,
          created_by,
          updated_by,
          deleted_at
        FROM [permission]
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Busca permissão por permission_code (anteriormente slug)
   */
  async findBySlug(tenantId: number, slug: string): Promise<PermissionDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('permission_code', sql.NVarChar, slug).query(`
        SELECT
          id,
          module_code,
          permission_code,
          action,
          name,
          description,
          category,
          is_dangerous,
          display_order,
          created_at,
          updated_at,
          created_by,
          updated_by,
          deleted_at
        FROM [permission]
        WHERE permission_code = @permission_code AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Permission with code "${slug}" not found`);
    }

    return result.recordset[0];
  }

  /**
   * Lista todas as categorias únicas
   */
  async getCategories(tenantId: number): Promise<string[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT DISTINCT category
      FROM [permission]
      WHERE category IS NOT NULL AND deleted_at IS NULL
      ORDER BY category
    `);

    return result.recordset.map((r) => r.category);
  }

  /**
   * Lista todos os módulos únicos
   */
  async getModules(tenantId: number): Promise<string[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT DISTINCT module_code
      FROM [permission]
      WHERE module_code IS NOT NULL AND deleted_at IS NULL
      ORDER BY module_code
    `);

    return result.recordset.map((r) => r.module_code);
  }

  /**
   * Busca permissões de um utilizador (diretas + de perfis)
   */
  async getUserPermissions(
    tenantId: number,
    userId: number,
  ): Promise<PermissionDto[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('userId', sql.Int, userId).query(`
        SELECT
          p.id,
          p.module_code,
          p.permission_code,
          p.action,
          p.name,
          p.description,
          p.category,
          p.is_dangerous,
          p.display_order,
          p.created_at,
          p.updated_at,
          p.created_by,
          p.updated_by,
          p.deleted_at
        FROM [permission] p
        WHERE p.deleted_at IS NULL AND p.id IN (
          -- Direct permissions
          SELECT permission_id FROM [user_permission] WHERE user_id = @userId
          UNION
          -- Permissions from user profiles
          SELECT upp.permission_id
          FROM [user_profile_permission] upp
          INNER JOIN [user_user_profile] uup ON upp.user_profile_id = uup.user_profile_id
          WHERE uup.user_id = @userId
        )
        ORDER BY
          CASE WHEN p.display_order IS NOT NULL THEN 0 ELSE 1 END,
          p.display_order,
          p.module_code,
          p.name
      `);

    return result.recordset;
  }
}
