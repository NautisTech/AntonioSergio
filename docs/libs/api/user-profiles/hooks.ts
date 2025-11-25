import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { userProfilesAPI } from './api'
import type {
    UserProfile,
    UserProfileDetail,
    UserProfileListFilters,
    CreateUserProfileDto,
    UpdateUserProfileDto,
    AssignPermissionsDto,
    AssignUsersDto,
} from './types'

// ==================== QUERY KEYS ====================
export const userProfilesKeys = {
    all: ['user-profiles'] as const,
    lists: () => [...userProfilesKeys.all, 'list'] as const,
    list: (filters?: UserProfileListFilters) => [...userProfilesKeys.lists(), filters] as const,
    details: () => [...userProfilesKeys.all, 'detail'] as const,
    detail: (id: number, includeDetails?: boolean) => [
        ...userProfilesKeys.details(),
        id,
        includeDetails,
    ] as const,
}

// ==================== QUERIES ====================

/**
 * Fetch list of user profiles
 */
export function useUserProfiles(
    filters?: UserProfileListFilters,
    options?: Omit<UseQueryOptions<UserProfile[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: userProfilesKeys.list(filters),
        queryFn: () => userProfilesAPI.list(filters),
        ...options,
    })
}

/**
 * Fetch a single user profile by ID
 */
export function useUserProfile(
    id: number,
    includeDetails: boolean = false,
    options?: Omit<UseQueryOptions<UserProfileDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: userProfilesKeys.detail(id, includeDetails),
        queryFn: () => userProfilesAPI.getById(id, includeDetails),
        enabled: !!id, // Only fetch if ID is provided
        ...options,
    })
}

// ==================== MUTATIONS ====================

/**
 * Create a new user profile
 */
export function useCreateUserProfile(
    options?: Omit<UseMutationOptions<UserProfile, Error, CreateUserProfileDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateUserProfileDto) => userProfilesAPI.create(data),
        onSuccess: () => {
            // Invalidate all list queries to refetch with new data
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.lists() })
        },
        ...options,
    })
}

/**
 * Update an existing user profile
 */
export function useUpdateUserProfile(
    options?: Omit<
        UseMutationOptions<UserProfile, Error, { id: number; data: UpdateUserProfileDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserProfileDto }) =>
            userProfilesAPI.update(id, data),
        onSuccess: (updatedProfile, variables) => {
            // Invalidate lists to show updated data
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.lists() })
            // Invalidate specific detail to refetch updated data
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.details() })
            // Optionally update cache directly for better UX
            queryClient.setQueryData(
                userProfilesKeys.detail(variables.id, false),
                updatedProfile
            )
        },
        ...options,
    })
}

/**
 * Delete a user profile (soft delete)
 */
export function useDeleteUserProfile(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userProfilesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.details() })
        },
        ...options,
    })
}

/**
 * Assign permissions to user profile
 */
export function useAssignPermissionsToProfile(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: AssignPermissionsDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AssignPermissionsDto }) =>
            userProfilesAPI.assignPermissions(id, data),
        onSuccess: (_, variables) => {
            // Invalidate user profile details to refetch updated permissions
            queryClient.invalidateQueries({
                queryKey: userProfilesKeys.detail(variables.id, true),
            })
            // Also invalidate lists to update permission counts
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.lists() })
        },
        ...options,
    })
}

/**
 * Assign users to user profile
 */
export function useAssignUsersToProfile(
    options?: Omit<
        UseMutationOptions<
            { success: boolean; message: string },
            Error,
            { id: number; data: AssignUsersDto }
        >,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AssignUsersDto }) =>
            userProfilesAPI.assignUsers(id, data),
        onSuccess: (_, variables) => {
            // Invalidate user profile details to refetch updated users
            queryClient.invalidateQueries({
                queryKey: userProfilesKeys.detail(variables.id, true),
            })
            // Also invalidate lists to update user counts
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.lists() })
        },
        ...options,
    })
}

/**
 * Remove user from user profile
 */
export function useRemoveUserFromProfile(
    options?: Omit<
        UseMutationOptions<void, Error, { id: number; userId: number }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, userId }: { id: number; userId: number }) =>
            userProfilesAPI.removeUser(id, userId),
        onSuccess: (_, variables) => {
            // Invalidate user profile details to refetch updated users
            queryClient.invalidateQueries({
                queryKey: userProfilesKeys.detail(variables.id, true),
            })
            // Also invalidate lists to update user counts
            queryClient.invalidateQueries({ queryKey: userProfilesKeys.lists() })
        },
        ...options,
    })
}
