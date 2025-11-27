import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { EmailService } from '../email/email.service';
import {
  SubscribeNewsletterDto,
  UnsubscribeNewsletterDto,
  SendNewsletterDto,
  SendTestNewsletterDto,
  SaveNewsletterTemplatesDto,
  NewsletterTemplateDto,
  NewsletterSubscriberDto,
  NewsletterStatsDto,
  NewsletterSendResultDto,
  ListSubscribersDto,
} from './dto/newsletter.dto';

/**
 * Newsletter Service
 *
 * Manages newsletter subscriptions and email campaigns.
 * - Uses newsletter_subscription table for subscribers
 * - Stores email templates in setting table
 * - Uses EmailService for sending emails
 * - Supports multi-language templates
 */
@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Subscribe email to newsletter
   */
  async subscribe(
    dto: SubscribeNewsletterDto,
  ): Promise<{ success: boolean; message: string }> {
    const pool = await this.databaseService.getTenantConnection(dto.tenantId);

    // Validate language against configured languages
    const allowedLanguages = await this.getAllowedLanguages(dto.tenantId);
    const normalizedLang = this.normalizeLang(dto.lang);

    if (!allowedLanguages.includes(normalizedLang)) {
      throw new BadRequestException(
        `Language "${dto.lang}" is not supported. Allowed languages: ${allowedLanguages.join(', ')}`,
      );
    }

    // Ensure table exists
    await this.ensureNewsletterTable(pool);

    // Check if email already exists
    const checkResult = await pool
      .request()
      .input('email', sql.NVarChar, dto.email).query(`
        SELECT id, status, metadata
        FROM newsletter_subscription
        WHERE email = @email
      `);

    const metadata = JSON.stringify({ language: normalizedLang });

    if (checkResult.recordset.length > 0) {
      const existing = checkResult.recordset[0];

      // If already subscribed, return conflict
      if (existing.status === 'subscribed') {
        throw new ConflictException(
          'This email is already subscribed to the newsletter.',
        );
      }

      // If unsubscribed, reactivate subscription
      await pool
        .request()
        .input('email', sql.NVarChar, dto.email)
        .input('metadata', sql.NVarChar(sql.MAX), metadata).query(`
          UPDATE newsletter_subscription
          SET status = 'subscribed', 
              metadata = @metadata, 
              subscription_date = GETDATE(),
              unsubscribed_at = NULL,
              unsubscribe_reason = NULL,
              updated_at = GETDATE()
          WHERE email = @email
        `);

      this.logger.log(`Newsletter subscription reactivated: ${dto.email}`);

      return {
        success: true,
        message: 'Subscription reactivated successfully!',
      };
    }

    // Insert new subscriber
    try {
      const insertResult = await pool
        .request()
        .input('email', sql.NVarChar, dto.email)
        .input('metadata', sql.NVarChar(sql.MAX), metadata).query(`
          INSERT INTO newsletter_subscription (email, status, subscription_date, metadata, created_at)
          VALUES (@email, 'subscribed', GETDATE(), @metadata, GETDATE())
        `);

      this.logger.log(
        `New newsletter subscription: ${dto.email}, language: ${normalizedLang}, rowsAffected: ${insertResult.rowsAffected[0]}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to insert newsletter subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }

    return {
      success: true,
      message: 'Subscription successful!',
    };
  }

  /**
   * Unsubscribe email from newsletter
   */
  async unsubscribe(
    dto: UnsubscribeNewsletterDto,
  ): Promise<{ success: boolean; message: string }> {
    const pool = await this.databaseService.getTenantConnection(dto.tenantId);

    const result = await pool.request().input('email', sql.NVarChar, dto.email)
      .query(`
        UPDATE newsletter_subscription
        SET status = 'unsubscribed', 
            unsubscribed_at = GETDATE(),
            updated_at = GETDATE()
        WHERE email = @email AND status = 'subscribed'
      `);

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException('Email not found or already unsubscribed');
    }

    this.logger.log(`Newsletter unsubscribed: ${dto.email}`);

    return {
      success: true,
      message: 'Unsubscribed successfully!',
    };
  }

  /**
   * Get newsletter subscribers with filtering
   */
  async listSubscribers(
    tenantId: number,
    filters: ListSubscribersDto = {},
  ): Promise<any> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const conditions: string[] = [];
    const request = pool.request();

    if (filters.language) {
      conditions.push("JSON_VALUE(metadata, '$.language') = @language");
      request.input('language', sql.NVarChar, filters.language);
    }

    if (filters.active !== undefined) {
      conditions.push('status = @status');
      request.input(
        'status',
        sql.NVarChar,
        filters.active ? 'subscribed' : 'unsubscribed',
      );
    }

    if (filters.search) {
      conditions.push('(email LIKE @search OR full_name LIKE @search)');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const countRequest = pool.request();
    if (filters.language)
      countRequest.input('language', sql.NVarChar, filters.language);
    if (filters.active !== undefined)
      countRequest.input(
        'status',
        sql.NVarChar,
        filters.active ? 'subscribed' : 'unsubscribed',
      );
    if (filters.search)
      countRequest.input('search', sql.NVarChar, `%${filters.search}%`);

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM newsletter_subscription ${whereClause}
    `);

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataResult = await request.query(`
      SELECT id, email, full_name, status, subscription_date, metadata, created_at
      FROM newsletter_subscription
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset.map((r) => this.mapToDto(r)),
      total: countResult.recordset[0].total,
      page,
      pageSize,
      totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
    };
  }

  /**
   * Get newsletter statistics
   */
  async getStats(tenantId: number): Promise<NewsletterStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Total and active/inactive counts
    const totalResult = await pool.request().query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as inactive
      FROM newsletter_subscription
    `);

    // By language
    const languageResult = await pool.request().query(`
      SELECT JSON_VALUE(metadata, '$.language') as idioma, COUNT(*) as count
      FROM newsletter_subscription
      WHERE status = 'subscribed'
      GROUP BY JSON_VALUE(metadata, '$.language')
    `);

    // New subscribers this month
    const monthResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM newsletter_subscription
      WHERE created_at >= DATEADD(month, -1, GETDATE())
    `);

    return {
      totalSubscribers: totalResult.recordset[0].total || 0,
      activeSubscribers: totalResult.recordset[0].active || 0,
      inactiveSubscribers: totalResult.recordset[0].inactive || 0,
      byLanguage: languageResult.recordset.reduce((acc, row) => {
        acc[row.idioma] = row.count;
        return acc;
      }, {}),
      newThisMonth: monthResult.recordset[0].count || 0,
    };
  }

  /**
   * Send newsletter to all active subscribers
   */
  async sendNewsletter(
    tenantId: number,
    dto: SendNewsletterDto,
    userId: number,
  ): Promise<NewsletterSendResultDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get active subscribers
    const conditions: string[] = ["status = 'subscribed'"];
    const request = pool.request();

    if (dto.language) {
      conditions.push("JSON_VALUE(metadata, '$.language') = @language");
      request.input('language', sql.NVarChar, dto.language);
    }

    const whereClause = conditions.join(' AND ');

    const result = await request.query(`
      SELECT email, JSON_VALUE(metadata, '$.language') as idioma
      FROM newsletter_subscription
      WHERE ${whereClause}
    `);

    const subscribers = result.recordset;

    if (subscribers.length === 0) {
      throw new BadRequestException('No active subscribers found');
    }

    this.logger.log(`Sending newsletter to ${subscribers.length} subscribers`);

    let sent = 0;
    let failed = 0;
    const failedEmails: string[] = [];

    // Get templates
    const templates = await this.getNewsletterTemplates(tenantId);

    // Send email to each subscriber
    for (const subscriber of subscribers) {
      try {
        const htmlContent =
          dto.customHtml ||
          this.buildNewsletterHtml(
            dto.title,
            dto.url,
            subscriber.idioma,
            templates,
          );

        const template =
          templates[subscriber.idioma] ||
          templates['pt-PT'] ||
          this.getDefaultTemplate();

        await this.emailService.sendEmail(
          tenantId,
          {
            to: subscriber.email,
            subject: `${template.subject_prefix} ${dto.title}`,
            html: htmlContent,
            entityType: 'newsletter',
            entityId: 0,
          },
          userId,
        );

        sent++;
      } catch (error) {
        this.logger.error(
          `Failed to send newsletter to ${subscriber.email}: ${error.message}`,
        );
        failed++;
        failedEmails.push(subscriber.email);
      }
    }

    this.logger.log(`Newsletter sent: ${sent} successful, ${failed} failed`);

    return {
      sent,
      failed,
      total: subscribers.length,
      failedEmails,
    };
  }

  /**
   * Send test newsletter
   */
  async sendTestNewsletter(
    tenantId: number,
    dto: SendTestNewsletterDto,
    userId: number,
  ): Promise<{ success: boolean }> {
    const templates = await this.getNewsletterTemplates(tenantId);
    const htmlContent = this.buildNewsletterHtml(
      dto.title,
      dto.url,
      dto.language,
      templates,
    );

    const template =
      templates[dto.language] ||
      templates['pt-PT'] ||
      this.getDefaultTemplate();

    await this.emailService.sendEmail(
      tenantId,
      {
        to: dto.email,
        subject: `[TEST] ${template.subject_prefix} ${dto.title}`,
        html: htmlContent,
      },
      userId,
    );

    return { success: true };
  }

  /**
   * Save newsletter templates
   */
  async saveTemplates(
    tenantId: number,
    dto: SaveNewsletterTemplatesDto,
  ): Promise<{ success: boolean }> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if setting exists
    const existingResult = await pool
      .request()
      .input('settingKey', sql.NVarChar, 'newsletter_email_templates').query(`
        SELECT id
        FROM setting
        WHERE [key] = @settingKey AND deleted_at IS NULL
      `);

    const templatesJson = JSON.stringify(dto.templates);

    if (existingResult.recordset.length > 0) {
      // Update existing
      await pool
        .request()
        .input('settingKey', sql.NVarChar, 'newsletter_email_templates')
        .input('value', sql.NVarChar, templatesJson).query(`
          UPDATE setting
          SET value = @value, updated_at = GETDATE()
          WHERE [key] = @settingKey
        `);
    } else {
      // Insert new
      await pool
        .request()
        .input('settingKey', sql.NVarChar, 'newsletter_email_templates')
        .input('value', sql.NVarChar, templatesJson)
        .input('valueType', sql.NVarChar, 'json')
        .input('category', sql.NVarChar, 'newsletter')
        .input(
          'description',
          sql.NVarChar,
          'Newsletter email templates by language',
        ).query(`
          INSERT INTO setting ([key], value, value_type, category, description, is_public, created_at)
          VALUES (@settingKey, @value, @valueType, @category, @description, 0, GETDATE())
        `);
    }

    this.logger.log(`Newsletter templates saved for tenant ${tenantId}`);

    return { success: true };
  }

  /**
   * Get newsletter templates
   */
  async getNewsletterTemplates(
    tenantId: number,
  ): Promise<Record<string, NewsletterTemplateDto>> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('settingKey', sql.NVarChar, 'newsletter_email_templates').query(`
        SELECT value
        FROM setting
        WHERE [key] = @settingKey AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      // Return default templates
      return {
        'pt-PT': this.getDefaultTemplate(),
      };
    }

    try {
      return JSON.parse(result.recordset[0].value);
    } catch (error) {
      this.logger.error(`Error parsing newsletter templates: ${error.message}`);
      return {
        'pt-PT': this.getDefaultTemplate(),
      };
    }
  }

  // ========================
  // Private Methods
  // ========================

  /**
   * Build newsletter HTML
   */
  private buildNewsletterHtml(
    title: string,
    url: string,
    language: string,
    templates: Record<string, NewsletterTemplateDto>,
  ): string {
    const template =
      templates[language] || templates['pt-PT'] || this.getDefaultTemplate();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
          }
          .content {
            padding: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${template.header}</h2>
        </div>
        <div class="content">
          <p>${template.greeting}</p>
          <p>${template.intro}</p>
          <h3>${title}</h3>
          <p>${template.cta_text}</p>
          <a href="${url}" class="button">${template.button_text}</a>
        </div>
        <div class="footer">
          <p>${template.footer_subscribed}</p>
          <p>${template.footer_unsubscribe}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get default template (Portuguese)
   */
  private getDefaultTemplate(): NewsletterTemplateDto {
    return {
      header: 'Novo Conteúdo Publicado',
      greeting: 'Olá,',
      intro: 'Temos novo conteúdo disponível no nosso site:',
      cta_text: 'Clique no botão abaixo para ler o artigo completo:',
      button_text: 'Ler Artigo',
      footer_subscribed:
        'Você está recebendo este email porque está inscrito na nossa newsletter.',
      footer_unsubscribe:
        'Se não deseja mais receber estes emails, entre em contato conosco.',
      subject_prefix: 'Novo Conteúdo:',
    };
  }

  /**
   * Get allowed languages from configuration
   */
  private async getAllowedLanguages(tenantId: number): Promise<string[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('settingKey', sql.NVarChar, 'site_public_languages').query(`
        SELECT value
        FROM setting
        WHERE [key] = @settingKey AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      // Default languages
      return ['pt-PT', 'en', 'es', 'fr', 'de', 'it', 'ar'];
    }

    try {
      return JSON.parse(result.recordset[0].value);
    } catch (error) {
      this.logger.error(`Error parsing allowed languages: ${error.message}`);
      return ['pt-PT', 'en', 'es', 'fr', 'de', 'it', 'ar'];
    }
  }

  /**
   * Normalize language code
   */
  private normalizeLang(lang: string): string {
    const languageMap: Record<string, string> = {
      pt: 'pt-PT',
      'pt-PT': 'pt-PT',
      en: 'en',
      es: 'es',
      fr: 'fr',
      de: 'de',
      it: 'it',
      ar: 'ar',
    };

    return languageMap[lang] || lang;
  }

  /**
   * Ensure newsletter_subscription table exists
   */
  private async ensureNewsletterTable(pool: sql.ConnectionPool): Promise<void> {
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'newsletter_subscription')
        BEGIN
          CREATE TABLE newsletter_subscription (
            id INT IDENTITY(1,1) PRIMARY KEY,
            email NVARCHAR(255) NOT NULL UNIQUE,
            full_name NVARCHAR(255) NULL,
            status NVARCHAR(50) NOT NULL DEFAULT 'subscribed',
            subscription_date DATETIME2 NOT NULL DEFAULT GETDATE(),
            unsubscribed_at DATETIME2 NULL,
            unsubscribe_reason NVARCHAR(500) NULL,
            metadata NVARCHAR(MAX) NULL,
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NULL
          );

          CREATE INDEX IX_newsletter_subscription_status ON newsletter_subscription(status);
          CREATE INDEX IX_newsletter_subscription_email ON newsletter_subscription(email);
        END
      `);
      this.logger.log('Newsletter subscription table check completed');
    } catch (error) {
      this.logger.error(
        `Error ensuring newsletter subscription table: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Map database record to DTO
   */
  private mapToDto(record: any): NewsletterSubscriberDto {
    const metadata = record.metadata ? JSON.parse(record.metadata) : {};
    return {
      id: record.id,
      email: record.email,
      language: metadata.language || 'pt-PT',
      active: record.status === 'subscribed',
      createdAt: record.created_at,
    };
  }
}
