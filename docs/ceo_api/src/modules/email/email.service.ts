import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { EmailSettingsService } from './email-settings.service';
import { SmtpProvider, EmailMessage } from './providers/smtp.provider';
import { SesProvider } from './providers/ses.provider';
import {
  EmailProvider,
  EmailStatus,
  EmailPriority,
  SendEmailDto,
  SendBulkEmailDto,
  EmailSentDto,
  EmailStatsDto,
  ListEmailsDto,
} from './dto/email.dto';

/**
 * Email Service
 *
 * Main service for sending emails using configured provider (SMTP or AWS SES).
 * - Automatically selects provider based on tenant configuration
 * - Logs all sent emails to database
 * - Provides email history and statistics
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly settingsService: EmailSettingsService,
    private readonly smtpProvider: SmtpProvider,
    private readonly sesProvider: SesProvider,
  ) { }

  /**
   * Send email
   */
  async sendEmail(
    tenantId: number,
    dto: SendEmailDto,
    userId: number,
  ): Promise<EmailSentDto> {
    // Get email configuration
    const config = await this.settingsService.getEmailConfig(tenantId);
    console.log('Email config:', config);

    if (!config || !config.enabled) {
      throw new BadRequestException('Email sending is not configured or disabled for this tenant');
    }

    // Get default from address
    const defaultFrom = await this.settingsService.getDefaultFrom(tenantId);

    if (!defaultFrom) {
      throw new BadRequestException('Default sender email is not configured');
    }

    // Validate email content
    if (!dto.text && !dto.html) {
      throw new BadRequestException('Email must have either text or HTML body');
    }

    // Build email message
    const message: EmailMessage = {
      from: `${defaultFrom.name} <${defaultFrom.email}>`,
      to: dto.toName ? `${dto.toName} <${dto.to}>` : dto.to,
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
      cc: dto.cc,
      bcc: dto.bcc,
      replyTo: dto.replyTo,
      attachments: dto.attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      })),
    };

    // Send email via appropriate provider
    let result: { messageId: string; accepted: string[]; rejected: string[] };

    try {
      if (config.provider === EmailProvider.SMTP) {
        if (!config.smtp) {
          throw new BadRequestException('SMTP configuration is missing');
        }
        result = await this.smtpProvider.sendEmail(tenantId, config.smtp, message);
      } else if (config.provider === EmailProvider.AWS_SES) {
        if (!config.awsSes) {
          throw new BadRequestException('AWS SES configuration is missing');
        }
        result = await this.sesProvider.sendEmail(tenantId, config.awsSes, message);
      } else {
        throw new BadRequestException(`Unsupported email provider: ${config.provider}`);
      }

      // Log email to database
      const emailLog = await this.logEmail(tenantId, {
        to: dto.to,
        subject: dto.subject,
        body: dto.html || dto.text || '',
        messageId: result.messageId,
        status: EmailStatus.SENT,
        provider: config.provider,
        entityType: dto.entityType,
        entityId: dto.entityId,
        userId,
        metadata: {
          cc: dto.cc,
          bcc: dto.bcc,
          replyTo: dto.replyTo,
          attachmentCount: dto.attachments?.length || 0,
          priority: dto.priority || EmailPriority.NORMAL,
        },
      });

      this.logger.log(`Email sent: tenant=${tenantId}, to=${dto.to}, messageId=${result.messageId}`);

      return emailLog;
    } catch (error) {
      this.logger.error(`Email send failed: ${error.message}`, error.stack);

      // Log failed email
      const emailLog = await this.logEmail(tenantId, {
        to: dto.to,
        subject: dto.subject,
        body: dto.html || dto.text || '',
        messageId: null,
        status: EmailStatus.FAILED,
        provider: config.provider,
        entityType: dto.entityType,
        entityId: dto.entityId,
        userId,
        error: error.message,
        metadata: {
          cc: dto.cc,
          bcc: dto.bcc,
          replyTo: dto.replyTo,
          attachmentCount: dto.attachments?.length || 0,
          priority: dto.priority || EmailPriority.NORMAL,
        },
      });

      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmail(
    tenantId: number,
    dto: SendBulkEmailDto,
    userId: number,
  ): Promise<{ sent: number; failed: number; results: EmailSentDto[] }> {
    const results: EmailSentDto[] = [];
    let sent = 0;
    let failed = 0;

    if (dto.individual) {
      // Send one email per recipient
      for (const recipient of dto.recipients) {
        try {
          const result = await this.sendEmail(
            tenantId,
            {
              to: recipient,
              subject: dto.subject,
              text: dto.text,
              html: dto.html,
            },
            userId,
          );
          results.push(result);
          sent++;
        } catch (error) {
          this.logger.error(`Bulk email failed for ${recipient}: ${error.message}`);
          failed++;
        }
      }
    } else {
      // Send one email with all recipients in BCC
      try {
        const result = await this.sendEmail(
          tenantId,
          {
            to: dto.recipients[0], // First recipient as "to"
            bcc: dto.recipients.slice(1), // Rest as BCC
            subject: dto.subject,
            text: dto.text,
            html: dto.html,
          },
          userId,
        );
        results.push(result);
        sent++;
      } catch (error) {
        this.logger.error(`Bulk email failed: ${error.message}`);
        failed++;
      }
    }

    return { sent, failed, results };
  }

  /**
   * Get email by ID
   */
  async getEmail(tenantId: number, emailId: number): Promise<EmailSentDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('id', sql.Int, emailId)
      .query(`
        SELECT
          id,
          message_id,
          [status],
          [to],
          [subject],
          entity_type,
          entity_id,
          created_at
        FROM email_log
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Email not found');
    }

    return this.mapToDto(result.recordset[0]);
  }

  /**
   * List emails with filtering
   */
  async listEmails(tenantId: number, filters: ListEmailsDto = {}): Promise<any> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const conditions: string[] = ['deleted_at IS NULL'];
    const request = pool.request();

    if (filters.status) {
      conditions.push('[status] = @status');
      request.input('status', sql.NVarChar, filters.status);
    }

    if (filters.to) {
      conditions.push('[to] = @to');
      request.input('to', sql.NVarChar, filters.to);
    }

    if (filters.entityType) {
      conditions.push('entity_type = @entityType');
      request.input('entityType', sql.NVarChar, filters.entityType);
    }

    if (filters.entityId) {
      conditions.push('entity_id = @entityId');
      request.input('entityId', sql.Int, filters.entityId);
    }

    if (filters.search) {
      conditions.push('[subject] LIKE @search');
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (filters.startDate) {
      conditions.push('created_at >= @startDate');
      request.input('startDate', sql.DateTime2, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('created_at <= @endDate');
      request.input('endDate', sql.DateTime2, filters.endDate);
    }

    const whereClause = conditions.join(' AND ');

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const countRequest = pool.request();
    if (filters.status) countRequest.input('status', sql.NVarChar, filters.status);
    if (filters.to) countRequest.input('to', sql.NVarChar, filters.to);
    if (filters.entityType) countRequest.input('entityType', sql.NVarChar, filters.entityType);
    if (filters.entityId) countRequest.input('entityId', sql.Int, filters.entityId);
    if (filters.search) countRequest.input('search', sql.NVarChar, `%${filters.search}%`);
    if (filters.startDate) countRequest.input('startDate', sql.DateTime2, filters.startDate);
    if (filters.endDate) countRequest.input('endDate', sql.DateTime2, filters.endDate);

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM email_log WHERE ${whereClause}
    `);

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataResult = await request.query(`
      SELECT
        id, message_id, [status], [to], [subject], entity_type, entity_id, created_at
      FROM email_log
      WHERE ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset.map(r => this.mapToDto(r)),
      total: countResult.recordset[0].total,
      page,
      pageSize,
      totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
    };
  }

  /**
   * Get email statistics
   */
  async getStats(tenantId: number): Promise<EmailStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Total stats
    const totalResult = await pool.request().query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN [status] = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN [status] = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN [status] = 'pending' THEN 1 ELSE 0 END) as pending
      FROM email_log
      WHERE deleted_at IS NULL
    `);

    // Sent today
    const todayResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM email_log
      WHERE [status] = 'sent'
        AND deleted_at IS NULL
        AND created_at >= CAST(GETDATE() AS DATE)
    `);

    // Sent this week
    const weekResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM email_log
      WHERE [status] = 'sent'
        AND deleted_at IS NULL
        AND created_at >= DATEADD(week, -1, GETDATE())
    `);

    // Sent this month
    const monthResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM email_log
      WHERE [status] = 'sent'
        AND deleted_at IS NULL
        AND created_at >= DATEADD(month, -1, GETDATE())
    `);

    // Recent emails (last 30 days)
    const recentResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM email_log
      WHERE deleted_at IS NULL
        AND created_at >= DATEADD(day, -30, GETDATE())
    `);

    return {
      totalSent: totalResult.recordset[0].sent || 0,
      totalFailed: totalResult.recordset[0].failed || 0,
      totalPending: totalResult.recordset[0].pending || 0,
      sentToday: todayResult.recordset[0].count || 0,
      sentThisWeek: weekResult.recordset[0].count || 0,
      sentThisMonth: monthResult.recordset[0].count || 0,
      recentEmails: recentResult.recordset[0].count || 0,
    };
  }

  // ========================
  // Private Methods
  // ========================

  /**
   * Log email to database
   */
  private async logEmail(
    tenantId: number,
    data: {
      to: string;
      subject: string;
      body: string;
      messageId: string | null;
      status: EmailStatus;
      provider: EmailProvider;
      entityType?: string;
      entityId?: number;
      userId: number;
      error?: string;
      metadata?: any;
    },
  ): Promise<EmailSentDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Ensure email_log table exists
    await this.ensureEmailLogTable(pool);

    const result = await pool.request()
      .input('to', sql.NVarChar, data.to)
      .input('subject', sql.NVarChar, data.subject)
      .input('body', sql.NVarChar, data.body)
      .input('messageId', sql.NVarChar, data.messageId)
      .input('status', sql.NVarChar, data.status)
      .input('provider', sql.NVarChar, data.provider)
      .input('entityType', sql.NVarChar, data.entityType || null)
      .input('entityId', sql.Int, data.entityId || null)
      .input('userId', sql.Int, data.userId)
      .input('error', sql.NVarChar, data.error || null)
      .input('metadata', sql.NVarChar, data.metadata ? JSON.stringify(data.metadata) : null)
      .query(`
        INSERT INTO email_log (
          [to], [subject], body, message_id, [status], provider,
          entity_type, entity_id, sent_by, error, metadata, created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @to, @subject, @body, @messageId, @status, @provider,
          @entityType, @entityId, @userId, @error, @metadata, GETDATE()
        )
      `);

    return this.mapToDto(result.recordset[0]);
  }

  /**
   * Ensure email_log table exists
   */
  private async ensureEmailLogTable(pool: sql.ConnectionPool): Promise<void> {
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'email_log')
        BEGIN
          CREATE TABLE email_log (
            id INT IDENTITY(1,1) PRIMARY KEY,
            [to] NVARCHAR(255) NOT NULL,
            [subject] NVARCHAR(500) NOT NULL,
            body NVARCHAR(MAX),
            message_id NVARCHAR(255),
            [status] NVARCHAR(50) NOT NULL,
            provider NVARCHAR(50) NOT NULL,
            entity_type NVARCHAR(50),
            entity_id INT,
            sent_by INT,
            error NVARCHAR(MAX),
            metadata NVARCHAR(MAX),
            created_at DATETIME2 DEFAULT GETDATE(),
            deleted_at DATETIME2
          );

          CREATE INDEX IX_email_log_status ON email_log([status]) WHERE deleted_at IS NULL;
          CREATE INDEX IX_email_log_entity ON email_log(entity_type, entity_id) WHERE deleted_at IS NULL;
          CREATE INDEX IX_email_log_to ON email_log([to]) WHERE deleted_at IS NULL;
        END
      `);
    } catch (error) {
      this.logger.error(`Error ensuring email_log table: ${error.message}`);
    }
  }

  /**
   * Map database record to DTO
   */
  private mapToDto(record: any): EmailSentDto {
    return {
      id: record.id,
      messageId: record.message_id,
      status: record.status,
      to: record.to,
      subject: record.subject,
      entityType: record.entity_type,
      entityId: record.entity_id,
      createdAt: record.created_at,
    };
  }
}
