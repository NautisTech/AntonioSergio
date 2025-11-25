// ==================== USER PROFILE TYPES ====================

export interface UserProfile {
    id: number
    name: string
    description?: string
    isDefault: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
    userCount?: number
    permissionCount?: number
}

export interface UserProfileDetail extends UserProfile {
    permissions?: Array<{
        id: number
        slug: string
        name: string
        category?: string
    }>
    users?: Array<{
        id: number
        email: string
        fullName: string
    }>
}

// ==================== USER PROFILE DTOs ====================

export interface CreateUserProfileDto {
    name: string
    description?: string
    isDefault?: boolean
    permissionIds?: number[]
}

export interface UpdateUserProfileDto {
    name?: string
    description?: string
    isDefault?: boolean
}

export interface AssignPermissionsDto {
    permissionIds: number[]
}

export interface AssignUsersDto {
    userIds: number[]
}

// ==================== QUERY FILTERS ====================

export interface UserProfileListFilters {
    includeDeleted?: boolean
}
