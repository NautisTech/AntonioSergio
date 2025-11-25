import { apiClient, type RequestConfig } from '../client'
import type {
    UserProfile,
    UserProfileDetail,
    UserProfileListFilters,
    CreateUserProfileDto,
    UpdateUserProfileDto,
    AssignPermissionsDto,
    AssignUsersDto,
} from './types'

class UserProfilesAPI {
    private baseUrl = '/user-profiles'

    /**
     * List all user profiles
     */
    async list(filters?: UserProfileListFilters, config?: RequestConfig): Promise<UserProfile[]> {
        const params = new URLSearchParams()

        if (filters?.includeDeleted !== undefined) {
            params.append('includeDeleted', String(filters.includeDeleted))
        }

        const queryString = params.toString()
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

        return apiClient.get<UserProfile[]>(url, config)
    }

    /**
     * Get user profile by ID with optional detailed information
     */
    async getById(
        id: number,
        includeDetails: boolean = false,
        config?: RequestConfig
    ): Promise<UserProfileDetail> {
        const params = includeDetails ? '?includeDetails=true' : ''
        return apiClient.get<UserProfileDetail>(`${this.baseUrl}/${id}${params}`, config)
    }

    /**
     * Create new user profile
     */
    async create(data: CreateUserProfileDto, config?: RequestConfig): Promise<UserProfile> {
        return apiClient.post<UserProfile>(
            this.baseUrl,
            data,
            {
                ...config,
                successMessage: 'User profile created successfully',
            }
        )
    }

    /**
     * Update user profile
     */
    async update(
        id: number,
        data: UpdateUserProfileDto,
        config?: RequestConfig
    ): Promise<UserProfile> {
        return apiClient.put<UserProfile>(
            `${this.baseUrl}/${id}`,
            data,
            {
                ...config,
                successMessage: 'User profile updated successfully',
            }
        )
    }

    /**
     * Delete user profile (soft delete)
     */
    async delete(id: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${id}`,
            {
                ...config,
                successMessage: 'User profile deleted successfully',
            }
        )
    }

    /**
     * Assign permissions to user profile (replaces all current permissions)
     */
    async assignPermissions(
        id: number,
        data: AssignPermissionsDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.put<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/permissions`,
            data,
            {
                ...config,
                successMessage: 'Permissions assigned successfully',
            }
        )
    }

    /**
     * Assign users to user profile (additive operation)
     */
    async assignUsers(
        id: number,
        data: AssignUsersDto,
        config?: RequestConfig
    ): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/${id}/users`,
            data,
            {
                ...config,
                successMessage: 'Users assigned successfully',
            }
        )
    }

    /**
     * Remove user from user profile
     */
    async removeUser(id: number, userId: number, config?: RequestConfig): Promise<void> {
        return apiClient.delete<void>(
            `${this.baseUrl}/${id}/users/${userId}`,
            {
                ...config,
                successMessage: 'User removed successfully',
            }
        )
    }
}

export const userProfilesAPI = new UserProfilesAPI()
