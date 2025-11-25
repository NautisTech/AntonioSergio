import { apiClient, type RequestConfig } from '../client'
import type {
    LoginDto,
    LoginResponse,
    RefreshTokenDto,
    RefreshTokenResponse,
    UserProfile,
    UserModulesResponse,
    Verify2FADto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ChangePasswordDto,
    SendVerificationEmailDto,
    VerifyEmailDto,
    SwitchTenantDto,
    AvailableTenant,
} from './types'

class AuthAPI {
    private baseUrl = '/auth'

    /**
     * Login with email and password
     */
    async login(data: LoginDto, config?: RequestConfig): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>(
            `${this.baseUrl}/login`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Refresh access token using refresh token
     */
    async refresh(data: RefreshTokenDto, config?: RequestConfig): Promise<RefreshTokenResponse> {
        return apiClient.post<RefreshTokenResponse>(
            `${this.baseUrl}/refresh`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Get current user profile
     */
    async getProfile(config?: RequestConfig): Promise<{ user: UserProfile }> {
        return apiClient.get<{ user: UserProfile }>(
            `${this.baseUrl}/me`,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Get user modules and permissions
     */
    async getModules(config?: RequestConfig): Promise<UserModulesResponse> {
        return apiClient.get<UserModulesResponse>(
            `${this.baseUrl}/me/modules`,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Logout current user
     */
    async logout(config?: RequestConfig): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(
            `${this.baseUrl}/logout`,
            {},
            {
                ...config,
                showSuccessToast: false,
            }
        )
    }

    // ==================== 2FA ====================

    /**
     * Verify 2FA token during login
     */
    async verify2FA(data: Verify2FADto, config?: RequestConfig): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>(
            `${this.baseUrl}/2fa/verify`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    // ==================== PASSWORD MANAGEMENT ====================

    /**
     * Request password reset email
     */
    async forgotPassword(data: ForgotPasswordDto, config?: RequestConfig): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(
            `${this.baseUrl}/password/forgot`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Reset password using token from email
     */
    async resetPassword(data: ResetPasswordDto, config?: RequestConfig): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(
            `${this.baseUrl}/password/reset`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Change password for logged in user
     */
    async changePassword(data: ChangePasswordDto, config?: RequestConfig): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(
            `${this.baseUrl}/password/change`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    // ==================== EMAIL VERIFICATION ====================

    /**
     * Send email verification link
     */
    async sendVerificationEmail(
        data: SendVerificationEmailDto,
        config?: RequestConfig
    ): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(
            `${this.baseUrl}/email/send-verification`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Verify email using token
     */
    async verifyEmail(data: VerifyEmailDto, config?: RequestConfig): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(
            `${this.baseUrl}/email/verify`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    // ==================== TENANT SWITCHING ====================

    /**
     * Switch to a different tenant without re-login
     */
    async switchTenant(data: SwitchTenantDto, config?: RequestConfig): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>(
            `${this.baseUrl}/switch-tenant`,
            data,
            {
                ...config,
                showSuccessToast: false,
                showErrorToast: false,
            }
        )
    }

    /**
     * Get list of tenants available to current user
     */
    async getAvailableTenants(config?: RequestConfig): Promise<AvailableTenant[]> {
        return apiClient.get<AvailableTenant[]>(
            `${this.baseUrl}/available-tenants`,
            {
                ...config,
                showErrorToast: false,
                showSuccessToast: false,
            }
        )
    }
}

export const authAPI = new AuthAPI()
