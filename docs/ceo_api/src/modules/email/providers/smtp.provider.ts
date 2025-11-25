import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SmtpConfigDto } from '../dto/email.dto';

export interface EmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

/**
 * SMTP Email Provider
 *
 * Handles email sending via SMTP (Gmail, Outlook, custom SMTP servers)
 */
@Injectable()
export class SmtpProvider {
  private readonly logger = new Logger(SmtpProvider.name);
  private readonly transporters = new Map<number, nodemailer.Transporter>();

  /**
   * Send email via SMTP
   */
  async sendEmail(
    tenantId: number,
    config: SmtpConfigDto,
    message: EmailMessage,
  ): Promise<EmailResult> {
    const transporter = this.getTransporter(tenantId, config);

    try {
      const info = await transporter.sendMail(message);

      this.logger.log(`Email sent via SMTP: tenant=${tenantId}, messageId=${info.messageId}`);

      return {
        messageId: info.messageId,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
      };
    } catch (error) {
      this.logger.error(`SMTP send error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(tenantId: number, config: SmtpConfigDto): Promise<boolean> {
    const transporter = this.createTransporter(config);

    try {
      await transporter.verify();
      this.logger.log(`SMTP connection verified for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`SMTP verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get or create transporter for tenant
   */
  private getTransporter(tenantId: number, config: SmtpConfigDto): nodemailer.Transporter {
    if (this.transporters.has(tenantId)) {
      return this.transporters.get(tenantId)!;
    }

    const transporter = this.createTransporter(config);
    this.transporters.set(tenantId, transporter);

    return transporter;
  }

  /**
   * Create nodemailer transporter
   */
  private createTransporter(config: SmtpConfigDto): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true for 465, false for other ports
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  /**
   * Clear transporter cache
   */
  clearCache(tenantId?: number): void {
    if (tenantId) {
      this.transporters.delete(tenantId);
    } else {
      this.transporters.clear();
    }
  }
}
