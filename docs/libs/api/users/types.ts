// ==================== USER TYPES ====================

export interface User {
    id: number
    email: string
    firstName: string
    lastName: string
    fullName: string
    avatarUrl?: string
    language?: string
    timezone?: string
    theme?: 'light' | 'dark'
    isAdmin: boolean
    isVerified: boolean
    emailVerifiedAt?: string
    twoFactorEnabled: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface UserDetail extends User {
    companies?: Array<{
        id: number
        name: string
        code: string
        isPrimary: boolean
    }>
    userProfiles?: Array<{
        id: number
        name: string
        description?: string
        permissionCount: number
    }>
    directPermissions?: Array<{
        id: number
        slug: string
        name: string
        category?: string
    }>
}

export interface UserListResponse {
    data: User[]
    total: number
    limit?: number
    offset?: number
}

// ==================== USER DTOs ====================

export interface CreateUserDto {
    email: string
    password: string
    firstName: string
    lastName: string
    avatarUrl?: string
    language?: string
    timezone?: string
    theme?: 'light' | 'dark'
    isAdmin?: boolean
    companyIds?: number[]
    primaryCompanyId?: number
    userProfileIds?: number[]
    permissionIds?: number[]
}

export interface UpdateUserDto {
    email?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
    language?: string
    timezone?: string
    theme?: 'light' | 'dark'
    isAdmin?: boolean
}

export interface ChangePasswordDto {
    newPassword: string
}

export interface AssignCompaniesDto {
    companyIds: number[]
    primaryCompanyId?: number
}

export interface AssignProfilesDto {
    userProfileIds: number[]
}

export interface AssignPermissionsDto {
    permissionIds: number[]
}

// ==================== QUERY FILTERS ====================

export interface UserListFilters {
    search?: string
    isAdmin?: boolean
    includeDeleted?: boolean
    limit?: number
    offset?: number
}
