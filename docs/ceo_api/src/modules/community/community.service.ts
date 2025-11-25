import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateCommunityCategoryDto,
  UpdateCommunityCategoryDto,
  CreateTopicDto,
  UpdateTopicDto,
  TopicFilterDto,
  CreateReplyDto,
  UpdateReplyDto,
  AddReactionDto,
  ReportContentDto,
  TopicStatus,
  ReactionType,
} from './dto/community.dto';
import * as sql from 'mssql';

/**
 * Community Service
 * Manages forum categories, topics, and replies
 */
@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure all community tables exist and add missing columns to existing tables
   */
  private async ensureCommunityTables(pool: any): Promise<void> {
    // Add missing columns to existing forum_category table
    await pool.request().query(`
      -- Add slug column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_category') AND name = 'slug')
      BEGIN
        ALTER TABLE forum_category ADD slug NVARCHAR(255) NULL
      END

      -- Add require_approval column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_category') AND name = 'require_approval')
      BEGIN
        ALTER TABLE forum_category ADD require_approval BIT NOT NULL DEFAULT 0
      END

      -- Add topic_count column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_category') AND name = 'topic_count')
      BEGIN
        ALTER TABLE forum_category ADD topic_count INT NOT NULL DEFAULT 0
      END

      -- Add reply_count column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_category') AND name = 'reply_count')
      BEGIN
        ALTER TABLE forum_category ADD reply_count INT NOT NULL DEFAULT 0
      END
    `);

    // Add missing columns to existing forum_topic table
    await pool.request().query(`
      -- Add slug column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'slug')
      BEGIN
        ALTER TABLE forum_topic ADD slug NVARCHAR(255) NULL
      END

      -- Add status column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'status')
      BEGIN
        ALTER TABLE forum_topic ADD status NVARCHAR(50) NOT NULL DEFAULT 'approved'
      END

      -- Add is_featured column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'is_featured')
      BEGIN
        ALTER TABLE forum_topic ADD is_featured BIT NOT NULL DEFAULT 0
      END

      -- Add view_count column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'view_count')
      BEGIN
        ALTER TABLE forum_topic ADD view_count INT NOT NULL DEFAULT 0
      END

      -- Add reply_count column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'reply_count')
      BEGIN
        ALTER TABLE forum_topic ADD reply_count INT NOT NULL DEFAULT 0
      END

      -- Add reaction_count column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'reaction_count')
      BEGIN
        ALTER TABLE forum_topic ADD reaction_count INT NOT NULL DEFAULT 0
      END

      -- Add last_reply_at column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'last_reply_at')
      BEGIN
        ALTER TABLE forum_topic ADD last_reply_at DATETIME2(7) NULL
      END

      -- Add last_reply_by_id column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'last_reply_by_id')
      BEGIN
        ALTER TABLE forum_topic ADD last_reply_by_id INT NULL
        ALTER TABLE forum_topic ADD CONSTRAINT FK_forum_topic_last_reply_by FOREIGN KEY (last_reply_by_id) REFERENCES [user](id)
      END

      -- Add best_reply_id column if it doesn't exist (maps to resolved system)
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_topic') AND name = 'best_reply_id')
      BEGIN
        ALTER TABLE forum_topic ADD best_reply_id INT NULL
        ALTER TABLE forum_topic ADD CONSTRAINT FK_forum_topic_best_reply FOREIGN KEY (best_reply_id) REFERENCES forum_response(id)
      END
    `);

    // Add missing columns to existing forum_response table
    await pool.request().query(`
      -- Add reaction_count column if it doesn't exist
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('forum_response') AND name = 'reaction_count')
      BEGIN
        ALTER TABLE forum_response ADD reaction_count INT NOT NULL DEFAULT 0
      END
    `);

    // Create supplementary tables if they don't exist
    await pool.request().query(`
      -- Topic Tags
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='forum_topic_tags' AND xtype='U')
      BEGIN
        CREATE TABLE forum_topic_tags (
          topic_id INT NOT NULL,
          tag NVARCHAR(30) NOT NULL,
          PRIMARY KEY (topic_id, tag),
          FOREIGN KEY (topic_id) REFERENCES forum_topic(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_forum_topic_tags_tag ON forum_topic_tags(tag)
      END

      -- Reactions
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='forum_reactions' AND xtype='U')
      BEGIN
        CREATE TABLE forum_reactions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          topic_id INT NULL,
          response_id INT NULL,
          reaction_type NVARCHAR(20) NOT NULL, -- like, helpful, love, etc
          created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (user_id) REFERENCES [user](id),
          FOREIGN KEY (topic_id) REFERENCES forum_topic(id) ON DELETE CASCADE,
          FOREIGN KEY (response_id) REFERENCES forum_response(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_forum_reactions_user ON forum_reactions(user_id)
        CREATE INDEX idx_forum_reactions_topic ON forum_reactions(topic_id)
        CREATE INDEX idx_forum_reactions_response ON forum_reactions(response_id)
        CREATE UNIQUE INDEX idx_forum_reactions_user_topic_type ON forum_reactions(user_id, topic_id, reaction_type) WHERE topic_id IS NOT NULL
        CREATE UNIQUE INDEX idx_forum_reactions_user_response_type ON forum_reactions(user_id, response_id, reaction_type) WHERE response_id IS NOT NULL
      END

      -- Reports
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='forum_reports' AND xtype='U')
      BEGIN
        CREATE TABLE forum_reports (
          id INT IDENTITY(1,1) PRIMARY KEY,
          reporter_id INT NOT NULL,
          topic_id INT NULL,
          response_id INT NULL,
          reason NVARCHAR(50) NOT NULL,
          details NVARCHAR(500) NULL,
          status NVARCHAR(20) NOT NULL DEFAULT 'pending',
          moderated_by_id INT NULL,
          moderation_notes NVARCHAR(MAX) NULL,
          moderated_at DATETIME2(7) NULL,
          created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (reporter_id) REFERENCES [user](id),
          FOREIGN KEY (topic_id) REFERENCES forum_topic(id) ON DELETE CASCADE,
          FOREIGN KEY (response_id) REFERENCES forum_response(id) ON DELETE CASCADE,
          FOREIGN KEY (moderated_by_id) REFERENCES [user](id)
        )

        CREATE INDEX idx_forum_reports_status ON forum_reports(status)
        CREATE INDEX idx_forum_reports_reporter ON forum_reports(reporter_id)
      END

      -- Subscriptions
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='forum_subscriptions' AND xtype='U')
      BEGIN
        CREATE TABLE forum_subscriptions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          topic_id INT NULL,
          category_id INT NULL,
          following_user_id INT NULL,
          created_at DATETIME2(7) NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (user_id) REFERENCES [user](id),
          FOREIGN KEY (topic_id) REFERENCES forum_topic(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES forum_category(id) ON DELETE CASCADE,
          FOREIGN KEY (following_user_id) REFERENCES [user](id)
        )

        CREATE INDEX idx_forum_subscriptions_user ON forum_subscriptions(user_id)
        CREATE INDEX idx_forum_subscriptions_topic ON forum_subscriptions(topic_id)
        CREATE INDEX idx_forum_subscriptions_category ON forum_subscriptions(category_id)
      END

      -- Create indexes on existing tables if they don't exist
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_forum_category_slug' AND object_id = OBJECT_ID('forum_category'))
      BEGIN
        CREATE INDEX idx_forum_category_slug ON forum_category(slug)
      END

      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_forum_topic_slug' AND object_id = OBJECT_ID('forum_topic'))
      BEGIN
        CREATE INDEX idx_forum_topic_slug ON forum_topic(slug)
      END

      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_forum_topic_status' AND object_id = OBJECT_ID('forum_topic'))
      BEGIN
        CREATE INDEX idx_forum_topic_status ON forum_topic(status)
      END
    `);
  }

  // =====================
  // Categories
  // =====================

  async createCategory(dto: CreateCommunityCategoryDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommunityTables(pool);

    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await pool.request().input('slug', sql.NVarChar, slug).query(`
      SELECT id FROM forum_category WHERE slug = @slug AND deleted_at IS NULL
    `);

    if (existing.recordset.length > 0) {
      throw new BadRequestException(`Category with slug '${slug}' already exists`);
    }

    const result = await pool
      .request()
      .input('parent_category_id', sql.Int, dto.parentId || null)
      .input('name', sql.NVarChar, dto.name)
      .input('slug', sql.NVarChar, slug)
      .input('description', sql.NVarChar, dto.description || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('color', sql.NVarChar, dto.color || null)
      .input('display_order', sql.Int, dto.order || 0)
      .input('is_private', sql.Bit, dto.visible === false ? 1 : 0)
      .input('require_approval', sql.Bit, dto.requireApproval ? 1 : 0).query(`
        INSERT INTO forum_category (
          parent_category_id, name, slug, description, icon, color, display_order, is_private, require_approval
        )
        OUTPUT INSERTED.id
        VALUES (
          @parent_category_id, @name, @slug, @description, @icon, @color, @display_order, @is_private, @require_approval
        )
      `);

    const categoryId = result.recordset[0].id;
    this.logger.log(`Forum category created: ${dto.name} (ID: ${categoryId})`);
    return this.getCategoryById(categoryId, tenantId);
  }

  async listCategories(tenantId: number, visibleOnly: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommunityTables(pool);

    const whereClause = visibleOnly ? 'WHERE is_private = 0 AND deleted_at IS NULL' : 'WHERE deleted_at IS NULL';

    const result = await pool.request().query(`
      SELECT
        c.id,
        c.parent_category_id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.color,
        c.display_order AS [order],
        CASE WHEN c.is_private = 0 THEN 1 ELSE 0 END AS visible,
        c.require_approval,
        c.topic_count,
        c.reply_count,
        c.created_at,
        (SELECT COUNT(*) FROM forum_category WHERE parent_category_id = c.id AND deleted_at IS NULL) AS subcategory_count
      FROM forum_category c
      ${whereClause}
      ORDER BY c.display_order, c.name
    `);

    return result.recordset.map((r) => ({
      ...r,
      visible: Boolean(r.visible),
      require_approval: Boolean(r.require_approval),
    }));
  }

  async getCategoryById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT * FROM forum_category WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return result.recordset[0];
  }

  // =====================
  // Topics
  // =====================

  async createTopic(dto: CreateTopicDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommunityTables(pool);

    // Verify category exists
    const category = await this.getCategoryById(dto.categoryId, tenantId);

    const slug = this.generateSlug(dto.title);
    const status = category.require_approval ? TopicStatus.PENDING : TopicStatus.APPROVED;

    const result = await pool
      .request()
      .input('category_id', sql.Int, dto.categoryId)
      .input('author_id', sql.Int, userId)
      .input('title', sql.NVarChar, dto.title)
      .input('slug', sql.NVarChar, slug)
      .input('content', sql.NVarChar, dto.content)
      .input('status', sql.NVarChar, status)
      .input('is_pinned', sql.Bit, dto.pinned ? 1 : 0)
      .input('is_featured', sql.Bit, dto.featured ? 1 : 0)
      .input('is_locked', sql.Bit, dto.locked ? 1 : 0).query(`
        INSERT INTO forum_topic (
          category_id, author_id, title, slug, content, status, is_pinned, is_featured, is_locked
        )
        OUTPUT INSERTED.id
        VALUES (
          @category_id, @author_id, @title, @slug, @content, @status, @is_pinned, @is_featured, @is_locked
        )
      `);

    const topicId = result.recordset[0].id;

    // Add tags
    if (dto.tags && dto.tags.length > 0) {
      for (const tag of dto.tags) {
        await pool
          .request()
          .input('topicId', sql.Int, topicId)
          .input('tag', sql.NVarChar, tag.toLowerCase()).query(`
            INSERT INTO forum_topic_tags (topic_id, tag) VALUES (@topicId, @tag)
          `);
      }
    }

    // Update category stats
    await this.updateCategoryStats(dto.categoryId, tenantId);

    this.logger.log(`Forum topic created: ${dto.title} (ID: ${topicId})`);
    return this.getTopicById(topicId, tenantId);
  }

  async listTopics(tenantId: number, filters: TopicFilterDto, userId?: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommunityTables(pool);

    const {
      categoryId,
      status,
      authorId,
      search,
      tags,
      pinnedOnly,
      featuredOnly,
      unansweredOnly,
      myTopicsOnly,
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const offset = (page - 1) * pageSize;
    const conditions: string[] = ['t.deleted_at IS NULL'];
    const request = pool.request();

    if (categoryId) {
      conditions.push('t.category_id = @categoryId');
      request.input('categoryId', sql.Int, categoryId);
    }

    if (status) {
      conditions.push('t.status = @status');
      request.input('status', sql.NVarChar, status);
    } else {
      conditions.push("t.status = 'approved'");
    }

    if (authorId) {
      conditions.push('t.author_id = @authorId');
      request.input('authorId', sql.Int, authorId);
    }

    if (myTopicsOnly && userId) {
      conditions.push('t.author_id = @userId');
      request.input('userId', sql.Int, userId);
    }

    if (search) {
      conditions.push('(t.title LIKE @search OR t.content LIKE @search)');
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      conditions.push(`EXISTS (
        SELECT 1 FROM forum_topic_tags
        WHERE topic_id = t.id AND tag IN (${tagList.map((_, i) => `@tag${i}`).join(',')})
      )`);
      tagList.forEach((tag, i) => request.input(`tag${i}`, sql.NVarChar, tag));
    }

    if (pinnedOnly) {
      conditions.push('t.pinned = 1');
    }

    if (featuredOnly) {
      conditions.push('t.featured = 1');
    }

    if (unansweredOnly) {
      conditions.push('t.reply_count = 0');
    }

    const whereClause = conditions.join(' AND ');

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM forum_topic t WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data
    const validSortColumns = ['created_at', 'updated_at', 'reply_count', 'view_count', 'reaction_count', 'last_reply_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    request.input('offset', sql.Int, offset).input('pageSize', sql.Int, pageSize);

    const result = await request.query(`
      SELECT
        t.id,
        t.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        t.title,
        t.slug,
        t.content,
        t.status,
        t.is_pinned AS pinned,
        t.is_featured AS featured,
        t.is_locked AS locked,
        t.view_count,
        t.reply_count,
        t.reaction_count,
        t.author_id,
        u.full_name AS author_name,
        u.avatar_url AS author_photo,
        t.last_reply_at,
        lr.full_name AS last_reply_by_name,
        t.created_at,
        t.updated_at
      FROM forum_topic t
      INNER JOIN forum_category c ON t.category_id = c.id
      INNER JOIN [user] u ON t.author_id = u.id
      LEFT JOIN [user] lr ON t.last_reply_by_id = lr.id
      WHERE ${whereClause}
      ORDER BY t.is_pinned DESC, t.${sortColumn} ${sortDirection}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    // Get tags for each topic
    const topics = await Promise.all(
      result.recordset.map(async (topic) => {
        const tagsResult = await pool.request().input('topicId', sql.Int, topic.id).query(`
          SELECT tag FROM forum_topic_tags WHERE topic_id = @topicId
        `);
        return {
          ...topic,
          pinned: Boolean(topic.pinned),
          featured: Boolean(topic.featured),
          locked: Boolean(topic.locked),
          tags: tagsResult.recordset.map((r) => r.tag),
        };
      }),
    );

    return {
      data: topics,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getTopicById(id: number, tenantId: number, incrementView: boolean = false) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        t.*,
        c.name AS category_name,
        c.slug AS category_slug,
        u.full_name AS author_name,
        u.email AS author_email,
        u.avatar_url AS author_photo
      FROM forum_topic t
      INNER JOIN forum_category c ON t.category_id = c.id
      INNER JOIN [user] u ON t.author_id = u.id
      WHERE t.id = @id AND t.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    const topic = result.recordset[0];

    // Get tags
    const tagsResult = await pool.request().input('id', sql.Int, id).query(`
      SELECT tag FROM forum_topic_tags WHERE topic_id = @id
    `);

    topic.tags = tagsResult.recordset.map((r) => r.tag);

    // Increment view count
    if (incrementView) {
      await pool.request().input('id', sql.Int, id).query(`
        UPDATE forum_topic SET view_count = view_count + 1 WHERE id = @id
      `);
      topic.view_count += 1;
    }

    return {
      ...topic,
      pinned: Boolean(topic.is_pinned),
      featured: Boolean(topic.is_featured),
      locked: Boolean(topic.is_locked),
    };
  }

  // =====================
  // Replies
  // =====================

  async createReply(dto: CreateReplyDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCommunityTables(pool);

    // Verify topic exists and is not locked
    const topic = await this.getTopicById(dto.topicId, tenantId);

    if (topic.locked) {
      throw new ForbiddenException('This topic is locked');
    }

    const result = await pool
      .request()
      .input('topic_id', sql.Int, dto.topicId)
      .input('parent_response_id', sql.Int, dto.parentId || null)
      .input('author_id', sql.Int, userId)
      .input('content', sql.NVarChar, dto.content).query(`
        INSERT INTO forum_response (topic_id, parent_response_id, author_id, content)
        OUTPUT INSERTED.id
        VALUES (@topic_id, @parent_response_id, @author_id, @content)
      `);

    const replyId = result.recordset[0].id;

    // Update topic stats
    await pool.request().input('topicId', sql.Int, dto.topicId).input('userId', sql.Int, userId).query(`
      UPDATE forum_topic
      SET
        reply_count = reply_count + 1,
        last_reply_at = GETDATE(),
        last_reply_by_id = @userId
      WHERE id = @topicId
    `);

    // Update category stats
    await this.updateCategoryStats(topic.category_id, tenantId);

    this.logger.log(`Forum reply created for topic ${dto.topicId} (ID: ${replyId})`);
    return this.getReplyById(replyId, tenantId);
  }

  async listReplies(topicId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('topicId', sql.Int, topicId).query(`
      SELECT
        r.id,
        r.topic_id,
        r.parent_response_id,
        r.content,
        r.is_solution,
        r.reaction_count,
        r.author_id,
        u.full_name AS author_name,
        u.avatar_url AS author_photo,
        r.created_at,
        r.updated_at
      FROM forum_response r
      INNER JOIN [user] u ON r.author_id = u.id
      WHERE r.topic_id = @topicId AND r.deleted_at IS NULL
      ORDER BY r.is_solution DESC, r.created_at ASC
    `);

    return result.recordset.map((r) => ({
      ...r,
      is_best_answer: Boolean(r.is_solution),
    }));
  }

  async getReplyById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        r.*,
        u.full_name AS author_name,
        u.avatar_url AS author_photo
      FROM forum_response r
      INNER JOIN [user] u ON r.author_id = u.id
      WHERE r.id = @id AND r.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }

    return {
      ...result.recordset[0],
      is_best_answer: Boolean(result.recordset[0].is_solution),
    };
  }

  async markAsBestAnswer(replyId: number, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const reply = await this.getReplyById(replyId, tenantId);
    const topic = await this.getTopicById(reply.topic_id, tenantId);

    // Only topic author can mark best answer
    if (topic.author_id !== userId) {
      throw new ForbiddenException('Only the topic author can mark the best answer');
    }

    // Unmark previous best answer
    await pool.request().input('topicId', sql.Int, reply.topic_id).query(`
      UPDATE forum_response SET is_solution = 0 WHERE topic_id = @topicId
    `);

    // Mark new best answer
    await pool.request().input('id', sql.Int, replyId).query(`
      UPDATE forum_response SET is_solution = 1 WHERE id = @id
    `);

    // Update topic (also sync with is_resolved and resolved_by_id)
    await pool.request()
      .input('topicId', sql.Int, reply.topic_id)
      .input('replyId', sql.Int, replyId)
      .input('userId', sql.Int, userId).query(`
      UPDATE forum_topic
      SET
        best_reply_id = @replyId,
        is_resolved = 1,
        resolved_at = GETDATE(),
        resolved_by_id = @userId
      WHERE id = @topicId
    `);

    this.logger.log(`Reply ${replyId} marked as best answer for topic ${reply.topic_id}`);
    return this.getReplyById(replyId, tenantId);
  }

  // =====================
  // Reactions
  // =====================

  async addReaction(dto: AddReactionDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    try {
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .input('topicId', sql.Int, dto.topicId || null)
        .input('responseId', sql.Int, dto.replyId || null)
        .input('reactionType', sql.NVarChar, dto.type).query(`
          INSERT INTO forum_reactions (user_id, topic_id, response_id, reaction_type)
          VALUES (@userId, @topicId, @responseId, @reactionType)
        `);

      // Update reaction count
      if (dto.topicId) {
        await pool.request().input('id', sql.Int, dto.topicId).query(`
          UPDATE forum_topic SET reaction_count = reaction_count + 1 WHERE id = @id
        `);
      } else if (dto.replyId) {
        await pool.request().input('id', sql.Int, dto.replyId).query(`
          UPDATE forum_response SET reaction_count = reaction_count + 1 WHERE id = @id
        `);
      }

      return { message: 'Reaction added successfully' };
    } catch (error) {
      throw new BadRequestException('You have already reacted with this type');
    }
  }

  async removeReaction(dto: AddReactionDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('topicId', sql.Int, dto.topicId || null)
      .input('responseId', sql.Int, dto.replyId || null)
      .input('reactionType', sql.NVarChar, dto.type).query(`
        DELETE FROM forum_reactions
        WHERE user_id = @userId
          AND (topic_id = @topicId OR response_id = @responseId)
          AND reaction_type = @reactionType
      `);

    // Update reaction count
    if (dto.topicId) {
      await pool.request().input('id', sql.Int, dto.topicId).query(`
        UPDATE forum_topic SET reaction_count = CASE WHEN reaction_count > 0 THEN reaction_count - 1 ELSE 0 END WHERE id = @id
      `);
    } else if (dto.replyId) {
      await pool.request().input('id', sql.Int, dto.replyId).query(`
        UPDATE forum_response SET reaction_count = CASE WHEN reaction_count > 0 THEN reaction_count - 1 ELSE 0 END WHERE id = @id
      `);
    }

    return { message: 'Reaction removed successfully' };
  }

  // =====================
  // Subscriptions
  // =====================

  async subscribe(topicId: number | null, categoryId: number | null, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('topicId', sql.Int, topicId)
      .input('categoryId', sql.Int, categoryId).query(`
        INSERT INTO forum_subscriptions (user_id, topic_id, category_id)
        VALUES (@userId, @topicId, @categoryId)
      `);

    return { message: 'Subscribed successfully' };
  }

  // =====================
  // Helper Methods
  // =====================

  private async updateCategoryStats(categoryId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request().input('categoryId', sql.Int, categoryId).query(`
      UPDATE forum_category
      SET
        topic_count = (SELECT COUNT(*) FROM forum_topic WHERE category_id = @categoryId AND deleted_at IS NULL),
        reply_count = (
          SELECT COUNT(*) FROM forum_response r
          INNER JOIN forum_topic t ON r.topic_id = t.id
          WHERE t.category_id = @categoryId AND r.deleted_at IS NULL
        )
      WHERE id = @categoryId
    `);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  }
}
