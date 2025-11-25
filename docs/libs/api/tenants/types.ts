// ==================== TENANT TYPES ====================

export interface Tenant {
    id: number
    name: string
    slug: string
    domain?: string
    databaseName: string
    logoUrl?: string
    faviconUrl?: string
    primaryColor?: string
    secondaryColor?: string
    subscriptionPlanId?: number
    subscriptionStatus?: string
    subscriptionStartsAt?: string
    subscriptionExpiresAt?: string
    trialEndsAt?: string
    maxUsers?: number
    maxStorageGb?: number
    currentUsersCount?: number
    currentStorageGb?: number
    lastActivityAt?: string
    billingEmail?: string
    billingName?: string
    taxId?: string
    timezone?: string
    locale?: string
    databaseVersion?: string
    createdAt: string
    updatedAt?: string
    createdBy?: number
    updatedBy?: number
}

export interface CreateTenantDto {
    name: string
    slug: string
    domain?: string
    databaseName: string
}

export interface UpdateTenantDto {
    name?: string
    slug?: string
    domain?: string
    databaseName?: string
}

export interface TenantStats {
    totalTenants: number
    activeTenants: number
    inactiveTenants: number
    trialTenants?: number
    activeSubscriptions?: number
    firstTenantDate?: string
    lastTenantDate?: string
}

export interface TenantDatabaseStats {
    tenant: {
        id: number
        name: string
        slug: string
    }
    stats: {
        totalUsers?: number
        totalCompanies?: number
        totalClients?: number
        totalProducts?: number
        totalEquipment?: number
        totalContent?: number
        totalOrders?: number
        totalQuotes?: number
    }
    error?: string
}

export interface ConnectionTest {
    success: boolean
    message: string
    error?: string
    database: string
}

export interface HealthCheck {
    success: boolean
    database: string
    connectionTimeMs: number
    criticalTablesExist: boolean
    timestamp: string
}

// ==================== TENANT SETTINGS (Tenant DB) ====================

export enum SettingValueType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    JSON = 'json',
}

export interface TenantSetting {
    id: number
    key: string
    value: string
    valueType: SettingValueType
    category?: string
    description?: string
    isPublic: boolean
    isEncrypted: boolean
    createdAt: string
    updatedAt?: string
}

export interface CreateSettingDto {
    key: string
    value?: string
    valueType: SettingValueType
    category?: string
    description?: string
    isPublic?: boolean
    isEncrypted?: boolean
}

export interface UpdateSettingDto {
    key?: string
    value?: string
    valueType?: SettingValueType
    category?: string
    description?: string
    isPublic?: boolean
    isEncrypted?: boolean
}

export interface BulkUpdateSettingsDto {
    settings: Array<{ key: string; value: string }>
}

export interface PublicSettingsResponse {
    success: boolean
    data: {
        tenantId: number
        tenantName: string
        tenantSlug: string
        settings: Array<{
            key: string
            value: string
            category?: string
            type?: string
            description?: string
            isPublic?: boolean
        }>
    }
}

// ==================== MODULES ====================

export interface Module {
    id: number
    code: string
    name: string
    description?: string
    icon?: string
    route?: string
    category?: string
    displayOrder: number
    minPlanLevel?: number
    isCore: boolean
    isActive: boolean
    version?: string
    totalPermissions?: number
    createdAt: string
    updatedAt?: string
}

export interface TenantModule {
    id: number
    tenantId: number
    moduleId: number
    code: string
    name: string
    description?: string
    icon?: string
    route?: string
    version?: string
    active: boolean
    activationDate?: string
    expirationDate?: string
    createdAt: string
    updatedAt?: string
}

export interface AssignModuleDto {
    moduleId: number
    active?: boolean
    activationDate?: string
    expirationDate?: string
}

export interface UpdateTenantModuleDto {
    active?: boolean
    activationDate?: string
    expirationDate?: string
}

export interface CreateModuleDto {
    code: string
    name: string
    description?: string
    icon?: string
    route?: string
    category?: string
    displayOrder: number
    minPlanLevel?: number
    isCore?: boolean
    isActive?: boolean
    version?: string
}

export interface UpdateModuleDto {
    name?: string
    description?: string
    icon?: string
    route?: string
    category?: string
    displayOrder?: number
    minPlanLevel?: number
    isCore?: boolean
    isActive?: boolean
    version?: string
}

// ==================== TENANT CONFIGS (Main DB) ====================

export interface TenantConfig {
    id: number
    tenantId: number
    code: string
    description: string
    value: string
    encrypted: boolean
    createdAt: string
    updatedAt?: string
}

export interface CreateTenantConfigDto {
    code: string
    description: string
    value?: string
    encrypt?: boolean
}

export interface UpdateTenantConfigDto {
    code?: string
    description?: string
    value?: string
    encrypt?: boolean
}

// ==================== GLOBAL SETTINGS (Main DB) ====================

export interface GlobalSetting {
    id: number
    code: string
    category?: string
    type?: string
    description: string
    value: string
    isEncrypted: boolean
    isSystem: boolean
    createdAt: string
    updatedAt?: string
}

export interface CreateGlobalSettingDto {
    code: string
    description: string
    value?: string
    encrypt?: boolean
}

export interface UpdateGlobalSettingDto {
    code?: string
    description?: string
    value?: string
    encrypt?: boolean
}

// ==================== PERMISSION TEMPLATES ====================

export interface PermissionTemplate {
    id: number
    moduleCode: string
    permissionCode: string
    name: string
    description?: string
    action?: string
    resource?: string
    isDangerous: boolean
    moduleName?: string
    moduleOrder?: number
    createdAt: string
    updatedAt?: string
}

export interface CreatePermissionTemplateDto {
    moduleCode: string
    permissionCode: string
    name: string
    description?: string
    action?: string
    resource?: string
    isDangerous?: boolean
}

export interface UpdatePermissionTemplateDto {
    name?: string
    description?: string
    action?: string
    resource?: string
    isDangerous?: boolean
}

// ==================== DEPLOY ====================

export interface DeployCommandResponse {
    success: boolean
    output: string
    error?: string
}
