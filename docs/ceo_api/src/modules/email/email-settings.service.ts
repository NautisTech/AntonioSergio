import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { EmailConfigDto, EmailProvider } from './dto/email.dto';

/**
 * Email Settings Service
 *
 * Manages email provider configuration stored in the tenant's setting table.
 * - Stores email provider configuration (SMTP, AWS SES)
 * - Caches settings to reduce database load (5-minute TTL)
 * - Supports per-tenant email configuration
 */
@Injectable()
export class EmailSettingsService {
  private readonly logger = new Logger(EmailSettingsService.name);
  private readonly settingsCache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly databaseService: DatabaseService) { }

  /**
   * Get email configuration for tenant
   */
  async getEmailConfig(tenantId: number): Promise<EmailConfigDto | null> {
    const cacheKey = `email_config_${tenantId}`;

    // Check cache
    const cached = this.settingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request()
      .input('settingKey', sql.NVarChar, 'email_config')
      .query(`
        SELECT value, is_encrypted
        FROM setting
        WHERE [key] = @settingKey AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const configData = result.recordset[0];
    let settingValue = configData.value;

    // Decrypt if encrypted
    if (configData.is_encrypted === 1 || configData.is_encrypted === true) {
      const encryptionService = this.databaseService.getEncryptionService();
      const key = encryptionService.getMasterKey();
      settingValue = encryptionService.decrypt(settingValue, key);
    }

    const config: EmailConfigDto = JSON.parse(settingValue);

    // Cache the result
    this.settingsCache.set(cacheKey, { value: config, timestamp: Date.now() });

    return config;
  }

  /**
   * Save email configuration
   */
  async saveEmailConfig(
    tenantId: number,
    config: EmailConfigDto,
    userId: number,
  ): Promise<void> {
    // Validate configuration
    this.validateEmailConfig(config);

    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if configuration already exists
    const existingResult = await pool.request()
      .input('settingKey', sql.NVarChar, 'email_config')
      .query(`
        SELECT id
        FROM setting
        WHERE [key] = @settingKey AND deleted_at IS NULL
      `);

    const configJson = JSON.stringify(config);

    // Encrypt the configuration
    const encryptionService = this.databaseService.getEncryptionService();
    const key = encryptionService.getMasterKey();
    const encryptedConfig = encryptionService.encrypt(configJson, key);

    if (existingResult.recordset.length > 0) {
      // Update existing configuration
      await pool.request()
        .input('settingKey', sql.NVarChar, 'email_config')
        .input('settingValue', sql.NVarChar, encryptedConfig)
        .query(`
          UPDATE setting
          SET value = @settingValue,
              is_encrypted = 1,
              updated_at = GETDATE()
          WHERE [key] = @settingKey
        `);
    } else {
      // Insert new configuration
      await pool.request()
        .input('settingKey', sql.NVarChar, 'email_config')
        .input('settingValue', sql.NVarChar, encryptedConfig)
        .input('valueType', sql.NVarChar, 'json')
        .input('category', sql.NVarChar, 'email')
        .input('description', sql.NVarChar, 'Email provider configuration')
        .query(`
          INSERT INTO setting ([key], value, value_type, category, description, is_public, is_encrypted, created_at)
          VALUES (@settingKey, @settingValue, @valueType, @category, @description, 0, 1, GETDATE())
        `);
    }

    // Clear cache
    const cacheKey = `email_config_${tenantId}`;
    this.settingsCache.delete(cacheKey);

    this.logger.log(`Email configuration saved for tenant ${tenantId}`);
  }

  /**
   * Delete email configuration
   */
  async deleteEmailConfig(tenantId: number): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request()
      .input('settingKey', sql.NVarChar, 'email_config')
      .query(`
        UPDATE setting
        SET deleted_at = GETDATE()
        WHERE [key] = @settingKey
      `);

    // Clear cache
    const cacheKey = `email_config_${tenantId}`;
    this.settingsCache.delete(cacheKey);

    this.logger.log(`Email configuration deleted for tenant ${tenantId}`);
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(tenantId: number, config: EmailConfigDto): Promise<boolean> {
    // Validate configuration
    this.validateEmailConfig(config);

    // TODO: Implement actual test email sending
    // For now, just validate the configuration structure

    return true;
  }

  /**
   * Get default "from" email and name
   */
  async getDefaultFrom(tenantId: number): Promise<{ email: string; name: string } | null> {
    const config = await this.getEmailConfig(tenantId);

    if (!config || !config.enabled) {
      return null;
    }

    // Normalize provider to lowercase for comparison
    const provider = (config.provider as string).toLowerCase();

    if (provider === EmailProvider.SMTP && config.smtp) {
      return {
        email: config.smtp.fromEmail || config.smtp.username,
        name: config.smtp.fromName || 'Nautis CEO',
      };
    }

    if (provider === EmailProvider.AWS_SES && config.awsSes) {
      return {
        email: config.awsSes.fromEmail || 'noreply@nautis.com',
        name: config.awsSes.fromName || 'Nautis CEO',
      };
    }

    return null;
  }

  /**
   * Clear all settings cache (useful for testing)
   */
  clearCache(): void {
    this.settingsCache.clear();
  }

  // ========================
  // Private Methods
  // ========================

  /**
   * Validate email configuration
   */
  private validateEmailConfig(config: EmailConfigDto): void {
    // Normalize provider to lowercase for comparison
    const provider = (config.provider as string).toLowerCase();

    if (provider === EmailProvider.SMTP) {
      if (!config.smtp) {
        throw new BadRequestException('SMTP configuration is required when provider is SMTP');
      }

      if (!config.smtp.host || !config.smtp.port || !config.smtp.username || !config.smtp.password) {
        throw new BadRequestException('SMTP configuration is incomplete. Required: host, port, username, password');
      }
    }

    if (provider === EmailProvider.AWS_SES) {
      if (!config.awsSes) {
        throw new BadRequestException('AWS SES configuration is required when provider is AWS_SES');
      }

      if (!config.awsSes.accessKeyId || !config.awsSes.secretAccessKey || !config.awsSes.region) {
        throw new BadRequestException('AWS SES configuration is incomplete. Required: accessKeyId, secretAccessKey, region');
      }
    }
  }
}
