import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';

/**
 * Simple mailer service for basic email sending
 * Wrapper around EmailService for backward compatibility
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Send a simple email
   * @param to Recipient email address
   * @param tenantId Tenant ID
   * @param subject Email subject
   * @param html HTML content
   */
  async sendSimpleEmail(
    to: string,
    tenantId: number,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.emailService.sendEmail(
        tenantId,
        {
          to,
          subject,
          html,
        },
        1, // System user ID for automated emails
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
