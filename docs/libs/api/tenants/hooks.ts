import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { tenantsAPI } from './api'
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
} from './types'

// ==================== QUERY KEYS ====================
export const tenantsKeys = {
    all: ['tenants'] as const,
    lists: () => [...tenantsKeys.all, 'list'] as const,
    list: () => [...tenantsKeys.lists()] as const,
    stats: () => [...tenantsKeys.all, 'stats'] as const,
    details: () => [...tenantsKeys.all, 'detail'] as const,
    detail: (id: number) => [...tenantsKeys.details(), id] as const,
    databaseStats: (id: number) => [...tenantsKeys.all, 'database-stats', id] as const,
    publicSettings: (slug: string) => [...tenantsKeys.all, 'public-settings', slug] as const,

    // Settings (tenant DB)
    settings: (tenantId: number) => [...tenantsKeys.detail(tenantId), 'settings'] as const,
    setting: (tenantId: number, key: string) => [...tenantsKeys.settings(tenantId), key] as const,

    // Modules
    allModules: () => [...tenantsKeys.all, 'modules', 'available'] as const,
    tenantModules: (tenantId: number) => [...tenantsKeys.detail(tenantId), 'modules'] as const,
    moduleDetail: (id: number) => [...tenantsKeys.all, 'modules', id] as const,

    // Configs (main DB)
    configs: (tenantId: number) => [...tenantsKeys.detail(tenantId), 'configs'] as const,

    // Global Settings (main DB)
    globalSettings: () => [...tenantsKeys.all, 'global-settings'] as const,
    globalSetting: (id: number) => [...tenantsKeys.globalSettings(), id] as const,
    globalSettingByKey: (key: string) => [...tenantsKeys.globalSettings(), 'key', key] as const,

    // Permission Templates
    permissionTemplates: () => [...tenantsKeys.all, 'permission-templates'] as const,
    modulePermissionTemplates: (moduleCode: string) =>
        [...tenantsKeys.permissionTemplates(), 'module', moduleCode] as const,
}

// ==================== TENANT MANAGEMENT QUERIES ====================

/**
 * List all tenants
 */
export function useTenants(
    options?: Omit<UseQueryOptions<Tenant[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.list(),
        queryFn: () => tenantsAPI.list(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get tenant statistics
 */
export function useTenantStats(
    options?: Omit<UseQueryOptions<TenantStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.stats(),
        queryFn: () => tenantsAPI.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get tenant by ID
 */
export function useTenant(
    id: number,
    options?: Omit<UseQueryOptions<Tenant>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.detail(id),
        queryFn: () => tenantsAPI.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get tenant database statistics
 */
export function useTenantDatabaseStats(
    id: number,
    options?: Omit<UseQueryOptions<TenantDatabaseStats>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.databaseStats(id),
        queryFn: () => tenantsAPI.getDatabaseStats(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    })
}

/**
 * Get public tenant settings by slug
 */
export function usePublicSettings(
    slug: string,
    options?: Omit<UseQueryOptions<PublicSettingsResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.publicSettings(slug),
        queryFn: () => tenantsAPI.getPublicSettings(slug),
        enabled: !!slug,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    })
}

// ==================== TENANT MANAGEMENT MUTATIONS ====================

/**
 * Create tenant
 */
export function useCreateTenant(
    options?: Omit<UseMutationOptions<Tenant, Error, CreateTenantDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTenantDto) => tenantsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: tenantsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Update tenant
 */
export function useUpdateTenant(
    options?: Omit<UseMutationOptions<Tenant, Error, { id: number; data: UpdateTenantDto }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTenantDto }) =>
            tenantsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: tenantsKeys.detail(id) })
        },
        ...options,
    })
}

/**
 * Delete tenant
 */
export function useDeleteTenant(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => tenantsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: tenantsKeys.stats() })
        },
        ...options,
    })
}

/**
 * Test tenant database connection
 */
export function useTestConnection(
    options?: Omit<UseMutationOptions<ConnectionTest, Error, number>, 'mutationFn'>
) {
    return useMutation({
        mutationFn: (id: number) => tenantsAPI.testConnection(id),
        ...options,
    })
}

/**
 * Health check for tenant database
 */
export function useHealthCheck(
    id: number,
    options?: Omit<UseQueryOptions<HealthCheck>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: [...tenantsKeys.detail(id), 'health'],
        queryFn: () => tenantsAPI.healthCheck(id),
        enabled: !!id,
        staleTime: 1 * 60 * 1000, // 1 minute
        ...options,
    })
}

// ==================== TENANT SETTINGS QUERIES ====================

/**
 * List all tenant settings from current user's tenant
 */
export function useTenantSettings(
    options?: Omit<UseQueryOptions<TenantSetting[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: [...tenantsKeys.all, 'my-settings'] as const,
        queryFn: () => tenantsAPI.findAllSettings(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get setting by key from current user's tenant
 */
export function useTenantSetting(
    key: string,
    options?: Omit<UseQueryOptions<TenantSetting>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: [...tenantsKeys.all, 'my-setting', key] as const,
        queryFn: () => tenantsAPI.findSettingByKey(key),
        enabled: !!key,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== TENANT SETTINGS MUTATIONS ====================

/**
 * Create tenant setting in current user's tenant
 */
export function useCreateTenantSetting(
    options?: Omit<
        UseMutationOptions<TenantSetting, Error, CreateSettingDto>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateSettingDto) =>
            tenantsAPI.createSetting(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...tenantsKeys.all, 'my-settings'] })
        },
        ...options,
    })
}

