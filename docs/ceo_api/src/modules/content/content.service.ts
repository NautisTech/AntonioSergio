import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateContentDto,
  UpdateContentDto,
  ContentFilterDto,
  ContentStatus,
  ContentVisibility,
} from './dto/content.dto';
import * as sql from 'mssql';

/**
 * Content Service
 * Manages content publication with versioning, scheduling, and SEO
 */
@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure all content tables exist
   */
  private async ensureContentTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='content' AND xtype='U')
      BEGIN
        -- Main content table
        CREATE TABLE content (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(200) NOT NULL,
          slug NVARCHAR(250) NOT NULL,
          excerpt NVARCHAR(500) NULL,
          content NVARCHAR(MAX) NOT NULL,
          type NVARCHAR(50) NOT NULL, -- article, news, tutorial, etc
          content_type_id INT NULL,
          status NVARCHAR(50) NOT NULL DEFAULT 'draft',
          visibility NVARCHAR(50) NOT NULL DEFAULT 'public',
          featured_image NVARCHAR(500) NULL,
          author_id INT NULL,
          published_at DATETIME NULL,
          allow_comments BIT DEFAULT 1,
          is_featured BIT DEFAULT 0,
          language NVARCHAR(5) DEFAULT 'pt',
          parent_id INT NULL, -- For translations/versions
          version INT DEFAULT 1,
          view_count INT DEFAULT 0,
          like_count INT DEFAULT 0,
          share_count INT DEFAULT 0,
          comment_count INT DEFAULT 0,
          -- SEO fields
          meta_title NVARCHAR(60) NULL,
          meta_description NVARCHAR(160) NULL,
          meta_keywords NVARCHAR(MAX) NULL,
          canonical_url NVARCHAR(500) NULL,
          og_title NVARCHAR(200) NULL,
          og_description NVARCHAR(300) NULL,
          og_image NVARCHAR(500) NULL,
          twitter_card NVARCHAR(50) NULL,
          robots NVARCHAR(50) NULL,
          -- Custom fields and permissions
          custom_fields NVARCHAR(MAX) NULL, -- JSON
          permissions NVARCHAR(MAX) NULL, -- JSON
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (author_id) REFERENCES [user](id),
          FOREIGN KEY (parent_id) REFERENCES content(id)
        )

        CREATE UNIQUE INDEX idx_content_slug ON content(slug) WHERE deleted_at IS NULL
        CREATE INDEX idx_content_status ON content(status)
        CREATE INDEX idx_content_visibility ON content(visibility)
        CREATE INDEX idx_content_type ON content(type)
        CREATE INDEX idx_content_author ON content(author_id)
        CREATE INDEX idx_content_published ON content(published_at)
        CREATE INDEX idx_content_featured ON content(is_featured)

        -- Content versions (track changes)
        CREATE TABLE content_versions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          content_id INT NOT NULL,
          version INT NOT NULL,
          title NVARCHAR(200) NOT NULL,
          content NVARCHAR(MAX) NOT NULL,
          changes_summary NVARCHAR(500) NULL,
          created_by INT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES [user](id)
        )

        CREATE INDEX idx_content_versions_content ON content_versions(content_id)

        -- Content categories (many-to-many)
        CREATE TABLE content_categories_junction (
          content_id INT NOT NULL,
          category_id INT NOT NULL,
          PRIMARY KEY (content_id, category_id),
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
        )

        -- Content tags (many-to-many)
        CREATE TABLE content_tags_junction (
          content_id INT NOT NULL,
          tag_id INT NOT NULL,
          PRIMARY KEY (content_id, tag_id),
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
        )

        -- Content media (many-to-many)
        CREATE TABLE content_media_junction (
          content_id INT NOT NULL,
          media_id INT NOT NULL,
          display_order INT DEFAULT 0,
          PRIMARY KEY (content_id, media_id),
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
        )

        -- Related content (many-to-many)
        CREATE TABLE content_related (
          content_id INT NOT NULL,
          related_content_id INT NOT NULL,
          PRIMARY KEY (content_id, related_content_id),
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
          FOREIGN KEY (related_content_id) REFERENCES content(id)
        )

        -- Content views tracking
        CREATE TABLE content_views (
          id INT IDENTITY(1,1) PRIMARY KEY,
          content_id INT NOT NULL,
          user_id INT NULL,
          ip_address NVARCHAR(50) NULL,
          user_agent NVARCHAR(500) NULL,
          referer NVARCHAR(500) NULL,
          viewed_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_content_views_content ON content_views(content_id)
        CREATE INDEX idx_content_views_date ON content_views(viewed_at)
      END
    `);
  }

  /**
   * Create content
   */
  async create(dto: CreateContentDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    // Generate slug if not provided
    const slug = dto.slug || this.generateSlug(dto.title);

    // Check slug uniqueness
    const existingSlug = await pool.request().input('slug', sql.NVarChar, slug)
      .query(`
      SELECT id FROM content WHERE slug = @slug AND deleted_at IS NULL
    `);

    if (existingSlug.recordset.length > 0) {
      throw new BadRequestException(
        `Content with slug '${slug}' already exists`,
      );
    }

    // Insert content
    const result = await pool
      .request()
      .input('title', sql.NVarChar, dto.title)
      .input('slug', sql.NVarChar, slug)
      .input('excerpt', sql.NVarChar, dto.excerpt || null)
      .input('content', sql.NVarChar, dto.content)
      .input('type', sql.NVarChar, dto.type)
      .input('content_type_id', sql.Int, dto.contentTypeId || null)
      .input('status', sql.NVarChar, dto.status)
      .input('visibility', sql.NVarChar, dto.visibility)
      .input('featured_image', sql.NVarChar, dto.featuredImage || null)
      .input('author_id', sql.Int, dto.authorId || userId)
      .input(
        'published_at',
        sql.DateTime,
        dto.publishedAt ? new Date(dto.publishedAt) : null,
      )
      .input('allow_comments', sql.Bit, dto.allowComments !== false ? 1 : 0)
      .input('is_featured', sql.Bit, dto.isFeatured ? 1 : 0)
      .input('language', sql.NVarChar, dto.language || 'pt')
      .input('parent_id', sql.Int, dto.parentId || null)
      .input('meta_title', sql.NVarChar, dto.seo?.metaTitle || null)
      .input('meta_description', sql.NVarChar, dto.seo?.metaDescription || null)
      .input(
        'meta_keywords',
        sql.NVarChar,
        dto.seo?.metaKeywords ? JSON.stringify(dto.seo.metaKeywords) : null,
      )
      .input('canonical_url', sql.NVarChar, dto.seo?.canonicalUrl || null)
      .input('og_title', sql.NVarChar, dto.seo?.ogTitle || null)
      .input('og_description', sql.NVarChar, dto.seo?.ogDescription || null)
      .input('og_image', sql.NVarChar, dto.seo?.ogImage || null)
      .input('twitter_card', sql.NVarChar, dto.seo?.twitterCard || null)
      .input('robots', sql.NVarChar, dto.seo?.robots || null)
      .input(
        'custom_fields',
        sql.NVarChar,
        dto.customFields ? JSON.stringify(dto.customFields) : null,
      )
      .input(
        'permissions',
        sql.NVarChar,
        dto.permissions ? JSON.stringify(dto.permissions) : null,
      ).query(`
        INSERT INTO content (
          title, slug, excerpt, content, type, content_type_id, status, visibility,
          featured_image, author_id, published_at, allow_comments, is_featured,
          language, parent_id, meta_title, meta_description, meta_keywords,
          canonical_url, og_title, og_description, og_image, twitter_card, robots,
          custom_fields, permissions, created_at, updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @slug, @excerpt, @content, @type, @content_type_id, @status, @visibility,
          @featured_image, @author_id, @published_at, @allow_comments, @is_featured,
          @language, @parent_id, @meta_title, @meta_description, @meta_keywords,
          @canonical_url, @og_title, @og_description, @og_image, @twitter_card, @robots,
          @custom_fields, @permissions, GETDATE(), GETDATE()
        )
      `);

    const contentId = result.recordset[0].id;

    // Create initial version
    await this.createVersion(
      contentId,
      dto.title,
      dto.content,
      'Initial version',
      userId,
      tenantId,
    );

    // Associate categories
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.associateCategories(contentId, dto.categoryIds, tenantId);
    }

    // Associate tags
    if (dto.tags && dto.tags.length > 0) {
      await this.associateTags(contentId, dto.tags, tenantId);
    }

    // Associate related content
    if (dto.relatedContentIds && dto.relatedContentIds.length > 0) {
      await this.associateRelatedContent(
        contentId,
        dto.relatedContentIds,
        tenantId,
      );
    }

    this.logger.log(`Content created: ${dto.title} (ID: ${contentId})`);
    return this.getById(contentId, tenantId);
  }

  /**
   * List content with filters
   */
  async list(tenantId: number, filters: ContentFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    const {
      type,
      status,
      visibility,
      categoryId,
      authorId,
      search,
      tags,
      language,
      featuredOnly,
      includeScheduled,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
      sortBy = 'published_at',
      sortOrder = 'desc',
    } = filters;

    const offset = (page - 1) * pageSize;
    const conditions: string[] = ['c.deleted_at IS NULL'];
    const request = pool.request();

    if (type) {
      conditions.push('c.type = @type');
      request.input('type', sql.NVarChar, type);
    }

    if (status) {
      conditions.push('c.status = @status');
      request.input('status', sql.NVarChar, status);
    }

    if (visibility) {
      conditions.push('c.visibility = @visibility');
      request.input('visibility', sql.NVarChar, visibility);
    }

    if (categoryId) {
      conditions.push(
        'EXISTS (SELECT 1 FROM content_categories_junction WHERE content_id = c.id AND category_id = @categoryId)',
      );
      request.input('categoryId', sql.Int, categoryId);
    }

    if (authorId) {
      conditions.push('c.author_id = @authorId');
      request.input('authorId', sql.Int, authorId);
    }

    if (search) {
      conditions.push(
        '(c.title LIKE @search OR c.excerpt LIKE @search OR c.content LIKE @search)',
      );
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      conditions.push(`EXISTS (
        SELECT 1 FROM content_tags_junction ctj
        INNER JOIN content_tags ct ON ctj.tag_id = ct.id
        WHERE ctj.content_id = c.id AND ct.name IN (${tagArray.map((_, i) => `@tag${i}`).join(',')})
      )`);
      tagArray.forEach((tag, i) => request.input(`tag${i}`, sql.NVarChar, tag));
    }

    if (language) {
      conditions.push('c.language = @language');
      request.input('language', sql.NVarChar, language);
    }

    if (featuredOnly) {
      conditions.push('c.is_featured = 1');
    }

    if (!includeScheduled) {
      conditions.push(
        '(c.published_at IS NULL OR c.published_at <= GETDATE())',
      );
    }

    if (startDate) {
      conditions.push('c.published_at >= @startDate');
      request.input('startDate', sql.DateTime, new Date(startDate));
    }

    if (endDate) {
      conditions.push('c.published_at <= @endDate');
      request.input('endDate', sql.DateTime, new Date(endDate));
    }

    const whereClause = conditions.join(' AND ');

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM content c WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data
    const validSortColumns = [
      'published_at',
      'created_at',
      'updated_at',
      'title',
      'view_count',
      'like_count',
    ];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : 'published_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    request
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize);

    const result = await request.query(`
      SELECT
        c.id,
        c.title,
        c.slug,
        c.excerpt,
        c.type AS type,
        c.status,
        c.visibility,
        c.featured_image,
        c.author_id,
        u.full_name AS author_name,
        c.published_at,
        c.allow_comments,
        c.is_featured,
        c.language,
        c.view_count,
        c.like_count,
        c.share_count,
        c.comment_count,
        c.created_at AS created_at,
        c.updated_at AS updated_at
      FROM content c
      LEFT JOIN [user] u ON c.author_id = u.id
      WHERE ${whereClause}
      ORDER BY c.${sortColumn} ${sortDirection}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    // Enrich each content item with categories, tags, and custom fields
    const enrichedData = await Promise.all(
      result.recordset.map(async (content) => {
        const contentObj = this.parseContent(content);

        try {
          const categories = await pool
            .request()
            .input('id', sql.Int, content.id).query(`
            SELECT cat.id, cat.name, cat.slug, cat.display_order, cat.visible
            FROM content_categories cat
            INNER JOIN content_categories_junction ccj ON cat.id = ccj.category_id
            WHERE ccj.content_id = @id
            ORDER BY cat.display_order ASC
          `);
          contentObj.categories = categories.recordset;
        } catch (error) {
          this.logger.error(`Failed to load categories for content ${content.id}:`, error);
          contentObj.categories = [];
        }

        try {
          const tags = await pool.request().input('id', sql.Int, content.id)
            .query(`
            SELECT t.id, t.name, t.slug, t.color, t.usage_count
            FROM tag t
            INNER JOIN content_tags_junction ctj ON t.id = ctj.tag_id
            WHERE ctj.content_id = @id
          `);
          contentObj.tags = tags.recordset;
        } catch (error) {
          contentObj.tags = [];
        }

        // Get custom fields based on content type
        try {
          const customFieldsResult = await pool
            .request()
            .input('contentId', sql.Int, content.id)
            .input('entityType', sql.NVarChar, content.type).query(`
              SELECT 
                cfc.id,
                cfc.field_name,
                cfc.field_label,
                cfc.field_type,
                cfv.value_text,
                cfv.value_number,
                cfv.value_date,
                cfv.value_boolean
              FROM custom_field_config cfc
              LEFT JOIN custom_field_value cfv ON cfc.id = cfv.custom_field_config_id 
                AND cfv.entity_id = @contentId
              WHERE cfc.entity_type = @entityType 
                AND cfc.deleted_at IS NULL
              ORDER BY cfc.display_order
            `);

          // Transform into a key-value object
          const customFields = {};
          customFieldsResult.recordset.forEach((field) => {
            const value =
              field.value_text ||
              field.value_number ||
              field.value_date ||
              field.value_boolean;
            customFields[field.field_name] = {
              label: field.field_label,
              value: value,
              type: field.field_type,
            };
          });
          contentObj.custom_fields = customFields;
        } catch (error) {
          contentObj.custom_fields = {};
        }

        return contentObj;
      }),
    );

    return {
      data: enrichedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get content by ID
   */
  async getById(id: number, tenantId: number, incrementView: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        c.*,
        u.full_name AS author_name,
        u.email AS author_email
      FROM content c
      LEFT JOIN [user] u ON c.author_id = u.id
      WHERE c.id = @id AND c.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    const content = this.parseContent(result.recordset[0]);

    // Get categories (optional)
    try {
      const categories = await pool.request().input('id', sql.Int, id).query(`
        SELECT cat.id, cat.name, cat.slug, cat.display_order
        FROM content_categories cat
        INNER JOIN content_categories_junction ccj ON cat.id = ccj.category_id
        WHERE ccj.content_id = @id
        ORDER BY cat.display_order ASC
      `);
      content.categories = categories.recordset;
    } catch (error) {
      this.logger.error(`Failed to load categories for content ${id}:`, error);
      content.categories = [];
    }

    // Get tags (optional)
    try {
      const tags = await pool.request().input('id', sql.Int, id).query(`
        SELECT t.id, t.name, t.slug, t.color, t.usage_count
        FROM tag t
        INNER JOIN content_tags_junction ctj ON t.id = ctj.tag_id
        WHERE ctj.content_id = @id
      `);
      content.tags = tags.recordset;
    } catch (error) {
      content.tags = [];
    }

    // Get related content (optional)
    try {
      const related = await pool.request().input('id', sql.Int, id).query(`
        SELECT c.id, c.title, c.slug, c.excerpt, c.featured_image
        FROM content c
        INNER JOIN content_related cr ON c.id = cr.related_content_id
        WHERE cr.content_id = @id AND c.deleted_at IS NULL
      `);
      content.related = related.recordset;
    } catch (error) {
      content.related = [];
    }

    // Get custom fields based on content type
    try {
      const customFieldsResult = await pool
        .request()
        .input('contentId', sql.Int, id)
        .input('entityType', sql.NVarChar, content.type).query(`
          SELECT 
            cfc.id,
            cfc.field_name,
            cfc.field_label,
            cfc.field_type,
            cfv.value_text,
            cfv.value_number,
            cfv.value_date,
            cfv.value_boolean
          FROM custom_field_config cfc
          LEFT JOIN custom_field_value cfv ON cfc.id = cfv.custom_field_config_id 
            AND cfv.entity_id = @contentId
          WHERE cfc.entity_type = @entityType 
            AND cfc.deleted_at IS NULL
          ORDER BY cfc.display_order
        `);

      // Transform into a key-value object
      const customFields = {};
      customFieldsResult.recordset.forEach((field) => {
        const value =
          field.value_text ||
          field.value_number ||
          field.value_date ||
          field.value_boolean;
        customFields[field.field_name] = {
          label: field.field_label,
          value: value,
          type: field.field_type,
        };
      });
      content.custom_fields = customFields;
    } catch (error) {
      content.custom_fields = {};
    }

    // Increment view count
    if (incrementView) {
      await pool.request().input('id', sql.Int, id).query(`
        UPDATE content SET view_count = view_count + 1 WHERE id = @id
      `);
    }

    return content;
  }

  /**
   * Get content by slug
   */
  async getBySlug(
    slug: string,
    tenantId: number,
    incrementView: boolean = false,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    const result = await pool.request().input('slug', sql.NVarChar, slug)
      .query(`
      SELECT id FROM content WHERE slug = @slug AND deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Content with slug '${slug}' not found`);
    }

    return this.getById(result.recordset[0].id, tenantId, incrementView);
  }

  /**
   * Update content
   */
  async update(
    id: number,
    dto: UpdateContentDto,
    tenantId: number,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    // Check if exists
    const existing = await this.getById(id, tenantId);

    // Check slug uniqueness if changed
    const slug = dto.slug || existing.slug;
    if (slug !== existing.slug) {
      const existingSlug = await pool
        .request()
        .input('slug', sql.NVarChar, slug)
        .input('id', sql.Int, id).query(`
        SELECT id FROM content WHERE slug = @slug AND id != @id AND deleted_at IS NULL
      `);

      if (existingSlug.recordset.length > 0) {
        throw new BadRequestException(
          `Content with slug '${slug}' already exists`,
        );
      }
    }

    // Track if content changed (for versioning)
    const contentChanged = dto.content && dto.content !== existing.content;

    // Update content
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, dto.title)
      .input('slug', sql.NVarChar, slug)
      .input('excerpt', sql.NVarChar, dto.excerpt || null)
      .input('content', sql.NVarChar, dto.content)
      .input('type', sql.NVarChar, dto.type)
      .input('content_type_id', sql.Int, dto.contentTypeId || null)
      .input('status', sql.NVarChar, dto.status)
      .input('visibility', sql.NVarChar, dto.visibility)
      .input('featured_image', sql.NVarChar, dto.featuredImage || null)
      .input('author_id', sql.Int, dto.authorId || existing.author_id)
      .input(
        'published_at',
        sql.DateTime,
        dto.publishedAt ? new Date(dto.publishedAt) : null,
      )
      .input('allow_comments', sql.Bit, dto.allowComments !== false ? 1 : 0)
      .input('is_featured', sql.Bit, dto.isFeatured ? 1 : 0)
      .input('language', sql.NVarChar, dto.language || 'pt')
      .input('parent_id', sql.Int, dto.parentId || null)
      .input('meta_title', sql.NVarChar, dto.seo?.metaTitle || null)
      .input('meta_description', sql.NVarChar, dto.seo?.metaDescription || null)
      .input(
        'meta_keywords',
        sql.NVarChar,
        dto.seo?.metaKeywords ? JSON.stringify(dto.seo.metaKeywords) : null,
      )
      .input('canonical_url', sql.NVarChar, dto.seo?.canonicalUrl || null)
      .input('og_title', sql.NVarChar, dto.seo?.ogTitle || null)
      .input('og_description', sql.NVarChar, dto.seo?.ogDescription || null)
      .input('og_image', sql.NVarChar, dto.seo?.ogImage || null)
      .input('twitter_card', sql.NVarChar, dto.seo?.twitterCard || null)
      .input('robots', sql.NVarChar, dto.seo?.robots || null)
      .input(
        'custom_fields',
        sql.NVarChar,
        dto.customFields ? JSON.stringify(dto.customFields) : null,
      )
      .input(
        'permissions',
        sql.NVarChar,
        dto.permissions ? JSON.stringify(dto.permissions) : null,
      ).query(`
        UPDATE content
        SET
          title = @title,
          slug = @slug,
          excerpt = @excerpt,
          content = @content,
          type = @type,
          content_type_id = @content_type_id,
          status = @status,
          visibility = @visibility,
          featured_image = @featured_image,
          author_id = @author_id,
          published_at = @published_at,
          allow_comments = @allow_comments,
          is_featured = @is_featured,
          language = @language,
          parent_id = @parent_id,
          meta_title = @meta_title,
          meta_description = @meta_description,
          meta_keywords = @meta_keywords,
          canonical_url = @canonical_url,
          og_title = @og_title,
          og_description = @og_description,
          og_image = @og_image,
          twitter_card = @twitter_card,
          robots = @robots,
          custom_fields = @custom_fields,
          permissions = @permissions,
          version = version + 1,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    // Create version if content changed
    if (contentChanged) {
      await this.createVersion(
        id,
        dto.title,
        dto.content,
        'Content updated',
        userId,
        tenantId,
      );
    }

    // Update categories
    if (dto.categoryIds !== undefined) {
      await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM content_categories_junction WHERE content_id = @id
      `);
      if (dto.categoryIds.length > 0) {
        await this.associateCategories(id, dto.categoryIds, tenantId);
      }
    }

    // Update tags
    if (dto.tags !== undefined) {
      await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM content_tags_junction WHERE content_id = @id
      `);
      if (dto.tags.length > 0) {
        await this.associateTags(id, dto.tags, tenantId);
      }
    }

    // Update related content
    if (dto.relatedContentIds !== undefined) {
      await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM content_related WHERE content_id = @id
      `);
      if (dto.relatedContentIds.length > 0) {
        await this.associateRelatedContent(id, dto.relatedContentIds, tenantId);
      }
    }

    this.logger.log(`Content updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete content (soft delete)
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE content SET deleted_at = GETDATE() WHERE id = @id
    `);

    this.logger.log(`Content deleted: ${id}`);
    return { message: 'Content deleted successfully' };
  }

  /**
   * Publish content
   */
  async publish(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE content
      SET status = 'published', published_at = GETDATE(), updated_at = GETDATE()
      WHERE id = @id AND deleted_at IS NULL
    `);

    this.logger.log(`Content published: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Unpublish content
   */
  async unpublish(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE content
      SET status = 'draft', updated_at = GETDATE()
      WHERE id = @id AND deleted_at IS NULL
    `);

    this.logger.log(`Content unpublished: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Track content view
   */
  async trackView(
    contentId: number,
    userId: number | null,
    ipAddress: string,
    userAgent: string,
    referer: string | null,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    await pool
      .request()
      .input('contentId', sql.Int, contentId)
      .input('userId', sql.Int, userId)
      .input('ipAddress', sql.NVarChar, ipAddress)
      .input('userAgent', sql.NVarChar, userAgent)
      .input('referer', sql.NVarChar, referer).query(`
        INSERT INTO content_views (content_id, user_id, ip_address, user_agent, referer)
        VALUES (@contentId, @userId, @ipAddress, @userAgent, @referer)
      `);
  }

  /**
   * Get content versions
   */
  async getVersions(contentId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureContentTables(pool);

    const result = await pool.request().input('contentId', sql.Int, contentId)
      .query(`
      SELECT
        v.id,
        v.version,
        v.title,
        v.changes_summary,
        v.created_by,
        u.full_name AS created_by_name,
        v.created_at AS created_at
      FROM content_versions v
      LEFT JOIN [user] u ON v.created_by = u.id
      WHERE v.content_id = @contentId
      ORDER BY v.version DESC
    `);

    return result.recordset;
  }

  /**
   * Create content version
   */
  private async createVersion(
    contentId: number,
    title: string,
    content: string,
    changesSummary: string,
    userId: number,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get current version
    const versionResult = await pool
      .request()
      .input('contentId', sql.Int, contentId).query(`
      SELECT ISNULL(MAX(version), 0) + 1 AS next_version FROM content_versions WHERE content_id = @contentId
    `);

    const nextVersion = versionResult.recordset[0].next_version;

    await pool
      .request()
      .input('contentId', sql.Int, contentId)
      .input('version', sql.Int, nextVersion)
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('changesSummary', sql.NVarChar, changesSummary)
      .input('createdBy', sql.Int, userId).query(`
        INSERT INTO content_versions (content_id, version, title, content, changes_summary, created_by)
        VALUES (@contentId, @version, @title, @content, @changesSummary, @createdBy)
      `);
  }

  /**
   * Associate categories
   */
  private async associateCategories(
    contentId: number,
    categoryIds: number[],
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    for (const categoryId of categoryIds) {
      await pool
        .request()
        .input('contentId', sql.Int, contentId)
        .input('categoryId', sql.Int, categoryId).query(`
          INSERT INTO content_categories_junction (content_id, category_id)
          VALUES (@contentId, @categoryId)
        `);
    }
  }

  /**
   * Associate tags (create if not exist)
   */
  private async associateTags(
    contentId: number,
    tags: string[],
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    for (const tagName of tags) {
      // Get or create tag
      let tagId: number;

      const existing = await pool.request().input('name', sql.NVarChar, tagName)
        .query(`
        SELECT id FROM content_tags WHERE name = @name
      `);

      if (existing.recordset.length > 0) {
        tagId = existing.recordset[0].id;
      } else {
        const slug = this.generateSlug(tagName);
        const result = await pool
          .request()
          .input('name', sql.NVarChar, tagName)
          .input('slug', sql.NVarChar, slug).query(`
            INSERT INTO content_tags (name, slug)
            OUTPUT INSERTED.id
            VALUES (@name, @slug)
          `);
        tagId = result.recordset[0].id;
      }

      // Associate
      await pool
        .request()
        .input('contentId', sql.Int, contentId)
        .input('tagId', sql.Int, tagId).query(`
          INSERT INTO content_tags_junction (content_id, tag_id)
          VALUES (@contentId, @tagId)
        `);
    }
  }

  /**
   * Associate related content
   */
  private async associateRelatedContent(
    contentId: number,
    relatedIds: number[],
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    for (const relatedId of relatedIds) {
      await pool
        .request()
        .input('contentId', sql.Int, contentId)
        .input('relatedId', sql.Int, relatedId).query(`
          INSERT INTO content_related (content_id, related_content_id)
          VALUES (@contentId, @relatedId)
        `);
    }
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
      .replace(/^-+|-+$/g, ''); // Trim dashes
  }

  /**
   * Parse content record
   */
  private parseContent(record: any) {
    return {
      ...record,
      allow_comments: Boolean(record.allow_comments),
      is_featured: Boolean(record.is_featured),
      meta_keywords: record.meta_keywords
        ? JSON.parse(record.meta_keywords)
        : null,
      custom_fields: record.custom_fields
        ? JSON.parse(record.custom_fields)
        : null,
      permissions: record.permissions ? JSON.parse(record.permissions) : null,
      seo: {
        metaTitle: record.meta_title,
        metaDescription: record.meta_description,
        metaKeywords: record.meta_keywords
          ? JSON.parse(record.meta_keywords)
          : null,
        canonicalUrl: record.canonical_url,
        ogTitle: record.og_title,
        ogDescription: record.og_description,
        ogImage: record.og_image,
        twitterCard: record.twitter_card,
        robots: record.robots,
      },
    };
  }
}
