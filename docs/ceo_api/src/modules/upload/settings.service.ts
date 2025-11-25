import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { S3ConfigDto, UpdateS3ConfigDto } from './dto/upload.dto';

/**
 * Settings Service
 *
 * Manages tenant-specific settings stored in the database.
 * Each tenant can have their own S3 configuration.
 */
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  // Cache for settings to avoid DB hits on every request
  private settingsCache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get S3 configuration for a tenant
   */
  async getS3Config(tenantId: number): Promise<S3ConfigDto | null> {
    const cacheKey = `s3_config_${tenantId}`;

    // Check cache first
    const cached = this.settingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      const pool = await this.databaseService.getTenantConnection(tenantId);

      const result = await pool.request()
        .input('settingKey', sql.NVarChar, 's3_config')
        .query(`
          SELECT value
          FROM setting
          WHERE [key] = @settingKey
        `);

      if (result.recordset.length === 0) {
        this.logger.log(`No S3 config found for tenant ${tenantId}, using local storage`);
        return null;
      }

      const settingValue = result.recordset[0].value;
      let config: S3ConfigDto;

      // Parse JSON value
      if (typeof settingValue === 'string') {
        config = JSON.parse(settingValue);
      } else {
        config = settingValue;
      }

      // Validate config
      if (!config.accessKeyId || !config.secretAccessKey || !config.region || !config.bucket) {
        this.logger.warn(`Incomplete S3 config for tenant ${tenantId}`);
        return null;
      }

      // Cache the result
      this.settingsCache.set(cacheKey, { value: config, timestamp: Date.now() });

      return config;
    } catch (error) {
      this.logger.error(`Error getting S3 config for tenant ${tenantId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Save or update S3 configuration for a tenant
   */
  async saveS3Config(tenantId: number, config: S3ConfigDto | UpdateS3ConfigDto, userId: number): Promise<void> {
    try {
      const pool = await this.databaseService.getTenantConnection(tenantId);

      // Check if config already exists
      const existingResult = await pool.request()
        .input('settingKey', sql.NVarChar, 's3_config')
        .query(`
          SELECT id, value
          FROM setting
          WHERE [key] = @settingKey
        `);

      const configJson = JSON.stringify(config);

      if (existingResult.recordset.length > 0) {
        // Update existing
        const existingId = existingResult.recordset[0].id;

        // If it's an update (partial), merge with existing
        let finalConfig = config;
        if (!config.hasOwnProperty('accessKeyId') || !config.hasOwnProperty('secretAccessKey')) {
          const existing = JSON.parse(existingResult.recordset[0].value);
          finalConfig = { ...existing, ...config };
        }

        await pool.request()
          .input('id', sql.Int, existingId)
          .input('settingValue', sql.NVarChar, JSON.stringify(finalConfig))
          .query(`
            UPDATE setting
            SET value = @settingValue,
                updated_at = GETDATE()
            WHERE id = @id
          `);
      } else {
        // Insert new
        await pool.request()
          .input('settingKey', sql.NVarChar, 's3_config')
          .input('settingValue', sql.NVarChar, configJson)
          .input('valueType', sql.NVarChar, 'json')
          .input('category', sql.NVarChar, 'storage')
          .input('description', sql.NVarChar, 'AWS S3 configuration for file uploads')
          .query(`
            INSERT INTO setting ([key], value, value_type, category, description, is_public, is_encrypted, created_at)
            VALUES (@settingKey, @settingValue, @valueType, @category, @description, 0, 1, GETDATE())
          `);
      }

      // Clear cache for this tenant
      const cacheKey = `s3_config_${tenantId}`;
      this.settingsCache.delete(cacheKey);

      this.logger.log(`S3 config saved for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Error saving S3 config for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException('Failed to save S3 configuration');
    }
  }

  /**
   * Delete S3 configuration for a tenant
   */
  async deleteS3Config(tenantId: number): Promise<void> {
    try {
      const pool = await this.databaseService.getTenantConnection(tenantId);

      await pool.request()
        .input('settingKey', sql.NVarChar, 's3_config')
        .query(`
          DELETE FROM setting
          WHERE [key] = @settingKey
        `);

      // Clear cache
      const cacheKey = `s3_config_${tenantId}`;
      this.settingsCache.delete(cacheKey);

      this.logger.log(`S3 config deleted for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Error deleting S3 config for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException('Failed to delete S3 configuration');
    }
  }

  /**
   * Test S3 connection for a tenant
   */
  async testS3Config(tenantId: number): Promise<{ success: boolean; message: string }> {
    const config = await this.getS3Config(tenantId);

    if (!config) {
      return {
        success: false,
        message: 'No S3 configuration found',
      };
    }

    if (!config.enabled) {
      return {
        success: false,
        message: 'S3 is disabled in configuration',
      };
    }

    // Basic validation
    if (!config.accessKeyId || !config.secretAccessKey || !config.region || !config.bucket) {
      return {
        success: false,
        message: 'Incomplete S3 configuration',
      };
    }

    return {
      success: true,
      message: 'S3 configuration is valid',
    };
  }

  /**
   * Get a generic setting value
   */
  async getSetting(tenantId: number, key: string): Promise<any> {
    const cacheKey = `setting_${tenantId}_${key}`;

    // Check cache
    const cached = this.settingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    try {
      const pool = await this.databaseService.getTenantConnection(tenantId);

      const result = await pool.request()
        .input('settingKey', sql.NVarChar, key)
        .query(`
          SELECT value
          FROM setting
          WHERE [key] = @settingKey
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      let value = result.recordset[0].value;

      // Try to parse JSON if it's a string
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          // Not JSON, keep as string
        }
      }

      // Cache the result
      this.settingsCache.set(cacheKey, { value, timestamp: Date.now() });

      return value;
    } catch (error) {
      this.logger.error(`Error getting setting ${key} for tenant ${tenantId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Save a generic setting value
   */
  async saveSetting(tenantId: number, key: string, value: any, userId: number): Promise<void> {
    try {
      const pool = await this.databaseService.getTenantConnection(tenantId);

      const valueString = typeof value === 'string' ? value : JSON.stringify(value);

      // Check if exists
      const existingResult = await pool.request()
        .input('settingKey', sql.NVarChar, key)
        .query(`
          SELECT id FROM setting WHERE [key] = @settingKey
        `);

      const valueType = typeof value === 'string' ? 'string' : 'json';

      if (existingResult.recordset.length > 0) {
        // Update
        await pool.request()
          .input('id', sql.Int, existingResult.recordset[0].id)
          .input('settingValue', sql.NVarChar, valueString)
          .input('valueType', sql.NVarChar, valueType)
          .query(`
            UPDATE setting
            SET value = @settingValue,
                value_type = @valueType,
                updated_at = GETDATE()
            WHERE id = @id
          `);
      } else {
        // Insert
        await pool.request()
          .input('settingKey', sql.NVarChar, key)
          .input('settingValue', sql.NVarChar, valueString)
          .input('valueType', sql.NVarChar, valueType)
          .query(`
            INSERT INTO setting ([key], value, value_type, created_at)
            VALUES (@settingKey, @settingValue, @valueType, GETDATE())
          `);
      }

      // Clear cache
      const cacheKey = `setting_${tenantId}_${key}`;
      this.settingsCache.delete(cacheKey);
    } catch (error) {
      this.logger.error(`Error saving setting ${key} for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException('Failed to save setting');
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.settingsCache.clear();
    this.logger.log('Settings cache cleared');
  }

  /**
   * Clear cache for specific tenant
   */
  clearTenantCache(tenantId: number): void {
    const keysToDelete: string[] = [];

    this.settingsCache.forEach((value, key) => {
      if (key.includes(`_${tenantId}_`) || key.endsWith(`_${tenantId}`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.settingsCache.delete(key));

    this.logger.log(`Cache cleared for tenant ${tenantId}`);
  }
}
