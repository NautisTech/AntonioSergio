import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  ModerateCommentDto,
  CommentStatus,
} from './dto/content.dto';
import * as sql from 'mssql';

/**
 * Comment Service
 * Manages content comments with moderation
 */
@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure comments table exists
   */
  private async ensureCommentTable(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='content_comments' AND xtype='U')
      BEGIN
        CREATE TABLE content_comments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          content_id INT NOT NULL,
          parent_id INT NULL,
          user_id INT NULL,
          author_name NVARCHAR(100) NULL,
          author_email NVARCHAR(200) NULL,
          comment_text NVARCHAR(2000) NOT NULL,
          status NVARCHAR(50) NOT NULL DEFAULT 'pending',
          approved_by INT NULL,
          approved_at DATETIME NULL,
          ip_address NVARCHAR(50) NULL,
          user_agent NVARCHAR(500) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES content_comments(id),
          FOREIGN KEY (user_id) REFERENCES [user](id),
          FOREIGN KEY (approved_by) REFERENCES [user](id)
        )

        CREATE INDEX idx_content_comments_content ON content_comments(content_id)
        CREATE INDEX idx_content_comments_parent ON content_comments(parent_id)
        CREATE INDEX idx_content_comments_status ON content_comments(status)
        CREATE INDEX idx_content_comments_user ON content_comments(user_id)
      END
    `);
  }

  /**
   * Create comment
   */
  async create(
    dto: CreateCommentDto,
    tenantId: number,
    userId: number | null,
    ipAddress: string,
    userAgent: string,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    // Verify content exists
    const content = await pool
      .request()
      .input('contentId', sql.Int, dto.contentId).query(`
      SELECT id, allow_comments FROM content WHERE id = @contentId AND deleted_at IS NULL
    `);

    if (content.recordset.length === 0) {
      throw new NotFoundException(`Content with ID ${dto.contentId} not found`);
    }

    if (!content.recordset[0].allow_comments) {
      throw new BadRequestException(
        'Comments are not allowed for this content',
      );
    }

    // Verify parent comment if specified
    if (dto.parentId) {
      const parent = await pool
        .request()
        .input('parentId', sql.Int, dto.parentId)
        .input('contentId', sql.Int, dto.contentId).query(`
          SELECT id FROM content_comments WHERE id = @parentId AND content_id = @contentId AND deleted_at IS NULL
        `);

      if (parent.recordset.length === 0) {
        throw new NotFoundException(
          `Parent comment with ID ${dto.parentId} not found`,
        );
      }
    }

    const result = await pool
      .request()
      .input('contentId', sql.Int, dto.contentId)
      .input('parentId', sql.Int, dto.parentId || null)
      .input('userId', sql.Int, userId)
      .input('authorName', sql.NVarChar, dto.authorName || null)
      .input('authorEmail', sql.NVarChar, dto.authorEmail || null)
      .input('commentText', sql.NVarChar, dto.text)
      .input('ipAddress', sql.NVarChar, ipAddress)
      .input('userAgent', sql.NVarChar, userAgent).query(`
        INSERT INTO content_comments (
          content_id, parent_id, user_id, author_name, author_email,
          comment_text, status, ip_address, user_agent
        )
        OUTPUT INSERTED.id
        VALUES (
          @contentId, @parentId, @userId, @authorName, @authorEmail,
          @commentText, 'pending', @ipAddress, @userAgent
        )
      `);

    const commentId = result.recordset[0].id;

    // Update content comment count
    await pool.request().input('contentId', sql.Int, dto.contentId).query(`
      UPDATE content
      SET comment_count = (SELECT COUNT(*) FROM content_comments WHERE content_id = @contentId AND status = 'approved' AND deleted_at IS NULL)
      WHERE id = @contentId
    `);

    this.logger.log(
      `Comment created on content ${dto.contentId} (ID: ${commentId})`,
    );
    return this.getById(commentId, tenantId);
  }

  /**
   * List comments for content
   */
  async listByContent(
    contentId: number,
    tenantId: number,
    approvedOnly: boolean = true,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    const statusFilter = approvedOnly ? "AND c.status = 'approved'" : '';

    const result = await pool.request().input('contentId', sql.Int, contentId)
      .query(`
      SELECT
        c.id,
        c.content_id,
        c.parent_id,
        c.user_id,
        u.full_name AS user_name,
        u.avatar_url AS user_photo,
        c.author_name,
        c.author_email,
        c.comment_text,
        c.status,
        c.created_at AS created_at,
        c.updated_at AS updated_at,
        (SELECT COUNT(*) FROM content_comments WHERE parent_id = c.id AND deleted_at IS NULL ${statusFilter}) AS reply_count
      FROM content_comments c
      LEFT JOIN [user] u ON c.user_id = u.id
      WHERE c.content_id = @contentId AND c.deleted_at IS NULL ${statusFilter}
      ORDER BY c.created_at DESC
    `);

    return result.recordset.map(this.parseComment);
  }

  /**
   * Get comment with replies (threaded)
   */
  async getThreaded(
    contentId: number,
    tenantId: number,
    approvedOnly: boolean = true,
  ) {
    const comments = await this.listByContent(
      contentId,
      tenantId,
      approvedOnly,
    );

    const buildThread = (parentId: number | null = null): any[] => {
      return comments
        .filter((comment) => comment.parent_id === parentId)
        .map((comment) => ({
          ...comment,
          replies: buildThread(comment.id),
        }));
    };

    return buildThread(null);
  }

  /**
   * Get comment by ID
   */
  async getById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        c.id,
        c.content_id,
        c.parent_id,
        c.user_id,
        u.full_name AS user_name,
        c.author_name,
        c.author_email,
        c.comment_text,
        c.status,
        c.approved_by,
        c.approved_at,
        m.full_name AS approved_by_name,
        c.created_at AS created_at,
        c.updated_at AS updated_at
      FROM content_comments c
      LEFT JOIN [user] u ON c.user_id = u.id
      LEFT JOIN [user] m ON c.approved_by = m.id
      WHERE c.id = @id AND c.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return this.parseComment(result.recordset[0]);
  }

  /**
   * Update comment
   */
  async update(
    id: number,
    dto: UpdateCommentDto,
    tenantId: number,
    userId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    // Check if exists and belongs to user
    const existing = await this.getById(id, tenantId);

    if (existing.user_id !== userId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('commentText', sql.NVarChar, dto.text).query(`
        UPDATE content_comments
        SET comment_text = @commentText, updated_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`Comment updated: ${id}`);
    return this.getById(id, tenantId);
  }

  /**
   * Moderate comment
   */
  async moderate(
    id: number,
    dto: ModerateCommentDto,
    tenantId: number,
    moderatorId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    // Check if exists
    const existing = await this.getById(id, tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, dto.status)
      .input('approvedBy', sql.Int, moderatorId).query(`
        UPDATE content_comments
        SET
          status = @status,
          approved_by = @approvedBy,
          approved_at = CASE WHEN @status = 'approved' THEN GETDATE() ELSE NULL END,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    // Update content comment count
    await pool.request().input('contentId', sql.Int, existing.content_id)
      .query(`
      UPDATE content
      SET comment_count = (SELECT COUNT(*) FROM content_comments WHERE content_id = @contentId AND status = 'approved' AND deleted_at IS NULL)
      WHERE id = @contentId
    `);

    this.logger.log(`Comment ${id} moderated: ${dto.status}`);
    return this.getById(id, tenantId);
  }

  /**
   * Delete comment
   */
  async delete(
    id: number,
    tenantId: number,
    userId: number,
    isAdmin: boolean = false,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    // Check if exists
    const existing = await this.getById(id, tenantId);

    if (!isAdmin && existing.user_id !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE content_comments SET deleted_at = GETDATE() WHERE id = @id
    `);

    // Update content comment count
    await pool.request().input('contentId', sql.Int, existing.content_id)
      .query(`
      UPDATE content
      SET comment_count = (SELECT COUNT(*) FROM content_comments WHERE content_id = @contentId AND status = 'approved' AND deleted_at IS NULL)
      WHERE id = @contentId
    `);

    this.logger.log(`Comment deleted: ${id}`);
    return { message: 'Comment deleted successfully' };
  }

  /**
   * Get pending comments for moderation
   */
  async getPendingComments(
    tenantId: number,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommentTable(pool);

    const offset = (page - 1) * pageSize;

    const countResult = await pool.request().query(`
      SELECT COUNT(*) as total FROM content_comments WHERE status = 'pending' AND deleted_at IS NULL
    `);

    const total = countResult.recordset[0].total;

    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize).query(`
      SELECT
        c.id,
        c.content_id,
        co.title AS content_title,
        c.user_id,
        u.full_name AS user_name,
        c.author_name,
        c.author_email,
        c.comment_text,
        c.status,
        c.created_at AS created_at
      FROM content_comments c
      INNER JOIN content co ON c.content_id = co.id
      LEFT JOIN [user] u ON c.user_id = u.id
      WHERE c.status = 'pending' AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: result.recordset.map(this.parseComment),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Parse comment record
   */
  private parseComment(record: any) {
    return {
      ...record,
    };
  }
}
