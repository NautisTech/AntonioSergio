import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EncryptionService } from '../../database/services/encryption.service';
import * as sql from 'mssql';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreateSettingDto,
  UpdateSettingDto,
  BulkUpdateSettingsDto,
  AssignModuleDto,
  UpdateTenantModuleDto,
  CreateTenantConfigDto,
  UpdateTenantConfigDto,
  SettingValueType,
} from './dto/tenant.dto';

const execAsync = promisify(exec);

@Injectable()
export class TenantsService {
  constructor(
    private databaseService: DatabaseService,
    private encryptionService: EncryptionService,
  ) {}

  // ========== TENANT MANAGEMENT (Main DB) ==========

  async create(dto: CreateTenantDto) {
    const mainPool = this.databaseService.getMainConnection();

    // Check if slug already exists
    const existing = await mainPool
      .request()
      .input('slug', sql.NVarChar, dto.slug)
      .query(`SELECT id FROM [tenant] WHERE slug = @slug AND deleted_at IS NULL`);

    if (existing.recordset.length > 0) {
      throw new ConflictException('A tenant with this slug already exists');
    }

    // New optimized schema (main.sql v2.0)
    const result = await mainPool
      .request()
      .input('name', sql.NVarChar, dto.name)
      .input('slug', sql.NVarChar, dto.slug)
      .input('custom_domain', sql.NVarChar, dto.domain || null)
      .input('database_name', sql.NVarChar, dto.databaseName)
      .input('subscription_status', sql.NVarChar, 'active')
      .query(`
        INSERT INTO [tenant] (
          name, slug, custom_domain, database_name,
          subscription_status,
          created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @slug, @custom_domain, @database_name,
          @subscription_status,
          GETDATE()
        )
      `);

    return { id: result.recordset[0].id };
  }

  async findAll() {
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0)
    const result = await mainPool.request().query(`
      SELECT
        id,
        name,
        slug,
        custom_domain as domain,
        database_name as databaseName,
        logo_url as logoUrl,
        primary_color as primaryColor,
        subscription_status as subscriptionStatus,
        subscription_plan_id as subscriptionPlanId,
        max_users as maxUsers,
        max_storage_gb as maxStorageGb,
        current_users_count as currentUsersCount,
        current_storage_gb as currentStorageGb,
        last_activity_at as lastActivityAt,
        created_at as createdAt,
        updated_at as updatedAt
      FROM [tenant]
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    return result.recordset;
  }

  async getStats() {
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0) with soft delete
    const result = await mainPool.request().query(`
      SELECT
        COUNT(*) as totalTenants,
        SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as activeTenants,
        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as inactiveTenants,
        SUM(CASE WHEN subscription_status = 'trial' AND deleted_at IS NULL THEN 1 ELSE 0 END) as trialTenants,
        SUM(CASE WHEN subscription_status = 'active' AND deleted_at IS NULL THEN 1 ELSE 0 END) as activeSubscriptions,
        MIN(created_at) as firstTenantDate,
        MAX(created_at) as lastTenantDate
      FROM [tenant]
    `);

    return result.recordset[0];
  }

  async findOne(id: number) {
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0)
    const result = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          id,
          name,
          slug,
          custom_domain as domain,
          database_name as databaseName,
          logo_url as logoUrl,
          favicon_url as faviconUrl,
          primary_color as primaryColor,
          secondary_color as secondaryColor,
          subscription_plan_id as subscriptionPlanId,
          subscription_status as subscriptionStatus,
          subscription_starts_at as subscriptionStartsAt,
          subscription_expires_at as subscriptionExpiresAt,
          trial_ends_at as trialEndsAt,
          max_users as maxUsers,
          max_storage_gb as maxStorageGb,
          current_users_count as currentUsersCount,
          current_storage_gb as currentStorageGb,
          last_activity_at as lastActivityAt,
          billing_email as billingEmail,
          billing_name as billingName,
          tax_id as taxId,
          timezone,
          locale,
          database_version as databaseVersion,
          created_at as createdAt,
          updated_at as updatedAt,
          created_by as createdBy,
          updated_by as updatedBy
        FROM [tenant]
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Tenant not found');
    }

    return result.recordset[0];
  }

  async getTenantDatabaseStats(id: number) {
    const tenant = await this.findOne(id);

    try {
      const tenantPool = await this.databaseService.getTenantConnection(id);

      // Using new English schema table names
      const result = await tenantPool.request().query(`
        SELECT
          (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'user') as hasUserTable,
          ISNULL((SELECT COUNT(*) FROM [user] WHERE deleted_at IS NULL), 0) as totalUsers,
          ISNULL((SELECT COUNT(*) FROM [company] WHERE deleted_at IS NULL), 0) as totalCompanies,
          ISNULL((SELECT COUNT(*) FROM [client] WHERE deleted_at IS NULL), 0) as totalClients,
          ISNULL((SELECT COUNT(*) FROM [product] WHERE deleted_at IS NULL), 0) as totalProducts,
          ISNULL((SELECT COUNT(*) FROM [equipment] WHERE deleted_at IS NULL), 0) as totalEquipment,
          ISNULL((SELECT COUNT(*) FROM [content] WHERE deleted_at IS NULL), 0) as totalContent,
          ISNULL((SELECT COUNT(*) FROM [order] WHERE deleted_at IS NULL), 0) as totalOrders,
          ISNULL((SELECT COUNT(*) FROM [quote] WHERE deleted_at IS NULL), 0) as totalQuotes
      `);

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        stats: result.recordset[0],
      };
    } catch (error) {
      console.error(`Error fetching stats for tenant ${id}:`, error.message);
      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        stats: {
          hasUserTable: 0,
          totalUsers: 0,
          totalCompanies: 0,
          totalClients: 0,
          totalProducts: 0,
          totalEquipment: 0,
          totalContent: 0,
          totalOrders: 0,
          totalQuotes: 0,
        },
        error: 'Could not connect to tenant database',
      };
    }
  }

  async testConnection(id: number) {
    const tenant = await this.findOne(id);

    try {
      const tenantPool = await this.databaseService.getTenantConnection(id);
      await tenantPool.request().query('SELECT 1 as test');

      return {
        success: true,
        message: 'Connection established successfully',
        database: tenant.databaseName,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection failed',
        error: error.message,
        database: tenant.databaseName,
      };
    }
  }

  async healthCheck(id: number) {
    const tenant = await this.findOne(id);

    try {
      const tenantPool = await this.databaseService.getTenantConnection(id);

      // Check connection
      const start = Date.now();
      await tenantPool.request().query('SELECT 1 as test');
      const connectionTime = Date.now() - start;

      // Check critical tables exist
      const tablesCheck = await tenantPool.request().query(`
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME IN ('user', 'company', 'permission', 'user_profile', 'setting')
      `);

      const criticalTablesExist = tablesCheck.recordset[0].count === 5;

      return {
        success: true,
        database: tenant.databaseName,
        connectionTimeMs: connectionTime,
        criticalTablesExist,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        database: tenant.databaseName,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async update(id: number, dto: UpdateTenantDto) {
    await this.findOne(id); // Check if exists

    const mainPool = this.databaseService.getMainConnection();

    const setClauses: string[] = [];
    const request = mainPool.request();
    request.input('id', sql.Int, id);

    // New optimized schema (main.sql v2.0)
    if (dto.name !== undefined) {
      setClauses.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }
    if (dto.domain !== undefined) {
      setClauses.push('custom_domain = @custom_domain');
      request.input('custom_domain', sql.NVarChar, dto.domain);
    }
    // Note: 'active' field doesn't exist in new schema (use soft delete instead)
    // Removed docker_build_cmd, docker_push_cmd, caprover_deploy_cmd (not in new schema)

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [tenant]
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
    }

    return { success: true };
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0) - Soft delete pattern
    await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [tenant]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id
      `);

