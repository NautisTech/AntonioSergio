// ==================== AUTH TYPES ====================

export interface LoginDto {
    email: string
    password: string
    tenantSlug: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: {
        id: number
        email: string
        username: string
        fotoUrl?: string
        tipo_utilizador?: string
        cliente_id?: number
        funcionario_id?: number
        email_verificado: boolean
    }
    tenant: {
        id: number
        nome: string
        slug: string
    }
    empresas: Array<{
        id: number
        nome: string
        principal: boolean
    }>
    requiresTwoFactor?: boolean
}

export interface RefreshTokenDto {
    refreshToken: string
}

export interface RefreshTokenResponse {
    accessToken: string
}

export interface UserProfile {
    userId: number
    email: string
    nome: string
    tenantId: number
    empresaId?: number
}

export interface UserModule {
    modulo: string
    nome: string
    icone: string
    permissoes: Array<{
        codigo: string
        nome: string
        tipo: string
    }>
}

export interface UserModulesResponse {
    modulos: UserModule[]
    empresas: Array<{
        empresa_id: number
        empresa_principal: boolean
        empresa_nome: string
        empresa_codigo: string
        logo_url?: string
        cor?: string
    }>
    totalPermissoes: number
    permissoesCodigos: string[]
}

export interface Verify2FADto {
    email: string
    tenantSlug: string
    token: string
}

export interface ForgotPasswordDto {
    email: string
    tenantSlug: string
}

export interface ResetPasswordDto {
    token: string
    email: string
    tenantSlug: string
    newPassword: string
}

export interface ChangePasswordDto {
    currentPassword: string
    newPassword: string
}

export interface SendVerificationEmailDto {
    email: string
    tenantSlug: string
}

export interface VerifyEmailDto {
    token: string
    email: string
    tenantSlug: string
}

export interface SwitchTenantDto {
    targetTenantId: number
}

export interface AvailableTenant {
    id: number
    name: string
    slug: string
    domain?: string
    logoUrl?: string
}
