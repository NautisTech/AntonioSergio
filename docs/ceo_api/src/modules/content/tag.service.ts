import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateTagDto } from './dto/content.dto';
import * as sql from 'mssql';

/**
 * Tag Service
 * Manages content tags
 */
@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure tags table exists
   */
  private async ensureTagTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='content_tags' AND xtype='U')
      BEGIN
        CREATE TABLE content_tags (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(50) NOT NULL,
          slug NVARCHAR(60) NOT NULL UNIQUE,
          color NVARCHAR(20) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        )

        CREATE INDEX idx_content_tags_name ON content_tags(name)
      END
    `);
  }

  /**
   * Create tag
   */
  async create(dto: CreateTagDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTagTable(pool);

    const slug = dto.slug || this.generateSlug(dto.name);

    // Check slug uniqueness
    const existing = await pool.request().input('slug', sql.NVarChar, slug).query(`
      SELECT id FROM content_tags WHERE slug = @slug
    `);

    if (existing.recordset.length > 0) {
      throw new BadRequestException(`Tag with slug '${slug}' already exists`);
    }

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('slug', sql.NVarChar, slug)
      .input('color', sql.NVarChar, dto.color || null).query(`
        INSERT INTO content_tags (name, slug, color)
        OUTPUT INSERTED.id
        VALUES (@name, @slug, @color)
      `);

    const tagId = result.recordset[0].id;

    this.logger.log(`Content tag created: ${dto.name} (ID: ${tagId})`);
    return this.getById(tagId, tenantId);
  }

  /**
   * List tags
   */
  async list(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTagTable(pool);

    const result = await pool.request().query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.color,
        t.created_at AS created_at,
        t.updated_at AS updated_at,
        (SELECT COUNT(*) FROM content_tags_junction WHERE tag_id = t.id) AS usage_count
      FROM content_tags t
      ORDER BY t.name
    `);

    return result.recordset;
  }

  /**
   * Get tag by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTagTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        t.id,
        t.name,
        t.slug,
        t.color,
        t.created_at AS created_at,
        t.updated_at AS updated_at
      FROM content_tags t
      WHERE t.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  /**
   * Update tag
   */
  async update(id: number, dto: CreateTagDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTagTable(pool);

    // Check if exists
    const existing = await this.getById(id, tenantId);

    // Check slug uniqueness if changed
    const slug = dto.slug || existing.slug;
    if (slug !== existing.slug) {
      const existingSlug = await pool.request().input('slug', sql.NVarChar, slug).input('id', sql.Int, id).query(`
        SELECT id FROM content_tags WHERE slug = @slug AND id != @id
      `);

      if (existingSlug.recordset.length > 0) {
        throw new BadRequestException(`Tag with slug '${slug}' already exists`);
      }
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('slug', sql.NVarChar, slug)
      .input('color', sql.NVarChar, dto.color || null).query(`
        UPDATE content_tags
        SET
          name = @name,
          slug = @slug,
          color = @color,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Content tag updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete tag
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTagTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM content_tags WHERE id = @id
    `);

    this.logger.log(`Content tag deleted: ${id}`);
    return { message: 'Tag deleted successfully' };
  }

  /**
   * Get popular tags
   */
  async getPopular(tenantId: number, limit: number = 10) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureTagTable(pool);

    const result = await pool.request().input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit)
        t.id,
        t.name,
        t.slug,
        t.color,
        COUNT(ctj.content_id) AS usage_count
      FROM content_tags t
      INNER JOIN content_tags_junction ctj ON t.id = ctj.tag_id
      GROUP BY t.id, t.name, t.slug, t.color
      ORDER BY COUNT(ctj.content_id) DESC
    `);

    return result.recordset;
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
