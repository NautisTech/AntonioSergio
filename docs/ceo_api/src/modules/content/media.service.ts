import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMediaDto, UpdateMediaDto, MediaType } from './dto/content.dto';
import * as sql from 'mssql';

/**
 * Media Library Service
 * Manages media assets for content
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure media table exists
   */
  private async ensureMediaTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='content_media' AND xtype='U')
      BEGIN
        CREATE TABLE content_media (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX) NULL,
          file_url NVARCHAR(500) NOT NULL,
          file_name NVARCHAR(255) NOT NULL,
          file_size INT NOT NULL,
          mime_type NVARCHAR(100) NOT NULL,
          type NVARCHAR(50) NOT NULL, -- image, video, document, audio, other
          alt_text NVARCHAR(200) NULL,
          width INT NULL,
          height INT NULL,
          duration INT NULL, -- For video/audio in seconds
          uploaded_by INT NULL,
          metadata NVARCHAR(MAX) NULL, -- JSON for additional metadata
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (uploaded_by) REFERENCES [user](id)
        )

        CREATE INDEX idx_content_media_type ON content_media(type)
        CREATE INDEX idx_content_media_uploaded_by ON content_media(uploaded_by)

        -- Media tags
        CREATE TABLE content_media_tags (
          media_id INT NOT NULL,
          tag NVARCHAR(50) NOT NULL,
          PRIMARY KEY (media_id, tag),
          FOREIGN KEY (media_id) REFERENCES content_media(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_content_media_tags_tag ON content_media_tags(tag)
      END
    `);
  }

  /**
   * Create media
   */
  async create(dto: CreateMediaDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMediaTable(pool);

    const result = await pool
      .request()
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('file_url', sql.NVarChar, dto.fileUrl)
      .input('file_name', sql.NVarChar, dto.fileName)
      .input('file_size', sql.Int, dto.fileSize)
      .input('mime_type', sql.NVarChar, dto.mimeType)
      .input('type', sql.NVarChar, dto.type)
      .input('alt_text', sql.NVarChar, dto.altText || null)
      .input('uploaded_by', sql.Int, userId)
      .input('metadata', sql.NVarChar, dto.metadata ? JSON.stringify(dto.metadata) : null).query(`
        INSERT INTO content_media (
          title, description, file_url, file_name, file_size, mime_type,
          type, alt_text, uploaded_by, metadata
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @description, @file_url, @file_name, @file_size, @mime_type,
          @type, @alt_text, @uploaded_by, @metadata
        )
      `);

    const mediaId = result.recordset[0].id;

    // Associate tags
    if (dto.tags && dto.tags.length > 0) {
      await this.associateTags(mediaId, dto.tags, tenantId);
    }

    this.logger.log(`Media created: ${dto.title} (ID: ${mediaId})`);
    return this.getById(mediaId, tenantId);
  }

  /**
   * List media
   */
  async list(
    tenantId: number,
    type?: MediaType,
    tag?: string,
    search?: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMediaTable(pool);

    const conditions: string[] = ['m.deleted_at IS NULL'];
    const request = pool.request();

    if (type) {
      conditions.push('m.type = @type');
      request.input('type', sql.NVarChar, type);
    }

    if (tag) {
      conditions.push('EXISTS (SELECT 1 FROM content_media_tags WHERE media_id = m.id AND tag = @tag)');
      request.input('tag', sql.NVarChar, tag);
    }

    if (search) {
      conditions.push('(m.title LIKE @search OR m.description LIKE @search OR m.file_name LIKE @search)');
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * pageSize;

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM content_media m WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data
    request.input('offset', sql.Int, offset).input('pageSize', sql.Int, pageSize);

    const result = await request.query(`
      SELECT
        m.id,
        m.title,
        m.description AS description,
        m.file_url,
        m.file_name,
        m.file_size,
        m.mime_type,
        m.type AS type,
        m.alt_text,
        m.width,
        m.height,
        m.duration,
        m.uploaded_by,
        u.full_name AS uploaded_by_name,
        m.metadata,
        m.created_at AS created_at,
        m.updated_at AS updated_at
      FROM content_media m
      LEFT JOIN [user] u ON m.uploaded_by = u.id
      WHERE ${whereClause}
      ORDER BY m.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    // Get tags for each media
    const mediaList = await Promise.all(
      result.recordset.map(async (media) => {
        const tags = await this.getTags(media.id, tenantId);
        return this.parseMedia({ ...media, tags });
      }),
    );

    return {
      data: mediaList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get media by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMediaTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        m.id,
        m.title,
        m.description AS description,
        m.file_url,
        m.file_name,
        m.file_size,
        m.mime_type,
        m.type AS type,
        m.alt_text,
        m.width,
        m.height,
        m.duration,
        m.uploaded_by,
        u.full_name AS uploaded_by_name,
        m.metadata,
        m.created_at AS created_at,
        m.updated_at AS updated_at
      FROM content_media m
      LEFT JOIN [user] u ON m.uploaded_by = u.id
      WHERE m.id = @id AND m.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    const media = result.recordset[0];
    const tags = await this.getTags(id, tenantId);

    return this.parseMedia({ ...media, tags });
  }

  /**
   * Update media
   */
  async update(id: number, dto: UpdateMediaDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMediaTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('file_url', sql.NVarChar, dto.fileUrl)
      .input('file_name', sql.NVarChar, dto.fileName)
      .input('file_size', sql.Int, dto.fileSize)
      .input('mime_type', sql.NVarChar, dto.mimeType)
      .input('type', sql.NVarChar, dto.type)
      .input('alt_text', sql.NVarChar, dto.altText || null)
      .input('metadata', sql.NVarChar, dto.metadata ? JSON.stringify(dto.metadata) : null).query(`
        UPDATE content_media
        SET
          title = @title,
          description = @description,
          file_url = @file_url,
          file_name = @file_name,
          file_size = @file_size,
          mime_type = @mime_type,
          type = @type,
          alt_text = @alt_text,
          metadata = @metadata,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    // Update tags
    if (dto.tags !== undefined) {
      await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM content_media_tags WHERE media_id = @id
      `);
      if (dto.tags.length > 0) {
        await this.associateTags(id, dto.tags, tenantId);
      }
    }

    this.logger.log(`Media updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete media
   */
  async delete(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMediaTable(pool);

    // Check if exists
    await this.getById(id, tenantId);

    // Check if media is used in content
    const usage = await pool.request().input('id', sql.Int, id).query(`
      SELECT COUNT(*) as count FROM content_media_junction WHERE media_id = @id
    `);

    if (usage.recordset[0].count > 0) {
      this.logger.warn(`Media ${id} is used in ${usage.recordset[0].count} content(s)`);
    }

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE content_media SET deleted_at = GETDATE() WHERE id = @id
    `);

    this.logger.log(`Media deleted: ${id}`);
    return { message: 'Media deleted successfully' };
  }

  /**
   * Get media statistics
   */
  async getStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureMediaTable(pool);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        COUNT(CASE WHEN type = 'image' THEN 1 END) as image_count,
        COUNT(CASE WHEN type = 'video' THEN 1 END) as video_count,
        COUNT(CASE WHEN type = 'document' THEN 1 END) as document_count,
        COUNT(CASE WHEN type = 'audio' THEN 1 END) as audio_count,
        COUNT(CASE WHEN type = 'other' THEN 1 END) as other_count,
        AVG(file_size) as avg_file_size
      FROM content_media
      WHERE deleted_at IS NULL
    `);

    return result.recordset[0];
  }

  /**
   * Get tags for media
   */
  private async getTags(mediaId: number, tenantId: number): Promise<string[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('mediaId', sql.Int, mediaId).query(`
      SELECT tag FROM content_media_tags WHERE media_id = @mediaId
    `);

    return result.recordset.map((r) => r.tag);
  }

  /**
   * Associate tags
   */
  private async associateTags(mediaId: number, tags: string[], tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    for (const tag of tags) {
      await pool
        .request()
        .input('mediaId', sql.Int, mediaId)
        .input('tag', sql.NVarChar, tag).query(`
          INSERT INTO content_media_tags (media_id, tag)
          VALUES (@mediaId, @tag)
        `);
    }
  }

  /**
   * Parse media record
   */
  private parseMedia(record: any) {
    return {
      ...record,
      metadata: record.metadata ? JSON.parse(record.metadata) : null,
    };
  }
}
