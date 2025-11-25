import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ContentType } from './dto/content.dto';
import * as sql from 'mssql';

/**
 * Content Analytics Service
 * Provides statistics and insights on content performance
 */
@Injectable()
export class ContentAnalyticsService {
  private readonly logger = new Logger(ContentAnalyticsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get overview statistics
   */
  async getOverviewStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as total_content,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending_review_count,
        COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_count,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        SUM(comment_count) as total_comments,
        SUM(share_count) as total_shares,
        AVG(view_count) as avg_views_per_content
      FROM content
      WHERE deleted_at IS NULL
    `);

    return result.recordset[0];
  }

  /**
   * Get statistics by content type
   */
  async getStatisticsByType(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        type AS type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        SUM(comment_count) as total_comments,
        AVG(view_count) as avg_views
      FROM content
      WHERE deleted_at IS NULL
      GROUP BY type
      ORDER BY total_count DESC
    `);

    return result.recordset;
  }

  /**
   * Get top performing content
   */
  async getTopPerforming(
    tenantId: number,
    metric: 'views' | 'likes' | 'comments' | 'shares' = 'views',
    limit: number = 10,
    type?: ContentType,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const metricColumn = {
      views: 'view_count',
      likes: 'like_count',
      comments: 'comment_count',
      shares: 'share_count',
    }[metric];

    const typeFilter = type ? 'AND c.type = @type' : '';
    const request = pool.request().input('limit', sql.Int, limit);

    if (type) {
      request.input('type', sql.NVarChar, type);
    }

    const result = await request.query(`
      SELECT TOP (@limit)
        c.id,
        c.title,
        c.slug,
        c.type AS type,
        c.featured_image,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.share_count,
        c.published_at,
        u.full_name AS author_name
      FROM content c
      LEFT JOIN [user] u ON c.author_id = u.id
      WHERE c.deleted_at IS NULL AND c.status = 'published' ${typeFilter}
      ORDER BY c.${metricColumn} DESC
    `);

    return result.recordset;
  }

  /**
   * Get content performance trends over time
   */
  async getPerformanceTrends(tenantId: number, days: number = 30) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('days', sql.Int, days).query(`
      SELECT
        CAST(viewed_at AS DATE) as date,
        COUNT(*) as view_count,
        COUNT(DISTINCT content_id) as unique_content_viewed,
        COUNT(DISTINCT user_id) as unique_visitors
      FROM content_views
      WHERE viewed_at >= DATEADD(day, -@days, GETDATE())
      GROUP BY CAST(viewed_at AS DATE)
      ORDER BY date DESC
    `);

    return result.recordset;
  }

  /**
   * Get publishing trends
   */
  async getPublishingTrends(tenantId: number, months: number = 6) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('months', sql.Int, months).query(`
      SELECT
        YEAR(published_at) as year,
        MONTH(published_at) as month,
        type AS type,
        COUNT(*) as published_count
      FROM content
      WHERE deleted_at IS NULL
        AND status = 'published'
        AND published_at >= DATEADD(month, -@months, GETDATE())
      GROUP BY YEAR(published_at), MONTH(published_at), type
      ORDER BY year DESC, month DESC
    `);

    return result.recordset;
  }

  /**
   * Get author statistics
   */
  async getAuthorStatistics(tenantId: number, limit: number = 10) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit)
        u.id AS author_id,
        u.full_name AS author_name,
        u.avatar_url AS author_photo,
        COUNT(*) as total_content,
        COUNT(CASE WHEN c.status = 'published' THEN 1 END) as published_count,
        SUM(c.view_count) as total_views,
        SUM(c.like_count) as total_likes,
        SUM(c.comment_count) as total_comments,
        AVG(c.view_count) as avg_views_per_content
      FROM content c
      INNER JOIN [user] u ON c.author_id = u.id
      WHERE c.deleted_at IS NULL
      GROUP BY u.id, u.full_name, u.avatar_url
      ORDER BY published_count DESC
    `);

    return result.recordset;
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        cat.id,
        cat.name,
        cat.slug,
        COUNT(DISTINCT ccj.content_id) as content_count,
        SUM(c.view_count) as total_views,
        AVG(c.view_count) as avg_views_per_content
      FROM content_categories cat
      LEFT JOIN content_categories_junction ccj ON cat.id = ccj.category_id
      LEFT JOIN content c ON ccj.content_id = c.id AND c.deleted_at IS NULL AND c.status = 'published'
      GROUP BY cat.id, cat.name, cat.slug
      HAVING COUNT(DISTINCT ccj.content_id) > 0
      ORDER BY content_count DESC
    `);

    return result.recordset;
  }

  /**
   * Get tag statistics
   */
  async getTagStatistics(tenantId: number, limit: number = 20) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit)
        t.id,
        t.name,
        t.slug,
        t.color,
        COUNT(DISTINCT ctj.content_id) as content_count,
        SUM(c.view_count) as total_views
      FROM content_tags t
      LEFT JOIN content_tags_junction ctj ON t.id = ctj.tag_id
      LEFT JOIN content c ON ctj.content_id = c.id AND c.deleted_at IS NULL AND c.status = 'published'
      GROUP BY t.id, t.name, t.slug, t.color
      HAVING COUNT(DISTINCT ctj.content_id) > 0
      ORDER BY content_count DESC
    `);

    return result.recordset;
  }

  /**
   * Get engagement statistics (likes, comments, shares)
   */
  async getEngagementStatistics(tenantId: number, contentId?: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const contentFilter = contentId ? 'WHERE c.id = @contentId AND' : 'WHERE';
    const request = pool.request();

    if (contentId) {
      request.input('contentId', sql.Int, contentId);
    }

    const result = await request.query(`
      SELECT
        COUNT(DISTINCT c.id) as total_content,
        SUM(c.view_count) as total_views,
        SUM(c.like_count) as total_likes,
        SUM(c.comment_count) as total_comments,
        SUM(c.share_count) as total_shares,
        AVG(c.view_count) as avg_views,
        AVG(c.like_count) as avg_likes,
        AVG(c.comment_count) as avg_comments,
        AVG(c.share_count) as avg_shares,
        -- Engagement rate (likes + comments + shares) / views
        CASE
          WHEN SUM(c.view_count) > 0
          THEN (CAST(SUM(c.like_count + c.comment_count + c.share_count) AS FLOAT) / SUM(c.view_count)) * 100
          ELSE 0
        END as engagement_rate
      FROM content c
      ${contentFilter} c.deleted_at IS NULL AND c.status = 'published'
    `);

    return result.recordset[0];
  }

  /**
   * Get visitor statistics
   */
  async getVisitorStatistics(tenantId: number, days: number = 30) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('days', sql.Int, days).query(`
      SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT content_id) as unique_content_viewed,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_views,
        COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_views
      FROM content_views
      WHERE viewed_at >= DATEADD(day, -@days, GETDATE())
    `);

    return result.recordset[0];
  }

  /**
   * Get content performance by visibility
   */
  async getPerformanceByVisibility(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        visibility,
        COUNT(*) as content_count,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        SUM(comment_count) as total_comments,
        AVG(view_count) as avg_views
      FROM content
      WHERE deleted_at IS NULL AND status = 'published'
      GROUP BY visibility
      ORDER BY content_count DESC
    `);

    return result.recordset;
  }

  /**
   * Get scheduled content
   */
  async getScheduledContent(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        c.id,
        c.title,
        c.slug,
        c.type AS type,
        c.published_at,
        u.full_name AS author_name,
        DATEDIFF(day, GETDATE(), c.published_at) as days_until_publish
      FROM content c
      LEFT JOIN [user] u ON c.author_id = u.id
      WHERE c.deleted_at IS NULL
        AND c.status = 'scheduled'
        AND c.published_at > GETDATE()
      ORDER BY c.published_at ASC
    `);

    return result.recordset;
  }

  /**
   * Get content needing review
   */
  async getContentNeedingReview(tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        c.id,
        c.title,
        c.slug,
        c.type AS type,
        c.created_at AS created_at,
        u.full_name AS author_name,
        DATEDIFF(day, c.created_at, GETDATE()) as days_waiting
      FROM content c
      LEFT JOIN [user] u ON c.author_id = u.id
      WHERE c.deleted_at IS NULL AND c.status = 'pending_review'
      ORDER BY c.created_at ASC
    `);

    return result.recordset;
  }

  /**
   * Get popular search terms (based on view referers)
   */
  async getPopularReferers(tenantId: number, limit: number = 10) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit)
        referer,
        COUNT(*) as view_count,
        COUNT(DISTINCT content_id) as unique_content_count
      FROM content_views
      WHERE referer IS NOT NULL AND referer != ''
      GROUP BY referer
      ORDER BY view_count DESC
    `);

    return result.recordset;
  }
}
