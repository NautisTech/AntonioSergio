import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
} from '@tanstack/react-query'
import { authAPI } from './api'
import type {
    LoginDto,
    LoginResponse,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    SendVerificationEmailDto,
    VerifyEmailDto,
    UserProfile,
    UserModulesResponse,
    SwitchTenantDto,
    AvailableTenant,
} from './types'

// ==================== QUERY KEYS ====================
export const authKeys = {
    all: ['auth'] as const,
    profile: () => [...authKeys.all, 'profile'] as const,
    modules: () => [...authKeys.all, 'modules'] as const,
    availableTenants: () => [...authKeys.all, 'available-tenants'] as const,
}

// ==================== QUERIES ====================

/**
 * Get current user profile
 */
export function useProfile(
    options?: Omit<UseQueryOptions<{ user: UserProfile }>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: () => authAPI.getProfile(),
        ...options,
    })
}

/**
 * Get user modules and permissions
 */
export function useModules(
    options?: Omit<UseQueryOptions<UserModulesResponse>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: authKeys.modules(),
        queryFn: () => authAPI.getModules(),
        staleTime: 10 * 60 * 1000, // 10 minutes - modules don't change frequently
        ...options,
    })
}

// ==================== MUTATIONS ====================

/**
 * Login with email and password
 */
export function useLogin(
    options?: Omit<UseMutationOptions<LoginResponse, Error, LoginDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: LoginDto) => authAPI.login(data),
        onSuccess: () => {
            // Invalidate auth queries to refetch with new credentials
            queryClient.invalidateQueries({ queryKey: authKeys.all })
        },
        ...options,
    })
}

/**
 * Logout current user
 */
export function useLogout(
    options?: Omit<UseMutationOptions<{ message: string }, Error, void>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => authAPI.logout(),
        onSuccess: () => {
            // Clear all auth-related queries
            queryClient.clear()
        },
        ...options,
    })
}

/**
 * Request password reset email
 */
export function useForgotPassword(
    options?: Omit<UseMutationOptions<{ message: string }, Error, ForgotPasswordDto>, 'mutationFn'>
) {
    return useMutation({
        mutationFn: (data: ForgotPasswordDto) => authAPI.forgotPassword(data),
        ...options,
    })
}

/**
 * Reset password using token from email
 */
export function useResetPassword(
    options?: Omit<UseMutationOptions<{ message: string }, Error, ResetPasswordDto>, 'mutationFn'>
) {
    return useMutation({
        mutationFn: (data: ResetPasswordDto) => authAPI.resetPassword(data),
        ...options,
    })
}

/**
 * Change password for logged in user
 */
export function useChangePassword(
    options?: Omit<UseMutationOptions<{ message: string }, Error, ChangePasswordDto>, 'mutationFn'>
) {
    return useMutation({
        mutationFn: (data: ChangePasswordDto) => authAPI.changePassword(data),
        ...options,
    })
}

/**
 * Send email verification link
 */
export function useSendVerificationEmail(
    options?: Omit<
        UseMutationOptions<{ message: string }, Error, SendVerificationEmailDto>,
        'mutationFn'
    >
) {
    return useMutation({
        mutationFn: (data: SendVerificationEmailDto) => authAPI.sendVerificationEmail(data),
        ...options,
    })
}

/**
 * Verify email using token
 */
export function useVerifyEmail(
    options?: Omit<UseMutationOptions<{ message: string }, Error, VerifyEmailDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: VerifyEmailDto) => authAPI.verifyEmail(data),
        onSuccess: () => {
            // Refetch profile to update email verification status
            queryClient.invalidateQueries({ queryKey: authKeys.profile() })
        },
        ...options,
    })
}

// ==================== TENANT SWITCHING ====================

/**
 * Get list of available tenants for current user
 */
export function useAvailableTenants(
    options?: Omit<UseQueryOptions<AvailableTenant[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: authKeys.availableTenants(),
        queryFn: () => authAPI.getAvailableTenants(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    })
}

/**
 * Switch to a different tenant without re-login
 */
export function useSwitchTenant(
    options?: Omit<UseMutationOptions<LoginResponse, Error, SwitchTenantDto>, 'mutationFn'>
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SwitchTenantDto) => authAPI.switchTenant(data),
        onSuccess: () => {
            // Invalidate all auth queries to refetch with new tenant context
            queryClient.invalidateQueries({ queryKey: authKeys.all })
            // Clear all cached data since we're in a different tenant now
            queryClient.clear()
        },
        ...options,
    })
}
