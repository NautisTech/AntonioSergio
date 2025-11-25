// ==================== PERMISSION TYPES ====================

export interface Permission {
    id: number
    module_code: string
    permission_code: string
    action: string
    name: string
    description?: string
    category?: string
    is_dangerous: boolean
    display_order?: number
    created_at: string
    updated_at?: string
    created_by?: number
    updated_by?: number
    deleted_at?: string | null
}

export interface PermissionListResponse {
    data: Permission[]
    total: number
    limit?: number
    offset?: number
}

// ==================== QUERY FILTERS ====================

export interface PermissionListFilters {
    category?: string
    search?: string
    limit?: number
    offset?: number
}