/**
 * Update tenant setting in current user's tenant
 */
export function useUpdateTenantSetting(
    options?: Omit<
        UseMutationOptions<
            TenantSetting,
            Error,
            { key: string; data: UpdateSettingDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ key, data }: { key: string; data: UpdateSettingDto }) =>
            tenantsAPI.updateSetting(key, data),
        onSuccess: (_, { key }) => {
            queryClient.invalidateQueries({ queryKey: [...tenantsKeys.all, 'my-settings'] })
            queryClient.invalidateQueries({ queryKey: [...tenantsKeys.all, 'my-setting', key] })
        },
        ...options,
    })
}

/**
 * Bulk update tenant settings in current user's tenant
 */
export function useBulkUpdateTenantSettings(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; updated: number },
            Error,
            BulkUpdateSettingsDto
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BulkUpdateSettingsDto) =>
            tenantsAPI.bulkUpdateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...tenantsKeys.all, 'my-settings'] })
        },
        ...options,
    })
}

/**
 * Delete tenant setting from current user's tenant
 */
export function useDeleteTenantSetting(
    options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (key: string) =>
            tenantsAPI.removeSetting(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...tenantsKeys.all, 'my-settings'] })
        },
        ...options,
    })
}

// ==================== MODULES QUERIES ====================

/**
 * List all available modules
 */
export function useAvailableModules(
    options?: Omit<UseQueryOptions<Module[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.allModules(),
        queryFn: () => tenantsAPI.findAllModules(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

/**
 * List tenant modules
 */
export function useTenantModules(
    tenantId: number,
    options?: Omit<UseQueryOptions<TenantModule[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.tenantModules(tenantId),
        queryFn: () => tenantsAPI.findTenantModules(tenantId),
        enabled: !!tenantId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Get module by ID
 */
export function useModule(
    id: number,
    options?: Omit<UseQueryOptions<Module>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.moduleDetail(id),
        queryFn: () => tenantsAPI.getModuleById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== MODULES MUTATIONS ====================

/**
 * Assign module to tenant
 */
export function useAssignModule(
    options?: Omit<
        UseMutationOptions<TenantModule, Error, { tenantId: number; data: AssignModuleDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tenantId, data }: { tenantId: number; data: AssignModuleDto }) =>
            tenantsAPI.assignModule(tenantId, data),
        onSuccess: (_, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.tenantModules(tenantId) })
        },
        ...options,
    })
}

/**
 * Update tenant module
 */
export function useUpdateTenantModule(
    options?: Omit<
        UseMutationOptions<
            TenantModule,
            Error,
            { tenantId: number; moduleId: number; data: UpdateTenantModuleDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tenantId, moduleId, data }: {
            tenantId: number;
            moduleId: number;
            data: UpdateTenantModuleDto;
        }) => tenantsAPI.updateTenantModule(tenantId, moduleId, data),
        onSuccess: (_, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.tenantModules(tenantId) })
        },
        ...options,
    })
}

/**
 * Remove module from tenant
 */
export function useRemoveModule(
    options?: Omit<UseMutationOptions<void, Error, { tenantId: number; moduleId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tenantId, moduleId }: { tenantId: number; moduleId: number }) =>
            tenantsAPI.removeModule(tenantId, moduleId),
        onSuccess: (_, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.tenantModules(tenantId) })
        },
        ...options,
    })
}

/**
 * Create module
 */
export function useCreateModule(
    options?: Omit<UseMutationOptions<Module, Error, CreateModuleDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateModuleDto) => tenantsAPI.createModule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.allModules() })
        },
        ...options,
    })
}

/**
 * Update module
 */
export function useUpdateModule(
    options?: Omit<UseMutationOptions<Module, Error, { id: number; data: UpdateModuleDto }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateModuleDto }) =>
            tenantsAPI.updateModule(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.allModules() })
            queryClient.invalidateQueries({ queryKey: tenantsKeys.moduleDetail(id) })
        },
        ...options,
    })
}

/**
 * Delete module
 */
export function useDeleteModule(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => tenantsAPI.deleteModule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.allModules() })
        },
        ...options,
    })
}

// ==================== TENANT CONFIGS QUERIES ====================

/**
 * List tenant configurations
 */
export function useTenantConfigs(
    tenantId: number,
    options?: Omit<UseQueryOptions<TenantConfig[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.configs(tenantId),
        queryFn: () => tenantsAPI.findAllTenantConfigs(tenantId),
        enabled: !!tenantId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

// ==================== TENANT CONFIGS MUTATIONS ====================

/**
 * Create tenant configuration
 */
export function useCreateTenantConfig(
    options?: Omit<
        UseMutationOptions<TenantConfig, Error, { tenantId: number; data: CreateTenantConfigDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tenantId, data }: { tenantId: number; data: CreateTenantConfigDto }) =>
            tenantsAPI.createTenantConfig(tenantId, data),
        onSuccess: (_, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.configs(tenantId) })
        },
        ...options,
    })
}

