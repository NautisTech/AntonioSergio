import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import { AvailableTenant, TenantGroup } from './interfaces/tenant-group.interface';

@Injectable()
export class TenantGroupService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Get all tenants accessible by a user
   */
  async getUserAvailableTenants(email: string): Promise<TenantGroup[]> {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('email', sql.NVarChar, email).query(`
        SELECT
          tg.id AS tenant_group_id,
          tg.name AS tenant_group_name,
          tg.code AS tenant_group_code,
          t.id AS tenant_id,
          t.slug AS tenant_slug,
          t.name AS tenant_name,
          COALESCE(tgm.display_name, t.name) AS display_name,
          tgm.display_order,
          tgm.is_default,
          uta.access_level,
          uta.can_switch
        FROM [dbo].[user_tenant_access] uta
        INNER JOIN [dbo].[tenant] t ON uta.tenant_id = t.id
        INNER JOIN [dbo].[tenant_groups] tg ON uta.tenant_group_id = tg.id
        INNER JOIN [dbo].[tenant_group_members] tgm ON tgm.tenant_id = t.id AND tgm.tenant_group_id = tg.id
        WHERE uta.email = @email
          AND uta.can_access = 1
          AND uta.revoked_at IS NULL
          AND t.deleted_at IS NULL
          AND tg.is_active = 1
          AND tgm.is_active = 1
        ORDER BY tgm.display_order, t.name
      `);

    const tenants = result.recordset;

    // Group by tenant group
    const groupsMap = new Map<number, TenantGroup>();

    tenants.forEach((row) => {
      const groupId = row.tenant_group_id;

      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          tenantGroupId: row.tenant_group_id,
          tenantGroupName: row.tenant_group_name,
          tenantGroupCode: row.tenant_group_code,
          tenants: [],
        });
      }

      groupsMap.get(groupId)!.tenants.push({
        tenantId: row.tenant_id,
        tenantSlug: row.tenant_slug,
        tenantName: row.tenant_name,
        displayName: row.display_name,
        displayOrder: row.display_order,
        isDefault: row.is_default,
        accessLevel: row.access_level,
        canSwitch: row.can_switch,
      });
    });

    return Array.from(groupsMap.values());
  }

  /**
   * Get simple list of accessible tenant IDs
   */
  async getUserAvailableTenantIds(email: string): Promise<number[]> {
    const groups = await this.getUserAvailableTenants(email);
    const tenantIds: number[] = [];

    groups.forEach((group) => {
      group.tenants.forEach((tenant) => {
        tenantIds.push(tenant.tenantId);
      });
    });

    return tenantIds;
  }

  /**
   * Check if user can switch to a specific tenant
   */
  async canUserSwitchToTenant(
    email: string,
    targetTenantId: number,
  ): Promise<boolean> {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('email', sql.NVarChar, email)
      .input('targetTenantId', sql.Int, targetTenantId).query(`
        SELECT
          CASE
            WHEN COUNT(*) > 0 THEN 1
            ELSE 0
          END AS can_switch
        FROM [dbo].[user_tenant_access] uta
        INNER JOIN [dbo].[tenant] t ON uta.tenant_id = t.id
        WHERE uta.email = @email
          AND uta.tenant_id = @targetTenantId
          AND uta.can_access = 1
          AND uta.can_switch = 1
          AND uta.revoked_at IS NULL
          AND t.deleted_at IS NULL
      `);

    return result.recordset[0]?.can_switch === 1;
  }

  /**
   * Get information about a specific tenant the user has access to
   */
  async getTenantInfo(
    email: string,
    tenantId: number,
  ): Promise<AvailableTenant | null> {
    const groups = await this.getUserAvailableTenants(email);

    for (const group of groups) {
      const tenant = group.tenants.find((t) => t.tenantId === tenantId);
      if (tenant) {
        return tenant;
      }
    }

    return null;
  }

  /**
   * Get tenant group ID for a user's specific tenant
   */
  async getTenantGroupId(email: string, tenantId: number): Promise<number | null> {
    const mainPool = this.databaseService.getMainConnection();

    const result = await mainPool
      .request()
      .input('email', sql.NVarChar, email)
      .input('tenantId', sql.Int, tenantId).query(`
        SELECT tenant_group_id
        FROM user_tenant_access
        WHERE email = @email
          AND tenant_id = @tenantId
          AND can_access = 1
          AND revoked_at IS NULL
      `);

    return result.recordset[0]?.tenant_group_id || null;
  }

  /**
   * Log tenant switch
   */
  async logTenantSwitch(
    email: string,
    fromTenantId: number,
    toTenantId: number,
    tenantGroupId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const mainPool = this.databaseService.getMainConnection();

    await mainPool
      .request()
      .input('email', sql.NVarChar, email)
      .input('fromTenantId', sql.Int, fromTenantId)
      .input('toTenantId', sql.Int, toTenantId)
      .input('tenantGroupId', sql.Int, tenantGroupId)
      .input('ipAddress', sql.NVarChar, ipAddress || null)
      .input('userAgent', sql.NVarChar, userAgent || null).query(`
        INSERT INTO tenant_switch_log (email, from_tenant_id, to_tenant_id, tenant_group_id, ip_address, user_agent)
        VALUES (@email, @fromTenantId, @toTenantId, @tenantGroupId, @ipAddress, @userAgent)
      `);
  }

  /**
   * Get default tenant for a user
   */
  async getDefaultTenant(email: string): Promise<AvailableTenant | null> {
    const groups = await this.getUserAvailableTenants(email);

    for (const group of groups) {
      const defaultTenant = group.tenants.find((t) => t.isDefault);
      if (defaultTenant) {
        return defaultTenant;
      }
    }

    // If no default, return the first one
    if (groups.length > 0 && groups[0].tenants.length > 0) {
      return groups[0].tenants[0];
    }

    return null;
  }

  /**
   * Grant user access to a tenant
   */
  async grantUserAccess(
    email: string,
    tenantId: number,
    tenantGroupId: number,
    accessLevel: string = 'user',
    grantedBy?: number,
  ): Promise<void> {
    const mainPool = this.databaseService.getMainConnection();

    await mainPool
      .request()
      .input('email', sql.NVarChar, email)
      .input('tenantId', sql.Int, tenantId)
      .input('tenantGroupId', sql.Int, tenantGroupId)
      .input('accessLevel', sql.NVarChar, accessLevel)
      .input('grantedBy', sql.Int, grantedBy || null).query(`
        INSERT INTO user_tenant_access (email, tenant_id, tenant_group_id, access_level, granted_by)
        VALUES (@email, @tenantId, @tenantGroupId, @accessLevel, @grantedBy)
      `);
  }

  /**
   * Revoke user access to a tenant
   */
  async revokeUserAccess(email: string, tenantId: number): Promise<void> {
    const mainPool = this.databaseService.getMainConnection();

    await mainPool
      .request()
      .input('email', sql.NVarChar, email)
      .input('tenantId', sql.Int, tenantId).query(`
        UPDATE user_tenant_access
        SET can_access = 0, revoked_at = GETDATE()
        WHERE email = @email AND tenant_id = @tenantId
      `);
  }
}
