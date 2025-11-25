import { apiClient, type RequestConfig } from '../client'
import type {
    User,
    UserDetail,
    UserListResponse,
    UserListFilters,
    CreateUserDto,
    UpdateUserDto,
    ChangePasswordDto,
    AssignCompaniesDto,
    AssignProfilesDto,
    AssignPermissionsDto,
} from './types'

class UsersAPI {
    private baseUrl = '/users'

    /**
     * List all users with pagination and filters
     */
    async list(filters?: UserListFilters, config?: RequestConfig): Promise<UserListResponse> {
        const params = new URLSearchParams()

        if (filters?.search) params.append('search', filters.search)
        if (filters?.isAdmin !== undefined) params.append('isAdmin', String(filters.isAdmin))
        if (filters?.includeDeleted !== undefined) params.append('includeDeleted', String(filters.includeDeleted))
        if (filters?.limit) params.append('limit', String(filters.limit))
        if (filters?.offset) params.append('offset', String(filters.offset))

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<UserListResponse>(url, config)
    }

    /**
     * Get user by ID with optional detailed information
     */
    async getById(id: number, includeDetails: boolean = false, config?: RequestConfig): Promise<UserDetail> {
        const params = includeDetails ? '?includeDetails=true' : ''
        return apiClient.get<UserDetail>(`${this.baseUrl}/${id}${params}`, config)
    }

    /**
     * Create new user
     */
    async create(data: CreateUserDto, config?: RequestConfig): Promise<User> {
        return apiClient.post<User>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'User created successfully',
            }
        )
    }

    /**
     * Update user
     */
    async update(id: number, data: UpdateUserDto, config?: RequestConfig): Promise<User> {
        return apiClient.put<User>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'User updated successfully',
            }
        )
    }

    /**
     * Delete user (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'User deleted successfully',
            }
        )
    }

    /**
     * Change user password
     */
    async changePassword(
        id: number,
        data: ChangePasswordDto,
        config?: RequestConfig
    ): Promise<void> {
        return apiClient.put<void>(
            `${this.baseUrl}/${id}/password`,
            data,
            {
                ...config,
                successMessage: 'Password changed successfully',
            }
        )
    }

    /**
     * Assign companies to user
     */
    async assignCompanies(
        id: number,
        data: AssignCompaniesDto,
        config?: RequestConfig
    ): Promise<void> {
        return apiClient.put<void>(
            `${this.baseUrl}/${id}/companies`,
            data,
            {
                ...config,
                successMessage: 'Companies assigned successfully',
            }
        )
    }

    /**
     * Assign user profiles to user
     */
    async assignProfiles(
        id: number,
        data: AssignProfilesDto,
        config?: RequestConfig
    ): Promise<void> {
        return apiClient.put<void>(
            `${this.baseUrl}/${id}/profiles`,
            data,
            {
                ...config,
                successMessage: 'User profiles assigned successfully',
            }
        )
    }

    /**
     * Assign direct permissions to user
     */
    async assignPermissions(
        id: number,
        data: AssignPermissionsDto,
        config?: RequestConfig
    ): Promise<void> {
        return apiClient.put<void>(
            `${this.baseUrl}/${id}/permissions`,
            data,
            {
                ...config,
                successMessage: 'Permissions assigned successfully',
            }
        )
    }
}

export const usersAPI = new UsersAPI()