    return { success: true, message: 'Tenant soft deleted successfully' };
  }

  // ========== SETTINGS (Tenant DB - 'setting' table) ==========

  async findAllSettings(tenantId: number) {
    await this.findOne(tenantId); // Verify tenant exists
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().query(`
      SELECT
        id,
        [key],
        value,
        value_type as valueType,
        category,
        description,
        is_public as isPublic,
        is_encrypted as isEncrypted,
        created_at as createdAt,
        updated_at as updatedAt
      FROM setting
      ORDER BY category, [key]
    `);

    // Decrypt encrypted values
    const masterKey = this.encryptionService.getMasterKey();
    return result.recordset.map(setting => {
      if (setting.isEncrypted && setting.value) {
        try {
          setting.value = this.encryptionService.decrypt(setting.value, masterKey);
        } catch (error) {
          console.error(`Error decrypting setting ${setting.key}:`, error);
          setting.value = '***ERROR***';
        }
      }
      return setting;
    });
  }

  async findSettingByKey(tenantId: number, key: string) {
    await this.findOne(tenantId);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('key', sql.NVarChar, key)
      .query(`
        SELECT
          id,
          [key],
          value,
          value_type as valueType,
          category,
          description,
          is_public as isPublic,
          is_encrypted as isEncrypted,
          created_at as createdAt,
          updated_at as updatedAt
        FROM setting
        WHERE [key] = @key
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Setting not found');
    }

    const setting = result.recordset[0];
    if (setting.isEncrypted && setting.value) {
      try {
        const masterKey = this.encryptionService.getMasterKey();
        setting.value = this.encryptionService.decrypt(setting.value, masterKey);
      } catch (error) {
        console.error(`Error decrypting setting ${setting.key}:`, error);
        setting.value = '***ERROR***';
      }
    }

    return setting;
  }

  async createSetting(tenantId: number, dto: CreateSettingDto) {
    await this.findOne(tenantId);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if key already exists
    const existing = await pool
      .request()
      .input('key', sql.NVarChar, dto.key)
      .query(`SELECT id FROM setting WHERE [key] = @key`);

    if (existing.recordset.length > 0) {
      throw new ConflictException('Setting with this key already exists');
    }

    // Encrypt value if needed
    let finalValue = dto.value || null;
    if (dto.isEncrypted && finalValue) {
      const masterKey = this.encryptionService.getMasterKey();
      finalValue = this.encryptionService.encrypt(finalValue, masterKey);
    }

    const result = await pool
      .request()
      .input('key', sql.NVarChar, dto.key)
      .input('value', sql.NVarChar(sql.MAX), finalValue)
      .input('value_type', sql.NVarChar, dto.valueType)
      .input('category', sql.NVarChar, dto.category || null)
      .input('description', sql.NVarChar, dto.description || null)
      .input('is_public', sql.Bit, dto.isPublic || false)
      .input('is_encrypted', sql.Bit, dto.isEncrypted || false)
      .query(`
        INSERT INTO setting (
          [key], value, value_type, category, description,
          is_public, is_encrypted, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @key, @value, @value_type, @category, @description,
          @is_public, @is_encrypted, GETDATE()
        )
      `);

    return { id: result.recordset[0].id };
  }

  async updateSetting(tenantId: number, key: string, dto: UpdateSettingDto) {
    await this.findOne(tenantId);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if setting exists
    const existing = await this.findSettingByKey(tenantId, key);

    const setClauses: string[] = [];
    const request = pool.request();
    request.input('key', sql.NVarChar, key);

    if (dto.value !== undefined) {
      let finalValue = dto.value;
      const shouldEncrypt = dto.isEncrypted !== undefined ? dto.isEncrypted : existing.isEncrypted;

      if (shouldEncrypt && finalValue) {
        const masterKey = this.encryptionService.getMasterKey();
        finalValue = this.encryptionService.encrypt(finalValue, masterKey);
      }

      setClauses.push('value = @value');
      request.input('value', sql.NVarChar(sql.MAX), finalValue);
    }

    if (dto.valueType !== undefined) {
      setClauses.push('value_type = @value_type');
      request.input('value_type', sql.NVarChar, dto.valueType);
    }

    if (dto.category !== undefined) {
      setClauses.push('category = @category');
      request.input('category', sql.NVarChar, dto.category);
    }

    if (dto.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.isPublic !== undefined) {
      setClauses.push('is_public = @is_public');
      request.input('is_public', sql.Bit, dto.isPublic);
    }

    if (dto.isEncrypted !== undefined) {
      setClauses.push('is_encrypted = @is_encrypted');
      request.input('is_encrypted', sql.Bit, dto.isEncrypted);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE setting
        SET ${setClauses.join(', ')}
        WHERE [key] = @key
      `);
    }

    return { success: true };
  }

  async bulkUpdateSettings(tenantId: number, dto: BulkUpdateSettingsDto) {
    await this.findOne(tenantId);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      for (const setting of dto.settings) {
        // Check if setting exists
        const existing = await transaction
          .request()
          .input('key', sql.NVarChar, setting.key)
          .query(`SELECT id, is_encrypted as isEncrypted FROM setting WHERE [key] = @key`);

        if (existing.recordset.length > 0) {
          // Update existing
          let finalValue = setting.value;
          if (existing.recordset[0].isEncrypted) {
            const masterKey = this.encryptionService.getMasterKey();
            finalValue = this.encryptionService.encrypt(setting.value, masterKey);
          }

          await transaction
            .request()
            .input('key', sql.NVarChar, setting.key)
            .input('value', sql.NVarChar(sql.MAX), finalValue)
            .query(`
              UPDATE setting
              SET value = @value, updated_at = GETDATE()
              WHERE [key] = @key
            `);
        }
        // If doesn't exist, skip (could throw error or create, depending on requirements)
      }

      await transaction.commit();
      return { success: true, updated: dto.settings.length };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removeSetting(tenantId: number, key: string) {
    await this.findOne(tenantId);
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Check if exists
    await this.findSettingByKey(tenantId, key);

    await pool
      .request()
      .input('key', sql.NVarChar, key)
      .query(`DELETE FROM setting WHERE [key] = @key`);

    return { success: true, message: 'Setting deleted successfully' };
  }

  async getPublicSettings(slug: string) {
    // Get tenant by slug
    const tenantInfo = await this.databaseService.getTenantInfoBySlug(slug);

    if (!tenantInfo) {
      throw new NotFoundException(`Tenant with slug "${slug}" not found`);
    }

    const pool = await this.databaseService.getTenantConnection(tenantInfo.id);

    // Fetch public settings
    const result = await pool.request().query(`
      SELECT [key], value, value_type as valueType
      FROM setting
      WHERE is_public = 1
    `);

    // Parse settings into a map
    const settings: Record<string, any> = {};
    result.recordset.forEach(row => {
      let value = row.value;

      // Parse based on type
      switch (row.valueType) {
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'number':
          value = parseFloat(value);
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch {}
          break;
      }

      settings[row.key] = value;
    });

    return {
      tenantName: settings.TENANT_NAME || tenantInfo.name,
      clientPortal: settings.CLIENT_PORTAL || false,
      supplierPortal: settings.SUPPLIER_PORTAL || false,
      ticketPortal: settings.TICKET_PORTAL || false,
      useTenantLogo: settings.USE_TENANT_LOGO || false,
      tenantLogoPath: settings.TENANT_LOGO_PATH || null,
      tenantLogoPathDark: settings.TENANT_LOGO_PATH_DARK || null,
    };
  }

  // ========== MODULES ==========

  async findAllModules() {
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0)
    const result = await mainPool.request().query(`
      SELECT
        id,
        code,
        name,
        description,
        icon,
        route,
        category,
        display_order as [order],
        version,
        min_plan_level as minPlanLevel,
        is_core as isCore,
        created_at as createdAt
      FROM [module]
      WHERE deleted_at IS NULL
      ORDER BY display_order, name
    `);

    return result.recordset;
  }

  async findTenantModules(tenantId: number) {
    await this.findOne(tenantId);
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0)
    const result = await mainPool
      .request()
      .input('tenant_id', sql.Int, tenantId)
      .query(`
        SELECT
          tm.id,
          tm.tenant_id as tenantId,
          tm.module_id as moduleId,
          tm.is_enabled as active,
          tm.enabled_at as activationDate,
          tm.expires_at as expirationDate,
          tm.usage_limit as usageLimit,
          tm.current_usage as currentUsage,
          tm.created_at as createdAt,
          tm.updated_at as updatedAt,
          m.code,
          m.name,
          m.description,
          m.icon,
          m.route,
          m.category,
          m.version
        FROM [tenant_module] tm
        INNER JOIN [module] m ON tm.module_id = m.id
        WHERE tm.tenant_id = @tenant_id AND tm.deleted_at IS NULL
        ORDER BY m.display_order, m.name
      `);

    return result.recordset;
  }

  async assignModule(tenantId: number, dto: AssignModuleDto) {
    await this.findOne(tenantId);
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0)
    // Check if module exists
    const module = await mainPool
      .request()
      .input('module_id', sql.Int, dto.moduleId)
      .query(`SELECT id FROM [module] WHERE id = @module_id AND deleted_at IS NULL`);

    if (!module.recordset[0]) {
      throw new NotFoundException('Module not found');
    }

    // Check if already assigned
    const existing = await mainPool
      .request()
      .input('tenant_id', sql.Int, tenantId)
      .input('module_id', sql.Int, dto.moduleId)
      .query(`
        SELECT id FROM [tenant_module]
        WHERE tenant_id = @tenant_id AND module_id = @module_id AND deleted_at IS NULL
      `);

    if (existing.recordset.length > 0) {
      throw new ConflictException('Module already assigned to this tenant');
    }

    const isEnabled = dto.active !== undefined ? dto.active : true;
    const result = await mainPool
      .request()
      .input('tenant_id', sql.Int, tenantId)
      .input('module_id', sql.Int, dto.moduleId)
      .input('is_enabled', sql.Bit, isEnabled)
      .input('enabled_at', sql.DateTime2, isEnabled ? new Date() : null)
      .input('expires_at', sql.DateTime2, dto.expirationDate || null)
      .query(`
        INSERT INTO [tenant_module] (
          tenant_id, module_id, is_enabled,
          enabled_at, expires_at, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @tenant_id, @module_id, @is_enabled,
          @enabled_at, @expires_at, GETDATE()
        )
      `);

    // Copy module permissions to tenant (if needed)
    await this.copyModulePermissionsToTenant(tenantId, dto.moduleId);

    return { id: result.recordset[0].id };
  }

  private async copyModulePermissionsToTenant(tenantId: number, moduleId: number): Promise<void> {
    const mainPool = this.databaseService.getMainConnection();
    const tenantPool = await this.databaseService.getTenantConnection(tenantId);

    // New optimized schema (main.sql v2.0) - Get module code first
    const moduleResult = await mainPool
      .request()
      .input('module_id', sql.Int, moduleId)
      .query(`SELECT code FROM [module] WHERE id = @module_id AND deleted_at IS NULL`);

    if (!moduleResult.recordset[0]) {
      return; // Module not found, skip
    }

    const moduleCode = moduleResult.recordset[0].code;

    // Get permission templates for this module
    const permissionsTemplate = await mainPool
      .request()
      .input('module_code', sql.NVarChar, moduleCode)
      .query(`
        SELECT
          permission_code as code,
          action,
          name,
          description,
          category,
          is_dangerous as isDangerous
        FROM [permission_template]
        WHERE module_code = @module_code AND deleted_at IS NULL
      `);

    // Insert each permission into tenant if doesn't exist
    for (const permission of permissionsTemplate.recordset) {
      const exists = await tenantPool
        .request()
        .input('slug', sql.NVarChar, permission.code)
        .query(`SELECT id FROM [permission] WHERE slug = @slug AND deleted_at IS NULL`);

      if (exists.recordset.length === 0) {
        await tenantPool
          .request()
          .input('slug', sql.NVarChar, permission.code)
          .input('name', sql.NVarChar, permission.name)
          .input('description', sql.NVarChar, permission.description || null)
          .input('category', sql.NVarChar, permission.category || moduleCode)
          .query(`
            INSERT INTO [permission] (slug, name, description, category, created_at)
            VALUES (@slug, @name, @description, @category, GETDATE())
          `);
      }
    }
  }

  async updateTenantModule(tenantId: number, moduleId: number, dto: UpdateTenantModuleDto) {
    await this.findOne(tenantId);
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0)
    // Check if tenant module exists
    const existing = await mainPool
      .request()
      .input('tenant_id', sql.Int, tenantId)
      .input('module_id', sql.Int, moduleId)
      .query(`
        SELECT id FROM [tenant_module]
        WHERE tenant_id = @tenant_id AND module_id = @module_id AND deleted_at IS NULL
      `);

    if (!existing.recordset[0]) {
      throw new NotFoundException('Module not assigned to this tenant');
    }

    const setClauses: string[] = [];
    const request = mainPool.request();
    request.input('tenant_id', sql.Int, tenantId);
    request.input('module_id', sql.Int, moduleId);

    if (dto.active !== undefined) {
      setClauses.push('is_enabled = @is_enabled');
      request.input('is_enabled', sql.Bit, dto.active);

      // Update enabled_at or disabled_at
      if (dto.active) {
        setClauses.push('enabled_at = GETDATE()');
        setClauses.push('disabled_at = NULL');
      } else {
        setClauses.push('disabled_at = GETDATE()');
      }
    }

    if (dto.expirationDate !== undefined) {
      setClauses.push('expires_at = @expires_at');
      request.input('expires_at', sql.DateTime2, dto.expirationDate);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [tenant_module]
        SET ${setClauses.join(', ')}
        WHERE tenant_id = @tenant_id AND module_id = @module_id
      `);
    }

    return { success: true };
  }

  async removeModule(tenantId: number, moduleId: number) {
    await this.findOne(tenantId);
    const mainPool = this.databaseService.getMainConnection();

    // New optimized schema (main.sql v2.0) - Soft delete
    // Check if exists
    const existing = await mainPool
      .request()
      .input('tenant_id', sql.Int, tenantId)
      .input('module_id', sql.Int, moduleId)
      .query(`
        SELECT id FROM [tenant_module]
        WHERE tenant_id = @tenant_id AND module_id = @module_id AND deleted_at IS NULL
      `);

    if (!existing.recordset[0]) {
      throw new NotFoundException('Module not assigned to this tenant');
    }

    await mainPool
      .request()
      .input('tenant_id', sql.Int, tenantId)
      .input('module_id', sql.Int, moduleId)
      .query(`
        UPDATE [tenant_module]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE tenant_id = @tenant_id AND module_id = @module_id
      `);

    return { success: true, message: 'Module removed successfully' };
  }

  // ========== DEPLOY ==========
  // Note: Deploy commands (docker_build_cmd, docker_push_cmd, caprover_deploy_cmd)
  // removed in new optimized schema. Deploy should be managed externally via CI/CD.

  async executeDockerCommand(
    tenantId: number,
    type: 'build' | 'push' | 'deploy'
  ): Promise<{ success: boolean; output: string; error?: string }> {
    throw new BadRequestException(
      'Deploy commands removed in new schema. Please use external CI/CD pipeline for deployments.'
    );
  }

  // ========== GLOBAL SYSTEM SETTINGS (Main DB - system-wide, no tenant_id) ==========
  // These are global configurations for the entire system, not tenant-specific
  // Uses tenant_setting table with tenant_id = NULL for global settings

  async findAllGlobalSettings() {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool.request().query(`
      SELECT
        id,
        setting_key as code,
        setting_category as category,
        setting_type as type,
        description,
        value,
        is_encrypted as isEncrypted,
        is_system as isSystem,
        created_at as createdAt,
        updated_at as updatedAt
      FROM [tenant_setting]
      WHERE tenant_id IS NULL AND deleted_at IS NULL
      ORDER BY setting_category, setting_key
    `);

    // Decrypt values
    const masterKey = this.encryptionService.getMasterKey();
    return result.recordset.map(config => {
      if (config.isEncrypted && config.value) {
        try {
          config.value = this.encryptionService.decrypt(config.value, masterKey);
        } catch (error) {
          console.error(`Error decrypting global setting ${config.code}:`, error);
          config.value = '***ERROR***';
        }
      }
      return config;
    });
  }

  async findGlobalSettingById(id: number) {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          id,
          setting_key as code,
          setting_category as category,
          setting_type as type,
          description,
          value,
          is_encrypted as isEncrypted,
          is_system as isSystem,
          created_at as createdAt,
          updated_at as updatedAt
        FROM [tenant_setting]
        WHERE id = @id AND tenant_id IS NULL AND deleted_at IS NULL
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Global setting not found');
    }

    const config = result.recordset[0];
    if (config.isEncrypted && config.value) {
      try {
        const masterKey = this.encryptionService.getMasterKey();
        config.value = this.encryptionService.decrypt(config.value, masterKey);
      } catch (error) {
        console.error(`Error decrypting global setting ${config.code}:`, error);
        config.value = '***ERROR***';
      }
    }

    return config;
  }

  async findGlobalSettingByKey(key: string) {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('setting_key', sql.NVarChar, key)
      .query(`
        SELECT
          id,
          setting_key as code,
          setting_category as category,
          setting_type as type,
          description,
          value,
          is_encrypted as isEncrypted,
          is_system as isSystem,
          created_at as createdAt,
          updated_at as updatedAt
        FROM [tenant_setting]
        WHERE setting_key = @setting_key AND tenant_id IS NULL AND deleted_at IS NULL
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Global setting not found');
    }

    const config = result.recordset[0];
    if (config.isEncrypted && config.value) {
      try {
        const masterKey = this.encryptionService.getMasterKey();
        config.value = this.encryptionService.decrypt(config.value, masterKey);
      } catch (error) {
        console.error(`Error decrypting global setting ${config.code}:`, error);
        config.value = '***ERROR***';
      }
    }

    return config;
  }

  async createGlobalSetting(dto: CreateTenantConfigDto) {
    const mainPool = this.databaseService.getMainConnection();

    // Check if key already exists
    const existing = await mainPool
      .request()
      .input('setting_key', sql.NVarChar, dto.code)
      .query(`
        SELECT id FROM [tenant_setting]
        WHERE setting_key = @setting_key AND tenant_id IS NULL AND deleted_at IS NULL
      `);

    if (existing.recordset.length > 0) {
      throw new ConflictException('Global setting with this key already exists');
    }

    // Encrypt if requested
    let finalValue = dto.value || '';
    if (dto.encrypt && finalValue) {
      const masterKey = this.encryptionService.getMasterKey();
      finalValue = this.encryptionService.encrypt(finalValue, masterKey);
    }

    const result = await mainPool
      .request()
      .input('setting_key', sql.NVarChar, dto.code)
      .input('description', sql.NVarChar, dto.description)
      .input('value', sql.NVarChar(sql.MAX), finalValue)
      .input('setting_type', sql.NVarChar, 'string')
      .input('is_encrypted', sql.Bit, dto.encrypt || false)
      .query(`
        INSERT INTO [tenant_setting] (
          tenant_id, setting_key, description, value,
          setting_type, is_encrypted, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          NULL, @setting_key, @description, @value,
          @setting_type, @is_encrypted, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, encrypted: dto.encrypt || false };
  }

  async updateGlobalSetting(id: number, dto: UpdateTenantConfigDto) {
    const mainPool = this.databaseService.getMainConnection();

    // Check if exists
    const existing = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, value, is_encrypted as isEncrypted, is_system as isSystem
        FROM [tenant_setting]
        WHERE id = @id AND tenant_id IS NULL AND deleted_at IS NULL
      `);

    if (!existing.recordset[0]) {
      throw new NotFoundException('Global setting not found');
    }

    const setClauses: string[] = [];
    const request = mainPool.request();
    request.input('id', sql.Int, id);

    if (dto.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }

    if (dto.value !== undefined) {
      let finalValue = dto.value;
      const shouldEncrypt = dto.encrypt !== undefined ? dto.encrypt : existing.recordset[0].isEncrypted;

      if (shouldEncrypt && finalValue) {
        const masterKey = this.encryptionService.getMasterKey();
        finalValue = this.encryptionService.encrypt(dto.value, masterKey);
      }

      setClauses.push('value = @value');
      request.input('value', sql.NVarChar(sql.MAX), finalValue);

      if (dto.encrypt !== undefined) {
        setClauses.push('is_encrypted = @is_encrypted');
        request.input('is_encrypted', sql.Bit, dto.encrypt);
      }
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [tenant_setting]
        SET ${setClauses.join(', ')}
        WHERE id = @id AND tenant_id IS NULL
      `);
    }

    return { success: true };
  }

  async removeGlobalSetting(id: number) {
    const mainPool = this.databaseService.getMainConnection();

    // Check if exists and is not system setting
    const existing = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, is_system as isSystem FROM [tenant_setting]
        WHERE id = @id AND tenant_id IS NULL AND deleted_at IS NULL
      `);

    if (!existing.recordset[0]) {
      throw new NotFoundException('Global setting not found');
    }

    if (existing.recordset[0].isSystem) {
      throw new BadRequestException('Cannot delete system setting');
    }

    await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE [tenant_setting]
        SET deleted_at = GETDATE(), updated_at = GETDATE()
        WHERE id = @id AND tenant_id IS NULL
      `);

    return { success: true, message: 'Global setting deleted successfully' };
  }

  // ==================== MODULE CRUD (Main DB) ====================

  async createModule(dto: any) {
    const mainPool = this.databaseService.getMainConnection();

    // Check if code already exists
    const existing = await mainPool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .query(`SELECT id FROM [module] WHERE code = @code AND deleted_at IS NULL`);

    if (existing.recordset.length > 0) {
      throw new BadRequestException('A module with this code already exists');
    }

    const result = await mainPool
      .request()
      .input('code', sql.NVarChar, dto.code)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('icon', sql.NVarChar, dto.icon || null)
      .input('route', sql.NVarChar, dto.route || null)
      .input('category', sql.NVarChar, dto.category || null)
      .input('display_order', sql.Int, dto.displayOrder)
      .input('min_plan_level', sql.Int, dto.minPlanLevel || null)
      .input('is_core', sql.Bit, dto.isCore !== undefined ? dto.isCore : false)
      .input('is_active', sql.Bit, dto.isActive !== undefined ? dto.isActive : true)
      .input('version', sql.NVarChar, dto.version || null)
      .query(`
        INSERT INTO [module] (
          code, name, description, icon, route, category,
          display_order, min_plan_level, is_core, is_active, version, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @code, @name, @description, @icon, @route, @category,
          @display_order, @min_plan_level, @is_core, @is_active, @version, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true, message: 'Module created successfully' };
  }

  async getModuleById(id: number) {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          id, code, name, description, icon, route, category,
          display_order as displayOrder,
          min_plan_level as minPlanLevel,
          is_core as isCore,
          is_active as isActive,
          version,
          created_at as createdAt,
          updated_at as updatedAt,
          (SELECT COUNT(*) FROM [permission_template] WHERE module_code = m.code AND deleted_at IS NULL) as totalPermissions
        FROM [module] m
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (!result.recordset[0]) {
      throw new NotFoundException('Module not found');
    }

    return result.recordset[0];
  }

  async updateModule(id: number, dto: any) {
    await this.getModuleById(id);
    const mainPool = this.databaseService.getMainConnection();

    const setClauses: string[] = [];
    const request = mainPool.request();
    request.input('id', sql.Int, id);

    if (dto.name) {
      setClauses.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }
    if (dto.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.icon !== undefined) {
      setClauses.push('icon = @icon');
      request.input('icon', sql.NVarChar, dto.icon);
    }
    if (dto.route !== undefined) {
      setClauses.push('route = @route');
      request.input('route', sql.NVarChar, dto.route);
    }
    if (dto.category !== undefined) {
      setClauses.push('category = @category');
      request.input('category', sql.NVarChar, dto.category);
    }
    if (dto.displayOrder !== undefined) {
      setClauses.push('display_order = @display_order');
      request.input('display_order', sql.Int, dto.displayOrder);
    }
    if (dto.minPlanLevel !== undefined) {
      setClauses.push('min_plan_level = @min_plan_level');
      request.input('min_plan_level', sql.Int, dto.minPlanLevel);
    }
    if (dto.isCore !== undefined) {
      setClauses.push('is_core = @is_core');
      request.input('is_core', sql.Bit, dto.isCore);
    }
    if (dto.isActive !== undefined) {
      setClauses.push('is_active = @is_active');
      request.input('is_active', sql.Bit, dto.isActive);
    }
    if (dto.version !== undefined) {
      setClauses.push('version = @version');
      request.input('version', sql.NVarChar, dto.version);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [module]
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
    }

    return { success: true, message: 'Module updated successfully' };
  }

  async deleteModule(id: number) {
    await this.getModuleById(id);
    const mainPool = this.databaseService.getMainConnection();

    // Check if module is in use by any tenant
    const inUse = await mainPool
      .request()
      .input('module_id', sql.Int, id)
      .query(`SELECT COUNT(*) as total FROM [tenant_module] WHERE module_id = @module_id AND deleted_at IS NULL`);

    if (inUse.recordset[0].total > 0) {
      throw new BadRequestException('Cannot delete this module as it is being used by tenants');
    }

    // Soft delete
    await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`UPDATE [module] SET deleted_at = GETDATE(), updated_at = GETDATE() WHERE id = @id`);

    return { success: true, message: 'Module deleted successfully' };
  }

  // ==================== PERMISSION TEMPLATE CRUD (Main DB) ====================

  async findModulePermissionTemplates(moduleCode: string) {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('module_code', sql.NVarChar, moduleCode)
      .query(`
        SELECT
          pt.id,
          pt.module_code as moduleCode,
          pt.permission_code as permissionCode,
          pt.name,
          pt.description,
          pt.action,
          pt.resource,
          pt.is_dangerous as isDangerous,
          pt.created_at as createdAt,
          pt.updated_at as updatedAt,
          m.name as moduleName
        FROM [permission_template] pt
        INNER JOIN [module] m ON pt.module_code = m.code
        WHERE pt.module_code = @module_code AND pt.deleted_at IS NULL
        ORDER BY pt.permission_code
      `);

    return result.recordset;
  }

  async findAllPermissionTemplates() {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool.request().query(`
      SELECT
        pt.id,
        pt.module_code as moduleCode,
        pt.permission_code as permissionCode,
        pt.name,
        pt.description,
        pt.action,
        pt.resource,
        pt.is_dangerous as isDangerous,
        pt.created_at as createdAt,
        pt.updated_at as updatedAt,
        m.name as moduleName,
        m.display_order as moduleOrder
      FROM [permission_template] pt
      INNER JOIN [module] m ON pt.module_code = m.code
      WHERE pt.deleted_at IS NULL AND m.deleted_at IS NULL
      ORDER BY m.display_order, m.name, pt.permission_code
    `);

    return result.recordset;
  }

  async createPermissionTemplate(dto: any) {
    const mainPool = this.databaseService.getMainConnection();

    // Verify module exists
    const module = await mainPool
      .request()
      .input('code', sql.NVarChar, dto.moduleCode)
      .query(`SELECT id FROM [module] WHERE code = @code AND deleted_at IS NULL`);

    if (!module.recordset[0]) {
      throw new NotFoundException('Module not found');
    }

    // Check if permission code already exists
    const existing = await mainPool
      .request()
      .input('permission_code', sql.NVarChar, dto.permissionCode)
      .query(`SELECT id FROM [permission_template] WHERE permission_code = @permission_code AND deleted_at IS NULL`);

    if (existing.recordset.length > 0) {
      throw new BadRequestException('A permission with this code already exists');
    }

    // Auto-extract action and resource from permission code if not provided
    // Ex: "invoicing.create" -> action: "create", resource: "invoicing"
    let action = dto.action;
    let resource = dto.resource;
    if (!action && dto.permissionCode.includes('.')) {
      const parts = dto.permissionCode.split('.');
      resource = resource || parts[0];
      action = parts[1] || undefined;
    }

    const result = await mainPool
      .request()
      .input('module_code', sql.NVarChar, dto.moduleCode)
      .input('permission_code', sql.NVarChar, dto.permissionCode)
      .input('name', sql.NVarChar, dto.name)
      .input('description', sql.NVarChar, dto.description || null)
      .input('action', sql.NVarChar, action || null)
      .input('resource', sql.NVarChar, resource || null)
      .input('is_dangerous', sql.Bit, dto.isDangerous !== undefined ? dto.isDangerous : false)
      .query(`
        INSERT INTO [permission_template] (
          module_code, permission_code, name, description, action, resource, is_dangerous, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @module_code, @permission_code, @name, @description, @action, @resource, @is_dangerous, GETDATE()
        )
      `);

    return { id: result.recordset[0].id, success: true, message: 'Permission template created successfully' };
  }

  async updatePermissionTemplate(id: number, dto: any) {
    const mainPool = this.databaseService.getMainConnection();

    // Verify permission exists
    const permission = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM [permission_template] WHERE id = @id AND deleted_at IS NULL`);

    if (!permission.recordset[0]) {
      throw new NotFoundException('Permission template not found');
    }

    const setClauses: string[] = [];
    const request = mainPool.request();
    request.input('id', sql.Int, id);

    if (dto.name) {
      setClauses.push('name = @name');
      request.input('name', sql.NVarChar, dto.name);
    }
    if (dto.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.action !== undefined) {
      setClauses.push('action = @action');
      request.input('action', sql.NVarChar, dto.action);
    }
    if (dto.resource !== undefined) {
      setClauses.push('resource = @resource');
      request.input('resource', sql.NVarChar, dto.resource);
    }
    if (dto.isDangerous !== undefined) {
      setClauses.push('is_dangerous = @is_dangerous');
      request.input('is_dangerous', sql.Bit, dto.isDangerous);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = GETDATE()');
      await request.query(`
        UPDATE [permission_template]
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
    }

    return { success: true, message: 'Permission template updated successfully' };
  }

  async deletePermissionTemplate(id: number) {
    const mainPool = this.databaseService.getMainConnection();

    // Verify permission exists
    const permission = await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM [permission_template] WHERE id = @id AND deleted_at IS NULL`);

    if (!permission.recordset[0]) {
      throw new NotFoundException('Permission template not found');
    }

    // Soft delete
    await mainPool
      .request()
      .input('id', sql.Int, id)
      .query(`UPDATE [permission_template] SET deleted_at = GETDATE(), updated_at = GETDATE() WHERE id = @id`);

    return { success: true, message: 'Permission template deleted successfully' };
  }
}
