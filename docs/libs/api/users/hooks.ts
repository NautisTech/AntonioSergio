import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { usersAPI } from './api'
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

// ==================== QUERY KEYS ====================
export const usersKeys = {
    all: ['users'] as const,
    lists: () => [...usersKeys.all, 'list'] as const,
    list: (filters?: UserListFilters) => [...usersKeys.lists(), filters] as const,
    details: () => [...usersKeys.all, 'detail'] as const,
    detail: (id: number, includeDetails?: boolean) => [
        ...usersKeys.details(),
        id,
        includeDetails,
    ] as const,
}

// ==================== QUERIES ====================

/**
 * Fetch list of users with optional filters
 */
export function useUsers(
    filters?: UserListFilters,
    options?: Omit<UseQueryOptions<UserListResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: usersKeys.list(filters),
        queryFn: () => usersAPI.list(filters),
        ...options,
    })
}

/**
 * Fetch a single user by ID
 */
export function useUser(
    id: number,
    includeDetails: boolean = false,
    options?: Omit<UseQueryOptions<UserDetail>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: usersKeys.detail(id, includeDetails),
        queryFn: () => usersAPI.getById(id, includeDetails),
        enabled: !!id, // Only fetch if ID is provided
        ...options,
    })
}

// ==================== MUTATIONS ====================

/**
 * Create a new user
 */
export function useCreateUser(
    options?: Omit<UseMutationOptions<User, Error, CreateUserDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateUserDto) => usersAPI.create(data),
        onSuccess: () => {
            // Invalidate all list queries to refetch with new data
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
        },
        ...options,
    })
}

/**
 * Update an existing user
 */
export function useUpdateUser(
    options?: Omit<UseMutationOptions<User, Error, { id: number; data: UpdateUserDto }>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
            usersAPI.update(id, data),
        onSuccess: (updatedUser, variables) => {
            // Invalidate lists to show updated data
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            // Invalidate specific detail to refetch updated data
            queryClient.invalidateQueries({ queryKey: usersKeys.details() })
            // Optionally update cache directly for better UX
            queryClient.setQueryData(
                usersKeys.detail(variables.id, false),
                updatedUser
            )
        },
        ...options,
    })
}

/**
 * Delete a user (soft delete)
 */
export function useDeleteUser(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => usersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.details() })
        },
        ...options,
    })
}

/**
 * Change user password
 */
export function useChangeUserPassword(
    options?: Omit<
        UseMutationOptions<void, Error, { id: number; data: ChangePasswordDto }>,
        'mutationFn'
    >
) {
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ChangePasswordDto }) =>
            usersAPI.changePassword(id, data),
        ...options,
    })
}

/**
 * Assign companies to user
 */
export function useAssignCompanies(
    options?: Omit<
        UseMutationOptions<void, Error, { id: number; data: AssignCompaniesDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AssignCompaniesDto }) =>
            usersAPI.assignCompanies(id, data),
        onSuccess: (_, variables) => {
            // Invalidate user details to refetch updated companies
            queryClient.invalidateQueries({
                queryKey: usersKeys.detail(variables.id, true),
            })
        },
        ...options,
    })
}

/**
 * Assign user profiles to user
 */
export function useAssignProfiles(
    options?: Omit<
        UseMutationOptions<void, Error, { id: number; data: AssignProfilesDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AssignProfilesDto }) =>
            usersAPI.assignProfiles(id, data),
        onSuccess: (_, variables) => {
            // Invalidate user details to refetch updated profiles
            queryClient.invalidateQueries({
                queryKey: usersKeys.detail(variables.id, true),
            })
        },
        ...options,
    })
}

/**
 * Assign direct permissions to user
 */
export function useAssignPermissions(
    options?: Omit<
        UseMutationOptions<void, Error, { id: number; data: AssignPermissionsDto }>,
        'mutationFn'
    >
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AssignPermissionsDto }) =>
            usersAPI.assignPermissions(id, data),
        onSuccess: (_, variables) => {
            // Invalidate user details to refetch updated permissions
            queryClient.invalidateQueries({
                queryKey: usersKeys.detail(variables.id, true),
            })
        },
        ...options,
    })
}
