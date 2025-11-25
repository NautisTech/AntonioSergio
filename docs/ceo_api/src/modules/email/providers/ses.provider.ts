import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// TODO: Install @aws-sdk/client-ses to enable AWS SES provider
// npm install @aws-sdk/client-ses
// import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { AwsSesConfigDto } from '../dto/email.dto';
import { EmailMessage, EmailResult } from './smtp.provider';

/**
 * AWS SES Email Provider
 *
 * Handles email sending via Amazon Simple Email Service (SES)
 * NOTE: Requires @aws-sdk/client-ses package to be installed
 */
@Injectable()
export class SesProvider {
  private readonly logger = new Logger(SesProvider.name);

  /**
   * Send email via AWS SES
   */
  async sendEmail(
    tenantId: number,
    config: AwsSesConfigDto,
    message: EmailMessage,
  ): Promise<EmailResult> {
    throw new BadRequestException(
      'AWS SES provider is not available. Please install @aws-sdk/client-ses package: npm install @aws-sdk/client-ses'
    );
  }

  /**
   * Verify AWS SES configuration
   */
  async verifyConfiguration(tenantId: number, config: AwsSesConfigDto): Promise<boolean> {
    this.logger.warn('AWS SES provider is not available - @aws-sdk/client-ses package not installed');
    return false;
  }

  /**
   * Clear client cache
   */
  clearCache(tenantId?: number): void {
    // No-op when AWS SDK is not installed
  }
}
