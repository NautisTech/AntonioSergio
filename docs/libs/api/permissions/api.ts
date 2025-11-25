import { apiClient, type RequestConfig } from '../client'
import type {
    Permission,
    PermissionListResponse,
    PermissionListFilters,
} from './types'

class PermissionsAPI {
    private baseUrl = '/permissions'

    /**
     * List all permissions with pagination and filters
     */
    async list(
        filters?: PermissionListFilters,
        config?: RequestConfig
    ): Promise<PermissionListResponse> {
        const params = new URLSearchParams()

        if (filters?.category) params.append('category', filters.category)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.limit) params.append('limit', String(filters.limit))
        if (filters?.offset) params.append('offset', String(filters.offset))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<PermissionListResponse>(url, config)
    }

    /**
     * Get all permission categories
     */
    async getCategories(config?: RequestConfig): Promise<string[]> {
        return apiClient.get<string[]>(`${this.baseUrl}/categories`, config)
    }

    /**
     * Get all permission modules
     */
    async getModules(config?: RequestConfig): Promise<string[]> {
        return apiClient.get<string[]>(`${this.baseUrl}/modules`, config)
    }

    /**
     * Get current user permissions (direct + from user profiles)
     */
    async getMyPermissions(config?: RequestConfig): Promise<Permission[]> {
        return apiClient.get<Permission[]>(`${this.baseUrl}/me`, config)
    }

    /**
     * Get permission by ID
     */
    async getById(id: number, config?: RequestConfig): Promise<Permission> {
        return apiClient.get<Permission>(`${this.baseUrl}/${id}`, config)
    }

    /**
     * Get permission by code (permission_code)
     */
    async getByCode(code: string, config?: RequestConfig): Promise<Permission> {
        return apiClient.get<Permission>(`${this.baseUrl}/code/${code}`, config)
    }

    /**
     * @deprecated Use getByCode instead
     * Get permission by slug (legacy method)
     */
    async getBySlug(slug: string, config?: RequestConfig): Promise<Permission> {
        return this.getByCode(slug, config)
    }
}

export const permissionsAPI = new PermissionsAPI()
