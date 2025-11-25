import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PermissionsService } from '../permissions/permissions.service';
import { TenantsService } from '../tenants/tenants.service';
import { MenuResponseDto, MenuSectionDto, MenuItemDto } from './dto/core.dto';
import * as sql from 'mssql';

@Injectable()
export class CoreService {
  private readonly logger = new Logger(CoreService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly permissionsService: PermissionsService,
    private readonly tenantsService: TenantsService,
  ) { }

  // ==================== HELPER METHODS ====================

  /**
   * Get tenant database connection
   */
  private async getTenantConnection(tenantId?: number) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.databaseService.getTenantConnection(tenantId);
  }

  /**
   * Get main database connection
   */
  private getMainConnection() {
    return this.databaseService.getMainConnection();
  }

  // ==================== SERVICE METHODS ====================

  /**
   * Get user menu based on modules and permissions
   */
  async getUserMenu(tenantId: number, userId: number): Promise<MenuResponseDto> {
    try {
      // Get user permissions
      const permissions = await this.permissionsService.getUserPermissions(tenantId, userId);
      const userPermissions = permissions.map(p => p.permission_code);

      // Get tenant modules (only active modules)
      const tenantModules = await this.tenantsService.findTenantModules(tenantId);
      const activeModules = tenantModules.filter(m => m.active);
      const userModules = activeModules.map(m => m.code);

      // Build menu sections based on modules and permissions
      const sections: MenuSectionDto[] = [];

      // Helper function to check if user has permission
      const hasPermission = (permission: string) => userPermissions.includes(permission);

      // Helper function to check if user has module
      const hasModule = (moduleCode: string) => userModules.includes(moduleCode);

      // ==================== SYSTEM SECTION ====================
      const systemChildren: MenuItemDto[] = [
        {
          label: 'Settings',
          icon: 'tabler-settings-cog',
          href: '/system/settings'
        },
        {
          label: 'Connections',
          icon: 'tabler-plug-connected',
          href: '/system/connections'
        }
      ];

      if (systemChildren.length > 0) {
        sections.push({
          label: 'System',
          children: systemChildren
        });
      }

      return {
        sections,
        userModules,
        userPermissions
      };
    } catch (error) {
      this.logger.error(`Error getting user menu: ${error.message}`, error.stack);
      throw error;
    }
  }

}
