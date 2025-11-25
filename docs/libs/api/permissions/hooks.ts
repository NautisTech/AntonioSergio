import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { permissionsAPI } from './api'
import type {
    Permission,
    PermissionListResponse,
    PermissionListFilters,
} from './types'

// ==================== QUERY KEYS ====================
export const permissionsKeys = {
    all: ['permissions'] as const,
    lists: () => [...permissionsKeys.all, 'list'] as const,
    list: (filters?: PermissionListFilters) => [...permissionsKeys.lists(), filters] as const,
    categories: () => [...permissionsKeys.all, 'categories'] as const,
    modules: () => [...permissionsKeys.all, 'modules'] as const,
    myPermissions: () => [...permissionsKeys.all, 'my-permissions'] as const,
    details: () => [...permissionsKeys.all, 'detail'] as const,
    detail: (id: number) => [...permissionsKeys.details(), id] as const,
    byCode: (code: string) => [...permissionsKeys.all, 'code', code] as const,
    bySlug: (slug: string) => [...permissionsKeys.all, 'slug', slug] as const, // Legacy
}

// ==================== QUERIES ====================

/**
 * Fetch list of permissions with optional filters
 */
export function usePermissions(
    filters?: PermissionListFilters,
    options?: Omit<UseQueryOptions<PermissionListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: permissionsKeys.list(filters),
        queryFn: () => permissionsAPI.list(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes - permissions rarely change
        ...options,
    })
}

/**
 * Fetch all permission categories
 */
export function usePermissionCategories(
    options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: permissionsKeys.categories(),
        queryFn: () => permissionsAPI.getCategories(),
        staleTime: 15 * 60 * 1000, // 15 minutes - categories very rarely change
        ...options,
    })
}

/**
 * Fetch all permission modules
 */
export function usePermissionModules(
    options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: permissionsKeys.modules(),
        queryFn: () => permissionsAPI.getModules(),
        staleTime: 15 * 60 * 1000, // 15 minutes - modules very rarely change
        ...options,
    })
}

/**
 * Fetch current user's permissions (direct + from profiles)
 */
export function useMyPermissions(
    options?: Omit<UseQueryOptions<Permission[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: permissionsKeys.myPermissions(),
        queryFn: () => permissionsAPI.getMyPermissions(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}

/**
 * Fetch a single permission by ID
 */
export function usePermission(
    id: number,
    options?: Omit<UseQueryOptions<Permission>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: permissionsKeys.detail(id),
        queryFn: () => permissionsAPI.getById(id),
        enabled: !!id, // Only fetch if ID is provided
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

/**
 * Fetch a single permission by permission code
 */
export function usePermissionByCode(
    code: string,
    options?: Omit<UseQueryOptions<Permission>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: permissionsKeys.byCode(code),
        queryFn: () => permissionsAPI.getByCode(code),
        enabled: !!code, // Only fetch if code is provided
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

/**
 * @deprecated Use usePermissionByCode instead
 * Fetch a single permission by slug (legacy)
 */
export function usePermissionBySlug(
    slug: string,
    options?: Omit<UseQueryOptions<Permission>, 'queryKey' | 'queryFn'>
) {
    return usePermissionByCode(slug, options)
}

/**
 * Custom hook to check if user has a specific permission
 * @param permissionCode - The permission code to check (e.g., 'clients.list')
 * @returns boolean indicating if user has the permission
 */
export function useHasPermission(permissionCode: string): boolean {
    const { data: permissions } = useMyPermissions()

    if (!permissions) return false

    return permissions.some(p => p.permission_code === permissionCode)
}

/**
 * Custom hook to check if user has any of the specified permissions
 * @param permissionCodes - Array of permission codes to check
 * @returns boolean indicating if user has at least one permission
 */
export function useHasAnyPermission(permissionCodes: string[]): boolean {
    const { data: permissions } = useMyPermissions()

    if (!permissions || !permissionCodes.length) return false

    return permissionCodes.some(code =>
        permissions.some(p => p.permission_code === code)
    )
}

/**
 * Custom hook to check if user has all specified permissions
 * @param permissionCodes - Array of permission codes to check
 * @returns boolean indicating if user has all permissions
 */
export function useHasAllPermissions(permissionCodes: string[]): boolean {
    const { data: permissions } = useMyPermissions()

    if (!permissions || !permissionCodes.length) return false

    return permissionCodes.every(code =>
        permissions.some(p => p.permission_code === code)
    )
}
