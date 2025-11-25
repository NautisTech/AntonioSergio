import { apiClient, type RequestConfig } from '../client'
import type {
    Tenant,
    CreateTenantDto,
    UpdateTenantDto,
    TenantStats,
    TenantDatabaseStats,
    ConnectionTest,
    HealthCheck,
    TenantSetting,
    CreateSettingDto,
    UpdateSettingDto,
    BulkUpdateSettingsDto,
    PublicSettingsResponse,
    Module,
    TenantModule,
    AssignModuleDto,
    UpdateTenantModuleDto,
    CreateModuleDto,
    UpdateModuleDto,
    TenantConfig,
    CreateTenantConfigDto,
    UpdateTenantConfigDto,
    GlobalSetting,
    CreateGlobalSettingDto,
    UpdateGlobalSettingDto,
    PermissionTemplate,
    CreatePermissionTemplateDto,
    UpdatePermissionTemplateDto,
    DeployCommandResponse,
} from './types'

class TenantsAPI {
    private baseUrl = '/tenants'

    // ==================== TENANT MANAGEMENT ====================

    /**
     * Create new tenant
     */
    async create(data: CreateTenantDto, config?: RequestConfig): Promise<Tenant> {
        return apiClient.post<Tenant>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'Tenant created successfully',
            }
        )
    }

    /**
     * List all tenants
     */
    async list(config?: RequestConfig): Promise<Tenant[]> {
        return apiClient.get<Tenant[]>(this.baseUrl, config)
    }

    /**
     * Get global tenant statistics
     */
    async getStats(config?: RequestConfig): Promise<TenantStats> {
        return apiClient.get<TenantStats>(`${this.baseUrl}/stats`, config)
    }

    /**
     * Get tenant by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Tenant> {
        return apiClient.get<Tenant>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Get tenant database statistics
     */
    async getDatabaseStats(id: number, config?: RequestConfig): Promise<TenantDatabaseStats> {
        return apiClient.get<TenantDatabaseStats>(`${this.baseUrl}/${id}/database-stats`, config)
    }

    /**
     * Test tenant database connection
     */
    async testConnection(id: number, config?: RequestConfig): Promise<ConnectionTest> {
        return apiClient.post<ConnectionTest>(`${this.baseUrl}/${id}/test-connection`, {}, config)
    }

    /**
     * Health check for tenant database
     */
    async healthCheck(id: number, config?: RequestConfig): Promise<HealthCheck> {
        return apiClient.get<HealthCheck>(`${this.baseUrl}/${id}/health`, config)
    }

    /**
     * Update tenant
     */
    async update(id: number, data: UpdateTenantDto, config?: RequestConfig): Promise<Tenant> {
        return apiClient.put<Tenant>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'Tenant updated successfully',
            }
        )
    }

    /**
     * Delete tenant (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'Tenant deleted successfully',
            }
        )
    }

    // ==================== TENANT SETTINGS (Tenant DB) ====================

    /**
     * List all tenant settings from current user's tenant database
     */
    async findAllSettings(config?: RequestConfig): Promise<TenantSetting[]> {
        return apiClient.get<TenantSetting[]>(`${this.baseUrl}/settings`, config)
    }

    /**
     * Get setting by key from current user's tenant
     */
    async findSettingByKey(key: string, config?: RequestConfig): Promise<TenantSetting> {
        return apiClient.get<TenantSetting>(`${this.baseUrl}/settings/${key}`, config)
    }

    /**
     * Create new tenant setting in current user's tenant
     */
    async createSetting(
        data: CreateSettingDto,
        config?: RequestConfig
    ): Promise<TenantSetting> {
        return apiClient.post<TenantSetting>(
            `${this.baseUrl}/settings`,
            data,
            {
                ...config,
                successMessage: 'Setting created successfully',
            }
        )
    }

    /**
     * Update tenant setting in current user's tenant
     */
    async updateSetting(
        key: string,
        data: UpdateSettingDto,
        config?: RequestConfig
    ): Promise<TenantSetting> {
        return apiClient.put<TenantSetting>(
            `${this.baseUrl}/settings/${key}`,
            data,
            {
                ...config,
                successMessage: 'Setting updated successfully',
            }
        )
    }

    /**
     * Bulk update tenant settings in current user's tenant
     */
    async bulkUpdateSettings(
        data: BulkUpdateSettingsDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; updated: number }> {
        return apiClient.put<{ success: boolean; updated: number }>(
            `${this.baseUrl}/settings-bulk`,
            data,
            {
                ...config,
                successMessage: 'Settings updated successfully',
            }
        )
    }

    /**
     * Delete tenant setting from current user's tenant
     */
    async removeSetting(key: string, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/settings/${key}`,
            {
                ...config,
                successMessage: 'Setting deleted successfully',
            }
        )
    }

    /**
     * Get public tenant settings by slug (no authentication required)
     */
    async getPublicSettings(slug: string, config?: RequestConfig): Promise<PublicSettingsResponse> {
        return apiClient.get<PublicSettingsResponse>(
            `${this.baseUrl}/public/${slug}/settings`,
            {
                ...config,
                showErrorToast: false,
            }
        )
    }

    // ==================== MODULES ====================

    /**
     * List all available modules
     */
    async findAllModules(config?: RequestConfig): Promise<Module[]> {
        return apiClient.get<Module[]>(`${this.baseUrl}/modules/available`, config)
    }

    /**
     * List tenant modules
     */
    async findTenantModules(tenantId: number, config?: RequestConfig): Promise<TenantModule[]> {
        return apiClient.get<TenantModule[]>(`${this.baseUrl}/${tenantId}/modules`, config)
    }

    /**
     * Assign module to tenant
     */
    async assignModule(
        tenantId: number,
        data: AssignModuleDto,
        config?: RequestConfig
    ): Promise<TenantModule> {
        return apiClient.post<TenantModule>(
            `${this.baseUrl}/${tenantId}/modules`,
            data,
            {
                ...config,
                successMessage: 'Module assigned successfully',
            }
        )
    }

    /**
     * Update tenant module
     */
    async updateTenantModule(
        tenantId: number,
        moduleId: number,
        data: UpdateTenantModuleDto,
        config?: RequestConfig
    ): Promise<TenantModule> {
        return apiClient.put<TenantModule>(
            `${this.baseUrl}/${tenantId}/modules/${moduleId}`,
            data,
            {
                ...config,
                successMessage: 'Module updated successfully',
            }
        )
    }

    /**
     * Remove module from tenant
     */
    async removeModule(tenantId: number, moduleId: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${tenantId}/modules/${moduleId}`,
            {
                ...config,
                successMessage: 'Module removed successfully',
            }
        )
    }

    // ==================== TENANT CONFIGS (Main DB) ====================

    /**
     * List tenant configurations
     */
    async findAllTenantConfigs(tenantId: number, config?: RequestConfig): Promise<TenantConfig[]> {
        return apiClient.get<TenantConfig[]>(`${this.baseUrl}/${tenantId}/configs`, config)
    }

    /**
     * Create tenant configuration
     */
    async createTenantConfig(
        tenantId: number,
        data: CreateTenantConfigDto,
        config?: RequestConfig
    ): Promise<TenantConfig> {
        return apiClient.post<TenantConfig>(
            `${this.baseUrl}/${tenantId}/configs`,
            data,
            {
                ...config,
                successMessage: 'Configuration created successfully',
            }
        )
    }

    /**
     * Update tenant configuration
     */
    async updateTenantConfig(
        tenantId: number,
        configId: number,
        data: UpdateTenantConfigDto,
        config?: RequestConfig
    ): Promise<TenantConfig> {
        return apiClient.put<TenantConfig>(
            `${this.baseUrl}/${tenantId}/configs/${configId}`,
            data,
            {
                ...config,
                successMessage: 'Configuration updated successfully',
            }
        )
    }

    /**
     * Delete tenant configuration
     */
    async removeTenantConfig(tenantId: number, configId: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${tenantId}/configs/${configId}`,
            {
                ...config,
                successMessage: 'Configuration deleted successfully',
            }
        )
    }

    // ==================== GLOBAL SETTINGS (Main DB) ====================

    /**
     * List all global system settings
     */
    async findAllGlobalSettings(config?: RequestConfig): Promise<GlobalSetting[]> {
        return apiClient.get<GlobalSetting[]>(`${this.baseUrl}/global-settings`, config)
    }

    /**
     * Get global setting by ID
     */
    async findGlobalSettingById(id: number, config?: RequestConfig): Promise<GlobalSetting> {
        return apiClient.get<GlobalSetting>(`${this.baseUrl}/global-settings/${id}`, config)
    }

    /**
     * Get global setting by key
     */
    async findGlobalSettingByKey(key: string, config?: RequestConfig): Promise<GlobalSetting> {
        return apiClient.get<GlobalSetting>(`${this.baseUrl}/global-settings/key/${key}`, config)
    }

    /**
     * Create global system setting
     */
    async createGlobalSetting(data: CreateGlobalSettingDto, config?: RequestConfig): Promise<GlobalSetting> {
        return apiClient.post<GlobalSetting>(
            `${this.baseUrl}/global-settings`,
            data,
            {
                ...config,
                successMessage: 'Global setting created successfully',
            }
        )
    }

    /**
     * Update global system setting
     */
    async updateGlobalSetting(
        id: number,
        data: UpdateGlobalSettingDto,
        config?: RequestConfig
    ): Promise<GlobalSetting> {
        return apiClient.put<GlobalSetting>(
            `${this.baseUrl}/global-settings/${id}`,
            data,
            {
                ...config,
                successMessage: 'Global setting updated successfully',
            }
        )
    }

    /**
     * Delete global system setting
     */
    async removeGlobalSetting(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/global-settings/${id}`,
            {
                ...config,
                successMessage: 'Global setting deleted successfully',
            }
        )
    }

    // ==================== MODULE MANAGEMENT ====================

    /**
     * Create new module
     */
    async createModule(data: CreateModuleDto, config?: RequestConfig): Promise<Module> {
        return apiClient.post<Module>(
            `${this.baseUrl}/modules`,
            data,
            {
                ...config,
                successMessage: 'Module created successfully',
            }
        )
    }

    /**
     * Get module by ID
     */
    async getModuleById(id: number, config?: RequestConfig): Promise<Module> {
        return apiClient.get<Module>(`${this.baseUrl}/modules/${id}`, config)
    }

    /**
     * Update module
     */
    async updateModule(id: number, data: UpdateModuleDto, config?: RequestConfig): Promise<Module> {
        return apiClient.put<Module>(
            `${this.baseUrl}/modules/${id}`,
            data,
            {
                ...config,
                successMessage: 'Module updated successfully',
            }
        )
    }

    /**
     * Delete module (soft delete)
     */
    async deleteModule(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/modules/${id}`,
            {
                ...config,
                successMessage: 'Module deleted successfully',
            }
        )
    }

    // ==================== PERMISSION TEMPLATES ====================

    /**
     * List module permission templates
     */
    async findModulePermissionTemplates(
        moduleCode: string,
        config?: RequestConfig
    ): Promise<PermissionTemplate[]> {
        return apiClient.get<PermissionTemplate[]>(
            `${this.baseUrl}/modules/${moduleCode}/permission-templates`,
            config
        )
    }

    /**
     * List all permission templates
     */
    async findAllPermissionTemplates(config?: RequestConfig): Promise<PermissionTemplate[]> {
        return apiClient.get<PermissionTemplate[]>(`${this.baseUrl}/permission-templates`, config)
    }

    /**
     * Create permission template
     */
    async createPermissionTemplate(
        data: CreatePermissionTemplateDto,
        config?: RequestConfig
    ): Promise<PermissionTemplate> {
        return apiClient.post<PermissionTemplate>(
            `${this.baseUrl}/permission-templates`,
            data,
            {
                ...config,
                successMessage: 'Permission template created successfully',
            }
        )
    }

    /**
     * Update permission template
     */
    async updatePermissionTemplate(
        id: number,
        data: UpdatePermissionTemplateDto,
        config?: RequestConfig
    ): Promise<PermissionTemplate> {
        return apiClient.put<PermissionTemplate>(
            `${this.baseUrl}/permission-templates/${id}`,
            data,
            {
                ...config,
                successMessage: 'Permission template updated successfully',
            }
        )
    }

    /**
     * Delete permission template
     */
    async deletePermissionTemplate(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/permission-templates/${id}`,
            {
                ...config,
                successMessage: 'Permission template deleted successfully',
            }
        )
    }

    // ==================== DEPLOY ====================

    /**
     * Execute Docker build for tenant
     * Note: Deploy commands are disabled in current schema version. Use external CI/CD.
     */
    async executeDockerBuild(tenantId: number, config?: RequestConfig): Promise<DeployCommandResponse> {
        return apiClient.post<DeployCommandResponse>(
            `${this.baseUrl}/${tenantId}/deploy/docker-build`,
            {},
            {
                ...config,
                successMessage: 'Docker build executed successfully',
            }
        )
    }

    /**
     * Execute Docker push for tenant
     * Note: Deploy commands are disabled in current schema version. Use external CI/CD.
     */
    async executeDockerPush(tenantId: number, config?: RequestConfig): Promise<DeployCommandResponse> {
        return apiClient.post<DeployCommandResponse>(
            `${this.baseUrl}/${tenantId}/deploy/docker-push`,
            {},
            {
                ...config,
                successMessage: 'Docker push executed successfully',
            }
        )
    }

    /**
     * Execute CapRover deploy for tenant
     * Note: Deploy commands are disabled in current schema version. Use external CI/CD.
     */
    async executeCaproverDeploy(tenantId: number, config?: RequestConfig): Promise<DeployCommandResponse> {
        return apiClient.post<DeployCommandResponse>(
            `${this.baseUrl}/${tenantId}/deploy/caprover`,
            {},
            {
                ...config,
                successMessage: 'CapRover deploy executed successfully',
            }
        )
    }
}

export const tenantsAPI = new TenantsAPI()