/**
 * Update tenant configuration
 */
export function useUpdateTenantConfig(
    options?: Omit<
        UseMutationOptions<
            TenantConfig,
            Error,
            { tenantId: number; configId: number; data: UpdateTenantConfigDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tenantId, configId, data }: {
            tenantId: number;
            configId: number;
            data: UpdateTenantConfigDto;
        }) => tenantsAPI.updateTenantConfig(tenantId, configId, data),
        onSuccess: (_, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.configs(tenantId) })
        },
        ...options,
    })
}

/**
 * Delete tenant configuration
 */
export function useDeleteTenantConfig(
    options?: Omit<UseMutationOptions<void, Error, { tenantId: number; configId: number }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tenantId, configId }: { tenantId: number; configId: number }) =>
            tenantsAPI.removeTenantConfig(tenantId, configId),
        onSuccess: (_, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.configs(tenantId) })
        },
        ...options,
    })
}

// ==================== GLOBAL SETTINGS QUERIES ====================

/**
 * List all global system settings
 */
export function useGlobalSettings(
    options?: Omit<UseQueryOptions<GlobalSetting[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.globalSettings(),
        queryFn: () => tenantsAPI.findAllGlobalSettings(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

/**
 * Get global setting by ID
 */
export function useGlobalSetting(
    id: number,
    options?: Omit<UseQueryOptions<GlobalSetting>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.globalSetting(id),
        queryFn: () => tenantsAPI.findGlobalSettingById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

/**
 * Get global setting by key
 */
export function useGlobalSettingByKey(
    key: string,
    options?: Omit<UseQueryOptions<GlobalSetting>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.globalSettingByKey(key),
        queryFn: () => tenantsAPI.findGlobalSettingByKey(key),
        enabled: !!key,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

// ==================== GLOBAL SETTINGS MUTATIONS ====================

/**
 * Create global system setting
 */
export function useCreateGlobalSetting(
    options?: Omit<UseMutationOptions<GlobalSetting, Error, CreateGlobalSettingDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateGlobalSettingDto) => tenantsAPI.createGlobalSetting(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.globalSettings() })
        },
        ...options,
    })
}

/**
 * Update global system setting
 */
export function useUpdateGlobalSetting(
    options?: Omit<
        UseMutationOptions<GlobalSetting, Error, { id: number; data: UpdateGlobalSettingDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateGlobalSettingDto }) =>
            tenantsAPI.updateGlobalSetting(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.globalSettings() })
            queryClient.invalidateQueries({ queryKey: tenantsKeys.globalSetting(id) })
        },
        ...options,
    })
}

/**
 * Delete global system setting
 */
export function useDeleteGlobalSetting(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => tenantsAPI.removeGlobalSetting(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.globalSettings() })
        },
        ...options,
    })
}

// ==================== PERMISSION TEMPLATES QUERIES ====================

/**
 * List all permission templates
 */
export function usePermissionTemplates(
    options?: Omit<UseQueryOptions<PermissionTemplate[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.permissionTemplates(),
        queryFn: () => tenantsAPI.findAllPermissionTemplates(),
        staleTime: 15 * 60 * 1000, // 15 minutes
        ...options,
    })
}

/**
 * List module permission templates
 */
export function useModulePermissionTemplates(
    moduleCode: string,
    options?: Omit<UseQueryOptions<PermissionTemplate[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: tenantsKeys.modulePermissionTemplates(moduleCode),
        queryFn: () => tenantsAPI.findModulePermissionTemplates(moduleCode),
        enabled: !!moduleCode,
        staleTime: 15 * 60 * 1000, // 15 minutes
        ...options,
    })
}

// ==================== PERMISSION TEMPLATES MUTATIONS ====================

/**
 * Create permission template
 */
export function useCreatePermissionTemplate(
    options?: Omit<UseMutationOptions<PermissionTemplate, Error, CreatePermissionTemplateDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePermissionTemplateDto) => tenantsAPI.createPermissionTemplate(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.permissionTemplates() })
            queryClient.invalidateQueries({
                queryKey: tenantsKeys.modulePermissionTemplates(result.moduleCode)
            })
        },
        ...options,
    })
}

/**
 * Update permission template
 */
export function useUpdatePermissionTemplate(
    options?: Omit<
        UseMutationOptions<PermissionTemplate, Error, { id: number; data: UpdatePermissionTemplateDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePermissionTemplateDto }) =>
            tenantsAPI.updatePermissionTemplate(id, data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.permissionTemplates() })
            queryClient.invalidateQueries({
                queryKey: tenantsKeys.modulePermissionTemplates(result.moduleCode)
            })
        },
        ...options,
    })
}

/**
 * Delete permission template
 */
export function useDeletePermissionTemplate(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => tenantsAPI.deletePermissionTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantsKeys.permissionTemplates() })
        },
        ...options,
    })
}
