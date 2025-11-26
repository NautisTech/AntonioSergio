import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateContentCategoryDto, UpdateContentCategoryDto } from './dto/content.dto';
import * as sql from 'mssql';

/**
 * Category Service
 * Manages content categories with hierarchy support
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure categories table exists
   */
  private async ensureCategoryTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='content_categories' AND xtype='U')
      BEGIN
        CREATE TABLE content_categories (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          slug NVARCHAR(150) NOT NULL UNIQUE,
          description NVARCHAR(MAX) NULL,
          parent_id INT NULL,
          icon NVARCHAR(10) NULL,
          color NVARCHAR(20) NULL,
          display_order INT DEFAULT 0,
          visible BIT DEFAULT 1,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (parent_id) REFERENCES content_categories(id)
        )

        CREATE INDEX idx_content_categories_parent ON content_categories(parent_id)
        CREATE INDEX idx_content_categories_visible ON content_categories(visible)
        CREATE INDEX idx_content_categories_order ON content_categories(display_order)
      END
    `);
  }

  /**
   * Create category
   */
  async create(dto: CreateContentCategoryDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCategoryTable(pool);

    const slug = dto.slug || this.generateSlug(dto.name);

    // Check slug uniqueness
    const existing = await pool.request().input('slug', sql.NVarChar, slug).query(`
      SELECT id FROM content_categories WHERE slug = @slug
    `);

    if (existing.recordset.length > 0) {
      throw new BadRequestException(`Category with slug '${slug}' already exists`);
    }

    const result = await pool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('slug', sql.NVarChar, slug)
      .input('description', sql.NVarChar, dto.description || null)
      .input('parent_id', sql.Int, dto.parentId || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('display_order', sql.Int, dto.order || 0)
      .input('visible', sql.Bit, dto.visible !== false ? 1 : 0).query(`
        INSERT INTO content_categories (name, slug, description, parent_id, icon, color, display_order, visible)
        OUTPUT INSERTED.id
        VALUES (@name, @slug, @description, @parent_id, @icon, @color, @display_order, @visible)
      `);

    const categoryId = result.recordset[0].id;

    this.logger.log(`Content category created: ${dto.name} (ID: ${categoryId})`);
    return this.getById(categoryId, tenantId);
  }

  /**
   * List categories
   */
  async list(tenantId: number, visibleOnly: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCategoryTable(pool);

    const whereClause = visibleOnly ? 'WHERE c.visible = 1' : '';

    const result = await pool.request().query(`
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        p.name AS parent_name,
        c.icon,
        c.color,
        c.display_order AS [order],
        c.visible,
        c.created_at AS created_at,
        c.updated_at AS updated_at,
        (SELECT COUNT(*) FROM content_categories WHERE parent_id = c.id) AS children_count,
        (SELECT COUNT(*) FROM content_categories_junction WHERE category_id = c.id) AS content_count
      FROM content_categories c
      LEFT JOIN content_categories p ON c.parent_id = p.id
      ${whereClause}
      ORDER BY c.display_order, c.name
    `);

    return result.recordset.map(this.parseCategory);
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getTree(tenantId: number) {
    const categories = await this.list(tenantId);

    const buildTree = (parentId: number | null = null): any[] => {
      return categories
        .filter((cat) => cat.parent_id === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    return buildTree(null);
  }

  /**
   * Get category by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCategoryTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.parent_id,
        p.name AS parent_name,
        c.icon,
        c.color,
        c.display_order AS [order],
        c.visible,
        c.created_at AS created_at,
        c.updated_at AS updated_at
      FROM content_categories c
      LEFT JOIN content_categories p ON c.parent_id = p.id
      WHERE c.id = @id
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.parseCategory(result.recordset[0]);
  }

  /**
   * Update category
   */
  async update(id: number, dto: UpdateContentCategoryDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCategoryTable(pool);

    // Check if exists
    const existing = await this.getById(id, tenantId);

    // Check slug uniqueness if changed
    const slug = dto.slug || existing.slug;
    if (slug !== existing.slug) {
      const existingSlug = await pool.request().input('slug', sql.NVarChar, slug).input('id', sql.Int, id).query(`
        SELECT id FROM content_categories WHERE slug = @slug AND id != @id
      `);

      if (existingSlug.recordset.length > 0) {
        throw new BadRequestException(`Category with slug '${slug}' already exists`);
      }
    }

    // Prevent circular parent reference
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if parent would create a circular reference
      const isCircular = await this.wouldCreateCircularReference(id, dto.parentId, tenantId);
      if (isCircular) {
        throw new BadRequestException('This parent would create a circular reference');
      }
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, dto.name)
      .input('slug', sql.NVarChar, slug)
      .input('description', sql.NVarChar, dto.description || null)
      .input('parent_id', sql.Int, dto.parentId || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('display_order', sql.Int, dto.order || 0)
      .input('visible', sql.Bit, dto.visible !== false ? 1 : 0).query(`
        UPDATE content_categories
        SET
          name = @name,
          slug = @slug,
          description = @description,
          parent_id = @parent_id,
          icon = @icon,
          color = @color,
          display_order = @display_order,
          visible = @visible,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Content category updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete category
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCategoryTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if has children
    const children = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) as count FROM content_categories WHERE parent_id = @id
    `);

    if (children.recordset[0].count > 0) {
      throw new BadRequestException('Cannot delete category with subcategories. Delete children first.');
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM content_categories WHERE id = @id
    `);

    this.logger.log(`Content category deleted: ${id}`);
    return { message: 'Category deleted successfully' };
  }

  /**
   * Check if setting a parent would create circular reference
   */
  private async wouldCreateCircularReference(categoryId: number, newParentId: number, tenantId: number): Promise<boolean> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    let currentId = newParentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (visited.has(currentId)) {
        return true; // Circular reference detected
      }

      if (currentId === categoryId) {
        return true; // Would create circular reference
      }

      visited.add(currentId);

      const result = await pool.request().input('id', sql.Int, currentId).query(`
        SELECT parent_id FROM content_categories WHERE id = @id
      `);

      if (result.recordset.length === 0) {
        break;
      }

      currentId = result.recordset[0].parent_id;
    }

    return false;
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

  /**
   * Parse category record
   */
  private parseCategory(record: any) {
    return {
      ...record,
      visible: Boolean(record.visible),
    };
  }
}
